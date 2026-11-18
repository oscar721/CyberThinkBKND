import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema(
  {
    topic: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
    lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', default: null },
    title: { type: String, required: true, trim: true },
    url: { type: String, default: '' },
    description: { type: String, default: '' },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Video = mongoose.model('Video', videoSchema);
