#!/usr/bin/env bash
# Build and deploy the committed HEAD of this checkout as rumahpayung-dev.
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"
cd "$REPO_DIR"

[ -z "$(git status --porcelain)" ] || { echo "Working tree is dirty; commit first." >&2; exit 1; }
[ -f "$ENV_FILE" ] || { echo "Missing $ENV_FILE (see deploy/edunesis.env.example)." >&2; exit 1; }
SHA="$(git rev-parse HEAD)"
PREV="$(running_sha)"
echo "Deploying $SHA (previous: ${PREV:-none})"

if [ -n "$PREV" ] && [ "$PREV" != "$SHA" ]; then
  "$REPO_DIR/deploy/backup.sh"
fi

export RELEASE_SHA="$SHA"
DC config --quiet
DC build app
start_release "$SHA"

if wait_healthy; then
  echo "$(date -u +%FT%TZ) deployed $SHA arch=$(uname -m) image=$(sudo docker image inspect --format '{{.Id}}' "rumahpayung:$SHA")" >> "$RELEASES_FILE"
  echo "Healthy: $SHA"
else
  echo "Health gate failed for $SHA" >&2
  DC logs --tail 50 app >&2 || true
  if [ -n "$PREV" ] && [ "$PREV" != "$SHA" ]; then
    echo "Rolling back to $PREV" >&2
    start_release "$PREV"
    wait_healthy && echo "Rolled back to $PREV" >&2
  fi
  exit 1
fi
