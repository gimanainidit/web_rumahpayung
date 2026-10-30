import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, chmodSync } from 'node:fs';
import { dirname } from 'node:path';
import { randomBytes, scryptSync, timingSafeEqual, createHash } from 'node:crypto';
import type { Product, Settings } from '../src/domain.js';
export const dbPath = process.env.DATABASE_PATH || '.local/rumahpayung.sqlite';
mkdirSync(dirname(dbPath), { recursive: true });
export const db = new DatabaseSync(dbPath);
db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
CREATE TABLE IF NOT EXISTS migrations(version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL);
INSERT OR IGNORE INTO migrations VALUES(1,datetime('now'));
CREATE TABLE IF NOT EXISTS products(id TEXT PRIMARY KEY,slug TEXT UNIQUE NOT NULL,sku TEXT UNIQUE NOT NULL,data TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS settings(id INTEGER PRIMARY KEY CHECK(id=1),data TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS admins(id INTEGER PRIMARY KEY CHECK(id=1),password TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS leads(id TEXT PRIMARY KEY,data TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS orders(id TEXT PRIMARY KEY,owner TEXT NOT NULL,idempotency TEXT NOT NULL,data TEXT NOT NULL,UNIQUE(owner,idempotency));
CREATE TABLE IF NOT EXISTS audit(id INTEGER PRIMARY KEY,at TEXT NOT NULL,action TEXT NOT NULL,entity TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS events(id INTEGER PRIMARY KEY,at TEXT NOT NULL,name TEXT NOT NULL,source TEXT NOT NULL,campaign TEXT NOT NULL);
`);
chmodSync(dbPath, 0o600);
export const hash = (v: string) => createHash('sha256').update(v).digest('hex');
export function passwordHash(password: string) {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
}
export function checkPassword(password: string, stored: string) {
  const [salt, key] = stored.split(':');
  return timingSafeEqual(scryptSync(password, salt, 64), Buffer.from(key, 'hex'));
}
export function settings(): Settings {
  return JSON.parse(
    (db.prepare('SELECT data FROM settings WHERE id=1').get() as { data: string }).data,
  );
}
export function products(): Product[] {
  return (db.prepare('SELECT data FROM products').all() as { data: string }[]).map((r) => ({
    revision: 0,
    ...JSON.parse(r.data),
  }));
}
export function product(id: string): Product | undefined {
  const row = db.prepare('SELECT data FROM products WHERE id=?').get(id) as
    { data: string } | undefined;
  return row ? { revision: 0, ...JSON.parse(row.data) } : undefined;
}
export function saveProduct(p: Product) {
  p.revision = (product(p.id)?.revision ?? -1) + 1;
  db.prepare(
    'INSERT INTO products VALUES(?,?,?,?) ON CONFLICT(id) DO UPDATE SET slug=excluded.slug,sku=excluded.sku,data=excluded.data',
  ).run(p.id, p.slug, p.sku, JSON.stringify(p));
}
export function audit(action: string, entity: string) {
  db.prepare('INSERT INTO audit(at,action,entity) VALUES(?,?,?)').run(
    new Date().toISOString(),
    action,
    entity,
  );
}
export function transaction<T>(fn: () => T): T {
  db.exec('BEGIN IMMEDIATE');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
}
const initialSettings: Settings = {
  demo: true,
  whatsapp: '',
  businessName: 'RumahPayung',
  bankName: '',
  bankAccount: '',
  bankHolder: '',
  minMargin: 25,
  maxDiscount: 10,
  printCost: 5000,
  setupCost: 150000,
  shippingLocal: 25000,
  shippingNational: 50000,
  followupHours: 48,
  responseMinutes: 15,
};
if (!db.prepare('SELECT id FROM settings').get()) {
  transaction(() => {
    db.prepare('INSERT INTO settings VALUES(1,?)').run(JSON.stringify(initialSettings));
    const seeds: [string, string, string, number, number, Product['image'], Product['category']][] =
      [
        [
          'payung-golf',
          'Payung Golf Custom',
          'Kanopi lebar untuk aktivitas luar ruang. Pilih warna dan konsultasikan penempatan logo untuk kebutuhan perusahaan Anda.',
          125000,
          70000,
          'navy',
          'Payung',
        ],
        [
          'payung-lipat',
          'Payung Lipat Otomatis',
          'Praktis untuk mobilitas sehari-hari. Pilihan merchandise karyawan dan souvenir acara dengan logo perusahaan.',
          95000,
          55000,
          'black',
          'Payung',
        ],
        [
          'payung-klasik',
          'Payung Klasik Custom',
          'Siluet klasik dengan gagang lengkung. Pilihan untuk souvenir dan kebutuhan promosi dengan desain yang sederhana.',
          85000,
          47000,
          'cream',
          'Payung',
        ],
        [
          'payung-eco',
          'Payung Warna Custom',
          'Pilihan warna untuk identitas acara Anda. Konsultasikan bahan, ukuran, dan metode cetak sebelum produksi.',
          110000,
          62000,
          'green',
          'Payung',
        ],
        [
          'tumbler-custom',
          'Tumbler Custom',
          'Pelengkap paket merchandise perusahaan. Spesifikasi bahan, kapasitas, dan cetak dikonfirmasi saat penawaran.',
          85000,
          48000,
          'tumbler',
          'Tumbler',
        ],
        [
          'totebag-custom',
          'Tote Bag Custom',
          'Tas untuk paket souvenir dan acara. Pilih kebutuhan cetak bersama tim saat mengajukan penawaran.',
          45000,
          23000,
          'bag',
          'Tas',
        ],
      ];
    for (const [id, name, description, price, cost, image, category] of seeds)
      saveProduct({
        revision: 0,
        id,
        slug: id,
        sku: 'RP-' + id.toUpperCase(),
        name,
        description,
        price,
        cost,
        image,
        category,
        moq: 24,
        active: true,
        verified: false,
        variants: [
          { id: 'navy', label: 'Navy', color: '#183b59', stock: 120 },
          { id: 'cream', label: 'Cream', color: '#d8ccad', stock: 80 },
          { id: 'black', label: 'Hitam', color: '#303236', stock: 60 },
        ],
      });
  });
}
