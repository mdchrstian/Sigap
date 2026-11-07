# Eval 20

## How to verify
- DB: `docker compose -f docker-compose.test.yml up -d --wait`
- Unit: `cd backend && uv run pytest dashboard/tests/test_seed.py -q`

## Checks
| # | Check | Type | Expected |
|---|-------|------|----------|
| 1 | call_command("seed_demo") | unit | 4 users, 30 reports, all descriptions start "[DATA UJI]" |
| 2 | statuses present | unit | all 6 statuses ≥1 |
| 3 | master group | unit | one master with report_count 3 |
| 4 | run twice | unit | still 30 reports |
| 5 | `--reset` then seed | unit | 30 reports, non-demo users untouched |
| 6 | every report | unit | is_in_bali true, ≥1 image |
| 7 | README sections | unit | `grep -c "Supabase\|seed_demo\|DATA UJI" README.md` ≥ 3 |
| 8 | `git grep -nE "sk-[A-Za-z0-9]{20}"` | unit | no matches |

## Edge cases
- AI_PROVIDER=openai without key -> seed still completes (embeddings skipped)

## Done means
All checks PASS, no file outside "Touch" changed, work committed on the ticket branch.
