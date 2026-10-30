# Menjalankan di server dan pemulihan

## Produksi satu instance

1. Siapkan Linux/Node 24+, npm, disk persisten. Gunakan akun proses non-root.
2. `npm ci` lalu `npm run build` dan `npm run admin:ensure`.
3. Set `NODE_ENV=production`, `HOST=127.0.0.1`, `PORT=3000`, `COOKIE_SECURE=true`, `PUBLIC_SITE_URL=https://domain-anda`, dan `DATABASE_PATH` pada volume persisten. `.env` diabaikan Git. Jangan memakai disk sementara.
4. Jalankan `npm start` dengan process supervisor. Reverse proxy HTTPS meneruskan Host asli, membatasi body, dan melayani upstream loopback. Aplikasi tidak mempercayai X-Forwarded-For secara default; rate limit akan berbagi IP proxy. Sesuaikan `trust proxy` hanya dengan hop/IP yang diketahui bila diperlukan.
5. Verifikasi `/api/health`, login HTTPS, secure cookie, formulir lead, checkout, restart proses, dan data tetap tersimpan. Jangan membuka server development ke publik.
6. Validasi bank, nomor WhatsApp, katalog, margin, ongkir, kebijakan dan proses verifikasi pembayaran. Aktifkan mode nyata di admin hanya setelah review owner.

Penjualan custom memerlukan konfirmasi manual sebelum produksi. Tidak ada webhook/gateway aktif, notifikasi, invoice pajak, atau pelacakan live. Pajak dan retur harus ditangani sesuai kewajiban bisnis. Multi-role/MFA, login pelanggan lintas perangkat, automation, dan hardening untuk trafik besar adalah tahap berikutnya.

## Backup

```sh
npm run backup
```

Script memakai SQLite online backup API untuk snapshot konsisten walau WAL aktif. Snapshot tersimpan di `.local/backups/` dengan mode 0600. Salin snapshot **dan direktori uploads di samping database** ke penyimpanan backup aman di luar mesin. Jangan mengandalkan snapshot platform untuk proses hidup atau satu-satunya backup transaksi. Atur retensi, enkripsi, akses, dan jadwal sesuai kebutuhan bisnis; tidak ada scheduler backup eksternal yang dikonfigurasi.

## Restore

- Hentikan hanya proses aplikasi, pastikan tidak ada koneksi penulis.
- Arsipkan database aktif beserta `-wal`/`-shm` dan folder uploads sebelum perubahan.
- Pulihkan file snapshot ke `DATABASE_PATH`, lalu pulihkan folder uploads yang cocok. Jangan menempelkan WAL lama pada database hasil restore.
- Periksa dengan `PRAGMA integrity_check`; jalankan aplikasi dan cek jumlah order/lead, akun admin, harga/stok, serta gambar.
- Jalankan `npm run admin:reset` setelah insiden kompromi; semua sesi admin dicabut. Gunakan password baru yang aman.

Tes restore otomatis membuktikan struktur/data snapshot dapat dibaca kembali. Latihan operasional pada hosting sebenarnya tetap perlu dilakukan sebelum produksi.
