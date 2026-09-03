#!/bin/sh
set -eu
# VPS üzerinde: curl ile sağlık. Dışarıdan FortiGuard varsa 127.0.0.1 kullanın.
BASE=${1:-http://127.0.0.1}
fail() { echo "FAIL $1"; exit 1; }
kod() { curl -sS -o /dev/null -w "%{http_code}" "$1"; }
h=$(kod "$BASE/lab/health")
[ "$h" = "200" ] || fail "health $h"
for p in / /giris /basvuru /kilavuz /is /kayit /yonetim; do
  k=$(kod "$BASE$p")
  [ "$k" = "200" ] || fail "$p $k"
done
tok=$(curl -sS -X POST "$BASE/api/v1/oturum" -H "content-type: application/json" \
  -d '{"kullaniciAdi":"arsiv","sifre":"Lab-2026!"}')
echo "$tok" | grep -q token || fail "oturum"
bearer=$(printf '%s' "$tok" | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")
d=$(curl -sS -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $bearer" "$BASE/api/v1/dosyalar")
[ "$d" = "200" ] || fail "dosyalar $d"
echo "OK $BASE"
