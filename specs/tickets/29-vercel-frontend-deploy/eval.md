# Eval 29

## How to verify
- Unit: `cd frontend && npm test -- api`
- Build: `cd frontend && npm run build && npm run lint`
- UI: `cd frontend && npx vite preview --port 4173` (after build)

## Checks
| # | Check | Type | Expected |
|---|-------|------|----------|
| 1 | api tests incl. trailing slash | unit | pass; `https://x/` + `/api/health` -> `https://x/api/health` |
| 2 | `npm run build` and `npm run lint` | unit | exit 0, `dist/index.html` exists |
| 3 | `frontend/vercel.json` is valid JSON with rewrite to `/index.html`, outputDirectory `dist` | unit | `node -e "JSON.parse(require('fs').readFileSync('frontend/vercel.json'))"` exit 0 |
| 4 | Full frontend suite `cd frontend && npm test` | unit | all pass |
| 5 | Preview: open `/` | ui | home page renders |

## Edge cases
- `VITE_API_URL` unset -> same-origin `/api/...` as before

## Done means
All checks PASS, no file outside "Touch" changed, work committed on the ticket branch.
