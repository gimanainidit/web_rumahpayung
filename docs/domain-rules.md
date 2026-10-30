# Aturan bisnis MVP

## Harga dan quote

Angka default adalah **hipotesis contoh**, harus divalidasi owner:

| Aturan                         | Default           |
| ------------------------------ | ----------------- |
| MOQ custom                     | 24 pcs per produk |
| Diskon <100 pcs                | 0%                |
| Diskon 100–299 pcs             | 5%                |
| Diskon ≥300 pcs                | 8%                |
| Diskon maksimum                | 10%               |
| Margin kotor minimum quotation | 25%               |
| Cetak satu logo per pcs        | Rp5.000           |
| Persiapan cetak                | Rp150.000         |
| Validitas quotation            | 7 hari            |

Harga dasar custom = harga produk + biaya cetak. Biaya total = `(HPP + biaya cetak) × jumlah + biaya persiapan`. Batas harga per unit dibulatkan ke atas agar `(total penawaran − biaya total) / total penawaran ≥ margin minimum`, termasuk biaya persiapan. Estimasi otomatis menaikkan harga ke batas minimum bila diperlukan. Diskon yang dimasukkan sales secara eksplisit ditolak bila melanggar batas diskon atau margin. Tidak ada override tersembunyi.

Total quotation = harga custom × jumlah + biaya persiapan. Pajak bila berlaku, ongkir custom, desain/spesifikasi tambahan belum dihitung. Harus disepakati sebelum transaksi custom. Quotation tidak mengunci stok; pesanan custom tetap melalui persetujuan manual. Omzet Won harus sama dengan quotation tersimpan. Margin CRM = omzet Won − snapshot biaya quotation. Metrik CRM tidak dijumlahkan dengan checkout agar tidak mengklaim omzet ganda.

## Checkout retail

Katalog berlaku untuk produk **tanpa cetak custom**. Pembelian retail mulai 1 pcs; MOQ di atas hanya untuk quotation custom. Setiap produk punya harga yang sama lintas warna, stok per varian. Stok dikurangi pada pembuatan order dalam transaksi; total dihitung server. Tidak dapat membeli produk nonaktif atau produk belum terverifikasi saat mode nyata.

Guest idempotency key (UUID) unik per owner menjamin retry checkout menghasilkan order yang sama dan tidak mengurangi stok dua kali. Reservasi stok tidak kedaluwarsa otomatis pada MVP. Sales memantau pesanan pending; pelanggan dapat membatalkan sebelum dibayar. Pembatalan mengembalikan stok sekali. Product revision mencegah perubahan admin dari editor lama menimpa stok yang baru terjual.

Tarif tetap admin: pickup Rp0, Jakarta Rp25.000, luar Jakarta Rp50.000 (default contoh). Tarif Jakarta mensyaratkan kota mengandung Jakarta. Tidak ada validasi wilayah/ongkir provider; tarif nasional harus cocok dengan cakupan layanan sebelum penjualan nyata diaktifkan.

Payment: `pending → paid` melalui verifikasi admin; atau `pending → cancelled`. Fulfillment: `unfulfilled → processing → packed → shipped → delivered`; pembatalan hanya dari unfulfilled dan belum dibayar. Shipping perlu kurir dan resi/referensi serah terima. Pickup memakai referensi serah terima ketika tahap shipped. Status timeline berasal dari input admin, bukan API kurir live. Retur/refund setelah pembayaran ditangani manual di luar MVP.

## CRM dan follow-up

Form mencatat perusahaan, PIC, telepon, email opsional, produk, jumlah, anggaran opsional, deadline, catatan, consent, sumber/campaign/medium/keyword. Deadline tidak boleh lampau. Tidak mengumpulkan file logo pelanggan pada MVP.

Pipeline: New Lead → Contacted → Qualified → Quotation Sent → Negotiation → Won/Lost. Sales dapat merevisi/membuka kembali status untuk koreksi; semua perubahan dicatat. Quotation Sent/Negotiation/Won mensyaratkan quotation. Lost wajib alasan. Won/Lost tidak punya jadwal follow-up aktif. Prospek aktif selalu memiliki jadwal berikutnya dan PIC.

- Lead baru: target internal respons 15 menit sejak masuk.
- Setelah quotation dibuat: follow-up 48 jam kemudian.
- Jadwal memakai jam kalender dan ditampilkan/diedit dalam WIB (Asia/Jakarta); sales menyesuaikan ke jam operasional.
- Pembuatan quotation tidak menandai terkirim. Sales harus menandai Quotation Sent setelah benar-benar mengirim.
- Semua komunikasi dilakukan manual. Catat hasil percakapan dan langkah berikutnya.

KPI dashboard seluruh periode: prospek aktif, follow-up jatuh tempo, omzet Won, margin kotor Won, distribusi pipeline dan klik WhatsApp terpisah. Ekspor CSV memungkinkan analisis mingguan berdasarkan tanggal/sumber. Belanja iklan, CPQL, dan laporan cohort belum terintegrasi.
