import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import 'dotenv/config';
import { connectDB } from './config/db.js';
import { seedAdmin } from './seed.js';
import authRoutes from './routes/auth.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.json({ name: 'CyberThink API', version: '1.0.0', status: 'ok' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.use('/api/auth', authRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

async function start() {
  try {
    await connectDB();
    await seedAdmin();
  } catch (error) {
    console.error('No se pudo inicializar MongoDB:', error.message);
  }

  app.listen(PORT, () => {
    console.log(`CyberThink API running on http://localhost:${PORT}`);
  });
}

start();
