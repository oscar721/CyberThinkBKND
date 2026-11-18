import mongoose from 'mongoose';
import { imageSchema } from './image.js';

const imageSearchCacheSchema = new mongoose.Schema(
  {
    queryKey: { type: String, required: true, unique: true, index: true },
    query: { type: String, required: true },
    results: { type: [imageSchema], default: [] },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true },
);

export const ImageSearchCache = mongoose.model(
  'ImageSearchCache',
  imageSearchCacheSchema,
);
