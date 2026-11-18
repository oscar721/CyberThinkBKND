import mongoose from 'mongoose';

export const imageSchema = new mongoose.Schema(
  {
    id: { type: String, default: '' },
    title: { type: String, default: '' },
    url: { type: String, default: '' },
    thumbnailUrl: { type: String, default: '' },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    creator: { type: String, default: '' },
    creatorUrl: { type: String, default: '' },
    license: { type: String, default: '' },
    licenseVersion: { type: String, default: '' },
    licenseUrl: { type: String, default: '' },
    source: { type: String, default: 'openverse' },
    foreignLandingUrl: { type: String, default: '' },
    attribution: { type: String, default: '' },
    query: { type: String, default: '' },
    fetchedAt: { type: Date, default: null },
    checkedAt: { type: Date, default: null },
  },
  { _id: false },
);
