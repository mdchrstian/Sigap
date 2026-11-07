# 13 AI Report Intelligence API
ui: no

## Goal
Officers can request a short AI-written summary of report patterns, generated strictly from
statistics the database already computed.

## Requirements
- `POST /api/analytics/insights` (IsOfficer) `{from?, to?, regency?}`:
  1. `stats = dashboard.services.compute_summary(...)`; also previous equal-length period
     totals for change comparison (computed in DB, passed in payload).
  2. `ai_services.client.generate_json(system, payload=stats, schema)` with schema
     `{summary: string (≤600 chars), highlights: string[] (≤5)}`.
  3. Response 200 `{summary, highlights, generated_at, based_on: stats}`.
- System prompt (Indonesian): use only numbers present in the payload; do not invent trends,
  causes, or priorities; if `limited_data` is true say the data is still limited; no
  recommendations about repair priority.
- Post-check: every number (regex `\d+`) in summary/highlights must appear in the JSON-dumped
  payload; otherwise drop that highlight / replace summary with
  "Ringkasan AI tidak dapat diverifikasi terhadap data." and set `verified:false`
  (`verified:true` otherwise).
- Cache 1 h per params. Throttle scope `ai_insights` 20/hour per user.
- AIUnavailable → 503 `{"detail":"Ringkasan AI tidak tersedia saat ini."}`.

## Touch
- `backend/dashboard/{views.py,urls.py,insights.py}`, `backend/dashboard/tests/test_insights.py`,
  `backend/config/settings.py` (throttle rate only)

## Do not touch
- `backend/dashboard/services.py` (call `compute_summary` as is), `backend/ai_services/`

## Decisions
- AI only summarizes DB-computed numbers; officer-only to control cost.
- Called on demand (button), never automatically.
