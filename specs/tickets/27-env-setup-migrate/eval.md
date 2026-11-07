# Eval 27

## How to verify
- DB: `docker compose -f docker-compose.test.yml up -d --wait`
- Unit: `cd backend && uv run pytest -q tests/test_setup_env.py`
- Full: `cd backend && uv run pytest -q`

## Checks
| # | Check | Type | Expected |
|---|-------|------|----------|
| 1 | No `.env`, run `--skip-migrate` | unit | `.env` created, equals example except SECRET_KEY, SECRET_KEY non-empty and differs from example |
| 2 | `.env` exists, run again | unit | file byte-identical, prints "kept" |
| 3 | `--force` | unit | `.env` regenerated with a new SECRET_KEY |
| 4 | `--database-url postgres://u:pw@h:5432/db?sslmode=require` on existing `.env` | unit | exactly one `DATABASE_URL=` line with that value; other lines unchanged |
| 5 | Output of any run | unit | contains neither SECRET_KEY value nor `pw`; masked `***` shown |
| 6 | Unknown flag `--nope` | unit | exit code 2, usage on stderr |
| 7 | `bash -n backend/scripts/setup_env.sh` and file is executable | unit | exit 0, `-x` true |
| 8 | Local DB: `cd backend && DATABASE_URL=postgres://sigap:sigap@localhost:54329/sigap scripts/setup_env.sh` on a fresh tmp `.env` copy, then `uv run python manage.py migrate --check` | unit | migrate succeeds, `--check` exit 0, local-default warning printed |
| 9 | Same with `--seed` | unit | seed_demo runs, exit 0 |
| 10 | `.env.example` contains all 6 DUP_* vars, DEMO_PASSWORD, Supabase comment mentioning 5432 and 6543 | unit | grep finds each |
| 11 | Full backend test suite | unit | all pass |
| 12 | `git status` shows no `backend/.env` tracked | unit | not tracked |

## Edge cases
- `.env.example` missing -> error message, exit non-zero
- DATABASE_URL value containing `&`, `/`, `?` -> written verbatim
- Run from repo root vs `backend/` -> same result

## Done means
All checks PASS, no file outside "Touch" changed, work committed on the ticket branch.
