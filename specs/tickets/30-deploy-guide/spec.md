# 30 Deploy Guide (Supabase + Render + Vercel)
ui: no

## Goal
A beginner can follow one Indonesian guide, step by step, to put Sigap online:
database + photos on Supabase, backend on Render, frontend on Vercel.

## Requirements
- New `docs/DEPLOY.md` in Indonesian, numbered steps, short sentences, each step says
  where to click and what value to copy. Sections:
  1. Push repo ke GitHub (repo has no remote yet): create repo, `git remote add`, `git push`.
  2. Supabase: get connection string (Connect -> Session pooler, port 5432, add
     `?sslmode=require`); create public bucket `report-images`; create S3 access keys
     (Storage -> Settings -> S3 Connection); note endpoint, region, public URL
     `https://<ref>.supabase.co/storage/v1/object/public/report-images`.
  3. Migrasi pertama dari laptop: `backend/scripts/setup_env.sh --database-url '<url>' --seed`
     (ticket 27). Mention extensions postgis + vector are created by migrations.
  4. Render: New -> Blueprint -> pick repo (uses `render.yaml`); fill every `sync:false`
     var (table: name, where to get value, example). Note free plan sleeps after
     inactivity; first request can take ~1 minute.
  5. Vercel: Import repo, Root Directory `frontend`, env `VITE_API_URL` = Render URL.
  6. Back in Render: set `CORS_ALLOWED_ORIGINS` and `CSRF_TRUSTED_ORIGINS` to the Vercel
     URL, `ALLOWED_HOSTS` to the Render hostname; redeploy.
  7. Cek: open `<render>/api/health`, open Vercel URL, log in with demo account
     (password = `DEMO_PASSWORD`), upload a photo report.
  8. Troubleshooting table: CORS error, 400 Bad Request (ALLOWED_HOSTS), DB connection
     error (wrong pooler/port, sslmode), images not loading (bucket not public /
     SUPABASE_PUBLIC_URL), AI 503 (NUSAROUTER_* empty or ticket 21 not merged).
- Never put real secrets in the doc; use placeholders like `<password>`.
- `README.md`: add a "Deploy" link to `docs/DEPLOY.md`; fix the storage text that says
  `STORAGE_BACKEND=s3` to `supabase` (code accepts both after ticket 28).

## Touch
- `docs/DEPLOY.md`  new
- `README.md`  deploy link + storage fix

## Do not touch
- All code and config files  tickets 27-29 own them

## Decisions
- Hosts -> Supabase (DB + Storage), Render free (backend), Vercel (frontend).
- AI -> NusaRouter; guide notes it requires ticket 21.
- Guide language -> Indonesian, for a non-technical reader.
