import bcrypt from 'bcryptjs';
import { User } from './models/User.js';
import { Topic } from './models/Topic.js';
import { Lesson } from './models/Lesson.js';
import { Video } from './models/Video.js';
import { Quiz } from './models/Quiz.js';
import { modules } from './data/curriculum.js';

async function ensureUser(username, password, role) {
  const existing = await User.findOne({ username });

  if (existing) {
    await User.updateOne(
      {
        _id: existing._id,
        $or: [{ role: { $exists: false } }, { role: null }],
      },
      { $set: { role } },
    );
    return;
  }

  const hash = await bcrypt.hash(password, 10);
  await User.create({ username, password: hash, role });
  console.log(`Usuario creado: ${username} (${role})`);
}

export async function seedAdmin() {
  await ensureUser('admin', 'admin', 'admin');
  await ensureUser('oscar', 'oscar', 'student');
}

export async function seedContent() {
  const count = await Topic.countDocuments();

  if (count > 0) {
    return;
  }

  for (const data of modules) {
    const topic = await Topic.create({
      name: data.name,
      slug: data.slug,
      description: data.description,
      order: data.order,
      published: true,
    });

    const lessons = await Lesson.insertMany(
      data.lessons.map((lesson) => ({
        topic: topic._id,
        title: lesson.title,
        introduction: lesson.introduction,
        objectives: lesson.objectives,
        content: lesson.content,
        example: lesson.example,
        recommendations: lesson.recommendations,
        imageUrl: '',
        order: lesson.order,
        published: true,
      })),
    );

    const lastLesson = lessons[lessons.length - 1];

    await Video.create({
      topic: topic._id,
      lesson: lastLesson?._id ?? null,
      title: data.video.title,
      url: data.video.url,
      description: data.video.description,
      order: 0,
      published: true,
    });

    await Quiz.create({
      topic: topic._id,
      lesson: lastLesson?._id ?? null,
      title: data.quiz.title,
      passingScore: data.quiz.passingScore,
      questions: data.quiz.questions,
      published: true,
    });
  }

  console.log('Contenido educativo cargado');
}
