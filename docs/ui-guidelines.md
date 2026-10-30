# RUMAH Payung — UI guidelines

Arah: “Tempat cerita bernaung”. Editorial, hangat, lugas; payung menjadi pusat identitas. CTA utama adalah penawaran custom B2B; belanja satuan tetap menuju katalog. Tidak menambah klaim pelanggan, testimoni, atau integrasi.

## Sistem visual

| Token   | Nilai     |
| ------- | --------- |
| Ink     | `#173449` |
| Paper   | `#F6F2EA` |
| Surface | `#FFFFFF` |
| Accent  | `#B54726` |
| Muted   | `#56636B` |
| Divider | `#DCD7CD` |

Manrope variable lokal, dengan fallback sistem; lisensi SIL OFL disimpan di `public/fonts/OFL-Manrope.txt`. Body/input 16px, label 14px, caption minimal 12px. Logo memiliki pengecualian ukuran sebagai lockup grafis. Container maksimum 1280px, breakpoint 1150/800/400px, kontrol utama minimal 44px. Gaya baru di `src/storefront.css` dibatasi wrapper `.storefront`; aturan logo juga dipakai admin.

## Identitas dan aset

Logo kanopi Naungan dan wordmark RUMAH Payung tersedia horizontal/stacked, navy/ivory/monokrom, SVG dan PNG di `public/brand/`. Ikon mandiri tersedia sebagai SVG, ICO, dan apple-touch-icon. Gunakan clearspace minimal seperempat tinggi simbol; jangan distorsi atau tambahkan glow/shadow. Kemiripan merek belum ditinjau secara legal.

Gambar editorial pada `public/images/editorial/` adalah visual konsep, bukan dokumentasi SKU. Hero desktop 79,264 byte, mobile 20,816 byte, detail 45,504 byte. Versi mobile dipilih melalui picture; hero eager/high priority, detail lazy. Fallback hero memakai ilustrasi existing. Jangan mengganti gambar `/media/` yang dikelola admin dengan visual konsep.

Aset editorial ditemukan dalam workspace implementasi 30 Oktober 2026, bersama sumber PNG pada folder generated_images. Prompt generasi yang benar-benar digunakan tidak tercatat; brief rencana: payung navy terbuka, kain dan jahitan realistis, gagang wajar, studio ivory, cahaya samping, tanpa teks/logo. Jangan menyatakan gambar sebagai foto produk aktual atau portofolio pelanggan. Gambar detail adalah crop studi yang sama, bukan foto penggunaan kontekstual terpisah.

## Halaman dan interaksi

Beranda: hero, manfaat, pilihan produk dinamis, cerita/detail payung, kategori, proses custom, FAQ, CTA. Katalog, detail, form penawaran, keranjang, checkout, pesanan, dan halaman informasi memakai sistem yang sama. Routing, pricing, stok, API dan database tidak diubah.

Menu mobile memindahkan fokus ke navigasi dan mengembalikannya saat Escape. Filter mobile mempertahankan query kategori, memiliki reset dan Escape. Form menggunakan validasi native ditambah pesan terkait field. Estimasi memiliki loading, gagal/retry, dan hasil tanpa menghapus kontak. Mode demo, consent, atribusi, dan sumber total server dipertahankan. Reduced motion dan gaya cetak tetap tersedia.

## Penggunaan ui-ux-pro-max

Skill lokal tersedia di `.agents/skills/ui-ux-pro-max`; sumber dan hash tercatat dalam `skills-lock.json`. Instalasi lokal bukan klaim instalasi personal ChatGPT. Pencarian `umbrella merchandise editorial ecommerce --design-system` menghasilkan Feature-Rich Showcase / Vibrant & Block-based. Hirarki pesan dan CTA relevan; palet hijau, animasi, scroll-snap, dan social proof generik tidak diterapkan karena tidak sesuai brief. Pencarian React `form error focus` mendukung focus management, error boundary, dan pelaporan kegagalan async.

## Verifikasi

Jalankan build, unit/integration tests, E2E dengan database disposable, dan format check sesuai AGENTS.md. E2E mencakup retail lengkap, quotation/CRM, admin, upload foto, axe WCAG A/AA, menu/filter keyboard, retry estimasi, dan overflow 320–1440px. Screenshot lokal berada di `.local/screenshots/` dan tidak di-commit. Hasil lab tidak membuktikan target Core Web Vitals pengguna nyata; belum ada pengukuran lapangan LCP/INP/CLS.
