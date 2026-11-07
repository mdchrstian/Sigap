# 19 Home page & Analytics UI
ui: yes

## Goal
The public home page explains Sigap and shows aggregate stats; officers get a statistics page
with charts, stale reports, and an on-demand AI summary.

## Requirements
- Dep: `recharts`. Charts follow the palette tokens, have axis labels and accessible titles.
- HomePage `/`: hero (headline "Laporkan kerusakan fasilitas publik di Bali", subtext, CTA
  "Buat Laporan" → /lapor, secondary "Jelajahi Peta" → /peta); "Cara kerja" 3 steps:
  "AI membantu menyusun laporan", "Warga mengonfirmasi", "Petugas memverifikasi";
  public stats from `GET /api/analytics/summary` (total, completed count, by_category bar).
  `limited_data` → "Data masih terbatas, statistik belum representatif."
- `/petugas/statistik` (new route in `App.tsx`, RequireRole officer/admin):
  filters period (30/90 hari/Semua) + kabupaten/kota → summary query. KPI tiles (total,
  per status), bar by_category, line by_week, table by_regency, stale list from
  `GET /api/analytics/stale` (code, category, status, days_since_update → link
  `/petugas/laporan/{id}`).
- AI card "Ringkasan AI": button "Buat Ringkasan" → `POST /api/analytics/insights {from, to,
  regency}` → `{summary, highlights[], generated_at, verified, based_on}`. Show summary,
  bullets, time, and caption "Dibuat AI dari statistik di halaman ini. Periksa kembali sebelum
  digunakan." `verified:false` → warning style. 503 → "Ringkasan AI tidak tersedia saat ini."

## Touch
- `frontend/src/pages/HomePage.tsx`, `frontend/src/pages/OfficerStatsPage.tsx` (new),
  `frontend/src/features/analytics/**` (new), `frontend/src/App.tsx` (one route),
  `frontend/package.json`

## Do not touch
- `frontend/src/lib/**`, `frontend/src/features/officer/`, `backend/`

## Decisions
- Numbers shown come only from the API; AI summary is officer-only and on demand.
