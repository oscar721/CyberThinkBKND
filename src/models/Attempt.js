import mongoose from 'mongoose';

const attemptSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    score: { type: Number, required: true },
    passed: { type: Boolean, required: true },
    correct: { type: Number, required: true },
    total: { type: Number, required: true },
  },
  { timestamps: true },
);

export const Attempt = mongoose.model('Attempt', attemptSchema);
