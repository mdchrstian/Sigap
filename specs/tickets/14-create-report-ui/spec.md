# 14 Create Report UI (AI-assisted flow)
ui: yes

## Goal
A logged-in user creates a report in guided steps: photo → location → AI draft → review →
similar reports → submit, and can always finish manually if AI fails.

## Requirements
- Page `/lapor` (`CreateReportPage`), stepper "Foto, Lokasi, Tinjau, Laporan Serupa, Kirim".
- Step Foto: 1–3 images (jpg/png/webp ≤8 MB), client-side downscale to ≤1600 px JPEG via canvas,
  previews with remove. Hint: "Hindari memotret wajah atau pelat nomor kendaraan."
- Step Lokasi: `src/components/LocationPicker.tsx` (props `value`, `onChange({lat,lng})`):
  Leaflet map centered Bali (-8.4095, 115.1889) zoom 10, click or drag marker, "Gunakan lokasi
  saya" (navigator.geolocation), search box → `GET /api/locations/search?q=` → result list → fly to.
  After pick: `GET /api/locations/reverse?lat=&lng=` → show address; `in_bali:false` blocks Next
  with "Lokasi harus berada di Provinsi Bali." Tiles from `VITE_TILE_URL` or OSM default + attribution.
- Step Tinjau: on entry call `POST /api/ai/analyze-photo` (form `image` = first photo) once.
  Loading text "AI sedang menganalisis foto…". Success → prefill category (by slug from
  `GET /api/categories`) and description, show observations, badge "Saran AI · Perlu ditinjau".
  `is_infrastructure:false` → warning, fields empty. 503/any error → notice "Analisis AI tidak
  tersedia. Silakan isi laporan secara manual." and empty form. Plus "Isi manual" skip link.
  Fields: category select (required), description textarea (10–2000, counter).
- Step Laporan Serupa: `POST /api/duplicates/check {latitude, longitude, category_id, description}`.
  `low` → auto-skip to Kirim. `high` → best candidate preselected ("Kemungkinan besar sama dengan
  {code}") with option "Bukan masalah yang sama". `medium` → radio list of candidates (thumbnail,
  code, category, distance_m m, status badge) + "Tidak ada yang sama" (default). Error → skip.
- Step Kirim: summary, button "Kirim Laporan" → `POST /api/reports` multipart: images, category_id,
  description, latitude, longitude, address, ai_used, ai_suggested_category_id,
  ai_suggested_description, ai_observations (JSON string), link_to_report_id? → navigate
  `/laporan/{id}`. Show 400 field errors on the relevant step.
- State survives step back/forward; leaving the page with data asks confirmation.

## Touch
- `frontend/src/pages/CreateReportPage.tsx`, `frontend/src/features/create-report/**` (new),
  `frontend/src/components/LocationPicker.tsx` (new), `frontend/src/lib/image.ts` (new)

## Do not touch
- `frontend/src/lib/api.ts`, `frontend/src/features/auth/`, `backend/`

## Decisions
- AI is a suggestion: user must actively confirm category and description. No confidence score.
- Duplicate `high` is preselected, never silently merged. Text in Bahasa Indonesia.
- Larger than usual (~500 lines) because the flow is one unit; keep step components small.
