# Arsitektur

Satu proses Express melayani API dan frontend. Saat development, Vite berjalan sebagai middleware. Saat production, Express melayani `dist/`. SQLite lokal memakai WAL, foreign_keys ON, busy_timeout 5 detik, prepared statements, dan transaksi `BEGIN IMMEDIATE`. Cocok untuk MVP satu instance; jangan menjalankan beberapa replika dengan disk SQLite terpisah.

## Modul

- `src/domain.ts`: schema Zod pada boundary API, model domain, Rupiah integer, fungsi quote dan URL gambar.
- `server/db.ts`: migrasi awal berversi, seed hanya saat DB baru, transaksi, hash password/session, persistence.
- `server/app.ts`: REST API, validasi, authorization, limits, lifecycle pesanan dan CRM.
- `server/index.ts`: entrypoint dev/production, static assets, foto, health, robots/sitemap.
- `src/store.tsx`: katalog, keranjang localStorage, refresh dan notifikasi; sumber otoritatif transaksi tetap server.
- `src/Storefront.tsx`, `src/components.tsx`: halaman publik dan komponen shared.
- `src/Admin.tsx`: dashboard, CRM, produk, pesanan dan aturan bisnis.
- `scripts/`: bootstrap/reset admin dan backup konsisten.
- `tests/`: integration/domain menggunakan DB sementara dan HTTP server riil.
- `e2e/`: Chromium menggunakan build production dan database terpisah.

## Penyimpanan

Tabel `products` memiliki unique id/slug/SKU; varian dan atribut disimpan sebagai JSON tervalidasi. `orders` menyimpan owner hash, idempotency key unik per owner, dan snapshot domain. `leads`, `settings` dan audit adalah persistensi terpusat server. Entitas JSON mengurangi overhead skema pada MVP; perubahan struktur harus menambah migrasi eksplisit dan mempertahankan histori.

Tidak ada data HPP pada endpoint katalog/estimasi publik. Harga, stok, rekening transaksi, nama produk dan varian dibekukan pada order. Quotation menyimpan biaya, harga, jumlah, diskon, masa berlaku, dan margin saat dibuat. Perubahan katalog selanjutnya tidak mengubah order/quotation sebelumnya.

## Akses

Satu akun administrator operasional. Password scrypt salted; sesi acak 256-bit disimpan sebagai hash dan kedaluwarsa setelah 8 jam. Cookie HttpOnly, SameSite=Strict. Mutasi JSON wajib header khusus dan pemeriksaan same-origin. Tidak ada CORS wildcard. Login dibatasi percobaan; intake publik dan API dibatasi per IP.

Guest memiliki cookie opaque 256-bit dengan masa 90 hari. Database hanya menyimpan hashnya. Daftar/detail/batal pesanan selalu memakai owner hash, bukan nomor pesanan saja. Menghapus cookie menghilangkan akses mandiri; pemulihan lintas perangkat belum ada. Admin menangani bantuan melalui verifikasi identitas manual.

Foto admin: maksimal 5 MB, JPEG/PNG/WebP, batas 20 juta pixel, nonanimasi, decode+re-encode WebP, maksimum sisi 1600px, metadata dihapus, UUID nama file. SVG/HTML/URL bebas ditolak. Gambar yang tidak lagi dipakai tidak dihapus otomatis agar histori tidak rusak.

## Batas integrasi

Payment gateway dan courier provider belum dibuat karena provider/akun belum dipilih. MVP memakai **transfer manual dan tarif tetap admin** yang merupakan mode operasional riil, dengan label eksplisit. Tidak ada webhook palsu atau status berdasarkan redirect. Saat gateway ditambahkan, wajib adapter, verifikasi signature/amount/currency, deduplication event, dan test replay/rekonsiliasi.

WhatsApp adalah tautan click-to-chat yang dibuka oleh tindakan pengguna. Server tidak mengirim pesan. CRM follow-up berupa antrean tanggal jatuh tempo, bukan scheduler broadcast.
