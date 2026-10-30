import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Server } from 'node:http';
import type { Lead, Order, Product } from '../src/domain.js';
import { calculateQuote } from '../src/domain.js';
const directory = mkdtempSync(join(tmpdir(), 'rp-test-'));
process.env.DATABASE_PATH = join(directory, 'db.sqlite');
let server: Server,
  base: string,
  db: typeof import('../server/db.js'),
  adminCookie: string,
  guest: string;
const password = 'test-only-password-with-entropy';
async function request(
  path: string,
  method = 'GET',
  body?: unknown,
  cookie = '',
  extra: Record<string, string> = {},
) {
  return fetch(base + '/api' + path, {
    method,
    headers: { 'Content-Type': 'application/json', 'X-RP-Request': '1', Cookie: cookie, ...extra },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
const leadInput = {
  company: 'Perusahaan Uji',
  name: 'PIC Uji',
  phone: '081234567890',
  email: 'test@example.com',
  productId: 'payung-golf',
  quantity: 100,
  budget: 20000000,
  deadline: '2099-12-15',
  notes: 'Event internal',
  consent: true,
  source: 'google',
  campaign: 'payung-corporate',
  term: 'payung custom',
};
const checkout = {
  items: [{ productId: 'payung-golf', variantId: 'navy', quantity: 2 }],
  address: {
    name: 'Pelanggan Uji',
    phone: '081234567890',
    email: '',
    address: 'Jalan Pengujian nomor 12',
    city: 'Jakarta Selatan',
    postalCode: '12345',
  },
  shipping: 'local',
  consent: true,
  expectedTotal: 275000,
};
beforeAll(async () => {
  db = await import('../server/db.js');
  db.db.prepare('INSERT INTO admins VALUES(1,?)').run(db.passwordHash(password));
  const { app } = await import('../server/app.js');
  server = app.listen(0, '127.0.0.1');
  await new Promise<void>((resolve) => server.once('listening', resolve));
  base = 'http://127.0.0.1:' + (server.address() as { port: number }).port;
  const store = await request('/store');
  guest = store.headers.get('set-cookie')!.split(';')[0];
  const login = await request('/admin/login', 'POST', { password });
  adminCookie = login.headers.get('set-cookie')!.split(';')[0];
});
afterAll(async () => {
  await new Promise<void>((resolve, reject) => server.close((e) => (e ? reject(e) : resolve())));
  db.db.close();
  rmSync(directory, { recursive: true, force: true });
});
describe('Pricing and commercial guardrails', () => {
  it('enforces MOQ, bounded discount, and minimum contribution margin', () => {
    const p = db.product('payung-golf')!,
      s = db.settings();
    expect(() => calculateQuote(p, 1, s)).toThrow('Minimum');
    expect(() => calculateQuote(p, 100, s, 11)).toThrow('Diskon');
    const costly = { ...p, cost: 100000 };
    expect(() => calculateQuote(costly, 100, s, 10)).toThrow('margin');
    const q = calculateQuote(costly, 300, s);
    expect(q.unitPrice).toBeGreaterThanOrEqual(
      Math.ceil((costly.cost + s.printCost) / (1 - s.minMargin / 100)),
    );
    expect(Number.isInteger(q.total)).toBe(true);
    expect(q.margin).toBeGreaterThanOrEqual(s.minMargin);
    expect(q.total - q.cost).toBeGreaterThan(0);
  });
  it('does not expose HPP or margin in public APIs', async () => {
    const store = await (await request('/store')).json();
    expect(store.products[0]).not.toHaveProperty('cost');
    const estimate = await (
      await request('/estimate', 'POST', { productId: 'payung-golf', quantity: 100 })
    ).json();
    expect(estimate).not.toHaveProperty('cost');
    expect(estimate).not.toHaveProperty('margin');
  });
  it('blocks live sales until contact, bank, and catalog are verified', async () => {
    const r = await request(
      '/admin/settings',
      'PUT',
      { ...db.settings(), demo: false },
      adminCookie,
    );
    expect(r.status).toBe(400);
    expect(db.settings().demo).toBe(true);
  });
});
describe('Authentication and authorization', () => {
  it('requires server-side admin authorization', async () => {
    expect((await request('/admin/data')).status).toBe(401);
    expect(
      (await request('/admin/products/payung-golf', 'PUT', db.product('payung-golf'))).status,
    ).toBe(401);
    expect((await request('/admin/leads.csv')).status).toBe(401);
  });
  it('rejects cross-origin writes and missing request marker', async () => {
    expect(
      (
        await request('/admin/settings', 'PUT', db.settings(), adminCookie, {
          Origin: 'https://evil.example',
        })
      ).status,
    ).toBe(403);
    const r = await fetch(base + '/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadInput),
    });
    expect(r.status).toBe(403);
  });
  it('rejects invalid credentials and issues HttpOnly session cookie', async () => {
    expect((await request('/admin/login', 'POST', { password: 'wrong' })).status).toBe(401);
    const r = await request('/admin/login', 'POST', { password });
    expect(r.headers.get('set-cookie')).toContain('HttpOnly');
    expect(r.headers.get('set-cookie')).toContain('SameSite=Strict');
  });
});
describe('Lead to quotation workflow', () => {
  let l: Lead;
  it('validates consent, MOQ, date and persists attribution', async () => {
    expect((await request('/leads', 'POST', { ...leadInput, consent: false })).status).toBe(400);
    expect((await request('/leads', 'POST', { ...leadInput, quantity: 1 })).status).toBe(400);
    expect((await request('/leads', 'POST', { ...leadInput, deadline: '2020-01-01' })).status).toBe(
      400,
    );
    const r = await request('/leads', 'POST', leadInput);
    expect(r.status).toBe(201);
    const { id } = await r.json();
    const d = await (await request('/admin/data', 'GET', undefined, adminCookie)).json();
    l = d.leads.find((l: Lead) => l.id === id);
    expect(l.stage).toBe('New Lead');
    expect(l.campaign).toBe('payung-corporate');
    expect(l.followupAt).toBeTruthy();
    expect(l.quote).toBeNull();
  });
  it('rejects Won without quotation, and Lost without reason', async () => {
    const update = {
      stage: 'Won',
      owner: 'Sales',
      followupAt: null,
      lostReason: '',
      revenue: 100,
      note: '',
    };
    expect((await request('/admin/leads/' + l.id, 'PATCH', update, adminCookie)).status).toBe(400);
    expect(
      (await request('/admin/leads/' + l.id, 'PATCH', { ...update, stage: 'Lost' }, adminCookie))
        .status,
    ).toBe(400);
  });
  it('creates immutable quote values and records a won deal', async () => {
    const quoteRes = await request(
      '/admin/leads/' + l.id + '/quote',
      'POST',
      { discount: 5 },
      adminCookie,
    );
    expect(quoteRes.status).toBe(200);
    l = await quoteRes.json();
    expect(l.quote?.total).toBe(12500000);
    const p = db.product('payung-golf')!,
      original = p.price;
    db.saveProduct({ ...p, price: original + 1000 });
    expect(l.quote?.unitPrice).toBe(123500);
    db.saveProduct({ ...p, price: original });
    const r = await request(
      '/admin/leads/' + l.id,
      'PATCH',
      {
        stage: 'Won',
        owner: 'Sales',
        followupAt: null,
        lostReason: '',
        revenue: l.quote!.total,
        note: 'Disepakati secara manual',
      },
      adminCookie,
    );
    expect(r.status).toBe(200);
    expect((await r.json()).followupAt).toBeNull();
  });
  it('exports CSV with campaign and formula escaping', async () => {
    await request('/leads', 'POST', { ...leadInput, company: '=HYPERLINK(test)' });
    const r = await request('/admin/leads.csv', 'GET', undefined, adminCookie);
    const text = await r.text();
    expect(r.status).toBe(200);
    expect(text).toContain('campaign');
    expect(text).toContain("'=HYPERLINK(test)");
  });
});
describe('Checkout, stock, ownership and fulfillment', () => {
  let o: Order,
    key = crypto.randomUUID();
  it('rejects tampered total and invalid quantity without reserving stock', async () => {
    const before = db.product('payung-golf')!.variants[0].stock;
    expect(
      (
        await request('/orders', 'POST', { ...checkout, expectedTotal: 1 }, guest, {
          'Idempotency-Key': crypto.randomUUID(),
        })
      ).status,
    ).toBe(409);
    expect(
      (
        await request(
          '/orders',
          'POST',
          { ...checkout, items: [{ ...checkout.items[0], quantity: -1 }] },
          guest,
          { 'Idempotency-Key': crypto.randomUUID() },
        )
      ).status,
    ).toBe(400);
    expect(db.product('payung-golf')!.variants[0].stock).toBe(before);
  });
  it('creates only one order for retries and snapshots server prices', async () => {
    const before = db.product('payung-golf')!.variants[0].stock;
    const responses = await Promise.all([
      request('/orders', 'POST', checkout, guest, { 'Idempotency-Key': key }),
      request('/orders', 'POST', checkout, guest, { 'Idempotency-Key': key }),
    ]);
    expect(responses.every((r) => r.status === 201)).toBe(true);
    const orders = await Promise.all(responses.map((r) => r.json()));
    o = orders[0];
    expect(orders[0].id).toBe(orders[1].id);
    expect(o.total).toBe(275000);
    expect(o.items[0].price).toBe(125000);
    expect(db.product('payung-golf')!.variants[0].stock).toBe(before - 2);
  });
  it('isolates guest order history', async () => {
    const other = await request('/store');
    const otherCookie = other.headers.get('set-cookie')!.split(';')[0];
    expect((await request('/orders/' + o.id, 'GET', undefined, otherCookie)).status).toBe(404);
    expect((await request('/orders/' + o.id + '/cancel', 'POST', {}, otherCookie)).status).toBe(
      404,
    );
    expect(await (await request('/orders', 'GET', undefined, otherCookie)).json()).toEqual([]);
    expect((await request('/orders/' + o.id, 'GET', undefined, guest)).status).toBe(200);
  });
  it('requires verified payment and sequential fulfillment', async () => {
    expect(
      (
        await request(
          '/admin/orders/' + o.id,
          'PATCH',
          { action: 'fulfill', status: 'shipped', courier: 'Test', tracking: 'TEST-1' },
          adminCookie,
        )
      ).status,
    ).toBe(400);
    expect(
      (await request('/admin/orders/' + o.id, 'PATCH', { action: 'pay' }, adminCookie)).status,
    ).toBe(200);
    expect((await request('/orders/' + o.id + '/cancel', 'POST', {}, guest)).status).toBe(400);
    expect(
      (await request('/admin/orders/' + o.id, 'PATCH', { action: 'pay' }, adminCookie)).status,
    ).toBe(400);
    expect(
      (
        await request(
          '/admin/orders/' + o.id,
          'PATCH',
          { action: 'fulfill', status: 'packed' },
          adminCookie,
        )
      ).status,
    ).toBe(200);
    expect(
      (
        await request(
          '/admin/orders/' + o.id,
          'PATCH',
          { action: 'fulfill', status: 'shipped' },
          adminCookie,
        )
      ).status,
    ).toBe(400);
    expect(
      (
        await request(
          '/admin/orders/' + o.id,
          'PATCH',
          { action: 'fulfill', status: 'shipped', courier: 'Kurir manual', tracking: 'TEST-001' },
          adminCookie,
        )
      ).status,
    ).toBe(200);
    const final = await request(
      '/admin/orders/' + o.id,
      'PATCH',
      { action: 'fulfill', status: 'delivered' },
      adminCookie,
    );
    expect(final.status).toBe(200);
    expect((await final.json()).timeline).toHaveLength(5);
  });
  it('prevents overselling for concurrent purchases of the last unit', async () => {
    const p = db.product('payung-lipat')!;
    p.variants[0].stock = 1;
    db.saveProduct(p);
    const payload = {
      ...checkout,
      items: [{ productId: p.id, variantId: 'navy', quantity: 1 }],
      expectedTotal: 120000,
    };
    const results = await Promise.all([
      request('/orders', 'POST', payload, guest, { 'Idempotency-Key': crypto.randomUUID() }),
      request('/orders', 'POST', payload, guest, { 'Idempotency-Key': crypto.randomUUID() }),
    ]);
    expect(results.map((r) => r.status).sort()).toEqual([201, 400]);
    expect(db.product(p.id)!.variants[0].stock).toBe(0);
    const success = results.find((r) => r.status === 201)!;
    const order = await success.json();
    expect((await request('/orders/' + order.id + '/cancel', 'POST', {}, guest)).status).toBe(200);
    expect(db.product(p.id)!.variants[0].stock).toBe(1);
    expect((await request('/orders/' + order.id + '/cancel', 'POST', {}, guest)).status).toBe(400);
    expect(db.product(p.id)!.variants[0].stock).toBe(1);
  });
  it('rejects duplicate variants and shipping tariff misuse', async () => {
    expect(
      (
        await request('/checkout/preview', 'POST', {
          ...checkout,
          items: [checkout.items[0], checkout.items[0]],
        })
      ).status,
    ).toBe(400);
    expect(
      (
        await request('/checkout/preview', 'POST', {
          ...checkout,
          address: { ...checkout.address, city: 'Bandung' },
        })
      ).status,
    ).toBe(400);
  });
});

describe('Catalog management and media validation', () => {
  it('accepts actual image content, rejects spoofed files and unauthenticated upload', async () => {
    const sharp = (await import('sharp')).default;
    const bytes = await sharp({
      create: { width: 20, height: 20, channels: 3, background: '#123456' },
    })
      .png()
      .toBuffer();
    expect(
      (await request('/admin/media', 'POST', { data: bytes.toString('base64'), mime: 'image/png' }))
        .status,
    ).toBe(401);
    expect(
      (
        await request(
          '/admin/media',
          'POST',
          { data: Buffer.from('<script>alert(1)</script>').toString('base64'), mime: 'image/png' },
          adminCookie,
        )
      ).status,
    ).toBe(400);
    const r = await request(
      '/admin/media',
      'POST',
      { data: bytes.toString('base64'), mime: 'image/png' },
      adminCookie,
    );
    expect(r.status).toBe(201);
    const { url } = await r.json();
    expect(url).toMatch(/^\/media\/[a-f0-9-]+\.webp$/);
    const p = db.product('payung-golf')!;
    const saved = await request(
      '/admin/products/' + p.id,
      'PUT',
      { ...p, image: url },
      adminCookie,
    );
    expect(saved.status).toBe(200);
    expect(db.product(p.id)!.image).toBe(url);
  });
  it('blocks stale product updates after stock reservations', async () => {
    const p = db.product('payung-golf')!;
    const updated = { ...p, name: 'Changed product' };
    db.saveProduct(updated);
    expect((await request('/admin/products/' + p.id, 'PUT', p, adminCookie)).status).toBe(409);
  });
  it('reports duplicate SKU and enforces safe media paths', async () => {
    const p = db.product('payung-golf')!;
    expect(
      (
        await request(
          '/admin/products/new-id',
          'PUT',
          { ...p, id: 'new-id', slug: 'new-product' },
          adminCookie,
        )
      ).status,
    ).toBe(409);
    expect(
      (
        await request(
          '/admin/products/' + p.id,
          'PUT',
          { ...p, image: 'https://evil.example/file.svg' },
          adminCookie,
        )
      ).status,
    ).toBe(400);
  });
});
describe('Backup and restore', () => {
  it('restores a consistent database including committed orders and leads', async () => {
    const { backup, DatabaseSync } = await import('node:sqlite');
    const path = join(directory, 'restored.sqlite');
    await backup(db.db, path);
    const restored = new DatabaseSync(path);
    expect(restored.prepare('PRAGMA integrity_check').get()).toEqual({ integrity_check: 'ok' });
    for (const table of ['orders', 'leads', 'products', 'admins', 'audit']) {
      expect(restored.prepare(`SELECT count(*) n FROM ${table}`).get()).toEqual(
        db.db.prepare(`SELECT count(*) n FROM ${table}`).get(),
      );
    }
    const row = restored.prepare('SELECT data FROM orders LIMIT 1').get() as { data: string };
    expect(JSON.parse(row.data).items.length).toBeGreaterThan(0);
    restored.close();
  });
});
