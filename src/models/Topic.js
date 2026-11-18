import mongoose from 'mongoose';
import { imageSchema } from './image.js';

const topicSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    image: { type: imageSchema, default: null },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Topic = mongoose.model('Topic', topicSchema);
