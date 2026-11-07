# 06 Locations API
ui: no

## Goal
Backend helpers and endpoints for address search, reverse geocoding, and the Bali boundary
check, backed by OSM Nominatim and following its usage policy.

## Requirements
- `locations/services.py`:
  - `BALI_BBOX = (lat_min -8.95, lat_max -8.04, lng_min 114.40, lng_max 115.72)`.
  - `is_in_bali(lat, lng) -> bool` (inclusive bbox check).
  - `reverse_geocode(lat, lng) -> {"address": str, "regency": str}`. Regency normalized to one
    of: Badung, Bangli, Buleleng, Denpasar, Gianyar, Jembrana, Karangasem, Klungkung, Tabanan
    (match Nominatim `address.county`/`city`/`state_district` case-insensitive substring), else "".
  - `search(q) -> [{"label", "latitude", "longitude"}]` max 5, `countrycodes=id`,
    `viewbox=114.40,-8.04,115.72,-8.95&bounded=1`, `accept-language=id`.
  - HTTP via `requests` with timeout 5 s, header `User-Agent` from env `NOMINATIM_USER_AGENT`
    (default `Sigap/0.1 (Bali DigiFest 2026 demo)`), base URL env `NOMINATIM_URL`
    (default `https://nominatim.openstreetmap.org`).
  - Cache results 24 h in Django cache (key by rounded lat/lng 5 dp or lowercased q).
  - Global rate limit: at most 1 upstream request/second (cache-based timestamp; sleep the
    remainder). Raise `GeocodingError` on HTTP/timeout errors.
- Endpoints (no auth, DRF throttle scope `geocode` 30/min):
  - `GET /api/locations/search?q=` (q 3–100 chars, else 400) → list above. Upstream error → 503.
  - `GET /api/locations/reverse?lat=&lng=` → `{address, regency, in_bali}`; outside Bali still 200
    with `in_bali:false` and no upstream call.
- Add `NOMINATIM_URL`, `NOMINATIM_USER_AGENT` to settings and `backend/.env.example`.

## Touch
- `backend/locations/**`, `backend/config/settings.py` (2 env vars, throttle rate),
  `backend/.env.example`

## Do not touch
- `backend/reports/`, `backend/accounts/`

## Decisions
- Geocoder = public Nominatim for MVP; never send the user's email or identity upstream.
- Tests must mock `requests` (no network).
