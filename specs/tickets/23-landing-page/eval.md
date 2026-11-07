# Eval 23

## How to verify
- Unit: `cd frontend && npm test -- landing analytics && npm run lint`
- Design guard: `cd frontend && npm run check:design -- src/pages/HomePage.tsx src/features/landing src/features/analytics/PublicStats.tsx`
- UI: `cd backend && uv run python manage.py runserver` (DB seeded: `uv run python manage.py seed_demo`) + `cd frontend && npm run dev`, open http://localhost:5173/

## Checks
| # | Check | Type | Expected |
|---|-------|------|----------|
| 1 | Logged in: picking a file on "Foto kerusakannya" | unit | navigate("/lapor", {state:{photo:File}}) is called |
| 2 | Logged out: the "Foto kerusakannya" button | unit | href `/masuk?next=%2Flapor` |
| 3 | PublicStats with mock data | unit | stat-total/stat-done correct; one row per regency, sorted desc, link `/peta?regency=...` |
| 4 | limited_data true | unit | banner `role=status` appears |
| 5 | check:design on the Touch paths | unit | exit 0 |
| 6 | 1280px first viewport | ui | SignPlate headline + both buttons + sample ticket visible without scrolling |
| 7 | 390px | ui | order SignPlate, text, buttons, ticket; no horizontal scroll; buttons ≥48px |
| 8 | Scroll to "Cara kerja" | ui | the marka line draws itself once; 5 steps, no cards |
| 9 | Reduced motion (DevTools) | ui | marka line visible immediately |
| 10 | Click a regency row | ui | goes to `/peta?regency=<name>` |
| 11 | Ticket says "Contoh" | ui | badge visible, code SGP-CONTOH |

## Edge cases
- Summary API error -> "Gagal memuat statistik." with role=alert, the rest of the page intact
- by_regency empty -> sentence "Belum ada laporan." and no sign list
- Long regency name ("Kabupaten Karangasem") -> fits on one row at 390px or wraps neatly

## Done means
All checks PASS, no file outside "Touch" changed, work committed on the ticket branch.
