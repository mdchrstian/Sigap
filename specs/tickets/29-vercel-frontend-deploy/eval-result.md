| # | Check | Result | Evidence (1 line) |
|---|-------|--------|-------------------|
| 1 | api tests incl. trailing slash | PASS | `CI=true npm test -- api`: 2 files, 9 tests passed; "strips trailing slash from VITE_API_URL" passes (`https://x.onrender.com/` + `/api/health` -> `https://x.onrender.com/api/health`) |
| 2 | `npm run build` and `npm run lint` | PASS | `npm run build` exit 0, `dist/index.html` present (390 B); `npm run lint` (tsc --noEmit) exit 0 |
| 3 | `frontend/vercel.json` valid JSON, rewrite to `/index.html`, outputDirectory `dist` | PASS | `node -e JSON.parse(...)` exit 0; outputDirectory `dist`, rewrites `[{"source":"/(.*)","destination":"/index.html"}]` |
| 4 | Full frontend suite `npm test` | PASS | `CI=true npm test`: 14 files, 65 tests passed, exit 0 |
| 5 | Preview: open `/` | PASS | `vite preview --port 4173`; agent-browser opened `http://localhost:4173/`, title "Sigap", h1 "Laporkan kerusakan fasilitas publik di Bali" rendered; `/reports/5` returns HTTP 200 |

Edge case (`VITE_API_URL` unset): PASS by code reading. `frontend/src/lib/api.ts:20` falls back to `""`, so requests go to same-origin `/api/...`.

Scope: ticket commit `ddc62b9` changes exactly the six Touch files (`frontend/.env.example`, `.nvmrc`, `package.json`, `src/lib/api.test.ts`, `src/lib/api.ts`, `vercel.json`). Worktree clean; work committed on `ticket/29-vercel-frontend-deploy`.
