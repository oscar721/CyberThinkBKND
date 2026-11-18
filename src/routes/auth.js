import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/auth.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Base de datos no disponible' });
    }

    const { username, password } = req.body ?? {};

    if (!username || !password) {
      return res.status(400).json({ message: 'Usuario y contraseña son obligatorios' });
    }

    const user = await User.findOne({ username: String(username).trim() });

    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const role = user.role || (user.username === 'admin' ? 'admin' : 'student');

    const token = jwt.sign(
      { sub: user._id.toString(), username: user.username, role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    );

    return res.json({
      success: true,
      message: 'Login exitoso',
      token,
      user: { username: user.username, role },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

router.get('/me', authenticate, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.user.id)) {
      return res.status(401).json({ message: 'Sesión inválida' });
    }

    const user = await User.findById(req.user.id).select('username role').lean();

    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    return res.json({ user: { username: user.username, role: user.role } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

export default router;
