#!/usr/bin/env bash
# SQLite online backup inside the running container plus an uploads archive.
# Output stays in $DATA_DIR/backups (mode 0600). Copy off-VPS separately.
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
sudo docker exec rumahpayung-dev-app-1 npm run --silent backup
mkdir -p "$DATA_DIR/backups"
if [ -d "$DATA_DIR/uploads" ]; then
  (umask 077; tar -C "$DATA_DIR" -czf "$DATA_DIR/backups/uploads-$STAMP.tar.gz" uploads)
fi
echo "Backup written under $DATA_DIR/backups"
