import mongoose from 'mongoose';
import { ImageSearchCache } from '../models/ImageSearchCache.js';
import { Topic } from '../models/Topic.js';
import { Lesson } from '../models/Lesson.js';
import {
  defaultLessonQuery,
  defaultTopicQuery,
  fallbackTopicQueries,
} from '../data/imageQueries.js';

const OPENVERSE_API_BASE = (
  process.env.OPENVERSE_API_BASE || 'https://api.openverse.org/v1'
).replace(/\/+$/, '');
const USER_AGENT = 'CyberThink/1.0 (educational platform)';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const EMPTY_CACHE_TTL_MS = 60 * 60 * 1000;
const FETCH_TIMEOUT_MS = 15000;
const CHECK_TIMEOUT_MS = 10000;
const ALLOWED_LICENSES = new Set(['cc0', 'pdm', 'by', 'by-sa']);
const MAINTENANCE_INTERVAL_MS = 24 * 60 * 60 * 1000;

let checkingImages = false;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeQueryKey(query) {
  return String(query || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function buildAttribution(item) {
  const title = item.title || 'Imagen';
  const creator = item.creator || 'Autor desconocido';
  const license = item.license ? item.license.toUpperCase() : 'licencia abierta';
  const version = item.license_version ? ` ${item.license_version}` : '';

  return `"${title}" por ${creator}, licencia ${license}${version}.`;
}

function toImageRecord(item, query) {
  const license = String(item.license || '').toLowerCase();
  const source = String(item.source || item.provider || 'openverse');

  if (
    !item.url ||
    !item.thumbnail ||
    !ALLOWED_LICENSES.has(license) ||
    item.mature ||
    source.toLowerCase().includes('wikimedia')
  ) {
    return null;
  }

  return {
    id: String(item.id || ''),
    title: String(item.title || ''),
    url: String(item.url),
    thumbnailUrl: String(item.thumbnail),
    width: Number(item.width) || 0,
    height: Number(item.height) || 0,
    creator: String(item.creator || ''),
    creatorUrl: String(item.creator_url || ''),
    license,
    licenseVersion: String(item.license_version || ''),
    licenseUrl: String(item.license_url || ''),
    source,
    foreignLandingUrl: String(item.foreign_landing_url || ''),
    attribution: String(item.attribution || buildAttribution(item)),
    query: String(query),
    fetchedAt: new Date(),
    checkedAt: new Date(),
  };
}

async function requestOpenverse(query) {
  const url = new URL(`${OPENVERSE_API_BASE}/images/`);
  url.searchParams.set('q', query);
  url.searchParams.set('page_size', '20');
  url.searchParams.set('license_type', 'commercial');
  url.searchParams.set('mature', 'false');

  let lastError;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': USER_AGENT,
        },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });

      if (!response.ok) {
        throw new Error(`Openverse respondió ${response.status}`);
      }

      const contentType = response.headers.get('content-type') || '';

      if (!contentType.includes('application/json')) {
        throw new Error(`Openverse respondió ${response.status} sin JSON`);
      }

      const data = await response.json();
      const results = Array.isArray(data?.results) ? data.results : [];
      const seen = new Set();

      return results
        .map((item) => toImageRecord(item, query))
        .filter((image) => {
          if (!image || seen.has(image.thumbnailUrl)) {
            return false;
          }

          seen.add(image.thumbnailUrl);
          return true;
        });
    } catch (error) {
      lastError = error;

      if (attempt === 0) {
        await sleep(1000);
      }
    }
  }

  throw lastError;
}

