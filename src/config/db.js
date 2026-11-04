import mongoose from 'mongoose';

const RETRY_DELAY_MS = 5000;

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI no está definida');
  }

  for (;;) {
    try {
      await mongoose.connect(uri, {
        dbName: process.env.MONGODB_DB || 'cyberthink',
        serverSelectionTimeoutMS: 10000,
      });

      console.log('MongoDB conectado');
      return;
    } catch (error) {
      console.error(
        `MongoDB no disponible (${error.message}). Reintentando en ${RETRY_DELAY_MS / 1000}s...`,
      );
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }
}
