#!/usr/bin/env bash
# Prepare backend/.env and run migrations (Supabase Postgres via DATABASE_URL).
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage: setup_env.sh [--database-url URL] [--seed] [--skip-migrate] [--force]
  --database-url URL  set/replace DATABASE_URL in backend/.env
  --seed              run seed_demo after migrate
  --skip-migrate      do not run migrations
  --force             regenerate backend/.env from .env.example
  -h, --help          show this help
USAGE
}

DB_URL=""
HAVE_DB_URL=0
SEED=0
SKIP_MIGRATE=0
FORCE=0

while [ $# -gt 0 ]; do
  case "$1" in
    -h|--help) usage; exit 0 ;;
    --database-url)
      if [ $# -lt 2 ]; then usage >&2; exit 2; fi
      DB_URL="$2"; HAVE_DB_URL=1; shift 2 ;;
    --seed) SEED=1; shift ;;
    --skip-migrate) SKIP_MIGRATE=1; shift ;;
    --force) FORCE=1; shift ;;
    *) echo "Unknown option: $1" >&2; usage >&2; exit 2 ;;
  esac
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

if [ ! -f .env ] || [ "$FORCE" -eq 1 ]; then
  if [ ! -f .env.example ]; then
    echo "error: backend/.env.example not found" >&2
    exit 1
  fi
  cp .env.example .env
  SECRET="$(uv run python -c "import secrets;print(secrets.token_urlsafe(50))")"
  if [ -z "$SECRET" ]; then echo "error: could not generate SECRET_KEY" >&2; exit 1; fi
  # awk with ENVIRON: portable (macOS + Linux) and value is not interpreted.
  NEW_SECRET="$SECRET" awk '
    /^SECRET_KEY=/ { print "SECRET_KEY=" ENVIRON["NEW_SECRET"]; next }
    { print }' .env > .env.tmp && mv .env.tmp .env
  echo "backend/.env created from .env.example (SECRET_KEY generated)"
else
  echo "backend/.env exists, kept"
fi

if [ "$HAVE_DB_URL" -eq 1 ]; then
  NEW_URL="$DB_URL" awk '
    BEGIN { done = 0 }
    /^DATABASE_URL=/ { if (!done) { print "DATABASE_URL=" ENVIRON["NEW_URL"]; done = 1 }; next }
    { print }
    END { if (!done) print "DATABASE_URL=" ENVIRON["NEW_URL"] }' .env > .env.tmp && mv .env.tmp .env
  echo "DATABASE_URL updated in backend/.env"
fi

CURRENT_URL="$(grep -E '^DATABASE_URL=' .env | tail -n 1 | cut -d= -f2- || true)"
# Mask password: scheme://user:PASS@host -> scheme://user:***@host
MASKED="$(printf '%s' "$CURRENT_URL" | sed -E 's#(://[^:/@]*):[^@]*@#\1:***@#')"
echo "DATABASE_URL: ${MASKED:-<empty>}"
case "$CURRENT_URL" in
  ""|*localhost:54329*)
    echo "warning: DATABASE_URL is empty or the local default, not Supabase. Continuing." >&2 ;;
esac

if [ "$SKIP_MIGRATE" -eq 0 ]; then
  echo "Running migrations..."
  uv run python manage.py migrate --noinput
  if [ "$SEED" -eq 1 ]; then
    echo "Seeding demo data..."
    uv run python manage.py seed_demo
  fi
elif [ "$SEED" -eq 1 ]; then
  echo "warning: --seed ignored because --skip-migrate was given" >&2
fi

echo "Done."
