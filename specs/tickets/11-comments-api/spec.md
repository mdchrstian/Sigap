# 11 Comments & contributions API
ui: no

## Goal
Logged-in users can add comments (optionally with a photo) to a report to contribute extra
information; everyone can read them without seeing the author's identity.

## Requirements
- `community/models.py` `ReportComment`: report FK (related `comments`), author FK User,
  body (text, 3–1000 chars), image ImageField null (`comments/%Y/%m/`), is_hidden bool,
  created_at.
- Image rules reuse `reports.images` (validate + resize + strip EXIF).
- Endpoints:
  - `GET /api/reports/{id}/comments?page=` (no auth) → paginated, oldest first, excludes
    hidden: `{id, body, image_url|null, author_label, is_mine, created_at}`.
    `author_label`: "Pelapor" if author is the report's reporter, "Petugas" if officer/admin,
    else "Warga". No names/emails.
  - `POST /api/reports/{id}/comments` (auth, multipart `body`, `image?`) → 201 item.
    Report hidden or not found → 404.
  - `DELETE /api/comments/{id}` (author or admin) → 204 (sets is_hidden=True).
- Throttle scope `comments` 20/hour per user.
- Django admin: ReportComment list (report code, author email, created_at, is_hidden), filter
  is_hidden, actions hide/unhide.

## Touch
- `backend/community/**`, `backend/config/settings.py` (throttle rate only)

## Do not touch
- `backend/reports/` (import `reports.images` helpers, do not modify)

## Decisions
- Contributions = comments + optional photo. No voting/upvotes in MVP.
- Moderation through Django admin; soft delete only.
