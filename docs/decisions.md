# Keputusan implementasi

1. **React + Vite + Express + TypeScript strict**: repo awal tidak memiliki kode atau stack. Satu proses memudahkan setup dan pengujian end-to-end. Zod memvalidasi semua input domain; tipe compile-time bukan pengganti validasi.
2. **SQLite bawaan Node 24**: persistent storage tanpa layanan/credential tambahan, transaksi serial lokal, snapshot backup konsisten. Pindah Postgres sebelum scaling beberapa replika; SQLite tidak cocok untuk disk ephemeral atau serverless tanpa volume.
3. **Prioritas recovery B2B**: landing custom, intake, attribution, CRM, quotation, margin dan follow-up mendahului fitur marketplace sekunder.
4. **Mode demonstrasi eksplisit**: harga/foto/stok bisnis belum diberikan. Seed produk diberi status belum verified. Gate server mencegah aktivasi nyata tanpa rekening, kontak dan verifikasi produk.
5. **Guest checkout dan satu admin**: memberikan workflow lengkap tanpa email service. Peran admin terpisah, multi-user, MFA dan login pelanggan ditunda. Owner tidak memiliki akses lintas sesi; admin memiliki akses operasional penuh dan audit.
6. **Pembayaran/pengiriman manual**: provider dan credential belum tersedia. Tidak mengklaim gateway aktif. Ongkir adalah tarif tetap admin yang ditampilkan sebelum checkout. Notifikasi otomatis tidak dibuat.
7. **Publikasi terpisah**: penyimpanan source ke GitHub tidak mengaktifkan website publik. Owner meninjau data bisnis serta memilih hosting sebelum deployment. Tidak ada pesan outreach otomatis.
8. **Dokumentasi repo sebagai memori**: tidak ada Codebase Memory MCP yang terverifikasi pada sesi ini. Tidak mengklaim penggunaan skill/tool yang tidak tersedia.
