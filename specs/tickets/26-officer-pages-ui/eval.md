# Eval 26

## How to verify
- Unit: `cd frontend && npm test -- officer analytics && npm run lint`
- Design guard: `cd frontend && npm run check:design -- src/pages/OfficerDashboardPage.tsx src/pages/OfficerReportPage.tsx src/pages/OfficerStatsPage.tsx src/features/officer src/features/analytics/Charts.tsx src/features/analytics/InsightsCard.tsx`
- UI: `cd backend && uv run python manage.py runserver` (seed_demo) + `cd frontend && npm run dev`, log in as an officer

## Checks
| # | Check | Type | Expected |
|---|-------|------|----------|
| 1 | Status tabs | unit | role=tablist, active tab aria-selected=true, counts from by_status |
| 2 | StatusForm note <10 chars for completed | unit | Field error, submit blocked |
| 3 | Successful status change | unit | Dialog confirm -> toast "Status diperbarui (k laporan)" |
| 4 | InsightsCard AI unavailable | unit | marka-soft notice (adjusted test passes) |
| 5 | Old officer/analytics tests (adjusted) | unit | pass |
| 6 | check:design on the Touch paths | unit | exit 0 |
| 7 | `grep -rn "amber\|orange-\|slate-" frontend/src/features/officer frontend/src/pages/Officer*` | unit | 0 results |
| 8 | `/petugas` 1280px | ui | blue SignPlate, tabs with marka underline, aligned table, sticky header |
| 9 | `/petugas` 390px | ui | table -> list of rows, filters wrap, no horizontal scroll |
| 10 | `/petugas/laporan/<id>` | ui | 2/3 + 1/3 layout, Saran AI vs Final side by side, marka timeline |
| 11 | `/petugas/statistik` | ui | chart colours match the StatusBadges, no gradients |

## Edge cases
- master_count>1 -> confirm Dialog mentions "{n-1} laporan lain dalam grup"
- Final status -> form replaced by "Status final"
- 0 data in a period -> EmptyState in the chart area, not an empty chart

## Done means
All checks PASS, no file outside "Touch" changed, work committed on the ticket branch.
