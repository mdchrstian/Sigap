# Eval result 27

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | No `.env`, run `--skip-migrate` | PASS | test_setup_env.py::test_creates_env (7 passed) |
| 2 | `.env` exists, run again -> kept | PASS | test_setup_env.py::test_existing_kept, prints "kept" |
| 3 | `--force` regenerates SECRET_KEY | PASS | test_setup_env.py::test_force_regenerates |
| 4 | `--database-url` replaces DATABASE_URL, one line, others unchanged | PASS | test_setup_env.py::test_database_url_and_masking |
| 5 | Output has no SECRET_KEY, no `pw`, shows `***` | PASS | pytest asserts; real logs: 0 SECRET_KEY hits, `DATABASE_URL: postgres://sigap:***@...` |
| 6 | Unknown flag `--nope` -> exit 2, usage on stderr | PASS | test_setup_env.py::test_unknown_flag |
| 7 | `bash -n` exit 0 and file executable | PASS | bash -n exit=0; `-x` true |
| 8 | Local DB: setup_env.sh then `migrate --check` | PASS | Migrations applied, `migrate --check` exit 0, local-default warning printed. Ran on isolated container port 54330 (see note) |
| 9 | Same with `--seed` | PASS | seed_demo ran: "Seed demo selesai: 30 laporan.", exit 0 (isolated DB 54330) |
| 10 | `.env.example` has 6 DUP_* + DEMO_PASSWORD + Supabase comment with 5432/6543 | PASS | grep: DUP_* lines 22-27, DEMO_PASSWORD line 28, comment lines 4-6 |
| 11 | Full backend test suite | PASS | `uv run pytest -q`: 121 passed (DATABASE_URL -> port 54330) |
| 12 | No `backend/.env` tracked | PASS | `git ls-files backend/.env` empty; `git status` clean; .env gitignored |

Edge cases (extra):
- `.env.example` missing -> test_setup_env.py::test_missing_example PASS
- DATABASE_URL with `&`, `/`, `?` written verbatim -> test_database_url_and_masking PASS; also verified from repo root cwd, exit 0, `DATABASE_URL=postgres://u:pw@h:5432/db?sslmode=require&a=b/c` written verbatim
- Run from repo root vs `backend/` -> same behavior PASS

Note: `docker compose -f docker-compose.test.yml up -d --wait` failed with "Bind for 0.0.0.0:54329 failed: port is already allocated" because another session's container (agent-a924ff840784f4166-db-1) holds port 54329. Checks 8-9 and the full suite were therefore run against a throwaway container from the same built image (agent-a4d36096e94e122f1-db) on host port 54330, with the same sigap/sigap credentials. That container was removed afterward. The other session's container was not touched. The script's warning still fires because `.env.example` keeps the 54329 default.

Result: 12/12 PASS (plus 3/3 edge cases).
