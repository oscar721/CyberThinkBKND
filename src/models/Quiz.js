import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    options: { type: [String], required: true },
    correctIndex: { type: Number, required: true },
  },
  { _id: false },
);

const quizSchema = new mongoose.Schema(
  {
    topic: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
    title: { type: String, required: true, trim: true },
    passingScore: { type: Number, default: 70 },
    questions: { type: [questionSchema], default: [] },
  },
  { timestamps: true },
);

export const Quiz = mongoose.model('Quiz', quizSchema);
