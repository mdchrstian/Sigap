# Eval 16

## How to verify
- Unit: `cd frontend && npx vitest run src/features/report-detail`
- UI: backend runserver 8000 (DB up, a report with an officer status change and a comment);
  `cd frontend && npm run dev`

## Checks
| # | Check | Type | Expected |
|---|-------|------|----------|
| 1 | detail mock with 3 history items | unit | timeline shows 3 entries in order |
| 2 | master.report_count 3 | unit | "tergabung dengan 2 laporan lain" |
| 3 | 404 response | unit | "Laporan tidak ditemukan" |
| 4 | logged out | unit | comment form hidden, login link shown |
| 5 | open /laporan/{id} | ui | photos, status, map marker, timeline visible |
| 6 | add comment with photo | ui | appears with label "Pelapor" or "Warga" |
| 7 | delete own comment | ui | removed from list |
| 8 | /laporan-saya | ui | own reports listed, click opens detail |
| 9 | 375px | ui | single column, no horizontal scroll |

## Edge cases
- Report with no images -> placeholder, no broken image

## Done means
All checks PASS, no file outside "Touch" changed, work committed on the ticket branch.
