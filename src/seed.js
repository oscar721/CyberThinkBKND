import bcrypt from 'bcryptjs';
import { User } from './models/User.js';
import { Topic } from './models/Topic.js';
import { Lesson } from './models/Lesson.js';
import { Video } from './models/Video.js';
import { Quiz } from './models/Quiz.js';
import { topics } from './data/seedContent.js';

export async function seedAdmin() {
  const exists = await User.findOne({ username: 'admin' });

  if (exists) {
    return;
  }

  const password = await bcrypt.hash('admin', 10);
  await User.create({ username: 'admin', password });
  console.log('Usuario de prueba creado: admin / admin');
}

export async function seedContent() {
  const count = await Topic.countDocuments();

  if (count > 0) {
    return;
  }

  for (const data of topics) {
    const topic = await Topic.create({
      name: data.name,
      slug: data.slug,
      description: data.description,
      order: data.order,
    });

    await Lesson.insertMany(
      data.lessons.map((lesson, index) => ({
        topic: topic._id,
        title: lesson.title,
        content: lesson.content,
        order: index,
      })),
    );

    await Video.insertMany(
      data.videos.map((video, index) => ({
        topic: topic._id,
        title: video.title,
        url: video.url,
        description: video.description,
        order: index,
      })),
    );

    if (data.quiz) {
      await Quiz.create({
        topic: topic._id,
        title: data.quiz.title,
        passingScore: data.quiz.passingScore,
        questions: data.quiz.questions,
      });
    }
  }

  console.log('Contenido educativo de ejemplo cargado');
}
