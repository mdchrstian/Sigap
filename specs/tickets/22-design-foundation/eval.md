# Eval 22

## How to verify
- Unit: `cd frontend && npm test -- components lib && npm run lint`
- Full: `cd frontend && npm test` (all old tests must still pass)
- Design guard: `cd frontend && npm run check:design -- src/components src/pages/NotFoundPage.tsx`
- UI: `cd backend && uv run python manage.py runserver` + `cd frontend && npm run dev`, then open http://localhost:5173

## Checks
| # | Check | Type | Expected |
|---|-------|------|----------|
| 1 | contrast.test.ts | unit | all pairs meet the threshold |
| 2 | ui.test.tsx (Button Link, loading aria-busy, Field aria-describedby, Dialog Esc, MarkaRoute aria-current, Toast) | unit | pass |
| 3 | StatusBadge shows label + icon for all 6 statuses | unit | labels unchanged ("Dalam Pengerjaan", etc.) |
| 4 | `npm run check:design -- src/components src/pages/NotFoundPage.tsx` | unit | exit 0 |
| 5 | check:design catches violations: a temp file with `bg-[#fff] p-5 bg-gradient-to-r` | unit | exit 1, 3 lines reported; delete the temp file |
| 6 | `grep -c "fonts.googleapis" frontend/index.html` | unit | 0 |
| 7 | Every page `/`, `/peta`, `/masuk`, `/petugas` at 1280px | ui | Overpass headings, Atkinson body, nav + aspal footer with marka line |
| 8 | At 390px: hamburger opens a panel, links ≥48px tall, no horizontal scroll | ui | ok |
| 9 | Tab through the nav | ui | 3px focus ring visible on every link/button |
| 10 | Text selection on a page | ui | marka background, ink text |
| 11 | `/halaman-asal` | ui | SignPlate "Halaman tidak ditemukan" + back button |

## Edge cases
- Long user names in the nav menu -> truncated with an ellipsis, layout intact
- `prefers-reduced-motion` (DevTools emulation) -> MarkaRoute appears without animation
- Pages that haven't migrated yet still use `bg-primary` -> still rambu green (alias)

## Done means
All checks PASS, no file outside "Touch" changed, work committed on the ticket branch.
