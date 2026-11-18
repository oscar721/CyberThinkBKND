import { Router } from 'express';
import { randomInt, randomUUID } from 'node:crypto';
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

const completedAttemptFilter = {
  $or: [{ status: 'completed' }, { status: { $exists: false } }],
};

function shuffle(items) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const target = randomInt(0, index + 1);
    [copy[index], copy[target]] = [copy[target], copy[index]];
  }

  return copy;
}

function buildAttemptQuestions(questions) {
  const usable = (Array.isArray(questions) ? questions : []).filter(
    (question) =>
      question?.text &&
      Array.isArray(question.options) &&
      question.options.length === 4 &&
      question.options.every((option) => String(option).trim()) &&
      Number.isInteger(question.correctIndex) &&
      question.correctIndex >= 0 &&
      question.correctIndex < 4 &&
      question.explanation,
  );

  if (usable.length < 10) {
    return null;
  }

  return shuffle(usable)
    .slice(0, 10)
    .map((question) => {
      const indexed = question.options.map((text, index) => ({ text, index }));
      const options = shuffle(indexed);

      return {
        key: randomUUID(),
        text: question.text,
        options: options.map((option) => option.text),
        correctIndex: options.findIndex(
          (option) => option.index === question.correctIndex,
        ),
        explanation: question.explanation,
      };
    });
}

function publicQuestions(attempt) {
  return (attempt.questions ?? []).map((question) => ({
    key: question.key,
    text: question.text,
    options: question.options,
  }));
}

function publicAttemptResponse(attempt, quiz) {
  return {
    attemptId: attempt._id,
    title: quiz.title,
    passingScore: attempt.passingScore ?? quiz.passingScore,
    topic: quiz.topic,
    questions: publicQuestions(attempt),
  };
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

    const match = { _id: new mongoose.Types.ObjectId(req.params.id) };

    if (req.user.role !== 'admin') {
      match.published = true;
    }

    const [quiz] = await Quiz.aggregate([
      { $match: match },
      {
        $lookup: {
          from: 'topics',
          localField: 'topic',
          foreignField: '_id',
          as: 'topic',
        },
      },
      { $unwind: { path: '$topic', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          title: 1,
          passingScore: 1,
          questionCount: { $size: '$questions' },
          topic: {
            _id: '$topic._id',
            name: '$topic.name',
            slug: '$topic.slug',
          },
        },
      },
    ]);

    if (!quiz) {
      return res.status(404).json({ message: 'Cuestionario no encontrado' });
    }

    res.json(quiz);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener el cuestionario' });
  }
});

router.post('/quizzes/:id/submit', (req, res) => {
  res.status(410).json({
    message: 'Este flujo fue reemplazado. Inicia una evaluación nueva para responder.',
  });
});

router.post('/quizzes/:id/attempts', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Cuestionario no encontrado' });
    }

    if (!mongoose.isValidObjectId(req.user.id)) {
      return res.status(401).json({ message: 'Sesión inválida' });
    }

    const quiz = await Quiz.findOne({ _id: req.params.id, ...visibility(req) })
      .populate('topic', 'name slug')
      .lean();

    if (!quiz) {
      return res.status(404).json({ message: 'Cuestionario no encontrado' });
    }

    const existing = await Attempt.findOne({
      user: req.user.id,
      quiz: quiz._id,
      status: 'in_progress',
    }).sort({ createdAt: -1 });

    if (existing) {
      return res.json(publicAttemptResponse(existing, quiz));
    }

    const questions = buildAttemptQuestions(quiz.questions);

    if (!questions) {
      return res.status(409).json({
        message:
          'El cuestionario no tiene suficientes preguntas válidas para iniciar la evaluación.',
      });
    }

    try {
      const attempt = await Attempt.create({
        username: req.user.username,
        user: req.user.id,
        quiz: quiz._id,
        status: 'in_progress',
        passingScore: quiz.passingScore,
        score: 0,
        passed: false,
        correct: 0,
        total: questions.length,
        questions,
        startedAt: new Date(),
      });

      return res.status(201).json(publicAttemptResponse(attempt, quiz));
    } catch (error) {
      if (error?.code === 11000) {
        const concurrent = await Attempt.findOne({
          user: req.user.id,
          quiz: quiz._id,
          status: 'in_progress',
        }).sort({ createdAt: -1 });

        if (concurrent) {
          return res.json(publicAttemptResponse(concurrent, quiz));
        }
      }

      throw error;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al iniciar la evaluación' });
  }
});

router.post('/attempts/:id/submit', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Intento no encontrado' });
    }

    if (!mongoose.isValidObjectId(req.user.id)) {
      return res.status(401).json({ message: 'Sesión inválida' });
    }

    const attempt = await Attempt.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!attempt) {
      return res.status(404).json({ message: 'Intento no encontrado' });
    }

    if (attempt.status !== 'in_progress') {
      return res.status(409).json({ message: 'Esta evaluación ya fue enviada' });
    }

    const { answers } = req.body ?? {};

    if (!Array.isArray(answers) || answers.length !== attempt.questions.length) {
      return res.status(400).json({ message: 'Respuestas inválidas' });
    }

    const answerMap = new Map();

    for (const answer of answers) {
      const questionKey =
        typeof answer?.questionKey === 'string' ? answer.questionKey : '';
      const selectedIndex = answer?.selectedIndex;
      const question = attempt.questions.find(
        (item) => item.key === questionKey,
      );

      if (
        !questionKey ||
        !question ||
        typeof selectedIndex !== 'number' ||
        !Number.isInteger(selectedIndex) ||
        selectedIndex < 0 ||
        selectedIndex >= question.options.length ||
        answerMap.has(questionKey)
      ) {
        return res.status(400).json({ message: 'Respuestas inválidas' });
      }

      answerMap.set(questionKey, selectedIndex);
    }

    if (answerMap.size !== attempt.questions.length) {
      return res.status(400).json({ message: 'Debes responder todas las preguntas' });
    }

    let correct = 0;

    const updatedQuestions = attempt.questions.map((question) => {
      const selectedIndex = answerMap.get(question.key);
      const isCorrect = selectedIndex === question.correctIndex;

      if (isCorrect) {
        correct += 1;
      }

      return {
        key: question.key,
        text: question.text,
        options: question.options,
        correctIndex: question.correctIndex,
        explanation: question.explanation,
        selectedIndex,
        isCorrect,
      };
    });

    const total = updatedQuestions.length;
    const score = Math.round((correct / total) * 100);
    const passingScore = attempt.passingScore ?? 70;
    const passed = score >= passingScore;

    const updated = await Attempt.findOneAndUpdate(
      {
        _id: attempt._id,
        user: req.user.id,
        status: 'in_progress',
      },
      {
        $set: {
          questions: updatedQuestions,
          score,
          passed,
          correct,
          total,
          status: 'completed',
          completedAt: new Date(),
        },
      },
      { returnDocument: 'after' },
    ).lean();

    if (!updated) {
      return res.status(409).json({ message: 'Esta evaluación ya fue enviada' });
    }

    return res.json({
      score,
      passed,
      correct,
      total,
      passingScore,
      detail: updated.questions.map((question) => ({
        text: question.text,
        options: question.options,
        selectedIndex: question.selectedIndex,
        correctIndex: question.correctIndex,
        explanation: question.explanation,
        isCorrect: question.isCorrect,
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al enviar la evaluación' });
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

    const attempts = await Attempt.find({ ...filter, ...completedAttemptFilter })
      .select('-questions')
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
      Attempt.find({ username: req.user.username, ...completedAttemptFilter })
        .select('score passed')
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
