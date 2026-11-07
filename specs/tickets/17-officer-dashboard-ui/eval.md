# Eval 17

## How to verify
- Unit: `cd frontend && npx vitest run src/features/officer`
- UI: backend runserver 8000 with reports; create officer via Django admin (`/admin/`, role
  officer) or `uv run python manage.py createsuperuser`; `cd frontend && npm run dev`

## Checks
| # | Check | Type | Expected |
|---|-------|------|----------|
| 1 | status select for "verified" | unit | options in_progress, rejected only |
| 2 | completed with 5-char note | unit | submit disabled, hint shown |
| 3 | master_count 3 confirm text | unit | mentions 2 other reports |
| 4 | officer opens /petugas | ui | report list with filters and status chips |
| 5 | filter Ditinjau tab | ui | only under_review rows |
| 6 | open report → Ditinjau → save | ui | toast, timeline gains entry with officer name |
| 7 | public user opens /petugas | ui | "Akses ditolak" |
| 8 | 375px | ui | list shows as cards, form usable |

## Edge cases
- Concurrent change makes transition invalid -> 400 detail shown, data refetched

## Done means
All checks PASS, no file outside "Touch" changed, work committed on the ticket branch.
