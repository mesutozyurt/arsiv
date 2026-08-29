#!/bin/sh
set -e
npx prisma migrate deploy --schema=/app/prisma/schema.prisma
exec node dist/main.js
