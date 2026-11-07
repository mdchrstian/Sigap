# Eval 08

## How to verify
- DB: `docker compose -f docker-compose.test.yml up -d --wait`
- Unit: `cd backend && uv run pytest duplicates reports/tests/test_link.py -q` (fake AI provider)

## Checks
| # | Check | Type | Expected |
|---|-------|------|----------|
| 1 | existing report 20 m away, same category, near-identical text | unit | decision high |
| 2 | same but 300 m away | unit | low, no candidates |
| 3 | 40 m, different category, similar text | unit | medium |
| 4 | candidate older than 90 days or rejected or hidden | unit | excluded |
| 5 | embed_text raises AIUnavailable, same category 30 m | unit | medium, similarity null |
| 6 | check without auth | unit | 401 |
| 7 | create with link_to_report_id (target no master) | unit | both share new MasterReport, count 2 |
| 8 | link to report already in a master | unit | joins that master, count 3 |
| 9 | link to report 1 km away | unit | 400 Indonesian message |
| 10 | create stores ReportEmbedding | unit | row exists, 1536 dims |
| 11 | store_embedding fails | unit | report still 201 |

## Edge cases
- Original reports keep their own id, photos, reporter after linking

## Done means
All checks PASS, no file outside "Touch" changed, work committed on the ticket branch.
