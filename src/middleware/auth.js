import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/auth.js';

export function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Autenticación requerida' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);

    req.user = {
      id: payload.sub,
      username: payload.username,
      role: payload.role,
    };

    return next();
  } catch {
    return res.status(401).json({ message: 'Sesión inválida o expirada' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Autenticación requerida' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'No tienes permisos para esta acción' });
    }

    return next();
  };
}
