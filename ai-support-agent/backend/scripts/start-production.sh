#!/bin/sh
# Production start: run migrations, baseline if DB was created via db push, then start API.
set -e

cd "$(dirname "$0")/.."

echo "[start] Running prisma migrate deploy..."
set +e
MIGRATE_OUTPUT=$(npx prisma migrate deploy 2>&1)
MIGRATE_EXIT=$?
set -e

if [ "$MIGRATE_EXIT" -ne 0 ]; then
  echo "$MIGRATE_OUTPUT"
  if echo "$MIGRATE_OUTPUT" | grep -q "P3005"; then
    echo "[start] Database has schema but no migration history (common after db push)."
    echo "[start] Baselining migrations..."
    npx prisma migrate resolve --applied "20250702120000_init"
    npx prisma migrate resolve --applied "20250708220000_byok_ai_config"
    npx prisma migrate deploy
  else
    exit "$MIGRATE_EXIT"
  fi
fi

echo "[start] Starting API..."
exec npm start
