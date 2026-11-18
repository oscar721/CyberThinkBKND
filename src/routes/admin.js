import { Router } from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { Topic } from '../models/Topic.js';
import { Lesson } from '../models/Lesson.js';
import { Video } from '../models/Video.js';
import { Quiz } from '../models/Quiz.js';
import { Attempt } from '../models/Attempt.js';
import { User } from '../models/User.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import {
  assignLessonImage,
  assignTopicImage,
  checkImages,
} from '../services/images.js';

const router = Router();

router.use(authenticate, requireRole('admin'));

const completedAttemptFilter = {
  $or: [{ status: 'completed' }, { status: { $exists: false } }],
};

const wrap = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function assignImageInBackground(promise, label) {
  promise.catch((error) => {
    console.error(`No se pudo asignar imagen a ${label}: ${error.message}`);
  });
}

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
      ? question.options.map((option) => String(option ?? '').trim())
      : [],
    correctIndex: Number(question.correctIndex),
    explanation: String(question.explanation || '').trim(),
  }));
}

function validQuestions(questions) {
  return (
    questions.length > 0 &&
    questions.every(
      (question) =>
        question.text &&
        question.options.length === 4 &&
        question.options.every(Boolean) &&
        Number.isInteger(question.correctIndex) &&
        question.correctIndex >= 0 &&
        question.correctIndex < 4 &&
        question.explanation,
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
        Attempt.countDocuments(completedAttemptFilter),
      ]);

    const recent = await Attempt.find(completedAttemptFilter)
      .select('-questions')
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
    const imageQuery = String(req.body?.imageQuery || '').trim();

    if (!payload.name || !payload.slug) {
      return res.status(400).json({ message: 'El nombre es obligatorio' });
    }

    const topic = await Topic.create(payload);

    if (imageQuery) {
      assignImageInBackground(assignTopicImage(topic, imageQuery), topic.name);
    } else if (!payload.imageUrl) {
      assignImageInBackground(assignTopicImage(topic), topic.name);
    }

    res.status(201).json(topic);
  }),
);

router.put(
  '/topics/:id',
  wrap(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Módulo no encontrado' });
    }

    const current = await Topic.findById(req.params.id).lean();

    if (!current) {
      return res.status(404).json({ message: 'Módulo no encontrado' });
    }

    const payload = topicPayload(req.body ?? {});
    const imageQuery = String(req.body?.imageQuery || '').trim();

    if (!payload.name || !payload.slug) {
      return res.status(400).json({ message: 'El nombre es obligatorio' });
    }

    if (!payload.imageUrl && current.image) {
      delete payload.imageUrl;
    } else if (
      payload.imageUrl &&
      current.image &&
      payload.imageUrl !== current.image.thumbnailUrl &&
      payload.imageUrl !== current.image.url
    ) {
      payload.image = null;
    }

    const topic = await Topic.findByIdAndUpdate(req.params.id, payload, {
      returnDocument: 'after',
      runValidators: true,
    });

    if (!topic) {
      return res.status(404).json({ message: 'Módulo no encontrado' });
    }

    if (imageQuery) {
      assignImageInBackground(assignTopicImage(topic, imageQuery), topic.name);
    }

    res.json(topic);
  }),
);

router.post(
  '/topics/:id/image',
  wrap(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Módulo no encontrado' });
    }

    const topic = await Topic.findById(req.params.id).lean();

    if (!topic) {
      return res.status(404).json({ message: 'Módulo no encontrado' });
    }

    try {
      const query = String(req.body?.query || '').trim();
      const updated = await assignTopicImage(
        topic,
        query || topic.image?.query,
        {
          excludeUrls: [topic.image?.thumbnailUrl, topic.image?.url],
        },
      );

      return res.json({
        image: updated.image,
        imageUrl: updated.imageUrl,
      });
    } catch (error) {
      console.error(error);
      return res.status(502).json({
        message:
          'No se pudo obtener una imagen de Openverse. Inténtalo de nuevo.',
      });
    }
  }),
);

