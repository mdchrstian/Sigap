# Eval 25

## How to verify
- Unit: `cd frontend && npm test -- map report-detail notifications && npm run lint`
- Design guard: `cd frontend && npm run check:design -- src/pages/ExploreMapPage.tsx src/pages/ReportDetailPage.tsx src/pages/MyReportsPage.tsx src/pages/NotificationsPage.tsx src/features/map src/features/report-detail src/features/notifications`
- UI: `cd backend && uv run python manage.py runserver` (seed_demo) + `cd frontend && npm run dev`

## Checks
| # | Check | Type | Expected |
|---|-------|------|----------|
| 1 | `/peta?regency=Badung` | unit | regency filter initial value "Badung" |
| 2 | Timeline status in_progress | unit | 4 done/current steps, 1 upcoming (Selesai), aria-current on in_progress |
| 3 | Timeline status rejected | unit | last step "Ditolak", no upcoming steps |
| 4 | MyReports empty | unit | text "Anda belum membuat laporan." + button |
| 5 | Bell with 3 unread | unit | aria-label "Notifikasi, 3 belum dibaca" |
| 6 | Old tests (adjusted) | unit | pass |
| 7 | check:design on the Touch paths | unit | exit 0 |
| 8 | `/peta` 1280px | ui | filter panel left, map fills the rest, markers in status colours |
| 9 | `/peta` 390px | ui | "Filter" button opens the Dialog, Esc closes it, no horizontal scroll |
| 10 | Filter with no results | ui | EmptyState + "Hapus filter" restores the markers |
| 11 | `/laporan/<id>` 1280 + 390px | ui | 2 columns -> stacked, marka timeline readable, comments as a list |
| 12 | `/notifikasi` | ui | unread is bold with a rambu dot, "Tandai semua dibaca" works |

## Edge cases
- Report without a photo -> a neutral line-bordered area "Tidak ada foto", no broken image
- `?regency=` with an unknown name -> ignored, filter "Semua"
- A very long comment / unbroken URL -> wraps (`break-words`), no overflow

## Done means
All checks PASS, no file outside "Touch" changed, work committed on the ticket branch.
