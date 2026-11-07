# Eval 04

## How to verify
- Unit: `cd frontend && npx vitest run src/features/auth`
- UI: DB `docker compose -f docker-compose.test.yml up -d --wait`; backend
  `cd backend && uv run python manage.py migrate && uv run python manage.py runserver 8000`;
  frontend `cd frontend && npm run dev`

## Checks
| # | Check | Type | Expected |
|---|-------|------|----------|
| 1 | RequireAuth with no user | unit | redirects to /masuk?next=... |
| 2 | RequireRole roles=[officer] with public user | unit | "Akses ditolak" |
| 3 | LoginPage shows API 401 detail | unit | message visible |
| 4 | register new account at /daftar | ui | lands on /, nav shows user name |
| 5 | logout then open /laporan-saya | ui | redirected to /masuk |
| 6 | login → returns to /laporan-saya | ui | correct page |
| 7 | /profil edit name → save | ui | new name in nav |
| 8 | public user nav | ui | no "Dashboard Petugas" link |
| 9 | `npm run lint` | unit | exit 0 |

## Edge cases
- Expired/invalid stored tokens on load -> treated as logged out, no crash

## Done means
All checks PASS, no file outside "Touch" changed, work committed on the ticket branch.
