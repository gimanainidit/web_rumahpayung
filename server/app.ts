import { mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import sharp from 'sharp';
import express, { type Request, type Response, type NextFunction } from 'express';
import { rateLimit } from 'express-rate-limit';
import { randomBytes, randomUUID } from 'node:crypto';
import { z } from 'zod';
import {
  dbPath,
  db,
  settings,
  products,
  product,
  saveProduct,
  transaction,
  audit,
  hash,
  checkPassword,
} from './db.js';
import {
  businessDate,
  productSchema,
  settingsSchema,
  leadSchema,
  checkoutSchema,
  calculateQuote,
  stages,
  orderStates,
  orderLabels,
  type Order,
  type Lead,
  type Checkout,
} from '../src/domain.js';
export const app = express();
app.disable('x-powered-by');
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});
app.use('/api', (_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});
app.use('/api/admin/media', express.json({ limit: '7mb' }));
app.use(express.json({ limit: '64kb' }));
app.use('/api', (req, res, next) => {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    if (req.get('X-RP-Request') !== '1' || !req.is('application/json'))
      return res.status(403).json({ error: 'Permintaan tidak diizinkan.' });
    const origin = req.get('Origin');
    if (origin) {
      try {
        if (new URL(origin).host !== req.get('Host'))
          return res.status(403).json({ error: 'Origin tidak diizinkan.' });
      } catch {
        return res.status(403).json({ error: 'Origin tidak valid.' });
      }
    }
  }
  next();
});
app.use(
  '/api',
  rateLimit({
    windowMs: 60000,
    limit: 240,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: 'Terlalu banyak permintaan. Coba lagi sebentar.' },
  }),
);
function cookie(req: Request, name: string) {
  return (
    req.headers.cookie
      ?.split(';')
      .map((s) => s.trim())
      .find((s) => s.startsWith(name + '='))
      ?.slice(name.length + 1) || ''
  );
}
const secure = process.env.COOKIE_SECURE === 'true';
function setCookie(res: Response, name: string, value: string, maxAge: number) {
  res.cookie(name, value, { httpOnly: true, sameSite: 'strict', secure, path: '/', maxAge });
}
function owner(req: Request, res: Response) {
  let token = cookie(req, 'rp_guest');
  if (!/^[a-f0-9]{64}$/.test(token)) {
    token = randomBytes(32).toString('hex');
    setCookie(res, 'rp_guest', token, 90 * 86400000);
  }
  return hash(token);
}
function isAdmin(req: Request) {
  const token = cookie(req, 'rp_admin');
  return (
    !!token &&
    !!db
      .prepare('SELECT token FROM sessions WHERE token=? AND expires>?')
      .get(hash(token), Date.now())
  );
}
function admin(req: Request, res: Response, next: NextFunction) {
  if (!isAdmin(req)) return res.status(401).json({ error: 'Silakan masuk sebagai admin.' });
  next();
}
function fail(message: string, status = 400): never {
  throw Object.assign(new Error(message), { status });
}
function records<T>(table: 'leads' | 'orders'): T[] {
  return (
    db.prepare(`SELECT data FROM ${table} ORDER BY rowid DESC`).all() as { data: string }[]
  ).map((r) => JSON.parse(r.data));
}
function leadById(id: string): Lead {
  const row = db.prepare('SELECT data FROM leads WHERE id=?').get(id) as
    { data: string } | undefined;
  if (!row) fail('Prospek tidak ditemukan.', 404);
  return JSON.parse(row.data);
}
function orderById(id: string): Order {
  const row = db.prepare('SELECT data FROM orders WHERE id=?').get(id) as
    { data: string } | undefined;
  if (!row) fail('Pesanan tidak ditemukan.', 404);
  return JSON.parse(row.data);
}
function saveLead(l: Lead) {
  db.prepare('UPDATE leads SET data=? WHERE id=?').run(JSON.stringify(l), l.id);
}
function available(id: string) {
  const p = product(id);
  if (!p || !p.active || (!settings().demo && !p.verified)) fail('Produk tidak tersedia.', 404);
  return p;
}
app.get('/api/health', (_req, res) => {
  db.prepare('SELECT 1').get();
  res.json({ status: 'ok' });
});
app.get('/api/store', (req, res) => {
  owner(req, res);
  const s = settings();
  res.json({
    products: products()
      .filter((p) => p.active && (s.demo || p.verified))
      .map(({ cost, ...p }) => p),
    settings: {
      demo: s.demo,
      whatsapp: s.whatsapp,
      businessName: s.businessName,
      shippingLocal: s.shippingLocal,
      shippingNational: s.shippingNational,
      bankReady: !!(s.bankName && s.bankAccount && s.bankHolder),
    },
  });
});
const intakeLimit = rateLimit({
  windowMs: 3600000,
  limit: 30,
  message: { error: 'Batas pengajuan tercapai. Silakan coba kembali nanti.' },
});
app.post('/api/estimate', (req, res) => {
  const d = z.object({ productId: z.string(), quantity: z.number().int() }).parse(req.body);
  const { cost, margin, ...quote } = calculateQuote(available(d.productId), d.quantity, settings());
  res.json(quote);
});
app.post('/api/leads', intakeLimit, (req, res) => {
  const d = leadSchema.parse(req.body),
    p = available(d.productId);
  if (d.quantity < p.moq) fail(`Minimum ${p.moq} pcs.`);
  if (
    d.deadline < businessDate() ||
    Number.isNaN(Date.parse(d.deadline)) ||
    new Date(d.deadline).toISOString().slice(0, 10) !== d.deadline
  )
    fail('Tanggal kebutuhan tidak valid atau sudah lewat.');
  const now = new Date().toISOString();
  const lead: Lead = {
    ...d,
    id: 'LEAD-' + randomBytes(5).toString('hex').toUpperCase(),
    createdAt: now,
    stage: 'New Lead',
    owner: 'Belum ditugaskan',
    followupAt: new Date(Date.now() + settings().responseMinutes * 60000).toISOString(),
    lostReason: '',
    revenue: 0,
    quote: null,
    activities: [{ at: now, text: 'Permintaan penawaran diterima dari formulir.' }],
  };
  db.prepare('INSERT INTO leads VALUES(?,?)').run(lead.id, JSON.stringify(lead));
  res.status(201).json({ id: lead.id });
});
app.post('/api/events', intakeLimit, (req, res) => {
  const d = z
    .object({
      name: z.enum(['whatsapp_click']),
      source: z.string().max(120),
      campaign: z.string().max(120),
    })
    .parse(req.body);
  db.prepare('INSERT INTO events(at,name,source,campaign) VALUES(?,?,?,?)').run(
    new Date().toISOString(),
    d.name,
    d.source,
    d.campaign,
  );
  res.json({ ok: true });
});
function preview(d: Checkout) {
  const seen = new Set<string>();
  const items = d.items.map((item) => {
    const key = item.productId + ':' + item.variantId;
    if (seen.has(key)) fail('Item duplikat.');
    seen.add(key);
    const p = available(item.productId),
      v = p.variants.find((v) => v.id === item.variantId);
    if (!v || v.stock < item.quantity) fail(`Stok ${p.name} tidak mencukupi.`);
    return { ...item, name: p.name, variant: v.label, price: p.price, image: p.image };
  });
  const s = settings();
  if (d.shipping === 'local' && !/jakarta/i.test(d.address.city))
    fail('Tarif Jakarta hanya berlaku untuk alamat Jakarta.');
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    shippingCost =
      d.shipping === 'pickup' ? 0 : d.shipping === 'local' ? s.shippingLocal : s.shippingNational;
  return { items, subtotal, shippingCost, total: subtotal + shippingCost };
}
app.post('/api/checkout/preview', (req, res) => {
  res.json(preview(checkoutSchema.parse(req.body)));
});
app.post('/api/orders', intakeLimit, (req, res) => {
  const d = checkoutSchema.parse(req.body),
    key = z.uuid().parse(req.get('Idempotency-Key')),
    guest = owner(req, res);
  const result = transaction(() => {
    const existing = db
      .prepare('SELECT data FROM orders WHERE owner=? AND idempotency=?')
      .get(guest, key) as { data: string } | undefined;
    if (existing) return JSON.parse(existing.data) as Order;
    const s = settings();
    if (!s.demo && !(s.bankName && s.bankAccount && s.bankHolder))
      fail('Pembayaran belum tersedia. Silakan ajukan penawaran.');
    const totals = preview(d);
    if (d.expectedTotal !== totals.total)
      fail('Total berubah. Periksa kembali ringkasan pesanan.', 409);
    for (const i of totals.items) {
      const p = product(i.productId)!;
      p.variants.find((v) => v.id === i.variantId)!.stock -= i.quantity;
      saveProduct(p);
    }
    const now = new Date().toISOString();
    const order: Order = {
      id: 'RP-' + randomBytes(6).toString('hex').toUpperCase(),
      createdAt: now,
      updatedAt: now,
      ...totals,
      address: d.address,
      shipping: d.shipping,
      payment: 'pending',
      status: 'unfulfilled',
      courier: '',
      tracking: '',
      timeline: [{ at: now, text: 'Pesanan diterima. Menunggu verifikasi pembayaran manual.' }],
      demo: s.demo,
      bank: { name: s.bankName, account: s.bankAccount, holder: s.bankHolder },
    };
    db.prepare('INSERT INTO orders VALUES(?,?,?,?)').run(
      order.id,
      guest,
      key,
      JSON.stringify(order),
    );
    audit('order.created', order.id);
    return order;
  });
  res.status(201).json(result);
});
app.get('/api/orders', (req, res) => {
  const guest = owner(req, res);
  res.json(
    (
      db.prepare('SELECT data FROM orders WHERE owner=? ORDER BY rowid DESC').all(guest) as {
        data: string;
      }[]
    ).map((r) => JSON.parse(r.data)),
  );
});
app.get('/api/orders/:id', (req, res) => {
  const guest = owner(req, res);
  const row = db
    .prepare('SELECT data FROM orders WHERE id=? AND owner=?')
    .get(req.params.id as string, guest) as { data: string } | undefined;
  if (!row) fail('Pesanan tidak ditemukan di sesi Anda.', 404);
  res.json(JSON.parse(row.data));
});
function cancelOrder(o: Order) {
  if (o.payment === 'paid' || o.status !== 'unfulfilled')
    fail('Pembatalan hanya untuk pesanan belum dibayar. Hubungi tim untuk bantuan.');
  for (const i of o.items) {
    const p = product(i.productId);
    if (p) {
      const v = p.variants.find((v) => v.id === i.variantId);
      if (v) v.stock += i.quantity;
      saveProduct(p);
    }
  }
  o.status = 'cancelled';
  o.payment = 'cancelled';
  o.updatedAt = new Date().toISOString();
  o.timeline.push({ at: o.updatedAt, text: 'Pesanan dibatalkan; stok dikembalikan.' });
  db.prepare('UPDATE orders SET data=? WHERE id=?').run(JSON.stringify(o), o.id);
  audit('order.cancelled', o.id);
}
app.post('/api/orders/:id/cancel', (req, res) => {
  transaction(() => {
    const row = db
      .prepare('SELECT data FROM orders WHERE id=? AND owner=?')
      .get(req.params.id as string, owner(req, res)) as { data: string } | undefined;
    if (!row) fail('Pesanan tidak ditemukan.', 404);
    cancelOrder(JSON.parse(row.data));
  });
  res.json({ ok: true });
});
app.post(
  '/api/admin/login',
  rateLimit({
    windowMs: 900000,
    limit: 10,
    message: { error: 'Terlalu banyak percobaan masuk. Coba lagi 15 menit.' },
  }),
  (req, res) => {
    const { password } = z.object({ password: z.string().min(1).max(200) }).parse(req.body);
    const a = db.prepare('SELECT password FROM admins WHERE id=1').get() as
      { password: string } | undefined;
    if (!a || !checkPassword(password, a.password)) fail('Kredensial tidak valid.', 401);
    const token = randomBytes(32).toString('hex');
    db.prepare('DELETE FROM sessions WHERE expires<?').run(Date.now());
    db.prepare('INSERT INTO sessions VALUES(?,?)').run(hash(token), Date.now() + 8 * 3600000);
    setCookie(res, 'rp_admin', token, 8 * 3600000);
    res.json({ ok: true });
  },
);
app.use('/api/admin', admin);
app.post('/api/admin/media', async (req, res) => {
  const d = z
    .object({
      data: z
        .string()
        .min(1)
        .max(7_000_000)
        .regex(/^[A-Za-z0-9+/=]+$/),
      mime: z.enum(['image/jpeg', 'image/png', 'image/webp']),
    })
    .parse(req.body);
  const bytes = Buffer.from(d.data, 'base64');
  if (bytes.length > 5 * 1024 * 1024) fail('Ukuran foto maksimal 5 MB.');
  const image = sharp(bytes, { limitInputPixels: 20_000_000 });
  let metadata;
  try {
    metadata = await image.metadata();
  } catch {
    fail('Berkas bukan gambar yang valid.');
  }
  if (
    !['jpeg', 'png', 'webp'].includes(metadata.format || '') ||
    (metadata.pages && metadata.pages > 1)
  )
    fail('Gunakan foto JPEG, PNG, atau WebP statis.');
  const dir = resolve(dirname(dbPath), 'uploads');
  mkdirSync(dir, { recursive: true, mode: 0o700 });
  const name = randomUUID() + '.webp';
  try {
    await image
      .rotate()
      .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(resolve(dir, name));
  } catch {
    fail('Foto gagal diproses. Gunakan gambar lain.');
  }
  audit('media.uploaded', name);
  res.status(201).json({ url: '/media/' + name });
});
app.get('/api/admin/session', (_req, res) => res.json({ ok: true }));
app.post('/api/admin/logout', (req, res) => {
  db.prepare('DELETE FROM sessions WHERE token=?').run(hash(cookie(req, 'rp_admin')));
  setCookie(res, 'rp_admin', '', 0);
  res.json({ ok: true });
});
app.get('/api/admin/data', (_req, res) => {
  const leads = records<Lead>('leads'),
    orders = records<Order>('orders');
  res.json({
    leads,
    orders,
    products: products(),
    settings: settings(),
    audit: db.prepare('SELECT * FROM audit ORDER BY id DESC LIMIT 100').all(),
    whatsappClicks: (db.prepare('SELECT count(*) n FROM events').get() as { n: number }).n,
  });
});
app.put('/api/admin/products/:id', (req, res) => {
  const p = productSchema.parse(req.body);
  if (p.id !== req.params.id) fail('ID tidak sesuai.');
  if (
    p.image.startsWith('/media/') &&
    !existsSync(resolve(dirname(dbPath), 'uploads', p.image.slice(7)))
  )
    fail('Foto belum tersedia. Unggah ulang.');
  if (new Set(p.variants.map((v) => v.id)).size !== p.variants.length)
    fail('ID varian harus unik.');
  if (p.price < p.cost) fail('Harga jual tidak boleh lebih rendah dari HPP.');
  const old = product(p.id);
  if (old && p.revision !== old.revision)
    fail('Produk berubah sejak dibuka. Tutup editor dan muat ulang sebelum menyimpan.', 409);
  if (old && old.variants.some((v) => !p.variants.some((n) => n.id === v.id)))
    fail('Varian lama harus dipertahankan untuk histori stok. Set stok nol untuk menonaktifkan.');
  transaction(() => {
    saveProduct(p);
    audit('product.saved', p.id);
  });
  res.json(p);
});
app.put('/api/admin/settings', (req, res) => {
  const s = settingsSchema.parse(req.body);
  if (!s.demo) {
    if (!(s.whatsapp && s.bankName && s.bankAccount && s.bankHolder))
      fail('Isi WhatsApp dan rekening sebelum mengaktifkan penjualan nyata.');
    if (products().some((p) => p.active && !p.verified))
      fail('Verifikasi atau arsipkan semua produk contoh terlebih dahulu.');
  }
  transaction(() => {
    db.prepare('UPDATE settings SET data=? WHERE id=1').run(JSON.stringify(s));
    audit('settings.updated', 'store');
  });
  res.json(s);
});
app.patch('/api/admin/leads/:id', (req, res) => {
  const d = z
    .object({
      stage: z.enum(stages),
      owner: z.string().trim().min(1).max(120),
      followupAt: z.iso.datetime().nullable(),
      lostReason: z.string().trim().max(500),
      revenue: z.number().int().min(0).max(100000000000),
      note: z.string().trim().max(2000),
    })
    .parse(req.body);
  const l = leadById(req.params.id as string);
  if (d.stage === 'Lost' && !d.lostReason) fail('Isi alasan prospek tidak lanjut.');
  if (['Quotation Sent', 'Negotiation', 'Won'].includes(d.stage) && !l.quote)
    fail('Buat quotation terlebih dahulu.');
  if (d.stage === 'Won' && (d.revenue <= 0 || d.revenue !== l.quote?.total))
    fail('Omzet harus sama dengan total quotation yang disepakati.');
  if (!['Won', 'Lost'].includes(d.stage) && !d.followupAt)
    fail('Prospek aktif wajib memiliki jadwal follow-up.');
  l.activities.push({
    at: new Date().toISOString(),
    text: d.note || `Status: ${d.stage}; PIC: ${d.owner}.`,
  });
  Object.assign(l, {
    stage: d.stage,
    owner: d.owner,
    followupAt: ['Won', 'Lost'].includes(d.stage) ? null : d.followupAt,
    lostReason: d.stage === 'Lost' ? d.lostReason : '',
    revenue: d.stage === 'Won' ? d.revenue : 0,
  });
  transaction(() => {
    saveLead(l);
    audit('lead.updated', l.id);
  });
  res.json(l);
});
app.post('/api/admin/leads/:id/quote', (req, res) => {
  const d = z.object({ discount: z.number().min(0).max(40) }).parse(req.body);
  const l = leadById(req.params.id as string);
  if (['Won', 'Lost'].includes(l.stage)) fail('Buka kembali prospek sebelum mengubah quotation.');
  const p = product(l.productId);
  if (!p || !p.active) fail('Produk sudah tidak aktif.');
  l.quote = calculateQuote(p, l.quantity, settings(), d.discount);
  l.followupAt = new Date(Date.now() + settings().followupHours * 3600000).toISOString();
  l.activities.push({
    at: new Date().toISOString(),
    text: 'Quotation dibuat. Belum ditandai dikirim.',
  });
  transaction(() => {
    saveLead(l);
    audit('quote.created', l.id);
  });
  res.json(l);
});
app.patch('/api/admin/orders/:id', (req, res) => {
  const d = z
    .object({
      action: z.enum(['pay', 'fulfill', 'cancel']),
      status: z.enum(orderStates).optional(),
      courier: z.string().trim().max(120).default(''),
      tracking: z.string().trim().max(120).default(''),
    })
    .parse(req.body);
  const o = transaction(() => {
    const o = orderById(req.params.id as string);
    if (d.action === 'cancel') {
      cancelOrder(o);
      return o;
    }
    if (d.action === 'pay') {
      if (o.payment !== 'pending' || o.status !== 'unfulfilled')
        fail('Pembayaran sudah diproses atau pesanan dibatalkan.');
      o.payment = 'paid';
      o.status = 'processing';
    } else {
      const transitions: Record<string, string> = {
        processing: 'packed',
        packed: 'shipped',
        shipped: 'delivered',
      };
      if (o.payment !== 'paid' || transitions[o.status] !== d.status)
        fail('Perubahan status tidak diizinkan.');
      if (d.status === 'shipped' && (!d.courier || !d.tracking))
        fail('Isi kurir dan nomor resi/referensi serah terima.');
      o.status = d.status!;
      if (d.status === 'shipped') {
        o.courier = d.courier;
        o.tracking = d.tracking;
      }
    }
    o.updatedAt = new Date().toISOString();
    o.timeline.push({
      at: o.updatedAt,
      text:
        d.action === 'pay'
          ? 'Pembayaran diverifikasi manual oleh admin.'
          : `Status diperbarui admin: ${orderLabels[o.status]}.`,
    });
    db.prepare('UPDATE orders SET data=? WHERE id=?').run(JSON.stringify(o), o.id);
    audit(d.action === 'pay' ? 'payment.verified' : 'fulfillment.updated', o.id);
    return o;
  });
  res.json(o);
});
app.get('/api/admin/leads.csv', (_req, res) => {
  const fields = [
    'id',
    'createdAt',
    'company',
    'name',
    'phone',
    'email',
    'source',
    'campaign',
    'term',
    'quantity',
    'deadline',
    'stage',
    'owner',
    'followupAt',
    'lostReason',
    'revenue',
  ] as const;
  const cell = (v: unknown) => {
    let s = String(v ?? '');
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return '"' + s.replaceAll('"', '""') + '"';
  };
  res
    .type('text/csv')
    .attachment('rumahpayung-prospek.csv')
    .send(
      '\uFEFF' +
        [
          fields.join(','),
          ...records<Lead>('leads').map((l) => fields.map((k) => cell(l[k])).join(',')),
        ].join('\r\n'),
    );
});
app.use('/api', (_req, res) => res.status(404).json({ error: 'Endpoint tidak ditemukan.' }));
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof z.ZodError)
    return res.status(400).json({
      error:
        'Periksa isian: ' + err.issues.map((i) => i.path.join('.') + ' ' + i.message).join('; '),
    });
  if (err instanceof SyntaxError)
    return res.status(400).json({ error: 'Format permintaan tidak valid.' });
  const e = err as { status?: number; message?: string; code?: string };
  if (e.code?.startsWith('SQLITE_CONSTRAINT') || e.message?.includes('UNIQUE constraint failed'))
    return res.status(409).json({ error: 'SKU atau slug sudah digunakan.' });
  if (e.status) return res.status(e.status).json({ error: e.message });
  if (err instanceof Error && /Minimum pemesanan|Diskon maksimal|margin minimum/.test(err.message))
    return res.status(400).json({ error: err.message });
  console.error('Request failed:', e.code || 'internal_error');
  res.status(500).json({ error: 'Terjadi kesalahan. Silakan coba kembali.' });
});
