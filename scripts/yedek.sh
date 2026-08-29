#!/bin/bash
set -euo pipefail
# Lab yedek: Postgres dump + MinIO veri dizini notu. Üretim RPO/RTO değildir.
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
OUT=${1:-/var/yedek/arsiv}
mkdir -p "$OUT"
docker exec arsiv-postgres pg_dump -U arsiv arsiv > "$OUT/arsiv-$STAMP.sql"
echo "minio volume: arsiv_minio_data — içerik+üst veri birlikte kopyalanmalı" > "$OUT/minio-$STAMP.txt"
echo "yedek $STAMP yazıldı $OUT"