router.post(
  '/images/check',
  wrap(async (req, res) => {
    const summary = await checkImages();
    res.json(summary);
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
    const imageQuery = String(req.body?.imageQuery || '').trim();

    if (!payload.topic || !mongoose.isValidObjectId(payload.topic)) {
      return res.status(400).json({ message: 'Selecciona un módulo válido' });
    }

    if (!payload.title) {
      return res.status(400).json({ message: 'El título es obligatorio' });
    }

    const topic = await Topic.findById(payload.topic).lean();

    if (!topic) {
      return res.status(400).json({ message: 'Selecciona un módulo válido' });
    }

    const lesson = await Lesson.create(payload);

    if (imageQuery) {
      assignImageInBackground(
        assignLessonImage(lesson, topic, imageQuery),
        lesson.title,
      );
    } else if (!payload.imageUrl) {
      assignImageInBackground(assignLessonImage(lesson, topic), lesson.title);
    }

    res.status(201).json(lesson);
  }),
);

router.put(
  '/lessons/:id',
  wrap(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Lección no encontrada' });
    }

    const current = await Lesson.findById(req.params.id).lean();

    if (!current) {
      return res.status(404).json({ message: 'Lección no encontrada' });
    }

    const payload = lessonPayload(req.body ?? {});
    const imageQuery = String(req.body?.imageQuery || '').trim();

    if (!payload.topic || !mongoose.isValidObjectId(payload.topic)) {
      return res.status(400).json({ message: 'Selecciona un módulo válido' });
    }

    if (!payload.title) {
      return res.status(400).json({ message: 'El título es obligatorio' });
    }

    if (!payload.imageUrl && current.image) {
      delete payload.imageUrl;
    } else if (
      payload.imageUrl &&
      current.image &&
      payload.imageUrl !== current.image.thumbnailUrl &&
      payload.imageUrl !== current.image.url
    ) {
      payload.image = null;
    }

    const lesson = await Lesson.findByIdAndUpdate(req.params.id, payload, {
      returnDocument: 'after',
      runValidators: true,
    });

    if (!lesson) {
      return res.status(404).json({ message: 'Lección no encontrada' });
    }

    if (imageQuery) {
      const topic = await Topic.findById(lesson.topic).lean();

      if (topic) {
        assignImageInBackground(
          assignLessonImage(lesson, topic, imageQuery),
          lesson.title,
        );
      }
    }

    res.json(lesson);
  }),
);

router.post(
  '/lessons/:id/image',
  wrap(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Lección no encontrada' });
    }

    const lesson = await Lesson.findById(req.params.id).lean();

    if (!lesson) {
      return res.status(404).json({ message: 'Lección no encontrada' });
    }

    const topic = await Topic.findById(lesson.topic).lean();

    if (!topic) {
      return res.status(409).json({ message: 'La lección no tiene un módulo válido' });
    }

    try {
      const query = String(req.body?.query || '').trim();
      const updated = await assignLessonImage(
        lesson,
        topic,
        query || lesson.image?.query,
        {
          excludeUrls: [lesson.image?.thumbnailUrl, lesson.image?.url],
        },
      );

      return res.json({
        image: updated.image,
        imageUrl: updated.imageUrl,
      });
    } catch (error) {
      console.error(error);
      return res.status(502).json({
        message:
          'No se pudo obtener una imagen de Openverse. Inténtalo de nuevo.',
      });
    }
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
    const topicFilter =
      req.query.topic && mongoose.isValidObjectId(req.query.topic)
        ? req.query.topic
        : '';
    const filter = topicFilter ? { topic: topicFilter } : {};
    const match = topicFilter
      ? { topic: new mongoose.Types.ObjectId(topicFilter) }
      : {};

    const [quizzes, counts] = await Promise.all([
      Quiz.find(filter)
        .select('-questions')
        .sort({ topic: 1, title: 1 })
        .populate('topic', 'name slug')
        .populate('lesson', 'title order')
        .lean(),
      Quiz.aggregate([
        { $match: match },
        { $project: { questionCount: { $size: '$questions' } } },
      ]),
    ]);

    const countMap = new Map(
      counts.map((item) => [String(item._id), item.questionCount]),
    );

    res.json(
      quizzes.map((quiz) => ({
        ...quiz,
        questionCount: countMap.get(String(quiz._id)) ?? 0,
      })),
    );
  }),
);

