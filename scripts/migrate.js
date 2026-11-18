import 'dotenv/config';
import { existsSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../src/models/User.js';
import { Topic } from '../src/models/Topic.js';
import { Lesson } from '../src/models/Lesson.js';
import { Video } from '../src/models/Video.js';
import { Quiz } from '../src/models/Quiz.js';
import { Attempt } from '../src/models/Attempt.js';
import { modules } from '../src/data/curriculum.js';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

function assertBackup() {
  const backupsDir = resolve(root, 'backups');

  if (!existsSync(backupsDir)) {
    throw new Error('No existe la carpeta de respaldos. Crea un respaldo antes de migrar.');
  }

  const hasManifest = readdirSync(backupsDir).some((entry) =>
    existsSync(resolve(backupsDir, entry, '_manifest.json')),
  );

  if (!hasManifest) {
    throw new Error('No se encontró un respaldo verificado (_manifest.json). Migración abortada.');
  }
}

async function migrateRoles() {
  const admin = await User.findOne({ username: 'admin' });

  if (!admin) {
    const password = await bcrypt.hash('admin', 10);
    await User.create({ username: 'admin', password, role: 'admin' });
    console.log('Usuario admin creado con rol admin');
  } else {
    const result = await User.updateOne(
      {
        _id: admin._id,
        $or: [{ role: { $exists: false } }, { role: null }],
      },
      { $set: { role: 'admin' } },
    );

    if (result.modifiedCount > 0) {
      console.log('Rol admin asignado al usuario admin');
    }
  }

  const student = await User.findOne({ username: 'oscar' });

  if (!student) {
    const password = await bcrypt.hash('oscar', 10);
    await User.create({ username: 'oscar', password, role: 'student' });
    console.log('Usuario oscar creado con rol student');
  } else {
    const result = await User.updateOne(
      {
        _id: student._id,
        $or: [{ role: { $exists: false } }, { role: null }],
      },
      { $set: { role: 'student' } },
    );

    if (result.modifiedCount > 0) {
      console.log('Rol student asignado al usuario oscar');
    }
  }
}

function normalizeQuestionText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function isValidStoredQuestion(question) {
  return (
    question &&
    question.text &&
    Array.isArray(question.options) &&
    question.options.length === 4 &&
    question.options.every((option) => String(option).trim()) &&
    Number.isInteger(question.correctIndex) &&
    question.correctIndex >= 0 &&
    question.correctIndex < 4 &&
    String(question.explanation || '').trim()
  );
}

function mergeQuestions(existing, bank) {
  const bankByText = new Map(
    bank.map((question) => [normalizeQuestionText(question.text), question]),
  );

  const merged = (existing ?? []).map((question) => {
    const bankQuestion = bankByText.get(normalizeQuestionText(question.text));

    if (!bankQuestion) {
      return question;
    }

    return isValidStoredQuestion(question) ? question : bankQuestion;
  });

  const texts = new Set(merged.map((question) => normalizeQuestionText(question.text)));

  for (const question of bank) {
    const text = normalizeQuestionText(question.text);

    if (!texts.has(text)) {
      merged.push(question);
      texts.add(text);
    }
  }

  return merged;
}

async function migrateContent() {
  let lessonCount = 0;

  for (const data of modules) {
    const topic = await Topic.findOneAndUpdate(
      { slug: data.slug },
      {
        $set: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          order: data.order,
          published: true,
        },
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
    );

    let lastLesson = null;

    for (const lesson of data.lessons) {
      const saved = await Lesson.findOneAndUpdate(
        { topic: topic._id, title: lesson.title },
        {
          $set: {
            topic: topic._id,
            title: lesson.title,
            introduction: lesson.introduction,
            objectives: lesson.objectives,
            content: lesson.content,
            example: lesson.example,
            recommendations: lesson.recommendations,
            order: lesson.order,
            published: true,
          },
        },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
      );

      lessonCount += 1;
      lastLesson = saved;
    }

    await Video.findOneAndUpdate(
      { topic: topic._id, order: 0 },
      {
        $set: {
          topic: topic._id,
          lesson: lastLesson?._id ?? null,
          title: data.video.title,
          url: data.video.url,
          description: data.video.description,
          order: 0,
          published: true,
        },
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
    );

    const existingQuiz = await Quiz.findOne({ topic: topic._id }).lean();
    const questions = mergeQuestions(
      existingQuiz?.questions,
      data.quiz.questions,
    );
    const published = existingQuiz ? existingQuiz.published !== false : true;

    await Quiz.findOneAndUpdate(
      { topic: topic._id },
      {
        $set: {
          topic: topic._id,
          lesson: lastLesson?._id ?? null,
          title: data.quiz.title,
          passingScore: data.quiz.passingScore,
          questions,
          published,
        },
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
    );

    console.log(
      `Módulo migrado: ${data.name} (3 lecciones, 1 video, 1 cuestionario, ${questions.length} preguntas)`,
    );
  }

  console.log(`Lecciones procesadas: ${lessonCount}`);
}

async function migrateAttempts() {
  const result = await Attempt.updateMany(
    { status: { $exists: false } },
    [
      {
        $set: {
          status: 'completed',
          startedAt: { $ifNull: ['$startedAt', '$createdAt'] },
          completedAt: { $ifNull: ['$completedAt', '$createdAt'] },
        },
      },
    ],
    { updatePipeline: true },
  );

  if (result.modifiedCount > 0) {
    console.log(`Intentos antiguos marcados como completados: ${result.modifiedCount}`);
  }
}

async function main() {
  assertBackup();

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI no está definida');
  }

  await mongoose.connect(uri, {
    dbName: process.env.MONGODB_DB || 'cyberthink',
    serverSelectionTimeoutMS: 15000,
  });

  await migrateRoles();
  await migrateContent();
  await migrateAttempts();

  const [users, topics, lessons, videos, quizzes, attempts] = await Promise.all([
    User.countDocuments(),
    Topic.countDocuments(),
    Lesson.countDocuments(),
    Video.countDocuments(),
    Quiz.countDocuments(),
    Attempt.countDocuments(),
  ]);

  console.log('Migración completada');
  console.log(`Usuarios: ${users} · Módulos: ${topics} · Lecciones: ${lessons} · Videos: ${videos} · Cuestionarios: ${quizzes} · Intentos: ${attempts}`);
}

try {
  await main();
} catch (error) {
  console.error('Migración abortada:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect().catch(() => {});
}
