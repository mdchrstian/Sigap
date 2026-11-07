# 27 Env Setup + Migrate (Supabase)
ui: no

## Goal
One command prepares `backend/.env` from `backend/.env.example` and runs Django migrations
against the Supabase Postgres in `DATABASE_URL`, optionally seeding demo data.

## Requirements
- New script `backend/scripts/setup_env.sh` (bash, `set -euo pipefail`, executable),
  runnable from any cwd (it `cd`s to `backend/` itself).
- Usage: `setup_env.sh [--database-url URL] [--seed] [--skip-migrate] [--force]`.
  `-h/--help` prints usage. Unknown flag -> usage on stderr, exit 2.
- `.env` handling:
  - If `backend/.env` missing (or `--force`): copy `.env.example` to `.env`, then replace
    `SECRET_KEY` with a freshly generated value
    (`uv run python -c "import secrets;print(secrets.token_urlsafe(50))"`).
  - If `.env` exists and no `--force`: keep it untouched (print "backend/.env exists, kept").
  - `--database-url URL` sets/replaces the `DATABASE_URL=` line in `.env` (works on both
    new and existing `.env`). Use a portable edit (no GNU-only `sed -i`; macOS + Linux).
  - Never print the SECRET_KEY or the full DATABASE_URL (mask password as `***`).
- Before migrating: if `DATABASE_URL` in `.env` is empty or still the local default
  (`localhost:54329`), print a warning that it is not Supabase but continue.
- Migrate: `uv run python manage.py migrate --noinput` unless `--skip-migrate`.
- `--seed`: after migrate, `uv run python manage.py seed_demo` (no `--reset`).
- Exit non-zero if any step fails.
- `backend/.env.example`:
  - Add missing vars with their current code defaults: `DUP_RADIUS_M=100`,
    `DUP_WINDOW_DAYS=90`, `DUP_HIGH_SIM=0.88`, `DUP_HIGH_MAX_DIST_M=50`,
    `DUP_MEDIUM_SIM=0.75`, `DUP_MAX_CANDIDATES=5`, `DEMO_PASSWORD=SigapDemo2026!`.
  - Add a comment above `DATABASE_URL` with the Supabase format:
    `postgres://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres?sslmode=require`
    and note: use the Session pooler (port 5432) or direct connection, NOT the
    Transaction pooler (6543).
  - Keep the existing local default value for `DATABASE_URL` unchanged.
- README: short "Setup .env + migrasi (Supabase)" section with the command and flags.
- Pytest test `backend/tests/test_setup_env.py` that runs the script via `subprocess` in a
  temp copy (copy `.env.example` + script into tmp `backend/` layout, use
  `--skip-migrate`) and asserts the `.env` behaviors above.

## Touch
- `backend/scripts/setup_env.sh`  new
- `backend/.env.example`  add vars + Supabase comment
- `backend/tests/test_setup_env.py`  new (or the existing backend tests folder if
  `backend/tests/` does not exist: place it next to other top-level tests)
- `README.md`  add setup section

## Do not touch
- `backend/config/settings.py`  env reading already has defaults
- `backend/*/migrations/`  no new migrations
- `backend/.env`  gitignored; the user runs the script on main
- `docker-compose.test.yml`  tests keep using local docker DB
- NUSAROUTER_* vars  belong to ticket 21

## Decisions
- .env created by worker? -> No, worker writes a setup script; user runs it on main.
- Target DB -> Supabase (user supplies URL via `--database-url` or edits `.env`).
- Fill .env.example gaps -> yes, DUP_* + DEMO_PASSWORD only (not NUSAROUTER_*).
- Seed -> optional `--seed` flag running `seed_demo`.
- Real Supabase run is not part of eval (no credentials in worktree); migrations are
  verified against the local docker DB instead.
