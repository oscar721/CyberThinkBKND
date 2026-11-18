import 'dotenv/config';
import mongoose from 'mongoose';
import { assignMissingImages } from '../src/services/images.js';

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('MONGODB_URI no está definida');
}

await mongoose.connect(uri, {
  dbName: process.env.MONGODB_DB || 'cyberthink',
  serverSelectionTimeoutMS: 15000,
});

try {
  const summary = await assignMissingImages();
  console.log(JSON.stringify({ summary }, null, 2));
} finally {
  await mongoose.disconnect().catch(() => {});
}