export async function searchOpenverse(query, options = {}) {
  const cleanQuery = String(query || '').trim();

  if (!cleanQuery) {
    throw new Error('La búsqueda de imágenes necesita un término');
  }

  const queryKey = normalizeQueryKey(cleanQuery);

  if (!options.refresh) {
    const cached = await ImageSearchCache.findOne({
      queryKey,
      expiresAt: { $gt: new Date() },
    }).lean();

    if (cached) {
      if (cached.results?.length) {
        return cached.results;
      }

      throw new Error('Openverse no devolvió imágenes para esa búsqueda');
    }
  }

  try {
    const results = await requestOpenverse(cleanQuery);
    const expiresAt = new Date(
      Date.now() + (results.length ? CACHE_TTL_MS : EMPTY_CACHE_TTL_MS),
    );

    await ImageSearchCache.findOneAndUpdate(
      { queryKey },
      {
        $set: {
          query: cleanQuery,
          results,
          expiresAt,
        },
      },
      { upsert: true, returnDocument: 'after' },
    );

    if (!results.length) {
      throw new Error('Openverse no devolvió imágenes para esa búsqueda');
    }

    return results;
  } catch (error) {
    const stale = await ImageSearchCache.findOne({ queryKey }).lean();

    if (stale?.results?.length) {
      console.warn(
        `Openverse no respondió para "${cleanQuery}"; se usa la caché anterior.`,
      );
      return stale.results;
    }

    throw error;
  }
}

async function usedImageUrls({ topicId, lessonId } = {}) {
  const [topics, lessons] = await Promise.all([
    Topic.find().select('_id image.thumbnailUrl image.url imageUrl').lean(),
    Lesson.find().select('_id image.thumbnailUrl image.url imageUrl').lean(),
  ]);

  const used = new Set();

  for (const item of topics) {
    if (topicId && String(item._id) === String(topicId)) {
      continue;
    }

    if (item.image?.thumbnailUrl) used.add(item.image.thumbnailUrl);
    if (item.image?.url) used.add(item.image.url);
    if (item.imageUrl) used.add(item.imageUrl);
  }

  for (const item of lessons) {
    if (lessonId && String(item._id) === String(lessonId)) {
      continue;
    }

    if (item.image?.thumbnailUrl) used.add(item.image.thumbnailUrl);
    if (item.image?.url) used.add(item.image.url);
    if (item.imageUrl) used.add(item.imageUrl);
  }

  return used;
}

function selectBestImage(results, used, query) {
  const candidates = results.filter(
    (image) =>
      image.url &&
      image.thumbnailUrl &&
      !used.has(image.thumbnailUrl) &&
      !used.has(image.url),
  );

  if (!candidates.length) {
    throw new Error('No hay imágenes nuevas disponibles para asignar');
  }

  const recommended = candidates.filter(
    (image) =>
      image.width >= 800 &&
      image.height >= 400 &&
      image.width >= image.height,
  );
  const usable = candidates.filter(
    (image) =>
      (image.width >= 400 && image.height >= 250) ||
      image.width >= 800 ||
      image.height >= 800,
  );
  const pool = recommended.length ? recommended : usable.length ? usable : candidates;
  const normalizedQuery = String(query || '').toLowerCase().trim();
  const titleOf = (image) => String(image.title || '').toLowerCase().trim();
  const selected =
    (normalizedQuery &&
      (pool.find((image) => titleOf(image) === normalizedQuery) ||
        pool.find((image) => titleOf(image).startsWith(normalizedQuery)) ||
        pool.find((image) => titleOf(image).includes(normalizedQuery)))) ||
    pool[0];

  return { ...selected, thumbnailUrl: selected.url };
}

async function findImage(query, used, options = {}) {
  const excluded = new Set(used);

  for (const url of options.excludeUrls || []) {
    if (url) excluded.add(url);
  }

  const candidates = [
    query,
    ...(options.fallbackQueries || []),
  ]
    .map((candidate) => String(candidate || '').trim())
    .filter(Boolean);
  const uniqueCandidates = [...new Set(candidates)];
  let lastError;

  for (const candidate of uniqueCandidates) {
    try {
      const results = await searchOpenverse(candidate, {
        refresh: options.refresh,
      });

      try {
        return selectBestImage(results, excluded, candidate);
      } catch (error) {
        if (!/No hay imágenes nuevas/.test(error.message)) {
          throw error;
        }

        const refreshed = await searchOpenverse(candidate, { refresh: true });

        try {
          return selectBestImage(refreshed, excluded, candidate);
        } catch (refreshError) {
          lastError = refreshError;
          continue;
        }
      }
    } catch (error) {
      lastError = error;

      if (
        /Openverse respondió 5\d\d|sin JSON|aborted|timeout|fetch failed/i.test(
          error.message,
        )
      ) {
        break;
      }
    }
  }

  throw lastError ?? new Error('Openverse no devolvió imágenes para esa búsqueda');
}

