# Eval 18

## How to verify
- Unit: `cd frontend && npx vitest run src/features/notifications`
- UI: backend runserver 8000; officer changes a status on a user's report; `npm run dev`

## Checks
| # | Check | Type | Expected |
|---|-------|------|----------|
| 1 | unread_count 0 / 3 / 12 | unit | no badge / "3" / "9+" |
| 2 | click item | unit | read POST then navigate to /laporan/{id} |
| 3 | relative time 5 minutes ago | unit | "5 menit yang lalu" or "5 menit lalu" |
| 4 | user after officer status change | ui | bell shows 1 |
| 5 | open notification | ui | lands on report detail, badge clears |
| 6 | logged out | ui | no bell |

## Edge cases
- report_id null -> item not clickable, still markable read

## Done means
All checks PASS, no file outside "Touch" changed, work committed on the ticket branch.
