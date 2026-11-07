# Eval 05

## How to verify
- DB: `docker compose -f docker-compose.test.yml up -d --wait`
- Unit: `cd backend && uv run pytest reports -q` (mock `reverse_geocode`)

## Checks
| # | Check | Type | Expected |
|---|-------|------|----------|
| 1 | GET /api/categories | unit | 6 seeded categories |
| 2 | POST /api/reports valid (1 jpg) | unit | 201, status submitted, code SGP-000001 format |
| 3 | uploaded JPEG with EXIF | unit | stored image has no EXIF, longest side ≤1600 |
| 4 | POST without auth | unit | 401 |
| 5 | POST lat/lng in Jakarta (-6.2, 106.8) | unit | 400 Bali message |
| 6 | POST 0 images / 4 images / .gif | unit | 400 each |
| 7 | GET detail as anonymous | unit | no `reporter` key, is_mine false |
| 8 | GET detail as officer | unit | `reporter` present |
| 9 | hidden report anonymous / owner | unit | 404 / 200 |
| 10 | GET /api/reports/mine | unit | only own reports, paginated |
| 11 | `geo.nearby` 2 reports 30 m and 500 m apart, radius 100 | unit | only the 30 m one |
| 12 | reverse_geocode raises | unit | report still created, regency "" |

## Edge cases
- description 9 chars -> 400; ai_observations not valid JSON -> 400

## Done means
All checks PASS, no file outside "Touch" changed, work committed on the ticket branch.
