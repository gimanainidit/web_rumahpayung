import { backup } from 'node:sqlite';
import { mkdirSync, chmodSync } from 'node:fs';
import { db } from '../server/db.js';
mkdirSync('.local/backups', { recursive: true });
const path = `.local/backups/rumahpayung-${Date.now()}.sqlite`;
await backup(db, path);
chmodSync(path, 0o600);
console.log(path);
db.close();
