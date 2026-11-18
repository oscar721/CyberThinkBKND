import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import 'dotenv/config';
import { connectDB } from './config/db.js';
import { seedAdmin, seedContent } from './seed.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import contentRoutes from './routes/content.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.json({ name: 'CyberThink API', version: '1.0.0', status: 'ok' });
});

app.get('/health', (req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];

  res.json({
    status: 'ok',
    uptime: process.uptime(),
    db: states[mongoose.connection.readyState] ?? 'unknown',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', contentRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.use((error, req, res, next) => {
  console.error(error);

  if (res.headersSent) {
    return next(error);
  }

  if (error?.name === 'ValidationError') {
    return res.status(400).json({ message: error.message });
  }

  if (error?.code === 11000) {
    return res.status(409).json({ message: 'Ya existe un registro con ese valor único' });
  }

  return res.status(500).json({ message: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`CyberThink API running on http://localhost:${PORT}`);
});

connectDB()
  .then(async () => {
    await seedAdmin();
    await seedContent();
  })
  .catch((error) => {
    console.error('No se pudo inicializar MongoDB:', error.message);
  });