export async function assignTopicImage(topic, query, options = {}) {
  const selectedQuery =
    String(query || '').trim() ||
    String(topic.image?.query || '').trim() ||
    defaultTopicQuery(topic);
  const used = await usedImageUrls({ topicId: topic._id });
  const image = await findImage(selectedQuery, used, {
    ...options,
    fallbackQueries: options.fallbackQueries ?? fallbackTopicQueries(topic),
  });

  const updated = await Topic.findByIdAndUpdate(
    topic._id,
    { $set: { image, imageUrl: image.thumbnailUrl } },
    { returnDocument: 'after', runValidators: true },
  ).lean();

  return updated;
}

export async function assignLessonImage(lesson, topic, query, options = {}) {
  let parent = topic;

  if (!parent) {
    parent = await Topic.findById(lesson.topic).lean();
  }

  if (!parent) {
    throw new Error('La lección no tiene un módulo válido');
  }

  const selectedQuery =
    String(query || '').trim() ||
    String(lesson.image?.query || '').trim() ||
    defaultLessonQuery(parent, lesson);
  const used = await usedImageUrls({ lessonId: lesson._id });
  const image = await findImage(selectedQuery, used, {
    ...options,
    fallbackQueries: options.fallbackQueries ?? fallbackTopicQueries(parent),
  });

  const updated = await Lesson.findByIdAndUpdate(
    lesson._id,
    { $set: { image, imageUrl: image.thumbnailUrl } },
    { returnDocument: 'after', runValidators: true },
  ).lean();

  return updated;
}

export async function assignMissingImages(options = {}) {
  const force = Boolean(options.force);
  const topics = await Topic.find().sort({ order: 1 }).lean();
  const lessons = await Lesson.find().sort({ topic: 1, order: 1 }).lean();
  const topicsById = new Map(
    topics.map((topic) => [String(topic._id), topic]),
  );
  const summary = { topics: 0, lessons: 0, failed: 0, skipped: 0 };

  for (const topic of topics) {
    if (!force && (topic.image?.thumbnailUrl || topic.imageUrl)) {
      summary.skipped += 1;
      continue;
    }

    try {
      await assignTopicImage(topic);
      summary.topics += 1;
      console.log(`Imagen de módulo asignada: ${topic.name}`);
    } catch (error) {
      summary.failed += 1;
      console.warn(`No se pudo asignar imagen a ${topic.name}: ${error.message}`);
    }

    await sleep(250);
  }

  for (const lesson of lessons) {
    if (!force && (lesson.image?.thumbnailUrl || lesson.imageUrl)) {
      summary.skipped += 1;
      continue;
    }

    const topic = topicsById.get(String(lesson.topic));

    if (!topic) {
      summary.failed += 1;
      console.warn(`No se pudo asignar imagen a ${lesson.title}: módulo ausente`);
      continue;
    }

    try {
      await assignLessonImage(lesson, topic);
      summary.lessons += 1;
      console.log(`Imagen de lección asignada: ${lesson.title}`);
    } catch (error) {
      summary.failed += 1;
      console.warn(
        `No se pudo asignar imagen a ${lesson.title}: ${error.message}`,
      );
    }

    await sleep(250);
  }

  return summary;
}

