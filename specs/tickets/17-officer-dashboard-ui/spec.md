# 17 Officer Dashboard UI
ui: yes

## Goal
Officers review incoming reports, inspect photos, location, AI info, and reporter, then
verify and update status with a note.

## Requirements
- `/petugas` (`OfficerDashboardPage`, role officer/admin): table/cards from
  `GET /api/officer/reports?status=&category=&regency=&q=&page=` (items: id, code, category,
  description, status, status_label, regency, thumbnail_url, master_id, master_count,
  reporter_name, created_at, updated_at, is_hidden). Filters: status tabs (Semua + 6), category,
  kabupaten/kota, search (code/description, debounce 300 ms). Pagination. Status count chips
  from `GET /api/analytics/summary` `by_status`. Hidden rows get badge "Disembunyikan".
- `/petugas/laporan/:id` (`OfficerReportPage`): `GET /api/reports/{id}` (officer view includes
  `reporter{id,full_name,email}` and `history[].actor_name`). Show photos, description, map,
  address, AI section (suggested vs final category/description side by side), master group with
  links to grouped reports (from list `?q=` not needed; show count + master_id), reporter box,
  full timeline.
- Status form: select shows only allowed next statuses: submitted→[under_review, rejected];
  under_review→[verified, rejected]; verified→[in_progress, rejected]; in_progress→[completed,
  rejected]; final → form replaced by "Status final". Note textarea; required ≥10 chars for
  completed/rejected. Confirm dialog; if master_count>1: "Perubahan ini juga berlaku untuk
  {n-1} laporan lain dalam grup." → `POST /api/officer/reports/{id}/status {status, note}` →
  toast "Status diperbarui ({k} laporan)" and refetch. 400 → show `detail`.
- Link "Statistik" in dashboard header → `/petugas/statistik` (page built in ticket 19).

## Touch
- `frontend/src/pages/{OfficerDashboardPage,OfficerReportPage}.tsx`, `frontend/src/features/officer/**` (new)

## Do not touch
- `frontend/src/lib/**`, `frontend/src/features/auth/`, `backend/`

## Decisions
- AI info is shown for context only; the officer decides. Admin tasks stay in Django admin
  (add a "Buka Admin" link to `/admin/` for role admin).
