# 29 Vercel Frontend Deploy Config
ui: yes

## Goal
The Vite frontend deploys to Vercel from GitHub, deep links (e.g. `/reports/5`) work on
refresh, and it talks to the Render backend via `VITE_API_URL`.

## Requirements
- `frontend/vercel.json`: framework `vite`, buildCommand `npm run build`,
  outputDirectory `dist`, rewrite `{"source": "/(.*)", "destination": "/index.html"}`
  (static files in `dist` are still served first by Vercel).
- `frontend/.nvmrc` with `20` and `"engines": {"node": ">=20"}` in `package.json`.
- `frontend/.env.example`: `VITE_API_URL=` with comment
  `# Production: https://<service>.onrender.com (no trailing slash). Empty = same origin /api.`
  and `VITE_TILE_URL=` with a comment that empty uses the default tiles.
- `frontend/src/lib/api.ts`: strip a trailing `/` from `VITE_API_URL` so
  `https://x.onrender.com/` and `https://x.onrender.com` both work. No other change.
- Unit test for the trailing-slash handling (next to existing api tests, vitest).

## Touch
- `frontend/vercel.json`  new
- `frontend/.nvmrc`  new
- `frontend/.env.example`  new
- `frontend/package.json`  engines only
- `frontend/src/lib/api.ts`  trailing slash
- `frontend/src/lib/api.test.ts` (or existing api test file)  new test

## Do not touch
- `backend/`, `render.yaml`  ticket 28
- `README.md`, `docs/`  ticket 30
- Any page/component  design tickets 22-26 are editing them

## Decisions
- Frontend host -> Vercel, project Root Directory = `frontend`.
- API base -> `VITE_API_URL` set in Vercel env to the Render URL.
