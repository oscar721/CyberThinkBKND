import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI no está definida');
  }

  await mongoose.connect(uri, {
    dbName: process.env.MONGODB_DB || 'cyberthink',
    serverSelectionTimeoutMS: 10000,
  });

  console.log('MongoDB conectado');
}
