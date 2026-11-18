import { Router } from 'express';
import mongoose from 'mongoose';
import { Topic } from '../models/Topic.js';
import { Lesson } from '../models/Lesson.js';
import { Video } from '../models/Video.js';
import { Quiz } from '../models/Quiz.js';
import { Attempt } from '../models/Attempt.js';
import { User } from '../models/User.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, requireRole('admin'));

const wrap = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

function slugify(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function toOrder(value) {
  const order = Number(value);
  return Number.isFinite(order) ? order : 0;
}

function topicPayload(body) {
  return {
    name: String(body.name || '').trim(),
    slug: slugify(body.slug || body.name),
    description: String(body.description || '').trim(),
    imageUrl: String(body.imageUrl || '').trim(),
    order: toOrder(body.order),
    published: body.published !== false,
  };
}

function lessonPayload(body) {
  return {
    topic: body.topic,
    title: String(body.title || '').trim(),
    introduction: String(body.introduction || '').trim(),
    objectives: toList(body.objectives),
    content: String(body.content || '').trim(),
    example: String(body.example || '').trim(),
    recommendations: toList(body.recommendations),
    imageUrl: String(body.imageUrl || '').trim(),
    order: toOrder(body.order),
    published: body.published !== false,
  };
}

function videoPayload(body) {
  return {
    topic: body.topic,
    lesson: body.lesson || null,
    title: String(body.title || '').trim(),
    url: String(body.url || '').trim(),
    description: String(body.description || '').trim(),
    order: toOrder(body.order),
    published: body.published !== false,
  };
}

function normalizeQuestions(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((question) => ({
    text: String(question.text || '').trim(),
    options: Array.isArray(question.options)
      ? question.options.map((option) => String(option).trim()).filter(Boolean)
      : [],
    correctIndex: Number(question.correctIndex),
  }));
}

function validQuestions(questions) {
  return (
    questions.length > 0 &&
    questions.every(
      (question) =>
        question.text &&
        question.options.length >= 2 &&
        Number.isInteger(question.correctIndex) &&
        question.correctIndex >= 0 &&
        question.correctIndex < question.options.length,
    )
  );
}

function quizPayload(body) {
  return {
    topic: body.topic,
    lesson: body.lesson || null,
    title: String(body.title || '').trim(),
    passingScore: Math.min(100, Math.max(0, Number(body.passingScore ?? 70))),
    questions: normalizeQuestions(body.questions),
    published: body.published !== false,
  };
}

router.get(
  '/stats',
  wrap(async (req, res) => {
    const [users, students, admins, topics, lessons, videos, quizzes, attempts] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: 'student' }),
        User.countDocuments({ role: 'admin' }),
        Topic.countDocuments(),
        Lesson.countDocuments(),
        Video.countDocuments(),
        Quiz.countDocuments(),
        Attempt.countDocuments(),
      ]);

    const recent = await Attempt.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .populate({
        path: 'quiz',
        select: 'title topic',
        populate: { path: 'topic', select: 'name slug' },
      })
      .lean();

    res.json({
      users,
      students,
      admins,
      topics,
      lessons,
      videos,
      quizzes,
      attempts,
      recent,
    });
  }),
);

router.get(
  '/topics',
  wrap(async (req, res) => {
    const topics = await Topic.find().sort({ order: 1, name: 1 }).lean();

    const data = await Promise.all(
      topics.map(async (topic) => ({
        ...topic,
        lessonCount: await Lesson.countDocuments({ topic: topic._id }),
        videoCount: await Video.countDocuments({ topic: topic._id }),
        quizCount: await Quiz.countDocuments({ topic: topic._id }),
      })),
    );

    res.json(data);
  }),
);

router.post(
  '/topics',
  wrap(async (req, res) => {
    const payload = topicPayload(req.body ?? {});

    if (!payload.name || !payload.slug) {
      return res.status(400).json({ message: 'El nombre es obligatorio' });
    }

    const topic = await Topic.create(payload);
    res.status(201).json(topic);
  }),
);

router.put(
  '/topics/:id',
  wrap(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Módulo no encontrado' });
    }

    const payload = topicPayload(req.body ?? {});

    if (!payload.name || !payload.slug) {
      return res.status(400).json({ message: 'El nombre es obligatorio' });
    }

    const topic = await Topic.findByIdAndUpdate(req.params.id, payload, {
      returnDocument: 'after',
      runValidators: true,
    });

    if (!topic) {
      return res.status(404).json({ message: 'Módulo no encontrado' });
    }

    res.json(topic);
  }),
);

