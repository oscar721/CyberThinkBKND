import mongoose from 'mongoose';

const attemptQuestionSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    text: { type: String, required: true },
    options: { type: [String], required: true },
    correctIndex: { type: Number, required: true },
    explanation: { type: String, required: true },
    selectedIndex: { type: Number, default: null },
    isCorrect: { type: Boolean, default: null },
  },
  { _id: false },
);

const attemptSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    status: {
      type: String,
      enum: ['in_progress', 'completed'],
      default: 'in_progress',
      index: true,
    },
    passingScore: { type: Number, default: 70 },
    score: { type: Number, required: true, default: 0 },
    passed: { type: Boolean, required: true, default: false },
    correct: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true, default: 0 },
    questions: { type: [attemptQuestionSchema], default: [] },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

attemptSchema.index(
  { user: 1, quiz: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'in_progress' },
  },
);
attemptSchema.index({ status: 1, createdAt: -1 });
attemptSchema.index({ username: 1, createdAt: -1 });

export const Attempt = mongoose.model('Attempt', attemptSchema);
