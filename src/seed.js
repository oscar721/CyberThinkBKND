import bcrypt from 'bcryptjs';
import { User } from './models/User.js';

export async function seedAdmin() {
  const exists = await User.findOne({ username: 'admin' });

  if (exists) {
    return;
  }

  const password = await bcrypt.hash('admin', 10);
  await User.create({ username: 'admin', password });
  console.log('Usuario de prueba creado: admin / admin');
}
