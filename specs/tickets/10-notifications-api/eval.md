# Eval 10

## How to verify
- DB: `docker compose -f docker-compose.test.yml up -d --wait`
- Unit: `cd backend && uv run pytest notifications -q`

## Checks
| # | Check | Type | Expected |
|---|-------|------|----------|
| 1 | create report | unit | no notification (initial submitted) |
| 2 | officer changes status with note | unit | 1 notification for reporter, body has label + note |
| 3 | master propagation updates 2 reports of 2 reporters | unit | each reporter gets 1 |
| 4 | GET list | unit | only own, unread_count correct |
| 5 | mark read other user's id | unit | 404 |
| 6 | read-all | unit | unread_count 0 |
| 7 | unauthenticated | unit | 401 |

## Edge cases
- Reporter is the officer changing their own report -> no notification

## Done means
All checks PASS, no file outside "Touch" changed, work committed on the ticket branch.
