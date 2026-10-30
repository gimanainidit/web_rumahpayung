import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const dir = mkdtempSync(join(tmpdir(), 'rp-browser-'));
process.env.DATABASE_PATH = join(dir, 'test.sqlite');
process.env.PORT = '3100';
process.env.NODE_ENV = 'production';
const { db, passwordHash } = await import('../server/db.js');
db.prepare('INSERT INTO admins VALUES(1,?)').run(passwordHash('browser-test-password-only'));
process.on('exit', () => {
  try {
    db.close();
    rmSync(dir, { recursive: true, force: true });
  } catch {}
});
await import('../server/index.js');
