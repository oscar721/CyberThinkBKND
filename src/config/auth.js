import 'dotenv/config';
import crypto from 'node:crypto';

export const JWT_SECRET =
  process.env.JWT_SECRET || crypto.randomBytes(48).toString('hex');

export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

if (!process.env.JWT_SECRET) {
  console.warn(
    'JWT_SECRET no está definida. Se generó un secreto temporal; las sesiones se invalidarán al reiniciar.',
  );
}
