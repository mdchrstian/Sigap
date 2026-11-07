| # | Check | Result | Evidence (1 line) |
|---|-------|--------|-------------------|
| 1 | `test -f docs/DEPLOY.md` | PASS | exit 0; docs/DEPLOY.md present (132 lines) in commit a443f32 |
| 2 | DEPLOY.md mentions setup_env.sh, render.yaml, VITE_API_URL, CORS_ALLOWED_ORIGINS, CSRF_TRUSTED_ORIGINS, SUPABASE_PUBLIC_URL, sslmode=require, 5432 | PASS | all 8 terms found (counts: 1, 1, 1, 3, 3, 2, 4, 5) |
| 3 | Every `sync: false` env var in render.yaml appears in DEPLOY.md | PASS | 14 sync:false vars checked (word match), none missing |
| 4 | Every repo path in DEPLOY.md points to an existing file | PASS | backend/scripts/setup_env.sh, backend/.env.example, render.yaml, frontend, docs/DEPLOY.md, README.md all exist |
| 5 | `grep -n "STORAGE_BACKEND=s3" README.md` has no match | PASS | grep exit 1, no match; README line 42 now `STORAGE_BACKEND=supabase` |
| 6 | README links docs/DEPLOY.md | PASS | README.md:138 `- Panduan deploy: lihat [Deploy](docs/DEPLOY.md).` |
| 7 | No real-looking secrets (`eyJ`, `sk-[A-Za-z0-9]{20}`) | PASS | grep over docs/DEPLOY.md and README.md exit 1, no match |

Note (Done means): commit a443f32 on branch ticket/30-deploy-guide changes only README.md and docs/DEPLOY.md (both in Touch). Worktree clean apart from this eval-result.md. Committed on ticket branch: yes.
