# Eval 28

## How to verify
- DB: `docker compose -f docker-compose.test.yml up -d --wait`
- Unit: `cd backend && uv run pytest -q tests/test_deploy_settings.py`
- Full: `cd backend && uv run pytest -q`

## Checks
| # | Check | Type | Expected |
|---|-------|------|----------|
| 1 | `cd backend && uv sync --frozen` | unit | exit 0, gunicorn + whitenoise installed |
| 2 | `DEBUG=false SECRET_KEY=x uv run python manage.py collectstatic --noinput` | unit | exit 0, files in STATIC_ROOT |
| 3 | `DEBUG=false SECRET_KEY=x uv run python manage.py check --deploy` | unit | no errors (warnings allowed except SECURE_PROXY/CSRF ones) |
| 4 | Start gunicorn locally on port 8765 with DEBUG=false, `curl -s localhost:8765/api/health` | unit | `{"status":"ok"}` |
| 5 | Same server, `curl -sI localhost:8765/static/admin/css/base.css` | unit | 200 |
| 6 | `RENDER_EXTERNAL_HOSTNAME=sigap.onrender.com` | unit | host in ALLOWED_HOSTS |
| 7 | `STORAGE_BACKEND=supabase SUPABASE_PUBLIC_URL=https://x.supabase.co/storage/v1/object/public/b` | unit | default storage S3Storage, custom domain without `https://`, querystring auth off |
| 8 | `STORAGE_BACKEND=s3` | unit | same storage as `supabase` |
| 9 | `render.yaml` | unit | contains rootDir backend, healthCheckPath /api/health, startCommand with migrate + gunicorn, DATABASE_URL sync:false |
| 10 | Full backend suite | unit | all pass |

## Edge cases
- `STORAGE_BACKEND` unset -> local FileSystemStorage as before
- `CSRF_TRUSTED_ORIGINS` unset -> `[]`, no crash

## Done means
All checks PASS, no file outside "Touch" changed, work committed on the ticket branch.
