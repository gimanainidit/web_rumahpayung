# Status implementasi MVP

Diverifikasi pada 30 Oktober 2026, environment kerja saat ini. Repositori awal kosong; aplikasi dibuat dari scratch sesuai permintaan lanjutan pengguna. Semua source tersedia di checkout untuk GitHub; aplikasi belum dideploy ke domain publik.

## Selesai dan diuji

- Storefront responsif, landing custom, katalog/filter/sort, detail/varian, cart, checkout, history/detail/cancel/print order.
- Lead intake, UTM, consent, pipeline CRM, owner, due follow-up, catatan, alasan lost, quotation, PDF melalui browser print, CSV.
- Pricing MOQ/tier discount/cap/minimum gross margin, admin HPP dan aturan configurable. Margin floor mencakup biaya persiapan.
- Admin login, session/authorization, dashboard data nyata, product create/edit/archive, safe photo upload, per-variant stock and stale-edit conflict protection.
- Manual payment verification, valid fulfillment transitions, resi dan timeline. Payment dan fulfillment terpisah.
- Persistence SQLite, idempotency/transaction protection, backup dan test restore.
- Cookie ownership, CSRF origin/header check, rate limits, Zod validation, safe CSV, photo decode/re-encode, secrets excluded from Git.
- WIB display/input dan quote follow-up form resynchronization.

## Bukti validasi

| Pemeriksaan                     | Hasil                                                                                                      |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Clean `npm ci` dari lockfile    | Lolos                                                                                                      |
| `npm run admin:ensure` berulang | Mempertahankan akun yang sudah ada                                                                         |
| `npm run build`                 | TypeScript strict + Vite production lolos                                                                  |
| `npm test`                      | 20 tes backend/domain/integration/backup lolos                                                             |
| `npm run test:e2e`              | 7 tes Chromium pada build terbaru lolos                                                                    |
| Aksesibilitas otomatis          | Axe WCAG A/AA pada beranda, formulir penawaran, login; nol violation yang terdeteksi pada halaman tersebut |
| Mobile                          | 390px, tujuh route storefront tanpa overflow horizontal                                                    |
| `npm run format:check`          | Lolos                                                                                                      |
| SQLite backup CLI               | Snapshot berhasil dibuat di folder lokal diabaikan Git                                                     |

Test API mencakup harga/HPP tidak bocor, guard mode nyata, auth, CSRF, lead validation, quote/Won/Lost, CSV formula injection, total tampering, idempotency, isolation antar-guest, state transitions, dua pembeli stok terakhir, cancel/restore satu kali, media spoofing, stale stock edits, duplicate SKU, backup integrity/data recovery.

Browser test mencakup katalog → cart → checkout → admin payment → packed/shipped/delivered → guest history; lead → quote → follow-up persisted; admin price/settings persistence; mobile routes; screenshot desktop/CRM; accessibility; foto persisten dan served WebP. Screenshot `.local/screenshots/home-desktop.png`, `home-mobile.png`, `crm-desktop.png` memakai **database test terpisah**, bukan pelanggan sebenarnya.

Rollup menampilkan dua peringatan anotasi komentar dari dependensi Zod saat build; build tetap berhasil. Tidak ada test skipped atau expected-failure pada suite akhir. Pemeriksaan otomatis aksesibilitas bukan audit manual WCAG menyeluruh.

## Batas MVP dan kebutuhan sebelum live

- Harga/stok/foto awal contoh, bukan fakta bisnis terverifikasi. Default demo harus dipertahankan sampai owner review.
- Belum ada gateway, webhook, ongkir/tracking provider, email/WhatsApp otomatis, akun pelanggan lintas perangkat, MFA/multi-role, invoice pajak, refund otomatis, review/wishlist/voucher, import CRM massal atau integrasi iklan.
- Quotation B2B tidak otomatis menjadi retail checkout; persetujuan desain, ketersediaan, pajak, jadwal, pembayaran, dan pengadaan custom masih dikelola tim.
- Pending checkout belum memiliki auto-expiry; cancellation mengembalikan stok. Admin perlu memantau pending orders.
- Database single-instance dengan persistent volume. Jangan deploy ke ephemeral filesystem.
- Privacy retention dan deletion request ditangani operator; belum ada automatic retention scheduler.
- Konfigurasi environment `install_script` dan `start_skill` tersimpan sebagai **draft**, belum dipublikasikan. Review dan simpan perubahan di environment settings lalu publish environment bila diinginkan. Publish environment berbeda dengan deployment website.
- Tidak ada secret integration yang dibuat/diminta. Tidak ada pesan outreach dikirim. Belum ada bukti restore ke task baru.

Data/keputusan owner tercatat di `docs/owner-handoff.md` agar dapat dilengkapi setelah kembali.
