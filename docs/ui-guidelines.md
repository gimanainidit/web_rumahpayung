# UI dan mockup

Arah visual mengikuti navy/putih/oranye pada mockup; struktur disesuaikan dengan fokus recovery B2B. UI berbahasa Indonesia, CTA utama Minta Penawaran, navigasi dan tombol mengarah ke alur yang berfungsi. Ilustrasi awal dibuat sebagai SVG lokal dan diberi label. Tidak ada logo klien, rating, jumlah pelanggan, atau testimoni yang diklaim tanpa data.

| Referensi         | Implementasi                    |
| ----------------- | ------------------------------- |
| 1 Beranda         | `/`                             |
| 2 Katalog         | `/katalog`                      |
| 3 Detail          | `/produk/:slug`                 |
| 4 Keranjang       | `/keranjang`                    |
| 5 Checkout        | `/checkout`                     |
| 6 Tracking        | `/pesanan/:id`, timeline manual |
| 7 Riwayat         | `/pesanan`, terikat browser     |
| 8 Login admin     | `/admin/login`                  |
| 9 Dashboard       | `/admin`                        |
| 10 Produk         | `/admin/products`               |
| 11 Pesanan admin  | `/admin/orders`                 |
| Recovery landing  | `/payung-custom`                |
| Recovery intake   | `/penawaran`                    |
| Recovery CRM      | `/admin/crm`                    |
| Harga / follow-up | `/admin/settings`               |

Breakpoint 1150/800/400px. Desktop grid 4 kolom, mobile 2; admin tabel bergulir di container sendiri. Form label eksplisit, status/error announced, focus-visible, skip link, dialog focus trap dan Escape, prefer-reduced-motion, print stylesheet quotation/order. Font sistem tidak mengirim request ke pihak ketiga.
