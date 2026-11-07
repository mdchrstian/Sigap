# 02 Frontend foundation
ui: yes

## Goal
A Vite + React + TypeScript + Tailwind app in `frontend/` with Sigap's visual identity,
top navigation, all MVP routes as placeholders, and a typed API client with JWT refresh.

## Requirements
- Vite + React 18 + TS (strict). Deps: react-router-dom v6, @tanstack/react-query,
  tailwindcss v4 (+ @tailwindcss/vite), leaflet + react-leaflet v4 (+ @types/leaflet), lucide-react.
  Dev: vitest, @testing-library/react, @testing-library/jest-dom, jsdom.
- Scripts: `dev` (port 5173), `build`, `test` (vitest), `lint` (tsc --noEmit).
- `vite.config.ts` proxies `/api` and `/media` to `http://localhost:8000`.
- `src/index.css` @theme tokens: primary #176B5B, primary-light #E8F3EF, secondary #2D6CDF,
  bg #F8FAFC, text #172B24. Inter from Google Fonts in `index.html`. `<title>Sigap</title>`.
- `src/lib/tokens.ts`: `getTokens()`, `setTokens({access,refresh})`, `clearTokens()` in
  localStorage key `sigap.tokens` (wrap in try/catch).
- `src/lib/api.ts`: `api<T>(path, {method, body, form})`. JSON or FormData body. Adds
  `Authorization: Bearer <access>`. On 401 calls `POST /api/auth/refresh {refresh}` → `{access}`
  once, retries; if refresh fails clears tokens and throws `ApiError(401)`.
  `ApiError` has `status` and `data` (parsed JSON). Base URL `import.meta.env.VITE_API_URL ?? ""`.
- `src/lib/status.ts`: map for statuses submitted|under_review|verified|in_progress|completed|
  rejected → label (Dikirim, Ditinjau, Terverifikasi, Dalam Pengerjaan, Selesai, Ditolak) and
  color (slate, amber, #2D6CDF, orange, #176B5B, red). `StatusBadge` component in
  `src/components/StatusBadge.tsx`.
- `src/components/layout/Layout.tsx` + `TopNav.tsx`: logo "Sigap", links Beranda (/),
  Jelajahi Peta (/peta), Laporan Saya (/laporan-saya), Notifikasi (/notifikasi), Profil (/profil),
  primary CTA button "Buat Laporan" (/lapor). Mobile: hamburger menu. All text Bahasa Indonesia.
- Routes in `src/App.tsx` (placeholder page each, file per page in `src/pages/`):
  / HomePage, /peta ExploreMapPage, /lapor CreateReportPage, /laporan-saya MyReportsPage,
  /laporan/:id ReportDetailPage, /masuk LoginPage, /daftar RegisterPage, /notifikasi
  NotificationsPage, /profil ProfilePage, /petugas OfficerDashboardPage,
  /petugas/laporan/:id OfficerReportPage, * NotFoundPage ("Halaman tidak ditemukan").
- `src/test/setup.ts` registers jest-dom; vitest env jsdom.

## Touch
- `frontend/**` (new)

## Do not touch
- `backend/`, `.claude/`, `specs/`

## Decisions
- Name **Sigap**. UI language Bahasa Indonesia only (no i18n library).
- Tokens in localStorage (accepted MVP trade-off). No Redux; server state via react-query.
- Map tiles: `https://tile.openstreetmap.org/{z}/{x}/{y}.png` with OSM attribution,
  overridable by `VITE_TILE_URL` (used by later tickets).
