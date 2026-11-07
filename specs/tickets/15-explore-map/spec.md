# 15 Explore Map (API + UI)
ui: yes

## Goal
Anyone can browse reports on an interactive Leaflet map of Bali, filter them, search by
place or report code, and open a report's detail. Only public information is shown.

## Requirements
- Backend `GET /api/reports/map?bbox=minLng,minLat,maxLng,maxLat&category=slug,slug&status=a,b&regency=&from=&to=`
  (no auth; bbox required, each side span ≤ 2°, else 400). Filter on lat/lng range + params,
  exclude hidden, limit 1000 newest → `{type:"FeatureCollection", truncated:bool, features:[
  {type:"Feature", geometry:{type:"Point", coordinates:[lng,lat]}, properties:{id, code,
  category_slug, category_name, status, status_label, created_at, master_count}}]}`.
  No reporter data, no description.
- Frontend `/peta` (`ExploreMapPage`): full-height map, center (-8.4095, 115.1889) zoom 10,
  `preferCanvas`, circle markers colored by status (`src/lib/status.ts`). Fetch on load and on
  `moveend` (debounce 400 ms) with react-query keyed by bbox+filters.
- Popup: code, category, StatusBadge, date (id-ID), "Bergabung dengan N laporan" if master_count>1,
  link "Lihat detail" → `/laporan/{id}`.
- Filter panel (side on desktop, bottom drawer on mobile): category (multi, from
  `/api/categories`), status (multi), kabupaten/kota (9 Bali regencies), periode (7/30/90 hari,
  Semua → `from`). Legend of status colors. `truncated` → note "Perbesar peta untuk melihat semua laporan."
- Search box: matches `/^SGP-\d+$/i` → `GET /api/reports/{id}` (id = number) → fly to + open
  popup; otherwise `/api/locations/search?q=` → fly to first result. Not found → message.
- Tiles: `VITE_TILE_URL` or OSM default with attribution.

## Touch
- `backend/reports/map_views.py` (new), `backend/reports/urls.py`, `backend/reports/tests/test_map.py`
- `frontend/src/pages/ExploreMapPage.tsx`, `frontend/src/features/map/**` (new)

## Do not touch
- `backend/reports/models.py`, `backend/reports/serializers.py`, `frontend/src/lib/api.ts`

## Decisions
- No marker clustering in MVP (canvas circle markers + 1000 cap).
- Map is public (no login) and shows only public fields.
