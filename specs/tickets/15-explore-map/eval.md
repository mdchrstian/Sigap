# Eval 15

## How to verify
- DB: `docker compose -f docker-compose.test.yml up -d --wait`
- Unit: `cd backend && uv run pytest reports/tests/test_map.py -q` and
  `cd frontend && npx vitest run src/features/map`
- UI: backend runserver 8000 with a few reports created; `cd frontend && npm run dev`

## Checks
| # | Check | Type | Expected |
|---|-------|------|----------|
| 1 | map API bbox around Denpasar | unit | only reports inside bbox, GeoJSON shape |
| 2 | hidden report | unit | excluded |
| 3 | status=completed filter | unit | only completed |
| 4 | bbox span 5° / missing bbox | unit | 400 |
| 5 | payload keys | unit | no reporter, no description |
| 6 | search "SGP-000001" handler | unit | calls /api/reports/1 |
| 7 | open /peta logged out | ui | Bali map with colored markers + legend |
| 8 | click marker → Lihat detail | ui | opens /laporan/{id} |
| 9 | filter status "Selesai" | ui | only completed markers remain |
| 10 | 375px | ui | filter drawer opens/closes, map usable |

## Edge cases
- No reports in view -> empty map, no error

## Done means
All checks PASS, no file outside "Touch" changed, work committed on the ticket branch.
