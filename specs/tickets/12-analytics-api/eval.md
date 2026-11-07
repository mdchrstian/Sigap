# Eval 12

## How to verify
- DB: `docker compose -f docker-compose.test.yml up -d --wait`
- Unit: `cd backend && uv run pytest dashboard -q`

## Checks
| # | Check | Type | Expected |
|---|-------|------|----------|
| 1 | 3 reports (2 road, 1 drainage), 1 hidden road | unit | total 2, road 1, drainage 1 |
| 2 | by_status | unit | 6 entries, zero-filled |
| 3 | regency filter Gianyar | unit | only Gianyar reports counted |
| 4 | from>to | unit | 400 |
| 5 | report in_progress updated 20 days ago | unit | stale_count 1 |
| 6 | completed report updated 20 days ago | unit | not stale |
| 7 | /api/analytics/stale as public | unit | 403 |
| 8 | total < 20 | unit | limited_data true |

## Edge cases
- No reports -> total 0, all lists zero-filled, no error

## Done means
All checks PASS, no file outside "Touch" changed, work committed on the ticket branch.
