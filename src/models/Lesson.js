import mongoose from 'mongoose';
import { imageSchema } from './image.js';

const lessonSchema = new mongoose.Schema(
  {
    topic: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
    title: { type: String, required: true, trim: true },
    introduction: { type: String, default: '' },
    objectives: { type: [String], default: [] },
    content: { type: String, default: '' },
    example: { type: String, default: '' },
    recommendations: { type: [String], default: [] },
    imageUrl: { type: String, default: '' },
    image: { type: imageSchema, default: null },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Lesson = mongoose.model('Lesson', lessonSchema);
