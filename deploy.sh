#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")"
git fetch origin
git reset --hard origin/main
docker compose --env-file .env up -d --build
curl -fsS http://127.0.0.1/api/v1/health
echo
curl -fsS -o /dev/null -w "web=%{http_code}\n" http://127.0.0.1/
