# Eval 09

## How to verify
- DB: `docker compose -f docker-compose.test.yml up -d --wait`
- Unit: `cd backend && uv run pytest tracking -q`

## Checks
| # | Check | Type | Expected |
|---|-------|------|----------|
| 1 | create report | unit | 1 history row, to_status submitted |
| 2 | officer submitted→under_review | unit | 200, history row with changed_by officer |
| 3 | officer submitted→completed | unit | 400 Indonesian detail |
| 4 | in_progress→completed without note | unit | 400 |
| 5 | public user POST status | unit | 403 |
| 6 | 3 reports in one master, one already rejected | unit | 2 updated, rejected unchanged |
| 7 | GET /api/officer/reports?status=submitted | unit | only submitted, paginated |
| 8 | officer list as public user | unit | 403 |
| 9 | detail history as anonymous | unit | no actor_name, has actor_role_label |
| 10 | detail history as officer | unit | actor_name present |

## Edge cases
- Change from a final status (completed→in_progress) -> 400

## Done means
All checks PASS, no file outside "Touch" changed, work committed on the ticket branch.
