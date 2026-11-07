# 04 Auth UI
ui: yes

## Goal
Users can register, log in, log out, and see/edit their profile; protected routes redirect
to login; officer-only routes are hidden from public users.

## Requirements
- `src/features/auth/AuthContext.tsx`: `AuthProvider`, `useAuth()` → `{user, login(email,pw),
  register(data), logout(), refreshUser()}`. On load, if tokens exist call `GET /api/auth/me`.
- API (from ticket 03): `POST /api/auth/register {email,password,full_name}` → user;
  `POST /api/auth/login {email,password}` → `{access,refresh,user}`; `GET/PATCH /api/auth/me`.
  User: `{id,email,full_name,role:"public"|"officer"|"admin"}`. Errors: 400 field map, 401 `{detail}`.
- After register, auto-login then go to `/`.
- `src/features/auth/RequireAuth.tsx`: redirects to `/masuk?next=<path>`; after login go to `next`.
- `src/features/auth/RequireRole.tsx` (`roles` prop): others see "Akses ditolak".
- Protect: /lapor, /laporan-saya, /notifikasi, /profil (auth); /petugas/* (officer, admin).
- LoginPage / RegisterPage: labeled inputs, inline field errors from API, submit disabled
  while pending, link between the two pages.
- ProfilePage: shows email + role label (Warga, Petugas, Administrator), edit full_name, Keluar button.
- TopNav: logged out → "Masuk" + "Daftar"; logged in → user name menu with Profil/Keluar;
  "Dashboard Petugas" link only for officer/admin.

## Touch
- `frontend/src/features/auth/**` (new), `frontend/src/pages/{LoginPage,RegisterPage,ProfilePage}.tsx`
- `frontend/src/App.tsx`, `frontend/src/components/layout/TopNav.tsx`, `frontend/src/main.tsx`

## Do not touch
- `frontend/src/lib/api.ts`, `frontend/src/lib/tokens.ts` (use as is), `backend/`

## Decisions
- UI text in Bahasa Indonesia. Officer/admin accounts come from Django admin.
- Django admin is at `/admin/` (no React admin pages).
