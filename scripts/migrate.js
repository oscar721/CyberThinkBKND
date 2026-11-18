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

    await Quiz.findOneAndUpdate(
      { topic: topic._id },
      {
        $set: {
          topic: topic._id,
          lesson: lastLesson?._id ?? null,
          title: data.quiz.title,
          passingScore: data.quiz.passingScore,
          questions: data.quiz.questions,
          published: true,
        },
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
    );

    console.log(`Módulo migrado: ${data.name} (3 lecciones, 1 video, 1 cuestionario)`);
  }

  console.log(`Lecciones procesadas: ${lessonCount}`);
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

  const [users, topics, lessons, videos, quizzes] = await Promise.all([
    User.countDocuments(),
    Topic.countDocuments(),
    Lesson.countDocuments(),
    Video.countDocuments(),
    Quiz.countDocuments(),
  ]);

  console.log('Migración completada');
  console.log(`Usuarios: ${users} · Módulos: ${topics} · Lecciones: ${lessons} · Videos: ${videos} · Cuestionarios: ${quizzes}`);
}

try {
  await main();
} catch (error) {
  console.error('Migración abortada:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect().catch(() => {});
}
