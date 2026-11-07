# 08 Duplicate Detection API
ui: no

## Goal
Before submitting, the system finds nearby similar reports and returns a decision level;
on submit, a report can be linked to an existing report's Master Report. Originals stay intact.

## Requirements
- `duplicates/models.py` `ReportEmbedding`: report OneToOne (related `embedding`),
  vector `VectorField(dimensions=1536)` (pgvector.django), model, created_at; HNSW index
  `vector_cosine_ops`.
- Settings (env-overridable): DUP_RADIUS_M=100, DUP_WINDOW_DAYS=90, DUP_HIGH_SIM=0.88,
  DUP_HIGH_MAX_DIST_M=50, DUP_MEDIUM_SIM=0.75, DUP_MAX_CANDIDATES=5.
- `duplicates/services.py`:
  - `find_candidates(lat, lng, category_id, description) -> {decision, candidates}`:
    1. `reports.geo.nearby(lat, lng, DUP_RADIUS_M)`; keep reports not hidden, not rejected,
       created within DUP_WINDOW_DAYS.
    2. `embed_text(description)`; cosine similarity vs each candidate's embedding
       (candidates without embedding get similarity null).
    3. Decision on best candidate: `high` if sim ≥ HIGH_SIM and same category and distance ≤
       HIGH_MAX_DIST_M; `medium` if sim ≥ MEDIUM_SIM, or (sim null, same category, ≤50 m);
       else `low`. No candidates → `low`.
    4. If embedding fails (AIUnavailable): distance-only rule above, never `high`.
  - `link_report(new_report, target_report)`: target.master or new MasterReport; set both.
  - `store_embedding(report)`: embed `category.name + ". " + description`; failure is logged, not raised.
- `POST /api/duplicates/check` (auth) `{latitude, longitude, category_id, description}` →
  `{decision:"high"|"medium"|"low", candidates:[{report_id, code, category_name,
  description (≤200), distance_m (int), similarity (2 dp|null), status, status_label,
  thumbnail_url, master_id, created_at}]}` sorted by similarity desc then distance.
- Extend `POST /api/reports` (in `reports/services.py` `create_report`): optional
  `link_to_report_id`. If given, target must be visible, not rejected, and within
  2×DUP_RADIUS_M, else 400 "Laporan yang dipilih tidak valid untuk digabungkan."; then
  `link_report`. After create (both paths) call `store_embedding`.
- Detail `master.report_count` reflects linked reports (already in ticket 05 serializer).

## Touch
- `backend/duplicates/**`, `backend/reports/services.py`, `backend/reports/serializers.py`
  (accept `link_to_report_id` only), `backend/reports/tests/test_link.py`, `backend/config/settings.py`

## Do not touch
- `backend/reports/models.py`, `backend/ai_services/` (use `embed_text`, `AIUnavailable`)

## Decisions
- Thresholds are initial placeholders until labeled-data evaluation; keep them in settings.
- The system never auto-merges silently: `high` is pre-selected in the UI but the user confirms;
  `medium` requires the user to pick; `low` creates a standalone report.
- Image similarity is out of MVP scope.
