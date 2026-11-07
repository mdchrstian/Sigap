# Eval 01

## How to verify
- DB: `docker compose -f docker-compose.test.yml up -d --wait`
- Unit: `cd backend && uv sync && uv run pytest -q`

## Checks
| # | Check | Type | Expected |
|---|-------|------|----------|
| 1 | `uv run python manage.py check` | unit | no errors |
| 2 | `uv run python manage.py makemigrations --check --dry-run` | unit | "No changes detected" |
| 3 | test: GET /api/health | unit | 200 `{"status":"ok"}` |
| 4 | test: `User.objects.create_user(email, pw)` | unit | role=public, password hashed |
| 5 | test: `create_superuser` | unit | role=admin, is_staff, is_superuser |
| 6 | test: `SELECT extname FROM pg_extension` | unit | includes postgis and vector |
| 7 | test: `auth_client(make_user())` hits /api/health with bearer | unit | 200 |
| 8 | `git grep -n "sk-" -- backend` | unit | no real keys |

## Edge cases
- Duplicate email on create_user -> IntegrityError
- AI_PROVIDER unset -> settings value is "fake"

## Done means
All checks PASS, no file outside "Touch" changed, work committed on the ticket branch.
