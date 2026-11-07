# 10 Notifications API
ui: no

## Goal
Reporters get an in-app notification whenever an officer changes the status of their report.

## Requirements
- `notifications/models.py` `Notification`: user FK, report FK null, kind (`status_changed`),
  title, body, is_read (default False), created_at. Index (user, is_read).
- Signal on `tracking.ReportStatusHistory` post_save (created, from_status not null, changed_by
  ≠ report.reporter) → notification for `report.reporter`:
  title `"Status laporan {code} diperbarui"`, body `"Status kini: {label}."` plus `" Catatan: {note}"` if note.
- Endpoints (auth, own notifications only):
  - `GET /api/notifications?page=` → paginated `{id, kind, title, body, is_read, report_id,
    created_at}` newest first, plus top-level `unread_count`.
  - `GET /api/notifications/unread-count` → `{unread_count}`.
  - `POST /api/notifications/{id}/read` → 204. Other user's id → 404.
  - `POST /api/notifications/read-all` → 204.

## Touch
- `backend/notifications/**`

## Do not touch
- `backend/tracking/` (listen with a signal receiver in notifications, do not edit tracking)

## Decisions
- In-app only for MVP (no email/push/WhatsApp).
- Comment notifications are out of scope.