async function imageAvailable(url) {
  if (!url) {
    return false;
  }

  const headers = {
    'User-Agent': USER_AGENT,
    Accept: 'image/webp,image/apng,image/*,*/*;q=0.8',
  };

  async function attempt(method) {
    const response = await fetch(url, {
      method,
      headers:
        method === 'GET'
          ? { ...headers, Range: 'bytes=0-0' }
          : headers,
      redirect: 'follow',
      signal: AbortSignal.timeout(CHECK_TIMEOUT_MS),
    });

    return response;
  }

  for (let attemptNumber = 0; attemptNumber < 2; attemptNumber += 1) {
    try {
      let response = await attempt('HEAD');

      if ([403, 405, 501].includes(response.status)) {
        response = await attempt('GET');
      }

      if (response.ok || response.status === 206 || response.status === 304) {
        return true;
      }

      if ([404, 410].includes(response.status)) {
        return false;
      }

      if (response.status >= 500 && attemptNumber === 0) {
        await sleep(1000);
        continue;
      }

      return false;
    } catch (error) {
      if (attemptNumber === 0) {
        await sleep(1000);
        continue;
      }

      return false;
    }
  }

  return false;
}

export async function checkImages() {
  if (mongoose.connection.readyState !== 1) {
    return { skipped: true, reason: 'db_disconnected' };
  }

  if (checkingImages) {
    return { skipped: true, reason: 'already_running' };
  }

  checkingImages = true;

  try {
    const [topics, lessons] = await Promise.all([
      Topic.find({
        'image.thumbnailUrl': { $exists: true, $nin: ['', null] },
      }).lean(),
      Lesson.find({
        'image.thumbnailUrl': { $exists: true, $nin: ['', null] },
      }).lean(),
    ]);
    const topicsById = new Map(
      topics.map((topic) => [String(topic._id), topic]),
    );
    const summary = {
      checked: 0,
      available: 0,
      repaired: 0,
      failed: 0,
    };

    for (const topic of topics) {
      summary.checked += 1;

      if (await imageAvailable(topic.image.thumbnailUrl)) {
        summary.available += 1;
        await Topic.updateOne(
          { _id: topic._id },
          { $set: { 'image.checkedAt': new Date() } },
        );
      } else {
        try {
          await assignTopicImage(topic, topic.image.query, {
            excludeUrls: [topic.image.thumbnailUrl, topic.image.url],
          });
          summary.repaired += 1;
          console.log(`Imagen de módulo reemplazada: ${topic.name}`);
        } catch (error) {
          summary.failed += 1;
          console.warn(
            `No se pudo reemplazar la imagen de ${topic.name}: ${error.message}`,
          );
        }
      }

      await sleep(100);
    }

    for (const lesson of lessons) {
      summary.checked += 1;

      if (await imageAvailable(lesson.image.thumbnailUrl)) {
        summary.available += 1;
        await Lesson.updateOne(
          { _id: lesson._id },
          { $set: { 'image.checkedAt': new Date() } },
        );
      } else {
        const topic = topicsById.get(String(lesson.topic));

        try {
          await assignLessonImage(lesson, topic, lesson.image.query, {
            excludeUrls: [lesson.image.thumbnailUrl, lesson.image.url],
          });
          summary.repaired += 1;
          console.log(`Imagen de lección reemplazada: ${lesson.title}`);
        } catch (error) {
          summary.failed += 1;
          console.warn(
            `No se pudo reemplazar la imagen de ${lesson.title}: ${error.message}`,
          );
        }
      }

      await sleep(100);
    }

    return summary;
  } finally {
    checkingImages = false;
  }
}

export function startImageMaintenance() {
  if (process.env.DISABLE_IMAGE_MAINTENANCE === 'true') {
    return;
  }

  const run = () => {
    checkImages()
      .then((summary) => {
        if (!summary.skipped) {
          console.log(
            `Verificación de imágenes: ${summary.available}/${summary.checked} disponibles, ${summary.repaired} reemplazadas, ${summary.failed} fallidas.`,
          );
        }
      })
      .catch((error) => {
        console.error('Error al verificar imágenes:', error.message);
      });
  };

  const firstRun = setTimeout(run, 60000);
  firstRun.unref?.();

  const timer = setInterval(run, MAINTENANCE_INTERVAL_MS);
  timer.unref?.();
}
