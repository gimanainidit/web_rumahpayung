import { test, expect } from '@playwright/test';
async function login(page: import('@playwright/test').Page) {
  await page.goto('/admin/login');
  await page.getByLabel('Password admin').fill('browser-test-password-only');
  await page.getByRole('button', { name: 'Masuk', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Setiap hubungan, berarti.' })).toBeVisible();
}
test('catalog → cart → checkout → manual payment → shipping → guest history', async ({ page }) => {
  await page.goto('/katalog');
  await page.getByRole('heading', { name: 'Payung Golf Custom', exact: true }).click();
  await page.getByRole('button', { name: 'Tambah ke keranjang' }).click();
  await page.getByRole('link', { name: /Keranjang, 1 produk/ }).click();
  await page.getByRole('link', { name: 'Lanjut ke checkout' }).click();
  await page.getByLabel('Nama lengkap').fill('Pelanggan Browser');
  await page.getByLabel('Nomor WhatsApp').fill('081234567890');
  await page.getByLabel('Alamat lengkap').fill('Jalan Browser nomor 10');
  await page.getByLabel('Kota', { exact: true }).fill('Jakarta Selatan');
  await page.getByLabel('Kode pos').fill('12345');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Buat pesanan simulasi' }).click();
  await expect(page.getByText('Pesanan demonstrasi. Jangan transfer uang.')).toBeVisible();
  const id = page.url().split('/').pop()!;
  await page.reload();
  await expect(page.getByRole('heading', { name: id })).toBeVisible();
  await login(page);
  await page.goto('/admin/orders');
  await page.getByRole('button', { name: id, exact: true }).click();
  await page.getByRole('button', { name: 'Verifikasi pembayaran manual' }).click();
  await page.getByRole('button', { name: 'Konfirmasi sudah diterima' }).click();
  await page.getByRole('button', { name: 'Tandai Dikemas' }).click();
  await page.getByLabel('Kurir / metode serah terima').fill('Kurir tes');
  await page.getByLabel('Nomor resi / referensi serah terima').fill('TEST-TRACK-001');
  await page.getByRole('button', { name: 'Tandai Dikirim' }).click();
  await page.getByRole('button', { name: 'Tandai Selesai' }).click();
  await page.getByRole('button', { name: 'Tutup dialog' }).click();
  await page.goto('/pesanan/' + id);
  await expect(page.getByText('Nomor resi / referensi:', { exact: false })).toBeVisible();
  await expect(page.locator('.badge').filter({ hasText: 'Selesai' })).toBeVisible();
});
test('quotation form preserves attribution, CRM schedules follow-up and creates quote', async ({
  page,
}) => {
  await page.goto('/penawaran?utm_source=google&utm_campaign=corporate-umbrella');
  await page.getByLabel('Nama perusahaan').fill('PT Browser Karya');
  await page.getByLabel('Nama PIC').fill('Ayu Tes');
  await page.getByLabel('Nomor WhatsApp').fill('081222333444');
  await page.getByLabel('Tanggal dibutuhkan').fill('2099-11-20');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Kirim permintaan penawaran' }).click();
  await expect(
    page.getByRole('heading', { name: 'Kebutuhan Anda sudah kami catat.' }),
  ).toBeVisible();
  await login(page);
  await page.goto('/admin/crm');
  await page.getByRole('button', { name: 'PT Browser Karya', exact: true }).click();
  await expect(page.getByText('google / corporate-umbrella / —')).toBeVisible();
  await page.getByRole('button', { name: 'Buat / revisi quotation' }).click();
  await expect(page.getByText('Margin kotor internal')).toBeVisible();
  const followup = await page.getByLabel('Follow-up berikutnya (WIB)').inputValue();
  expect(new Date(followup + ':00+07:00').getTime() - Date.now()).toBeGreaterThan(47 * 3600000);
  await expect(page.getByLabel('Omzet deal disepakati')).toHaveValue('13150000');
  await page.getByLabel('Status prospek').selectOption('Quotation Sent');
  await page.getByLabel('PIC sales').fill('Tim Sales');
  await page.getByLabel('Catatan tindak lanjut').fill('Quotation disiapkan untuk kontak personal.');
  await page.getByRole('button', { name: 'Simpan tindak lanjut' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByText('Tim Sales', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'PT Browser Karya', exact: true }).click();
  await expect(page.getByLabel('Follow-up berikutnya (WIB)')).toHaveValue(followup);
});
test('admin edits a product and pricing rules with persisted validation', async ({ page }) => {
  await login(page);
  await page.goto('/admin/products');
  await page.getByRole('button', { name: 'Edit', exact: true }).first().click();
  await page.getByLabel('Harga satuan (Rp)').fill('126000');
  await page.getByRole('button', { name: 'Simpan produk' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(
    page.getByRole('cell', { name: 'Rp 126.000 HPP Rp 70.000', exact: true }),
  ).toBeVisible();
  await page.goto('/admin/settings');
  await page.getByLabel('Diskon maksimum (%)').fill('9');
  await page.getByRole('button', { name: 'Simpan aturan & pengaturan' }).click();
  await expect(page.getByRole('status')).toContainText('Perubahan tersimpan.');
  await page.reload();
  await expect(page.getByLabel('Diskon maksimum (%)')).toHaveValue('9');
  await page.getByLabel('Mode demonstrasi').uncheck();
  await page.getByRole('button', { name: 'Simpan aturan & pengaturan' }).click();
  await expect(page.getByRole('alert')).toContainText('WhatsApp dan rekening');
});
test('mobile storefront renders without horizontal overflow and navigation works', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  for (const path of [
    '/',
    '/payung-custom',
    '/katalog',
    '/produk/payung-golf',
    '/penawaran',
    '/keranjang',
    '/kebijakan',
  ]) {
    await page.goto(path);
    await expect(page.locator('footer')).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  }
  expect(errors).toEqual([]);
  await page.goto('/');
  await page.screenshot({ path: '.local/screenshots/home-mobile.png', fullPage: true });
});
test('desktop visual evidence and no client errors', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Payung untuk setiap cerita.' })).toBeVisible();
  await page.screenshot({ path: '.local/screenshots/home-desktop.png', fullPage: true });
  await login(page);
  await page.goto('/admin/crm');
  await page.screenshot({ path: '.local/screenshots/crm-desktop.png', fullPage: true });
  expect(errors).toEqual([]);
});
test('core pages meet automated WCAG A/AA accessibility checks', async ({ page }) => {
  const { default: AxeBuilder } = await import('@axe-core/playwright');
  for (const path of ['/', '/penawaran', '/admin/login']) {
    await page.goto(path);
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(
      result.violations.map((v) => ({
        id: v.id,
        description: v.description,
        nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
      })),
    ).toEqual([]);
  }
});
test('admin uploads a photo, which persists after reload and is served as WebP', async ({
  page,
}) => {
  const sharp = (await import('sharp')).default;
  const image = await sharp({
    create: { width: 120, height: 100, channels: 3, background: '#3f6872' },
  })
    .png()
    .toBuffer();
  await login(page);
  await page.goto('/admin/products');
  await page.getByRole('button', { name: 'Edit', exact: true }).last().click();
  await page
    .getByLabel('Foto produk (JPEG, PNG, WebP; maks. 5 MB)')
    .setInputFiles({ name: 'photo-test.png', mimeType: 'image/png', buffer: image });
  const preview = page.getByAltText('Pratinjau foto produk');
  await expect(preview).toHaveAttribute('src', /^\/media\/.*\.webp$/);
  const url = await preview.getAttribute('src');
  await page.getByRole('button', { name: 'Simpan produk' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.reload();
  await page.getByRole('button', { name: 'Edit', exact: true }).last().click();
  await expect(page.getByAltText('Pratinjau foto produk')).toHaveAttribute('src', url!);
  const response = await page.request.get(url!);
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('image/webp');
});
