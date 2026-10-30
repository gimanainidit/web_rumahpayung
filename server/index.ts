import { app } from './app.js';
import express from 'express';
import { resolve, dirname } from 'node:path';
import { dbPath, settings, products } from './db.js';
app.use(
  '/media',
  express.static(resolve(dirname(dbPath), 'uploads'), {
    dotfiles: 'deny',
    immutable: true,
    maxAge: '1y',
  }),
);
app.get('/robots.txt', (_req, res) =>
  res
    .type('text/plain')
    .send(
      settings().demo
        ? 'User-agent: *\nDisallow: /\n'
        : 'User-agent: *\nDisallow: /admin\nDisallow: /pesanan\nDisallow: /checkout\n',
    ),
);
app.get('/sitemap.xml', (_req, res) => {
  if (!process.env.PUBLIC_SITE_URL || settings().demo) return res.status(404).end();
  const base = new URL(process.env.PUBLIC_SITE_URL).origin;
  const paths = [
    '/',
    '/payung-custom',
    '/katalog',
    '/tentang',
    ...products()
      .filter((p) => p.active && p.verified)
      .map((p) => '/produk/' + p.slug),
  ];
  res
    .type('application/xml')
    .send(
      '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
        paths.map((p) => '<url><loc>' + base + p + '</loc></url>').join('') +
        '</urlset>',
    );
});
if (process.env.NODE_ENV === 'production') {
  app.use((_req, res, next) => {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
    );
    next();
  });
  app.use(express.static(resolve('dist')));
  app.get('/{*path}', (_req, res) => res.sendFile(resolve('dist/index.html')));
} else {
  const { createServer } = await import('vite');
  const vite = await createServer({ server: { middlewareMode: true }, appType: 'spa' });
  app.use(vite.middlewares);
}
const port = Number(process.env.PORT || 3000);
app.listen(port, process.env.HOST || '127.0.0.1', () =>
  console.log(`RumahPayung server started on port ${port}`),
);
