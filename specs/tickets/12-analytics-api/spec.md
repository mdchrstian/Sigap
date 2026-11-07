# 12 Basic analytics API
ui: no

## Goal
Aggregate statistics computed by the database from stored reports, for the public home
page and the officer dashboard.

## Requirements
- `dashboard/services.py` `compute_summary(date_from=None, date_to=None, regency=None) -> dict`
  (ORM aggregates only; excludes hidden reports; dates filter `created_at` inclusive, Asia/Makassar):
  `{total, by_status:[{status,label,count}] (all 6, zero-filled), by_category:[{slug,name,count}]
  (all active, zero-filled), by_regency:[{regency,count}] (desc, "" shown as "Tidak diketahui"),
  by_week:[{week_start:"YYYY-MM-DD", count}] (TruncWeek, ascending), stale_count,
  period:{from,to}, limited_data: total < 20}`.
  `stale_count` = reports in submitted/under_review/verified/in_progress with updated_at older
  than 14 days.
- `GET /api/analytics/summary?from=YYYY-MM-DD&to=YYYY-MM-DD&regency=` (no auth) → the dict.
  Bad dates or from>to → 400.
- `GET /api/analytics/stale?page=` (IsOfficer) → paginated stale reports `{id, code, category,
  status, status_label, regency, updated_at, days_since_update}` oldest update first.
- Cache summary 60 s per parameter set.

## Touch
- `backend/dashboard/**`

## Do not touch
- other apps (read-only use of `reports.models`)

## Decisions
- Numbers come only from the DB. When `limited_data` is true the UI warns
  "Data masih terbatas, statistik belum representatif."
- Public sees aggregates only; the stale list is officer-only.