router.delete(
  '/topics/:id',
  wrap(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Módulo no encontrado' });
    }

    const quizzes = await Quiz.find({ topic: req.params.id }).select('_id').lean();
    const attempts = await Attempt.countDocuments({
      quiz: { $in: quizzes.map((quiz) => quiz._id) },
    });

    if (attempts > 0) {
      return res.status(409).json({
        message:
          'No se puede eliminar: el módulo tiene intentos registrados. Puedes despublicarlo.',
      });
    }

    await Promise.all([
      Lesson.deleteMany({ topic: req.params.id }),
      Video.deleteMany({ topic: req.params.id }),
      Quiz.deleteMany({ topic: req.params.id }),
    ]);

    const removed = await Topic.findByIdAndDelete(req.params.id);

    if (!removed) {
      return res.status(404).json({ message: 'Módulo no encontrado' });
    }

    res.json({ message: 'Módulo eliminado' });
  }),
);

router.get(
  '/lessons',
  wrap(async (req, res) => {
    const filter = req.query.topic ? { topic: req.query.topic } : {};
    const lessons = await Lesson.find(filter)
      .sort({ topic: 1, order: 1 })
      .populate('topic', 'name slug')
      .lean();

    res.json(lessons);
  }),
);

router.post(
  '/lessons',
  wrap(async (req, res) => {
    const payload = lessonPayload(req.body ?? {});

    if (!payload.topic || !mongoose.isValidObjectId(payload.topic)) {
      return res.status(400).json({ message: 'Selecciona un módulo válido' });
    }

    if (!payload.title) {
      return res.status(400).json({ message: 'El título es obligatorio' });
    }

    const lesson = await Lesson.create(payload);
    res.status(201).json(lesson);
  }),
);

router.put(
  '/lessons/:id',
  wrap(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Lección no encontrada' });
    }

    const payload = lessonPayload(req.body ?? {});

    if (!payload.topic || !mongoose.isValidObjectId(payload.topic)) {
      return res.status(400).json({ message: 'Selecciona un módulo válido' });
    }

    if (!payload.title) {
      return res.status(400).json({ message: 'El título es obligatorio' });
    }

    const lesson = await Lesson.findByIdAndUpdate(req.params.id, payload, {
      returnDocument: 'after',
      runValidators: true,
    });

    if (!lesson) {
      return res.status(404).json({ message: 'Lección no encontrada' });
    }

    res.json(lesson);
  }),
);

router.delete(
  '/lessons/:id',
  wrap(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Lección no encontrada' });
    }

    await Promise.all([
      Video.updateMany({ lesson: req.params.id }, { $set: { lesson: null } }),
      Quiz.updateMany({ lesson: req.params.id }, { $set: { lesson: null } }),
    ]);

    const removed = await Lesson.findByIdAndDelete(req.params.id);

    if (!removed) {
      return res.status(404).json({ message: 'Lección no encontrada' });
    }

    res.json({ message: 'Lección eliminada' });
  }),
);

router.get(
  '/videos',
  wrap(async (req, res) => {
    const filter = req.query.topic ? { topic: req.query.topic } : {};
    const videos = await Video.find(filter)
      .sort({ topic: 1, order: 1 })
      .populate('topic', 'name slug')
      .populate('lesson', 'title order')
      .lean();

    res.json(videos);
  }),
);

router.post(
  '/videos',
  wrap(async (req, res) => {
    const payload = videoPayload(req.body ?? {});

    if (!payload.topic || !mongoose.isValidObjectId(payload.topic)) {
      return res.status(400).json({ message: 'Selecciona un módulo válido' });
    }

    if (!payload.title) {
      return res.status(400).json({ message: 'El título es obligatorio' });
    }

    if (payload.url && !/^https?:\/\//i.test(payload.url)) {
      return res.status(400).json({ message: 'La URL debe comenzar con http(s)' });
    }

    const video = await Video.create(payload);
    res.status(201).json(video);
  }),
);

router.put(
  '/videos/:id',
  wrap(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Video no encontrado' });
    }

    const payload = videoPayload(req.body ?? {});

    if (!payload.topic || !mongoose.isValidObjectId(payload.topic)) {
      return res.status(400).json({ message: 'Selecciona un módulo válido' });
    }

    if (!payload.title) {
      return res.status(400).json({ message: 'El título es obligatorio' });
    }

    if (payload.url && !/^https?:\/\//i.test(payload.url)) {
      return res.status(400).json({ message: 'La URL debe comenzar con http(s)' });
    }

    const video = await Video.findByIdAndUpdate(req.params.id, payload, {
      returnDocument: 'after',
      runValidators: true,
    });

    if (!video) {
      return res.status(404).json({ message: 'Video no encontrado' });
    }

    res.json(video);
  }),
);

