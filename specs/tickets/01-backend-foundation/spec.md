# 01 Backend foundation
ui: no

## Goal
A runnable Django + DRF project for Sigap in `backend/`, with a custom User model, env-based
config (Supabase Postgres in dev, local Docker Postgres for tests), PostGIS + pgvector enabled,
switchable storage, and a fake AI mode. Every later backend ticket builds on this.

## Requirements
- Python 3.12 via uv: `backend/pyproject.toml` (+ `uv.lock`), deps: django>=5.2,<6,
  djangorestframework, djangorestframework-simplejwt, django-environ, django-cors-headers,
  django-storages[s3], boto3, psycopg[binary], pgvector, Pillow, openai, requests;
  dev: pytest, pytest-django. `.python-version` = 3.12.
- `config/settings.py` reads `backend/.env` via django-environ. Vars: SECRET_KEY, DEBUG,
  ALLOWED_HOSTS, DATABASE_URL, CORS_ALLOWED_ORIGINS (default http://localhost:5173),
  STORAGE_BACKEND (`local`|`supabase`), SUPABASE_S3_ENDPOINT, SUPABASE_S3_REGION,
  SUPABASE_S3_ACCESS_KEY, SUPABASE_S3_SECRET_KEY, SUPABASE_BUCKET, AI_PROVIDER (`fake`|`openai`,
  default `fake`), OPENAI_API_KEY, OPENAI_VISION_MODEL (default gpt-4o-mini),
  OPENAI_TEXT_MODEL (default gpt-4o-mini), OPENAI_EMBEDDING_MODEL (default text-embedding-3-small).
- `local` storage = FileSystemStorage at `backend/media/`, served at `/media/` when DEBUG.
  `supabase` = S3Boto3Storage (endpoint/region/keys/bucket above, `querystring_auth=False`).
- `LANGUAGE_CODE="id"`, `TIME_ZONE="Asia/Makassar"`, USE_TZ=True.
- DRF defaults: JWTAuthentication, `IsAuthenticatedOrReadOnly`, PageNumberPagination size 20,
  no trailing slash on routes (`/api/health`).
- Apps created (empty `models.py`, `urls.py` mounted under `/api/`): accounts, reports,
  ai_services, duplicates, locations, tracking, dashboard, community, notifications.
- `accounts.User` (AbstractBaseUser + PermissionsMixin): email (unique, USERNAME_FIELD),
  full_name, role choices `public`|`officer`|`admin` (default public), is_active, is_staff,
  date_joined; custom manager with `create_user` / `create_superuser` (superuser → role admin).
  `AUTH_USER_MODEL="accounts.User"`.
- Migration `accounts/migrations/0001_extensions.py` runs before User: `CREATE EXTENSION IF NOT
  EXISTS postgis;` and `CREATE EXTENSION IF NOT EXISTS vector;`.
- `GET /api/health` → `{"status":"ok"}`, no auth.
- `docker-compose.test.yml` (repo root) + `docker/db/Dockerfile`: FROM postgis/postgis:16-3.4,
  apt install postgresql-16-pgvector; user/pass/db `sigap`, host port 54329, healthcheck.
- `backend/conftest.py`: forces AI_PROVIDER=fake and local storage (tmp MEDIA_ROOT); fixtures
  `api_client`, `make_user(role="public", **kw)`, `auth_client(user)` (JWT bearer).
- `backend/.env.example` with every var above (dummy values) and the local DB URL
  `postgres://sigap:sigap@localhost:54329/sigap`. Root `.gitignore` adds `.env`, `.venv/`,
  `backend/media/`, `__pycache__/`, `node_modules/`, `dist/` (keep existing lines).

## Touch
- `backend/**` (new), `docker-compose.test.yml`, `docker/db/Dockerfile`, `.gitignore`

## Do not touch
- `.claude/`, `SUPER-AGENT.md`, `super-agent/`, `specs/`

## Decisions
- Product name is **Sigap** (not InfraBali AI) in all code, titles, and docs.
- Dev DB = Supabase hosted Postgres (DATABASE_URL with `?sslmode=require`); tests use local Docker.
- Auth = Django + SimpleJWT (not Supabase Auth). Images = Supabase Storage (S3 API).
- No GeoDjango (GDAL is not installed). Location = float lat/lng + a PostGIS generated
  geography column queried with raw SQL (added in ticket 05).
- Admin features (users, roles, categories, moderation) use Django admin, not React.
- `AI_PROVIDER=fake` must work with no OpenAI key (tests, demo without key).
