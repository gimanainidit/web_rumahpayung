#!/usr/bin/env bash
# Shared helpers; scoped strictly to the rumahpayung-dev compose project.
set -euo pipefail
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BASE_DIR="${BASE_DIR:-/opt/rumahpayung-dev}"
export DATA_DIR="${DATA_DIR:-$BASE_DIR/data}"
export ENV_FILE="${ENV_FILE:-$BASE_DIR/runtime.env}"
RELEASES_FILE="$BASE_DIR/releases.log"
DC() { sudo docker compose -p rumahpayung-dev -f "$REPO_DIR/compose.dev.yaml" "$@"; }

running_sha() {
  sudo docker inspect --format '{{.Config.Image}}' rumahpayung-dev-app-1 2>/dev/null | sed 's/^rumahpayung://' || true
}

wait_healthy() {
  local i status
  for i in $(seq 1 30); do
    status="$(sudo docker inspect --format '{{.State.Health.Status}}' rumahpayung-dev-app-1 2>/dev/null || echo missing)"
    [ "$status" = healthy ] && curl -fsS -m 5 http://127.0.0.1:3101/api/health >/dev/null && return 0
    sleep 3
  done
  return 1
}

start_release() {
  export RELEASE_SHA="$1"
  DC up -d --no-build --no-deps app
}
