# 20 Demo seed data & README
ui: no

## Goal
One command fills the database with clearly labeled test data for the Bali DigiFest demo,
and the README explains setup, Supabase config, and the demo scenario.

## Requirements
- `python manage.py seed_demo [--reset]` in `dashboard/management/commands/seed_demo.py`:
  - Users (password = env `DEMO_PASSWORD`, default `SigapDemo2026!`): warga1@sigap.test,
    warga2@sigap.test (public), petugas@sigap.test (officer), admin@sigap.test (admin, staff).
  - 30 reports across all 9 regencies and 6 categories with plausible Bali coordinates
    (inside `is_in_bali`). Every description starts with "[DATA UJI]". Images generated with
    Pillow (colored 800×600 JPEG with text "DATA UJI"). Set regency directly (no geocoding).
  - Use `reports.services.create_report` (with `reverse_geocode` patched to no-op) and
    `tracking.services.change_status` by the officer to spread statuses (all 6 present).
  - One Master Report with 3 linked reports (via `duplicates.services.link_report`), comments
    on 5 reports, embeddings via `store_embedding` (fake provider works).
  - `--reset` deletes only `@sigap.test` users and their data. Idempotent without `--reset`
    (skips if demo users exist). Prints the accounts at the end.
- Root `README.md` (Bahasa Indonesia): what Sigap is; stack; architecture (modular monolith,
  app list); prerequisites (uv, Node, Docker); Supabase setup (enable `postgis` and `vector`
  extensions, create public bucket, S3 access keys, `DATABASE_URL` with `sslmode=require`);
  env vars table (from `backend/.env.example`); commands (test DB, migrate, seed_demo,
  runserver, frontend dev, tests); demo scenario (12 steps of the MVP flow); Responsible AI
  ("AI membantu. Warga mengonfirmasi. Petugas memverifikasi."); known limits & open decisions
  (deployment, duplicate thresholds need labeled data, no face/plate blurring).

## Touch
- `backend/dashboard/management/**` (new), `backend/dashboard/tests/test_seed.py`, `README.md`

## Do not touch
- all other backend apps' code (call their services only), `frontend/`

## Decisions
- Demo data is always labeled "[DATA UJI]" and uses `@sigap.test` emails.
