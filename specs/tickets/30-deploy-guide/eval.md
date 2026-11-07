# Eval 30

## How to verify
- Unit: shell greps below, run from repo root.

## Checks
| # | Check | Type | Expected |
|---|-------|------|----------|
| 1 | `test -f docs/DEPLOY.md` | unit | exit 0 |
| 2 | DEPLOY.md mentions `setup_env.sh`, `render.yaml`, `VITE_API_URL`, `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS`, `SUPABASE_PUBLIC_URL`, `sslmode=require`, `5432` | unit | grep finds each |
| 3 | Every env var with `sync: false` in `render.yaml` appears in DEPLOY.md | unit | none missing |
| 4 | Every command in DEPLOY.md that refers to a repo path points to an existing file | unit | paths exist |
| 5 | `grep -n "STORAGE_BACKEND=s3" README.md` | unit | no match |
| 6 | README links `docs/DEPLOY.md` | unit | grep finds it |
| 7 | No real-looking secrets (`grep -E "eyJ|sk-[A-Za-z0-9]{20}"`) | unit | no match |

## Edge cases
- Var renamed in render.yaml -> check 3 catches it

## Done means
All checks PASS, no file outside "Touch" changed, work committed on the ticket branch.
