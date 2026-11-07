# 05 Reports core API
ui: no

## Goal
Logged-in users can submit a report (photos, category, description, location) and read
their own reports; anyone can read a report's public detail. Admins moderate in Django admin.

## Requirements
- Models in `reports/models.py`:
  - `Category`: slug (unique), name, is_active. Data migration seeds: road "Jalan",
    street_lighting "Penerangan Jalan Umum", pedestrian "Trotoar & Pejalan Kaki",
    drainage "Drainase", public_transport "Fasilitas Transportasi Umum", sanitation "Toilet Umum".
  - `MasterReport`: created_at. Property `report_count`.
  - `Report`: reporter FK User, category FK, description (text), latitude, longitude (float),
    address (char 255, blank), regency (char 64, blank), status (choices submitted, under_review,
    verified, in_progress, completed, rejected; default submitted), master FK MasterReport
    (null, related_name reports), ai_used bool, ai_suggested_category FK Category null,
    ai_suggested_description text blank, ai_observations JSON list, is_hidden bool,
    created_at, updated_at. Property `code` = `f"SGP-{id:06d}"`. Index (latitude, longitude).
  - `ReportImage`: report FK (related images), image ImageField `reports/%Y/%m/`, created_at.
- RunSQL migration adds `geog geography(Point,4326) GENERATED ALWAYS AS
  (ST_SetSRID(ST_MakePoint(longitude, latitude),4326)::geography) STORED` + GIST index.
  Not a Django field.
- `reports/geo.py`: `nearby(lat, lng, radius_m) -> list[tuple[int, float]]` (report_id,
  distance_m) via raw SQL `ST_DWithin`/`ST_Distance` on geog, ordered by distance.
- `reports/images.py`: validate jpg/png/webp, ≤8 MB; resize longest side ≤1600 px, re-encode
  JPEG q80, **strip EXIF** (privacy).
- `reports/services.py`: `create_report(user, data, images) -> Report` in a transaction; sets
  regency/address with `locations.services.reverse_geocode` (failure → keep blank).
- Endpoints:
  - `GET /api/categories` → `[{id, slug, name}]` active only, no auth.
  - `POST /api/reports` (auth, multipart): images (1–3), category_id, description (10–2000),
    latitude, longitude (must pass `locations.services.is_in_bali`, else 400
    "Lokasi harus berada di Provinsi Bali."), address?, ai_used?, ai_suggested_category_id?,
    ai_suggested_description?, ai_observations? (JSON string list) → 201 detail.
  - `GET /api/reports/{id}` (no auth): detail. Hidden → 404 unless owner/officer/admin.
  - `GET /api/reports/mine` (auth): paginated list, newest first.
- Detail shape: `{id, code, category:{id,slug,name}, description, latitude, longitude, address,
  regency, status, status_label, images:[{id,url}], master:{id, report_count}|null,
  ai:{used, suggested_category, suggested_description, observations}, created_at, updated_at,
  is_mine}`; plus `reporter:{id, full_name, email}` only for officer/admin.
  List item: `{id, code, category, description (≤140 chars), status, status_label, thumbnail_url,
  regency, created_at}`. status_label uses the Indonesian labels (Dikirim … Ditolak).
- Django admin: Category (edit name/is_active), Report (list code, category, status, regency,
  is_hidden, created_at; filters; action "Sembunyikan"/"Tampilkan"), ReportImage inline.

## Touch
- `backend/reports/**`, `backend/config/urls.py` (mount only if needed)

## Do not touch
- `backend/accounts/`, `backend/locations/` (use `is_in_bali`, `reverse_geocode` from ticket 06)

## Decisions
- Reporter identity never appears in public responses. Photos are public URLs after EXIF strip.
- Face/plate blurring is out of MVP scope; moderation is via `is_hidden` in Django admin.
- Status history, duplicates, comments come in tickets 08/09/11: do not add them here.
