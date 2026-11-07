# Eval 11

## How to verify
- DB: `docker compose -f docker-compose.test.yml up -d --wait`
- Unit: `cd backend && uv run pytest community -q`

## Checks
| # | Check | Type | Expected |
|---|-------|------|----------|
| 1 | POST comment as user | unit | 201, author_label "Warga" |
| 2 | reporter comments own report | unit | author_label "Pelapor" |
| 3 | officer comments | unit | author_label "Petugas" |
| 4 | GET as anonymous | unit | no author name/email in payload |
| 5 | POST unauthenticated | unit | 401 |
| 6 | body "ok" | unit | 400 |
| 7 | comment with jpg | unit | 201, image_url set, EXIF stripped |
| 8 | DELETE by other user | unit | 403 |
| 9 | DELETE by author then GET | unit | comment not listed |
| 10 | 21st comment in an hour | unit | 429 |

## Edge cases
- Comment on hidden report -> 404

## Done means
All checks PASS, no file outside "Touch" changed, work committed on the ticket branch.