router.get(
  '/quizzes/:id',
  wrap(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Cuestionario no encontrado' });
    }

    const quiz = await Quiz.findById(req.params.id)
      .populate('topic', 'name slug')
      .populate('lesson', 'title order')
      .lean();

    if (!quiz) {
      return res.status(404).json({ message: 'Cuestionario no encontrado' });
    }

    res.json(quiz);
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
        message:
          'Cada pregunta necesita cuatro opciones, una respuesta correcta y una explicación',
      });
    }

    if (payload.published && payload.questions.length < 20) {
      return res.status(400).json({
        message: 'Publica solo cuando el cuestionario tenga al menos 20 preguntas',
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
        message:
          'Cada pregunta necesita cuatro opciones, una respuesta correcta y una explicación',
      });
    }

    if (payload.published && payload.questions.length < 20) {
      return res.status(400).json({
        message: 'Publica solo cuando el cuestionario tenga al menos 20 preguntas',
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

router.patch(
  '/quizzes/:id/published',
  wrap(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Cuestionario no encontrado' });
    }

    const { published } = req.body ?? {};

    if (typeof published !== 'boolean') {
      return res.status(400).json({ message: 'Estado de publicación inválido' });
    }

    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: 'Cuestionario no encontrado' });
    }

    if (published && !validQuestions(quiz.questions)) {
      return res.status(400).json({
        message:
          'Cada pregunta necesita cuatro opciones, una respuesta correcta y una explicación',
      });
    }

    if (published && quiz.questions.length < 20) {
      return res.status(400).json({
        message: 'Publica solo cuando el cuestionario tenga al menos 20 preguntas',
      });
    }

    quiz.published = published;
    await quiz.save();

    res.json({ _id: quiz._id, published: quiz.published });
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

router.post(
  '/users',
  wrap(async (req, res) => {
    const username = String(req.body?.username || '')
      .trim()
      .toLowerCase();
    const password = String(req.body?.password || '');
    const role = String(req.body?.role || 'student');

    if (!/^[a-z0-9._-]{3,32}$/.test(username)) {
      return res.status(400).json({
        message:
          'El usuario debe tener entre 3 y 32 caracteres y usar solo letras minúsculas, números, punto, guion o guion bajo',
      });
    }

    if (password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
      return res.status(400).json({
        message: 'La contraseña debe tener entre 8 y 72 caracteres',
      });
    }

    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      return res.status(400).json({
        message: 'La contraseña debe incluir al menos una letra y un número',
      });
    }

    if (!['admin', 'student'].includes(role)) {
      return res.status(400).json({ message: 'Rol inválido' });
    }

    const existing = await User.findOne({
      username: {
        $regex: `^${escapeRegExp(username)}$`,
        $options: 'i',
      },
    }).lean();

    if (existing) {
      return res.status(409).json({ message: 'El usuario ya existe' });
    }

    try {
      const hash = await bcrypt.hash(password, 12);
      const user = await User.create({ username, password: hash, role });

      return res.status(201).json({
        _id: user._id,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
      });
    } catch (error) {
      if (error?.code === 11000) {
        return res.status(409).json({ message: 'El usuario ya existe' });
      }

      throw error;
    }
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
    const attempts = await Attempt.find(completedAttemptFilter)
      .select('-questions')
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
