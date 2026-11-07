# Eval 02

## How to verify
- Unit: `cd frontend && npm install && npx vitest run src/lib src/components`
- Types: `cd frontend && npm run lint && npm run build`
- UI: `cd frontend && npm run dev` then open http://localhost:5173

## Checks
| # | Check | Type | Expected |
|---|-------|------|----------|
| 1 | api(): adds bearer header when tokens exist | unit | header present |
| 2 | api(): 401 → refresh → retry succeeds | unit | 2nd call uses new access |
| 3 | api(): refresh fails | unit | tokens cleared, ApiError status 401 |
| 4 | StatusBadge renders "Dalam Pengerjaan" for in_progress | unit | text visible |
| 5 | lint + build | unit | exit 0 |
| 6 | open / | ui | top nav with "Sigap" and "Buat Laporan" button |
| 7 | click each nav link | ui | placeholder page for that route, no console errors |
| 8 | /tidak-ada | ui | "Halaman tidak ditemukan" |
| 9 | viewport 375px | ui | hamburger menu, no horizontal scroll |

## Edge cases
- localStorage throws -> getTokens returns null, app still renders

## Done means
All checks PASS, no file outside "Touch" changed, work committed on the ticket branch.
