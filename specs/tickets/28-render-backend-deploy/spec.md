# 28 Render Backend Deploy Config
ui: no

## Goal
The Django backend can be deployed to Render (free plan, native Python runtime) from
GitHub using a committed `render.yaml`, with DB on Supabase and photos in Supabase Storage.

## Requirements
- Deps: add `gunicorn` and `whitenoise` via `uv add` (updates `pyproject.toml` + `uv.lock`).
- `backend/config/settings.py`:
  - WhiteNoise middleware right after `SecurityMiddleware`; `STORAGES["staticfiles"]`
    = `whitenoise.storage.CompressedManifestStaticFilesStorage` when not DEBUG.
    Keep the existing `default` storage logic.
  - `SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")` (always on).
  - `CSRF_TRUSTED_ORIGINS` = env list, default `[]`.
  - When not DEBUG: `SESSION_COOKIE_SECURE = CSRF_COOKIE_SECURE = True`.
  - `ALLOWED_HOSTS`: also append `RENDER_EXTERNAL_HOSTNAME` if that env var is set.
  - Supabase storage (`STORAGE_BACKEND=supabase`): add env `SUPABASE_PUBLIC_URL`
    (str, default ""). If set, `AWS_S3_CUSTOM_DOMAIN` = that value with `https://`
    stripped, and `AWS_QUERYSTRING_AUTH = False`, so image URLs are public
    `https://<ref>.supabase.co/storage/v1/object/public/<bucket>/<key>` links.
    If empty, keep current behavior.
  - Also accept `STORAGE_BACKEND=s3` as an alias of `supabase` (README uses `s3`).
- `render.yaml` at repo root (Blueprint), one web service:
  - `runtime: python`, `rootDir: backend`, `plan: free`, `healthCheckPath: /api/health`
  - env `PYTHON_VERSION=3.12.8`
  - `buildCommand`: `pip install uv && uv sync --frozen && uv run python manage.py collectstatic --noinput`
  - `startCommand`: `uv run python manage.py migrate --noinput && uv run gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --timeout 60`
    (migrate in start command: free plan has no pre-deploy command)
  - envVars: `SECRET_KEY` generateValue; `DEBUG=false`; `AI_PROVIDER=nusarouter`;
    `STORAGE_BACKEND=supabase`; `sync: false` for `DATABASE_URL`, `ALLOWED_HOSTS`,
    `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS`, all `SUPABASE_*` incl.
    `SUPABASE_PUBLIC_URL`, `NUSAROUTER_API_KEY`, `NUSAROUTER_BASE_URL`,
    `NUSAROUTER_VISION_MODEL`, `NUSAROUTER_TEXT_MODEL`.
- `backend/.env.example`: add `CSRF_TRUSTED_ORIGINS=` and `SUPABASE_PUBLIC_URL=` with a
  one-line comment each.
- Tests `backend/tests/test_deploy_settings.py`: settings flags above (use
  `override_settings`/reload with env where needed), whitenoise in MIDDLEWARE,
  `render.yaml` parses (PyYAML only if already installed; else simple text asserts).

## Touch
- `backend/pyproject.toml`, `backend/uv.lock`  add gunicorn, whitenoise
- `backend/config/settings.py`  production settings above
- `backend/.env.example`  2 new vars
- `render.yaml`  new
- `backend/tests/test_deploy_settings.py`  new

## Do not touch
- `backend/*/migrations/`  no schema change
- `backend/ai_services/`  NusaRouter code is ticket 21
- `frontend/`  ticket 29
- `README.md`, `docs/`  ticket 30

## Decisions
- Backend host -> Render, free plan, native Python runtime (not Docker).
- DB -> Supabase Postgres (`DATABASE_URL`, Session pooler 5432, `sslmode=require`).
- Photos -> Supabase Storage, public bucket, public URLs (no signed URLs).
- AI in production -> `nusarouter` (works once ticket 21 is merged).
- Migrations run at start of each deploy.
