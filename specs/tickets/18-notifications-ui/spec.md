# 18 Notifications UI
ui: yes

## Goal
Logged-in users see an unread badge in the top nav and a notifications page that links to
the affected report.

## Requirements
- TopNav bell (logged in only): `GET /api/notifications/unread-count` → `{unread_count}`,
  react-query `refetchInterval` 60 s and on window focus; badge hidden at 0, "9+" above 9.
- `/notifikasi` (`NotificationsPage`): `GET /api/notifications?page=` → `{count, next, results:[
  {id, kind, title, body, is_read, report_id, created_at}], unread_count}`. Unread styled bold
  with dot. Click → `POST /api/notifications/{id}/read` then navigate `/laporan/{report_id}`.
  "Tandai semua dibaca" → `POST /api/notifications/read-all`. Invalidate unread-count after both.
  "Muat lebih banyak". Empty state "Belum ada notifikasi."
- Relative time in Indonesian (e.g. "5 menit lalu") via `Intl.RelativeTimeFormat("id")`.

## Touch
- `frontend/src/pages/NotificationsPage.tsx`, `frontend/src/features/notifications/**` (new),
  `frontend/src/components/layout/TopNav.tsx` (bell only)

## Do not touch
- `frontend/src/lib/**`, `frontend/src/features/auth/`, `backend/`

## Decisions
- Polling, no websockets, in MVP.
