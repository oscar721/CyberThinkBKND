import { Router } from 'express';
import mongoose from 'mongoose';
import { Topic } from '../models/Topic.js';
import { Lesson } from '../models/Lesson.js';
import { Video } from '../models/Video.js';
import { Quiz } from '../models/Quiz.js';
import { Attempt } from '../models/Attempt.js';

const router = Router();

router.get('/topics', async (req, res) => {
  try {
    const topics = await Topic.find().sort({ order: 1, name: 1 }).lean();

    const data = await Promise.all(
      topics.map(async (topic) => ({
        ...topic,
        lessonCount: await Lesson.countDocuments({ topic: topic._id }),
        videoCount: await Video.countDocuments({ topic: topic._id }),
      })),
    );

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al listar los temas' });
  }
});

router.get('/topics/:slug', async (req, res) => {
  try {
    const topic = await Topic.findOne({ slug: req.params.slug }).lean();

    if (!topic) {
      return res.status(404).json({ message: 'Tema no encontrado' });
    }

    const [lessons, videos, quiz] = await Promise.all([
      Lesson.find({ topic: topic._id }).sort({ order: 1 }).lean(),
      Video.find({ topic: topic._id }).sort({ order: 1 }).lean(),
      Quiz.findOne({ topic: topic._id }).select('title passingScore').lean(),
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

    const lesson = await Lesson.findById(req.params.id)
      .populate('topic', 'name slug')
      .lean();

    if (!lesson) {
      return res.status(404).json({ message: 'Lección no encontrada' });
    }

    res.json(lesson);
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

    const quiz = await Quiz.findById(req.params.id).lean();

    if (!quiz) {
      return res.status(404).json({ message: 'Cuestionario no encontrado' });
    }

    res.json({
      _id: quiz._id,
      title: quiz.title,
      passingScore: quiz.passingScore,
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

    const quiz = await Quiz.findById(req.params.id).lean();

    if (!quiz) {
      return res.status(404).json({ message: 'Cuestionario no encontrado' });
    }

    const { answers, username } = req.body ?? {};

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

    if (username) {
      await Attempt.create({
        username,
        quiz: quiz._id,
        score,
        passed,
        correct,
        total,
      });
    }

    res.json({ score, passed, correct, total, passingScore: quiz.passingScore, detail });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al enviar el cuestionario' });
  }
});

router.get('/results', async (req, res) => {
  try {
    const { username } = req.query;
    const filter = username ? { username } : {};
    const attempts = await Attempt.find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('quiz', 'title')
      .lean();

    res.json(attempts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los resultados' });
  }
});

export default router;
