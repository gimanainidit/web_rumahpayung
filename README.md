# RumahPayung

MVP commerce + CRM untuk pemulihan penjualan B2B RumahPayung. Antarmuka Bahasa Indonesia, Rupiah integer, React/TypeScript, Express, dan SQLite persisten. Dibangun dari repository kosong berdasarkan Recovery Plan 90 Hari dan DRP v0.2; dokumen diperlakukan sebagai referensi kebutuhan, bukan otorisasi untuk menjalankan integrasi atau menghubungi pelanggan.

## Membuka lewat browser dengan GitHub Codespaces

1. Buka repository GitHub, pilih **Code → Codespaces → Create codespace on main**.
2. Tunggu setup selesai. Konfigurasi `.devcontainer/devcontainer.json` menyiapkan Node 24, dependencies, akun admin lokal, dan build.
3. Di terminal Codespaces, jalankan `npm start` dan biarkan proses berjalan.
4. Buka tab **Ports**, cari port **3000**, lalu klik **Open in Browser**. Gunakan port visibility **Private**.
5. Untuk admin, tambahkan `/admin/login` pada alamat aplikasi. Buka file `.local/admin-access.txt` di Explorer Codespaces untuk password yang dibuat pada Codespace tersebut. Password environment ini tidak ikut di-push.

Codespaces menjalankan demo dari build production. Setelah mengubah kode, hentikan server, jalankan `npm run build`, kemudian `npm start` lagi. Jika tab Ports belum menampilkan port 3000, pilih **Forward a Port** dan masukkan `3000`.

Konfigurasi Codespaces disediakan; pembuatan Codespace di akun GitHub belum dijalankan dari sesi ini. Ini adalah akses development, bukan deployment website publik.

## Menjalankan di komputer sendiri

Prasyarat: Node.js **24+**, npm. Chromium diperlukan hanya untuk browser test.

```sh
npm ci
npm run admin:ensure
npm run dev
```

Server memakai port **3000**, bind **127.0.0.1**. Aplikasi menyediakan storefront `/`, landing B2B `/payung-custom`, penawaran `/penawaran`, katalog `/katalog`, keranjang `/keranjang`, checkout `/checkout`, riwayat `/pesanan`, dan admin `/admin/login`.

Kredensial awal dibuat secara acak di **`.local/admin-access.txt`**, mode berkas 0600, diabaikan Git. Tidak ada password default. `admin:ensure` tidak mereset akun yang sudah ada. `npm run admin:reset` menghasilkan password baru dan mencabut semua sesi admin; operator juga dapat memberikan `ADMIN_PASSWORD` melalui environment yang aman (minimal 14 karakter). Jangan mengirim atau menyimpan password dalam commit.

```sh
npm run build
npm start
npm test
npm run test:e2e
npm run format:check
```

`npm start` membutuhkan hasil build. Browser test memakai Chromium `/usr/bin/chromium`; ubah `CHROMIUM_PATH` jika berbeda. API dan E2E menggunakan database sementara terpisah, bukan database aplikasi. Pada sandbox yang melarang binding socket, perintah server/test memerlukan fasilitas eskalasi resmi dari platform.

## Apa yang sudah bekerja

- Landing custom dengan CTA, FAQ, pilihan produk, estimasi anggaran server-side, dan form quotation.
- Katalog: pencarian, kategori, batas harga, stok, sort, pagination, detail, pilihan warna.
- Keranjang persisten di browser; guest checkout dengan harga/stok diperiksa ulang dan pencegahan order ganda.
- Riwayat pesanan milik sesi browser, pembatalan sebelum bayar, detail dan cetak, timeline manual.
- Admin: login, dashboard data aktual, CRM, quotation cetak/PDF via browser, jadwal follow-up, alasan lost, omzet/margin Won, ekspor CSV.
- UTM source/medium/campaign/term tersimpan pada lead. Klik WhatsApp dicatat terpisah dari lead dan penjualan; WhatsApp muncul setelah nomor bisnis diisi.
- Produk: create/edit/archive, HPP, MOQ, varian/stok, unggah foto yang divalidasi dan dikonversi ke WebP.
- Operasional: verifikasi pembayaran manual, packing, kurir/resi, delivered, audit log.
- Harga: diskon bertingkat, diskon maksimum, margin minimum pada seluruh quotation termasuk biaya persiapan, batas MOQ.

## Data contoh dan penggunaan nyata

Instalasi baru berisi enam **produk contoh**, tanpa pelanggan, transaksi, lead, atau testimoni buatan. Banner demonstrasi terlihat pada storefront. Foto awal adalah ilustrasi SVG; admin dapat menggantinya dengan foto berizin. **Jangan melakukan pembayaran nyata dalam mode demonstrasi.**

Di `/admin/settings`, isi nomor WhatsApp dan rekening, validasi aturan harga/ongkir, dan verifikasi atau arsipkan setiap produk contoh sebelum mematikan mode demonstrasi. Server menolak aktivasi bila prasyarat belum terpenuhi. Riwayat pesanan simulasi mempertahankan label simulasi meskipun mode toko berubah.

Sebelum menerima pelanggan nyata, selesaikan [daftar owner](docs/owner-handoff.md) dan [runbook deployment](docs/deployment.md). Deployment website publik dilakukan terpisah dari penyimpanan source di GitHub. Integrasi payment gateway, kurir live, email, dan pengiriman WhatsApp otomatis **tidak aktif**.

## Konfigurasi dan data

Salin `.env.example` menjadi `.env` jika perlu. Script npm memuat file `.env` bila ada; variabel proses memiliki prioritas. `DATABASE_PATH` default `.local/rumahpayung.sqlite`; gambar di folder `uploads` di samping database. Gunakan disk persisten untuk keduanya.

`HOST`, `PORT`, `COOKIE_SECURE`, `DATABASE_PATH`, dan opsional `PUBLIC_SITE_URL` adalah konfigurasi runtime. Gunakan HTTPS dan `COOKIE_SECURE=true` untuk penggunaan publik. `PUBLIC_SITE_URL` mengaktifkan sitemap saat mode demo mati. Robots melarang indexing selama demo.

## Dokumentasi

- [Arsitektur](docs/architecture.md)
- [Aturan domain dan follow-up](docs/domain-rules.md)
- [Keputusan teknis](docs/decisions.md)
- [UI dan pemetaan mockup](docs/ui-guidelines.md)
- [Status implementasi](docs/implementation-status.md)
- [Owner handoff](docs/owner-handoff.md)
- [Deployment dan backup/restore](docs/deployment.md)
