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

const users = await User.find().select('username role -_id').sort({ username: 1 }).lean();
const topics = await Topic.find().sort({ order: 1 }).select('name slug published order').lean();
const lessons = await Lesson.find().sort({ topic: 1, order: 1 }).select('title order published topic -_id').lean();
const videos = await Video.find().sort({ topic: 1 }).select('title url lesson published topic -_id').lean();
const quizzes = await Quiz.find().sort({ topic: 1 }).select('title passingScore questions published topic -_id').lean();
const attempts = await Attempt.countDocuments();

const lessonsByTopic = topics.map((topic) => ({
  module: topic.name,
  lessons: lessons.filter((lesson) => String(lesson.topic) === String(topic._id)).length,
}));

console.log(JSON.stringify({
  users,
  topics,
  lessonsByTopic,
  totalLessons: lessons.length,
  videos: videos.map((video) => ({
    title: video.title,
    url: video.url,
    linkedToLesson: Boolean(video.lesson),
    published: video.published,
  })),
  quizzes: quizzes.map((quiz) => ({
    title: quiz.title,
    passingScore: quiz.passingScore,
    questions: quiz.questions.length,
    published: quiz.published,
  })),
  attempts,
}, null, 2));

await mongoose.disconnect();
