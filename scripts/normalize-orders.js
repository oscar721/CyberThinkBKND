import 'dotenv/config';
import mongoose from 'mongoose';
import { Topic } from '../src/models/Topic.js';
import { Lesson } from '../src/models/Lesson.js';
import { Video } from '../src/models/Video.js';
import { Quiz } from '../src/models/Quiz.js';
import { modules } from '../src/data/curriculum.js';

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('MONGODB_URI no está definida');
}

await mongoose.connect(uri, {
  dbName: process.env.MONGODB_DB || 'cyberthink',
  serverSelectionTimeoutMS: 15000,
});

let updated = 0;

try {
  for (const data of modules) {
    const topic = await Topic.findOne({ slug: data.slug });

    if (!topic) {
      console.log(`Módulo ausente: ${data.slug}`);
      continue;
    }

    const lessons = await Lesson.find({ topic: topic._id }).sort({
      order: 1,
      _id: 1,
    });

    if (!lessons.length) {
      continue;
    }

    const minOrder = Math.min(...lessons.map((lesson) => lesson.order));

    if (minOrder >= 1) {
      console.log(`Sin cambios: ${data.name}`);
      continue;
    }

    for (let index = 0; index < lessons.length; index += 1) {
      const desired = index + 1;

      if (lessons[index].order !== desired) {
        await Lesson.updateOne(
          { _id: lessons[index]._id },
          { $set: { order: desired } },
        );
        updated += 1;
      }
    }

    const lastLesson = lessons[lessons.length - 1];
    await Video.updateMany(
      { topic: topic._id },
      { $set: { lesson: lastLesson._id } },
    );
    await Quiz.updateMany(
      { topic: topic._id },
      { $set: { lesson: lastLesson._id } },
    );

    console.log(`Normalizado: ${data.name} (${lessons.length} lecciones)`);
  }

  console.log(`Lecciones reordenadas: ${updated}`);
} finally {
  await mongoose.disconnect();
}
