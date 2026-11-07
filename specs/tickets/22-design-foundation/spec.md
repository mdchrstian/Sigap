# 22 Design Foundation "Rambu & Marka"
ui: yes

## Goal
Every page immediately uses Sigap's new design tokens, fonts, shell (TopNav + Footer) and
shared UI components, ready to be adopted by tickets 23–26.

## Requirements
- READ `DESIGN.md` and `PRODUCT.md` at the repo root first. All values (hex, fonts, scale,
  spacing, radius, motion, bans) come from there; do not invent new values.
- Fonts: install `@fontsource/overpass` (700, 800), `@fontsource/overpass-mono` (600),
  `@fontsource/atkinson-hyperlegible-next` (400, 600, 700). Import them in `src/main.tsx`.
  Remove the Google Fonts Inter `<link>` tags from `index.html`.
- `src/index.css`: replace `@theme` with all colour tokens from DESIGN.md, `--font-display`,
  `--font-sans`, `--font-mono`, and the text scale from DESIGN.md (`text-xs`..`text-3xl`,
  `text-display`). Base layer: body ground/ink/18px/line-height 1.6; h1–h3 use font-display;
  the browser-surfaces section from DESIGN.md (selection, caret, focus-visible, link underline,
  scrollbar, accent-color); `@media (prefers-reduced-motion: reduce)` turns off animations
  and transitions. Remove the old tokens (`primary`, `secondary`, `bg`, `text`, `primary-light`)
  but keep aliases `--color-primary: var(--color-rambu)` and `--color-secondary:
  var(--color-info)` so pages that haven't been migrated yet don't break.
- `src/lib/status.ts`: `STATUS_MAP[s] = { label, color /*chart*/, bg, fg, icon }`, with values
  per DESIGN.md (`icon` = a lucide-react component). Labels must not change.
- `src/components/StatusBadge.tsx`: rounded-lg, soft bg + fg + icon (aria-hidden) + label,
  `text-sm` 600, `px-3 py-1`.
- `src/components/ui/` (new), each with typed props and a named export, plus `index.ts`:
  - `Button` (`variant: primary|secondary|quiet|danger`, `size: md|lg` = h-12|h-14, `icon?`,
    `loading?` -> spinner + `aria-busy`, `to?` -> render as react-router `Link`).
  - `Field` (label, hint?, error?, htmlFor; error = danger text + `CircleAlert` icon,
    `aria-describedby` wired up) + `Input`, `Select`, `Textarea` (h-12, rounded-lg,
    border line-strong, surface).
  - `Panel` (surface, 1px line border, rounded-xl, p-6; `as?` prop).
  - `SignPlate` (`tone: rambu|info`, `level: 1|2` -> h1/h2, `arrow?: boolean`, children): the
    exact spec from DESIGN.md (inner border via `outline`/inset pseudo-element, not nested divs).
  - `MarkaRoute` (`steps: {title, description?, state: 'done'|'current'|'upcoming', meta?}[]`,
    `animate?: boolean`): an `<ol>`, a dashed SVG line (`stroke-dasharray 8 8`) on the left;
    when `animate` and in view (IntersectionObserver) the line draws itself in 600 ms; with
    reduced motion it is drawn immediately. Current step gets `aria-current="step"`.
  - `Dialog` (open, onClose, title, children, footer?): `<dialog>` element with
    `showModal()`, Esc + backdrop click close it, focus returns to the trigger, overlay shadow per DESIGN.md.
  - `ToastProvider` + `useToast()` (`toast(msg, tone?: 'success'|'error')`): bottom-centre
    stack, `role="status"`, auto-dismiss after 5 s, with a close button.
  - `EmptyState` (icon, title, description?, action?).
- Shell: `components/layout/TopNav.tsx` restyled: a white surface bar with a 1px bottom line,
  h-16; logo = a small rambu SignPlate "Sigap" (text-lg, no arrow); links in ink 600 with the
  active one rambu + 3px marka underline; CTA "Buat Laporan" = Button primary with a `Camera`
  icon. Mobile: a hamburger opens a full-width panel with links at h-12. Keep all existing
  behaviour (auth menu, bell, Profil/Keluar).
- `components/layout/Footer.tsx` (new): aspal background, a marka dashed line along the top
  edge, white text: "Sigap" + one sentence "Layanan pelaporan kerusakan fasilitas publik di
  Bali." + links Peta, Buat Laporan, Masuk/Profil. Not a 4-column footer.
- `components/layout/Layout.tsx`: TopNav + `<main>` + Footer, `ToastProvider` around the
  outlet. Route `/` is full-bleed (no container); other routes get the container
  `mx-auto max-w-6xl px-4 sm:px-6 py-8 md:py-12`.
- `pages/NotFoundPage.tsx`: SignPlate "Halaman tidak ditemukan" + Button "Kembali ke Beranda".
- `scripts/check-design.mjs` + npm script `check:design`: `node scripts/check-design.mjs
  [paths...]` (default `src`), scans `.ts/.tsx/.css` except `*.test.*`, `src/lib/status.ts`,
  `src/index.css`. Fails (exit 1, prints file:line) on: `[#` hex arbitrary classes, 6-digit
  hex in tsx, `gradient`, `backdrop-blur`, `shadow-[0_0`, arbitrary `text-[`, spacing
  classes (p/m/gap/space/inset/top/left/right/bottom, incl. axis/side variants) with steps
  5|7|9|10|11|14|20 or `-[..px]`, emoji (`\p{Extended_Pictographic}`).
- Tests: `components/ui/ui.test.tsx` (Button as Link, loading, Field error aria, Dialog
  Esc, MarkaRoute aria-current, Toast appears) + `components/ui/contrast.test.ts` (parse the
  `--color-*` values from `src/index.css`, assert ink/surface, ink/ground, muted/ground ≥7,
  white/rambu, white/info, white/aspal, white/danger, ink/marka ≥4.5, and each status fg/bg ≥4.5).

## Touch
- `frontend/package.json`, `frontend/package-lock.json`, `frontend/index.html`, `frontend/src/main.tsx`
- `frontend/src/index.css`, `frontend/src/lib/status.ts`, `frontend/src/components/StatusBadge.tsx`
- `frontend/src/components/ui/**` (new), `frontend/src/components/layout/{Layout,TopNav,Footer}.tsx`
- `frontend/src/pages/NotFoundPage.tsx`, `frontend/scripts/check-design.mjs` (new)
- `DESIGN.md` only if a value needs correcting (e.g. contrast fails) and the change is noted in the commit message

## Do not touch
- `frontend/src/pages/*` other than NotFoundPage, `frontend/src/features/**`: tickets 23–26
- `frontend/src/lib/api.ts`, `backend/`

## Decisions
- Direction "Rambu & Marka", chosen by the user. Light mode only. Body text 18px, targets ≥48px, "Anda".
- Self-hosted fonts via fontsource. No component library (shadcn/radix): own components in `components/ui`.
