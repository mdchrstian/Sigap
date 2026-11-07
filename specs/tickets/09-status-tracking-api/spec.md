# 09 Status tracking & officer API
ui: no

## Goal
Every status change is recorded with time and actor. Officers list reports and update
status (verify, progress, complete, reject); users see the timeline on report detail.

## Requirements
- `tracking/models.py` `ReportStatusHistory`: report FK (related `history`), from_status
  (null), to_status, note (text blank), changed_by FK User null, created_at.
- `tracking/signals.py`: on Report created → history row (from null → submitted,
  changed_by = reporter, note ""). Connect in `TrackingConfig.ready()`.
- Allowed transitions: submitted→under_review; under_review→verified; verified→in_progress;
  in_progress→completed; any of (submitted, under_review, verified, in_progress)→rejected.
  completed and rejected are final.
- `tracking/services.py` `change_status(report, to_status, note, actor) -> list[Report]`:
  validates transition; `completed` and `rejected` require note ≥10 chars; applies the same
  change to every other report in the same master whose current status allows it; writes one
  history row per changed report; updates `updated_at`. Atomic.
- Officer endpoints (permission `accounts.permissions.IsOfficer`):
  - `GET /api/officer/reports?status=&category=&regency=&q=&page=` (q matches code or
    description) → paginated `{id, code, category, description (≤140), status, status_label,
    regency, thumbnail_url, master_id, master_count, reporter_name, created_at, updated_at}`,
    newest first. Includes hidden reports with `is_hidden`.
  - `POST /api/officer/reports/{id}/status` `{status, note}` → 200 `{updated:[ids], report:<detail>}`;
    invalid transition → 400 `{"detail":"Perubahan status tidak diizinkan."}`.
- Report detail (`GET /api/reports/{id}`) gains `history: [{to_status, status_label, note,
  actor_role_label, actor_name (officer/admin viewers only), created_at}]` oldest first.
  `actor_role_label`: Pelapor | Petugas | Administrator.
- Django admin: history inline (read-only) on Report.

## Touch
- `backend/tracking/**`, `backend/reports/serializers.py` (add `history` field only),
  `backend/reports/admin.py` (inline only)

## Do not touch
- `backend/reports/models.py`, `backend/reports/services.py`, `backend/duplicates/`

## Decisions
- Status changes are human-only (officer/admin); AI never changes status.
- "Completed" needs an officer note as verification evidence.
- Status propagates across reports in one Master Report so the group stays consistent.
