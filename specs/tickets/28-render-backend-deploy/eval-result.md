# Eval result 28

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | `cd backend && uv sync --frozen` | PASS | exit 0 ("Checked 45 packages"); gunicorn 26.2.0, whitenoise 6.12.0 importable |
| 2 | `DEBUG=false SECRET_KEY=x manage.py collectstatic --noinput` | PASS | exit 0; `backend/staticfiles/admin/css/base.css` present, `staticfiles.json` written |
| 3 | `DEBUG=false SECRET_KEY=x manage.py check --deploy` | PASS | exit 0; 3 warnings only: security.W004 (HSTS), W008 (SSL redirect), W009 (SECRET_KEY length, dummy `x`); none about SECURE_PROXY or CSRF |
| 4 | gunicorn on 8765, DEBUG=false, `curl localhost:8765/api/health` | PASS | body `{"status": "ok"}` (JSON-equal to expected; spacing differs). Server stopped afterwards, port closed |
| 5 | `curl -sI localhost:8765/static/admin/css/base.css` | PASS | `HTTP/1.1 200 OK`, `Server: gunicorn`, `Content-Type: text/css` |
| 6 | `RENDER_EXTERNAL_HOSTNAME=sigap.onrender.com` | PASS | ALLOWED_HOSTS = `["localhost", "127.0.0.1", "sigap.onrender.com"]` |
| 7 | `STORAGE_BACKEND=supabase SUPABASE_PUBLIC_URL=https://x.supabase.co/storage/v1/object/public/b` | PASS | default backend `storages.backends.s3.S3Storage`; `AWS_S3_CUSTOM_DOMAIN = "x.supabase.co/storage/v1/object/public/b"` (no https://); `AWS_QUERYSTRING_AUTH = false` |
| 8 | `STORAGE_BACKEND=s3` | PASS | default backend `S3Storage`, same as `supabase` (with and without SUPABASE_PUBLIC_URL) |
| 9 | `render.yaml` contents | PASS | rootDir: backend; healthCheckPath: /api/health; startCommand has `migrate --noinput && uv run gunicorn`; `DATABASE_URL` with `sync: false`. Checked by test_render_yaml (PyYAML not installed, text asserts used) |
| 10 | Full backend suite `uv run pytest -q` | PASS | 131 passed in 20.85s |

Edge cases:
- `STORAGE_BACKEND` unset -> `django.core.files.storage.FileSystemStorage` PASS
- `CSRF_TRUSTED_ORIGINS` unset -> `[]`, no crash PASS

Unit file: `uv run pytest -q tests/test_deploy_settings.py` -> 10 passed.

Notes:
- DB: `docker compose -f docker-compose.test.yml up -d --wait` failed with "Bind for 0.0.0.0:54329 failed: port is already allocated" (held by container `agent-a924ff840784f4166-db-1`, healthy). Tests ran against that existing healthy Postgres at localhost:54329 (the settings default DATABASE_URL). pytest-django uses its own test DB.
- `backend/staticfiles/` is untracked and was already present at session start; collectstatic regenerated it. Not in Touch and not committed.
