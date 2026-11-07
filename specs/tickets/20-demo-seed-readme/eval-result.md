| # | Check | Result | Evidence (1 line) |
|---|-------|--------|-------------------|
| 1 | call_command("seed_demo") | SKIP | Test DB unreachable: `docker compose up` failed ("Docker Desktop is unable to start"); pytest errors with connection refused on localhost:54329 |
| 2 | statuses present | SKIP | Same DB blocker; test_seed_basic not executed |
| 3 | master group | SKIP | Same DB blocker; test_seed_basic not executed |
| 4 | run twice | SKIP | Same DB blocker; test_idempotent_and_reset not executed |
| 5 | `--reset` then seed | SKIP | Same DB blocker; test_idempotent_and_reset not executed |
| 6 | every report | SKIP | Same DB blocker; test_seed_basic not executed |
| 7 | README sections | PASS | `grep -c "Supabase\|seed_demo\|DATA UJI" README.md` = 11 (>= 3) |
| 8 | `git grep -nE "sk-[A-Za-z0-9]{20}"` | PASS | No matches (git grep exit 1) |
| 9 | AI_PROVIDER=openai without key (edge) | SKIP | Same DB blocker; test_openai_without_key not executed |

Done means: NOT MET. Checks 1-6 and 9 could not run (no DB). Touch-list check PASS: branch diff vs main touches only README.md, backend/dashboard/management/{__init__.py,commands/__init__.py,commands/seed_demo.py}, backend/dashboard/tests/test_seed.py. Commit PASS: 99a9d97 on ticket/20-demo-seed-readme, worktree clean.