router.delete(
  '/videos/:id',
  wrap(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Video no encontrado' });
    }

    const removed = await Video.findByIdAndDelete(req.params.id);

    if (!removed) {
      return res.status(404).json({ message: 'Video no encontrado' });
    }

    res.json({ message: 'Video eliminado' });
  }),
);

router.get(
  '/quizzes',
  wrap(async (req, res) => {
    const filter = req.query.topic ? { topic: req.query.topic } : {};
    const quizzes = await Quiz.find(filter)
      .sort({ topic: 1, title: 1 })
      .populate('topic', 'name slug')
      .populate('lesson', 'title order')
      .lean();

    res.json(quizzes);
  }),
);

router.post(
  '/quizzes',
  wrap(async (req, res) => {
    const payload = quizPayload(req.body ?? {});

    if (!payload.topic || !mongoose.isValidObjectId(payload.topic)) {
      return res.status(400).json({ message: 'Selecciona un módulo válido' });
    }

    if (!payload.title) {
      return res.status(400).json({ message: 'El título es obligatorio' });
    }

    if (!validQuestions(payload.questions)) {
      return res.status(400).json({
        message: 'Añade al menos una pregunta con dos opciones y una respuesta correcta',
      });
    }

    const quiz = await Quiz.create(payload);
    res.status(201).json(quiz);
  }),
);

router.put(
  '/quizzes/:id',
  wrap(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Cuestionario no encontrado' });
    }

    const payload = quizPayload(req.body ?? {});

    if (!payload.topic || !mongoose.isValidObjectId(payload.topic)) {
      return res.status(400).json({ message: 'Selecciona un módulo válido' });
    }

    if (!payload.title) {
      return res.status(400).json({ message: 'El título es obligatorio' });
    }

    if (!validQuestions(payload.questions)) {
      return res.status(400).json({
        message: 'Añade al menos una pregunta con dos opciones y una respuesta correcta',
      });
    }

    const quiz = await Quiz.findByIdAndUpdate(req.params.id, payload, {
      returnDocument: 'after',
      runValidators: true,
    });

    if (!quiz) {
      return res.status(404).json({ message: 'Cuestionario no encontrado' });
    }

    res.json(quiz);
  }),
);

router.delete(
  '/quizzes/:id',
  wrap(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Cuestionario no encontrado' });
    }

    const attempts = await Attempt.countDocuments({ quiz: req.params.id });

    if (attempts > 0) {
      return res.status(409).json({
        message:
          'No se puede eliminar: el cuestionario tiene intentos registrados. Puedes despublicarlo.',
      });
    }

    const removed = await Quiz.findByIdAndDelete(req.params.id);

    if (!removed) {
      return res.status(404).json({ message: 'Cuestionario no encontrado' });
    }

    res.json({ message: 'Cuestionario eliminado' });
  }),
);

router.get(
  '/users',
  wrap(async (req, res) => {
    const users = await User.find().select('username role createdAt').sort({
      role: 1,
      username: 1,
    });

    res.json(users);
  }),
);

router.patch(
  '/users/:id/role',
  wrap(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const { role } = req.body ?? {};

    if (!['admin', 'student'].includes(role)) {
      return res.status(400).json({ message: 'Rol inválido' });
    }

    if (req.user.id === req.params.id) {
      return res.status(400).json({ message: 'No puedes cambiar tu propio rol' });
    }

    const target = await User.findById(req.params.id);

    if (!target) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (target.role === 'admin' && role === 'student') {
      const admins = await User.countDocuments({ role: 'admin' });

      if (admins <= 1) {
        return res.status(400).json({
          message: 'Debe existir al menos un administrador',
        });
      }
    }

    target.role = role;
    await target.save();

    res.json({ username: target.username, role: target.role });
  }),
);

router.get(
  '/results',
  wrap(async (req, res) => {
    const attempts = await Attempt.find()
      .sort({ createdAt: -1 })
      .limit(200)
      .populate({
        path: 'quiz',
        select: 'title topic',
        populate: { path: 'topic', select: 'name slug' },
      })
      .lean();

    res.json(attempts);
  }),
);

export default router;
