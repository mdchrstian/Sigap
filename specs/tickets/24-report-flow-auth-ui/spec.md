# 24 Report Flow + Auth UI
ui: yes

## Goal
The report wizard (`/lapor`) and the login/register/profile pages use the "Rambu & Marka"
design system, are comfortable for every age on a phone, and `/lapor` accepts a photo sent
from the landing page.

## Requirements
- READ `DESIGN.md` + `PRODUCT.md` at the repo root. Use only tokens + `components/ui`
  (Button, Field/Input/Select/Textarea, Panel, SignPlate, StatusBadge, EmptyState, Dialog).
  Mode = Operate: standard layouts, no decoration.
- Remove all `[#...]` hex classes and inline class strings for inputs/buttons in the Touch files;
  replace them with the components.
- `/lapor` (`CreateReportPage` + `features/create-report/*`):
  - Title: `SignPlate tone=rambu level=1` "Buat Laporan" (no arrow).
  - `StepNav`: a horizontal stepper with 4 steps (Foto, Lokasi, Cek draf, Kirim): a dashed
    marka line between the dots (same style as MarkaRoute, horizontal), done = rambu + check,
    current = marka + ink ring + `aria-current="step"`, labels always visible (text-xs at
    390px). Back/Next buttons: Button secondary/primary size lg, at the bottom of each step,
    full-width on mobile.
  - PhotoStep: a large drop/upload area (Panel, dashed line-strong border, `Camera` icon,
    copy "Ambil atau pilih foto kerusakan") with a preview + "Ganti foto" button.
  - **Contract with 23**: when `useLocation().state?.photo` is a `File`, PhotoStep starts with
    that photo already selected (as if the user had just picked it) and does NOT auto-advance;
    then clear the state with `navigate(".", { replace: true, state: null })`.
  - LocationStep / `components/LocationPicker.tsx`: search input = Input, "Gunakan lokasi
    saya" button = Button secondary icon `LocateFixed`, map h-80 rounded-xl with a line border.
  - ReviewStep: the AI suggestion in a Panel labelled "Draf AI" (rambu-soft badge) with a
    category Select + description Textarea that can be edited; loading = Button loading /
    the text "AI sedang membaca foto..."; when AI fails (503 fallback manual): a marka-soft
    notice "AI sedang tidak tersedia. Silakan isi kategori dan deskripsi sendiri." + an empty form.
  - DuplicateStep: a list of similar reports as compact items (p-4, line border) with
    StatusBadge; actions "Gabungkan ke laporan ini" / "Tetap kirim laporan baru".
  - SubmitStep: success = SignPlate level 2 "Laporan terkirim", the report code in Overpass Mono,
    Button "Lihat laporan" + Button secondary "Buat laporan lain".
- `/masuk`, `/daftar`: a centred Panel max-w-md, h1 Overpass (not a SignPlate), Fields with
  visible labels, server errors in a danger-soft box `role="alert"`, Button primary lg
  full-width, link to the other page underneath. Show/hide toggle on password (Button quiet
  icon `Eye`/`EyeOff`, with `aria-label`).
- `/profil`: Panel with email, role label, a "Nama lengkap" Field + Save button (Toast "Profil
  disimpan"), Button danger secondary "Keluar".
- All text and behaviour stays the same except the copy above; adjust the tests that break
  because of new structure/copy, and add a test for the `state.photo` contract.

## Touch
- `frontend/src/pages/{CreateReportPage,LoginPage,RegisterPage,ProfilePage}.tsx`
- `frontend/src/features/create-report/**` (incl. create-report.test.tsx)
- `frontend/src/components/LocationPicker.tsx`
- `frontend/src/features/auth/auth.test.tsx` (only for adjustments)

## Do not touch
- `frontend/src/components/ui/**`, `components/layout/**`, `index.css` (ticket 22)
- `frontend/src/features/auth/{AuthContext,RequireAuth,RequireRole,errors}.ts(x)`: auth logic stays the same
- `features/create-report/api.ts` form fields (backend contract)
- `HomePage`, other features (tickets 23, 25, 26)

## Decisions
- Direction "Rambu & Marka"; address users as "Anda"; body text 18px, targets ≥48px.
- SignPlate only for the title of `/lapor` and the success screen; auth pages use a plain h1.
- Interface with 23: router state `{ photo: File }` on `/lapor`.
