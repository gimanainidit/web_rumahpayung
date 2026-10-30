#!/usr/bin/env bash
# Usage: deploy/rollback.sh <full-git-sha>   (image rumahpayung:<sha> must exist)
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
SHA="${1:?usage: rollback.sh <full-git-sha>}"
sudo docker image inspect "rumahpayung:$SHA" >/dev/null
echo "Rolling back to $SHA (data volume untouched; DB schema is not reverted)"
start_release "$SHA"
wait_healthy
echo "$(date -u +%FT%TZ) rollback $SHA" >> "$RELEASES_FILE"
echo "Healthy: $SHA"
