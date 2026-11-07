# Eval 03

## How to verify
- DB: `docker compose -f docker-compose.test.yml up -d --wait`
- Unit: `cd backend && uv run pytest accounts -q`

## Checks
| # | Check | Type | Expected |
|---|-------|------|----------|
| 1 | register valid | unit | 201, role=public |
| 2 | register with `"role":"admin"` | unit | 201, role=public |
| 3 | register duplicate email | unit | 400 with email error |
| 4 | register password "123" | unit | 400 |
| 5 | login valid | unit | 200 with access, refresh, user |
| 6 | login wrong password | unit | 401 Indonesian detail |
| 7 | refresh with valid refresh token | unit | 200 access |
| 8 | GET /api/auth/me without token | unit | 401 |
| 9 | PATCH me with role=admin | unit | role unchanged |
| 10 | IsOfficer: public denied, officer & admin allowed | unit | as stated |
| 11 | admin save role=admin | unit | is_staff True |

## Edge cases
- Email case: "A@x.com" then "a@x.com" -> second register 400 (normalize lowercase)

## Done means
All checks PASS, no file outside "Touch" changed, work committed on the ticket branch.
