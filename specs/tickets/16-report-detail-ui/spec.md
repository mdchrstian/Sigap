# 16 Report Detail & My Reports UI
ui: yes

## Goal
Users see a report's full public detail with status timeline, Master Report group, AI info,
and comments; logged-in users track their own reports in "Laporan Saya".

## Requirements
- `/laporan/:id` (`ReportDetailPage`) uses `GET /api/reports/{id}` (shape: id, code,
  category{id,slug,name}, description, latitude, longitude, address, regency, status,
  status_label, images[{id,url}], master{id,report_count}|null, ai{used, suggested_category,
  suggested_description, observations}, history[{to_status, status_label, note,
  actor_role_label, created_at}], created_at, updated_at, is_mine). 404 → "Laporan tidak ditemukan".
- Layout: header (code, StatusBadge, category, date), photo gallery (click → lightbox),
  description, address + regency, small non-interactive Leaflet map with marker.
- Timeline: vertical list of history (label, actor_role_label, note, date-time id-ID).
- Master group: if `master.report_count > 1` → "Laporan ini tergabung dengan {n-1} laporan lain
  tentang masalah yang sama."
- AI box if `ai.used`: "Dibantu AI" with suggested category/description, observations, note
  "Saran AI telah ditinjau pelapor."
- Comments section: `GET /api/reports/{id}/comments` (paginated `{id, body, image_url,
  author_label, is_mine, created_at}`), "Muat lebih banyak"; logged in → form (body 3–1000,
  optional photo) `POST` multipart; own comment → "Hapus" (`DELETE /api/comments/{id}`);
  logged out → "Masuk untuk menambahkan informasi" link.
- "Lihat di peta" link → `/peta`.
- `/laporan-saya` (`MyReportsPage`): `GET /api/reports/mine?page=` cards (thumbnail, code,
  category, StatusBadge, regency, date) → detail; "Muat lebih banyak"; empty state with CTA
  "Buat Laporan".

## Touch
- `frontend/src/pages/{ReportDetailPage,MyReportsPage}.tsx`, `frontend/src/features/report-detail/**` (new)

## Do not touch
- `frontend/src/lib/**`, `frontend/src/features/auth/`, `backend/`

## Decisions
- Reporter identity is never shown on this page. Text in Bahasa Indonesia.
