import 'dotenv/config';
import mongoose from 'mongoose';
import { Topic } from '../src/models/Topic.js';
import { Lesson } from '../src/models/Lesson.js';

await mongoose.connect(process.env.MONGODB_URI, {
  dbName: process.env.MONGODB_DB || 'cyberthink',
  serverSelectionTimeoutMS: 15000,
});

const [topics, lessons] = await Promise.all([
  Topic.find().sort({ order: 1 }).select('name image imageUrl').lean(),
  Lesson.find().sort({ topic: 1, order: 1 }).select('title image imageUrl').lean(),
]);

function inspect(item) {
  if (item.image?.thumbnailUrl) {
    return {
      source: 'openverse',
      thumbnailUrl: item.image.thumbnailUrl,
      license: item.image.license,
      attribution: Boolean(item.image.attribution),
    };
  }

  if (item.imageUrl) {
    return { source: 'custom', thumbnailUrl: item.imageUrl };
  }

  return { source: 'missing' };
}

const topicReport = topics.map((topic) => ({
  name: topic.name,
  ...inspect(topic),
}));
const lessonReport = lessons.map((lesson) => ({
  title: lesson.title,
  ...inspect(lesson),
}));
const missing =
  topicReport.filter((item) => item.source === 'missing').length +
  lessonReport.filter((item) => item.source === 'missing').length;

console.log(
  JSON.stringify(
    {
      topics: topicReport,
      lessons: lessonReport,
      missing,
    },
    null,
    2,
  ),
);

if (missing > 0) {
  process.exitCode = 1;
}

await mongoose.disconnect();
