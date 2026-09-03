#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")"
git fetch origin main:refs/remotes/origin/main
git reset --hard origin/main
docker compose --env-file .env up -d --build
ok=0
for i in 1 2 3 4 5 6 7 8 9 10; do
  if curl -fsS http://127.0.0.1/api/v1/health >/dev/null 2>&1; then
    ok=1
    break
  fi
  sleep 3
done
[ "$ok" = "1" ] || { echo "api health timeout"; exit 1; }
curl -fsS http://127.0.0.1/api/v1/health
echo
web_ok=0
for i in 1 2 3 4 5 6 7 8 9 10; do
  kod=$(curl -sS -o /dev/null -w "%{http_code}" http://127.0.0.1/ || true)
  if [ "$kod" = "200" ]; then
    web_ok=1
    break
  fi
  sleep 3
done
[ "$web_ok" = "1" ] || { echo "web timeout"; exit 1; }
echo "web=200"
