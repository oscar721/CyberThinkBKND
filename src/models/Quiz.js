import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (options) =>
          Array.isArray(options) &&
          options.length === 4 &&
          options.every((option) => String(option).trim().length > 0),
        message: 'Cada pregunta debe tener exactamente 4 opciones no vacías',
      },
    },
    correctIndex: { type: Number, required: true, min: 0, max: 3 },
    explanation: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const quizSchema = new mongoose.Schema(
  {
    topic: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
    lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', default: null },
    title: { type: String, required: true, trim: true },
    passingScore: { type: Number, default: 70 },
    questions: { type: [questionSchema], default: [] },
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Quiz = mongoose.model('Quiz', quizSchema);
