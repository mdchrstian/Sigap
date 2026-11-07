# Eval 19

## How to verify
- Unit: `cd frontend && npx vitest run src/features/analytics`
- UI: backend runserver 8000 (AI_PROVIDER=fake) with reports; `cd frontend && npm run dev`

## Checks
| # | Check | Type | Expected |
|---|-------|------|----------|
| 1 | summary mock limited_data true | unit | limited-data warning visible |
| 2 | insights verified false | unit | warning style |
| 3 | insights 503 | unit | Indonesian unavailable message |
| 4 | open / logged out | ui | hero, 3 steps, stats with real counts |
| 5 | officer /petugas/statistik | ui | KPI tiles, 2 charts, regency table, stale list |
| 6 | click "Buat Ringkasan" | ui | summary + caption shown |
| 7 | public user /petugas/statistik | ui | "Akses ditolak" |
| 8 | 375px home and stats | ui | no horizontal scroll, charts fit |

## Edge cases
- total 0 -> charts show empty state text, no crash

## Done means
All checks PASS, no file outside "Touch" changed, work committed on the ticket branch.
