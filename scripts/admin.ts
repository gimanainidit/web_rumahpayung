import { randomBytes } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { db, passwordHash } from '../server/db.js';
const password = process.env.ADMIN_PASSWORD || randomBytes(18).toString('base64url');
if (password.length < 14) throw Error('Password minimal 14 karakter.');
db.prepare(
  'INSERT INTO admins VALUES(1,?) ON CONFLICT(id) DO UPDATE SET password=excluded.password',
).run(passwordHash(password));
db.prepare('DELETE FROM sessions').run();
if (!process.env.ADMIN_PASSWORD) {
  writeFileSync('.local/admin-access.txt', `Login admin: /admin/login\nPassword: ${password}\n`, {
    mode: 0o600,
  });
  console.log('Kredensial dibuat di .local/admin-access.txt (lokal, tidak dilacak Git).');
} else console.log('Password admin diperbarui. Semua sesi sebelumnya dicabut.');
db.close();
