import { Router } from 'express';
import mongoose from 'mongoose';
import { Topic } from '../models/Topic.js';
import { Lesson } from '../models/Lesson.js';
import { Video } from '../models/Video.js';
import { Quiz } from '../models/Quiz.js';
import { Attempt } from '../models/Attempt.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

function visibility(req) {
  return req.user.role === 'admin' ? {} : { published: true };
}

router.get('/topics', async (req, res) => {
  try {
    const filter = visibility(req);
    const topics = await Topic.find(filter).sort({ order: 1, name: 1 }).lean();

    const data = await Promise.all(
      topics.map(async (topic) => {
        const [lessonCount, videoCount, quiz] = await Promise.all([
          Lesson.countDocuments({ topic: topic._id, ...filter }),
          Video.countDocuments({ topic: topic._id, ...filter }),
          Quiz.findOne({ topic: topic._id, ...filter })
            .select('_id title passingScore')
            .lean(),
        ]);

        return { ...topic, lessonCount, videoCount, quiz };
      }),
    );

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al listar los temas' });
  }
});

router.get('/topics/:slug', async (req, res) => {
  try {
    const filter = visibility(req);
    const topic = await Topic.findOne({ slug: req.params.slug, ...filter }).lean();

    if (!topic) {
      return res.status(404).json({ message: 'Tema no encontrado' });
    }

    const [lessons, videos, quiz] = await Promise.all([
      Lesson.find({ topic: topic._id, ...filter }).sort({ order: 1 }).lean(),
      Video.find({ topic: topic._id, ...filter }).sort({ order: 1 }).lean(),
      Quiz.findOne({ topic: topic._id, ...filter })
        .select('_id title passingScore')
        .lean(),
    ]);

    res.json({ topic, lessons, videos, quiz });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener el tema' });
  }
});

router.get('/lessons/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Lección no encontrada' });
    }

    const filter = visibility(req);

    const lesson = await Lesson.findOne({ _id: req.params.id, ...filter })
      .populate('topic', 'name slug description')
      .lean();

    if (!lesson) {
      return res.status(404).json({ message: 'Lección no encontrada' });
    }

    const topicId = lesson.topic?._id;

    const [video, quiz, siblings] = await Promise.all([
      Video.findOne({ topic: topicId, lesson: lesson._id, ...filter })
        .sort({ order: 1 })
        .lean()
        .then(
          (found) =>
            found ?? Video.findOne({ topic: topicId, ...filter }).sort({ order: 1 }).lean(),
        ),
      Quiz.findOne({ topic: topicId, lesson: lesson._id, ...filter })
        .select('_id title passingScore')
        .lean()
        .then(
          (found) =>
            found ??
            Quiz.findOne({ topic: topicId, ...filter })
              .select('_id title passingScore')
              .lean(),
        ),
      Lesson.find({ topic: topicId, ...filter })
        .sort({ order: 1 })
        .select('_id title order')
        .lean(),
    ]);

    const index = siblings.findIndex(
      (item) => item._id.toString() === lesson._id.toString(),
    );

    res.json({
      ...lesson,
      video: video ?? null,
      quiz: quiz ?? null,
      lessons: siblings,
      previousLesson: index > 0 ? siblings[index - 1] : null,
      nextLesson: index >= 0 && index < siblings.length - 1 ? siblings[index + 1] : null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener la lección' });
  }
});

router.get('/quizzes/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Cuestionario no encontrado' });
    }

    const quiz = await Quiz.findOne({ _id: req.params.id, ...visibility(req) })
      .populate('topic', 'name slug')
      .lean();

    if (!quiz) {
      return res.status(404).json({ message: 'Cuestionario no encontrado' });
    }

    res.json({
      _id: quiz._id,
      title: quiz.title,
      passingScore: quiz.passingScore,
      topic: quiz.topic,
      questions: quiz.questions.map((question) => ({
        text: question.text,
        options: question.options,
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener el cuestionario' });
  }
});

router.post('/quizzes/:id/submit', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Cuestionario no encontrado' });
    }

    const quiz = await Quiz.findOne({ _id: req.params.id, ...visibility(req) }).lean();

    if (!quiz) {
      return res.status(404).json({ message: 'Cuestionario no encontrado' });
    }

    const { answers } = req.body ?? {};

    if (!Array.isArray(answers) || answers.length !== quiz.questions.length) {
      return res.status(400).json({ message: 'Respuestas inválidas' });
    }

    let correct = 0;

    const detail = quiz.questions.map((question, index) => {
      const isCorrect = answers[index] === question.correctIndex;

      if (isCorrect) {
        correct += 1;
      }

      return {
        text: question.text,
        correctIndex: question.correctIndex,
        selectedIndex: answers[index],
        isCorrect,
      };
    });

    const total = quiz.questions.length;
    const score = Math.round((correct / total) * 100);
    const passed = score >= quiz.passingScore;

    await Attempt.create({
      username: req.user.username,
      user: mongoose.isValidObjectId(req.user.id) ? req.user.id : null,
      quiz: quiz._id,
      score,
      passed,
      correct,
      total,
    });

    res.json({ score, passed, correct, total, passingScore: quiz.passingScore, detail });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al enviar el cuestionario' });
  }
});

router.get('/results', async (req, res) => {
  try {
    const filter =
      req.user.role === 'admin'
        ? req.query.username
          ? { username: req.query.username }
          : {}
        : { username: req.user.username };

    const attempts = await Attempt.find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .populate({
        path: 'quiz',
        select: 'title topic',
        populate: { path: 'topic', select: 'name slug' },
      })
      .lean();

    res.json(attempts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los resultados' });
  }
});

router.get('/progress', async (req, res) => {
  try {
    const [topics, lessons, attempts] = await Promise.all([
      Topic.countDocuments(visibility(req)),
      Lesson.countDocuments(visibility(req)),
      Attempt.find({ username: req.user.username })
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    const passed = attempts.filter((attempt) => attempt.passed).length;
    const average =
      attempts.length > 0
        ? Math.round(
            attempts.reduce((sum, attempt) => sum + attempt.score, 0) / attempts.length,
          )
        : 0;

    res.json({ topics, lessons, attempts: attempts.length, passed, average });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener el progreso' });
  }
});

export default router;
