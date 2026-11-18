import 'dotenv/config';
import mongoose from 'mongoose';
import { User } from '../src/models/User.js';
import { Topic } from '../src/models/Topic.js';
import { Lesson } from '../src/models/Lesson.js';
import { Video } from '../src/models/Video.js';
import { Quiz } from '../src/models/Quiz.js';
import { Attempt } from '../src/models/Attempt.js';

await mongoose.connect(process.env.MONGODB_URI, {
  dbName: process.env.MONGODB_DB || 'cyberthink',
  serverSelectionTimeoutMS: 15000,
});

const users = await User.find()
  .select('username role -_id')
  .sort({ username: 1 })
  .lean();
const topics = await Topic.find()
  .sort({ order: 1 })
  .select('name slug image imageUrl published order')
  .lean();
const lessons = await Lesson.find()
  .sort({ topic: 1, order: 1 })
  .select('title image imageUrl order published topic -_id')
  .lean();
const videos = await Video.find()
  .sort({ topic: 1 })
  .select('title url lesson published topic -_id')
  .lean();
const quizzes = await Quiz.find()
  .sort({ topic: 1 })
  .select('title passingScore questions published topic -_id')
  .lean();
const attemptStatuses = await Attempt.find().select('status -_id').lean();

const lessonsByTopic = topics.map((topic) => ({
  module: topic.name,
  lessons: lessons.filter((lesson) => String(lesson.topic) === String(topic._id))
    .length,
}));

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

const issues = [];

const topicsMissingImages = topics.filter(
  (topic) => !topic.image?.thumbnailUrl && !topic.imageUrl,
);
const lessonsMissingImages = lessons.filter(
  (lesson) => !lesson.image?.thumbnailUrl && !lesson.imageUrl,
);

for (const topic of topicsMissingImages) {
  issues.push(`Módulo sin imagen: ${topic.name}`);
}

for (const lesson of lessonsMissingImages) {
  issues.push(`Lección sin imagen: ${lesson.title}`);
}

const quizReports = quizzes.map((quiz) => {
  const texts = new Set();
  const invalidQuestions = [];

  for (const [index, question] of quiz.questions.entries()) {
    const options = Array.isArray(question.options) ? question.options : [];
    const normalized = normalizeText(question.text);
    const valid =
      question.text &&
      options.length === 4 &&
      options.every((option) => String(option).trim()) &&
      Number.isInteger(question.correctIndex) &&
      question.correctIndex >= 0 &&
      question.correctIndex < 4 &&
      String(question.explanation || '').trim() &&
      !texts.has(normalized);

    if (!valid) {
      invalidQuestions.push(index + 1);
    }

    texts.add(normalized);
  }

  if (quiz.published && quiz.questions.length < 20) {
    issues.push(`Cuestionario publicado con menos de 20 preguntas: ${quiz.title}`);
  }

  if (invalidQuestions.length > 0) {
    issues.push(
      `Cuestionario con preguntas inválidas o duplicadas: ${quiz.title} (${invalidQuestions.join(', ')})`,
    );
  }

  return {
    title: quiz.title,
    passingScore: quiz.passingScore,
    questions: quiz.questions.length,
    published: quiz.published,
    invalidQuestions,
  };
});

const completedAttempts = attemptStatuses.filter(
  (attempt) => !attempt.status || attempt.status === 'completed',
).length;
const inProgressAttempts = attemptStatuses.filter(
  (attempt) => attempt.status === 'in_progress',
).length;

console.log(
  JSON.stringify(
    {
      users,
      topics: topics.map((topic) => ({
        name: topic.name,
        slug: topic.slug,
        published: topic.published,
        image: topic.image?.thumbnailUrl || topic.imageUrl || null,
      })),
      lessonsByTopic,
      totalLessons: lessons.length,
      videos: videos.map((video) => ({
        title: video.title,
        url: video.url,
        linkedToLesson: Boolean(video.lesson),
        published: video.published,
      })),
      quizzes: quizReports,
      attempts: {
        total: attemptStatuses.length,
        completed: completedAttempts,
        inProgress: inProgressAttempts,
      },
      issues,
    },
    null,
    2,
  ),
);

if (issues.length > 0) {
  process.exitCode = 1;
}

await mongoose.disconnect();
