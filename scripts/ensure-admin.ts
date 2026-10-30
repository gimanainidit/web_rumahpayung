import { db } from '../server/db.js';
if (db.prepare('SELECT id FROM admins WHERE id=1').get()) {
  console.log('Admin sudah tersedia; kredensial dipertahankan.');
  db.close();
} else {
  await import('./admin.js');
}
