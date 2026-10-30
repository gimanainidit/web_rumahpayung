# Runbook dev: edunesis.store (VPS existing)

Lingkungan dev/demo. Mode demo aplikasi tetap aktif; tidak ada pembayaran nyata.

## Arsitektur

Browser → Caddy host (80/443) → `127.0.0.1:3101` → container `rumahpayung-dev-app-1` (port 3000, Express melayani `dist`, `/api`, `/media`). SQLite satu instance; tidak memakai PostgreSQL/Redis layanan lain.

| Item          | Lokasi                                                                        |
| ------------- | ----------------------------------------------------------------------------- |
| Compose       | `compose.dev.yaml`, project `rumahpayung-dev`, service `app`                  |
| Data          | `/opt/rumahpayung-dev/data` → `/app/.local` (uid 1000)                        |
| Env runtime   | `/opt/rumahpayung-dev/runtime.env` (0600, dari `deploy/edunesis.env.example`) |
| Riwayat rilis | `/opt/rumahpayung-dev/releases.log`                                           |
| Caddy         | `/etc/caddy/rumahpayung-dev.d/edunesis.store.caddy` (di-import)               |

Image diberi tag `rumahpayung:<full-sha>`; tag lama dipertahankan untuk rollback.

## Perintah (jalankan dari checkout repo)

```sh
deploy/deploy.sh                  # build HEAD yang sudah di-commit, backup, ganti app, health gate, auto-rollback
deploy/rollback.sh <full-sha>     # kembali ke image lama (schema DB tidak dibalik)
deploy/backup.sh                  # snapshot SQLite online + arsip uploads di data/backups
sudo docker restart rumahpayung-dev-app-1   # restart hanya app

sudo docker logs --tail 100 rumahpayung-dev-app-1
```

Jangan menjalankan `docker system prune`, `compose down -v`, atau perintah pada project lain.

## Admin

Sekali saja setelah start pertama (mempertahankan akun yang ada):

```sh
sudo docker exec rumahpayung-dev-app-1 npm run --silent admin:ensure
sudo cat /opt/rumahpayung-dev/data/admin-access.txt   # sampaikan lewat kanal privat, lalu hapus/ganti
```

Jangan menjalankan `admin:reset` tanpa alasan; itu mencabut semua sesi.

## Caddy dan DNS

1. A record `edunesis.store` → IPv4 publik VPS pada penyedia DNS authoritative. Hapus/koreksi AAAA yang menunjuk host lain.
2. Pasang snippet, `sudo caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile`, lalu `sudo systemctl reload caddy`.
3. Aktifkan snippet hanya setelah DNS benar agar ACME tidak gagal berulang.

### Status aktivasi (2026-10-31)

Snippet (apex + redirect `www` → apex) terpasang dan di-import dari `/etc/caddy/Caddyfile` (cadangan: `/etc/caddy/Caddyfile.bak-20261030235835`). `systemctl reload caddy` gagal di host ini (`status=226/NAMESPACE`, PrivateTmp); proses Caddy tidak terganggu. Gunakan reload lewat admin API:

```sh
sudo caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
sudo caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile --force
```

Resolver lokal VPS masih men-cache IP lama `edunesis.store`; uji dari server dengan `curl --resolve edunesis.store:443:43.157.230.75`.

## Batasan

- Rate limit melihat IP proxy bersama (`trust proxy` belum diaktifkan); perubahan terpisah.
- Akses dev bersifat publik; `robots.txt` demo `Disallow: /` bukan kontrol akses.
- Backup di VPS bukan backup sungguhan; salin `data/backups` ke luar mesin.
- Rollback image tidak membalik migrasi DB; restore mengikuti `docs/deployment.md`.
