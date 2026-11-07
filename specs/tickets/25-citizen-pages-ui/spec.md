# 25 Citizen Pages UI (Peta, Detail, Laporan Saya, Notifikasi)
ui: yes

## Goal
The map, report detail, "Laporan Saya" and notifications pages use the "Rambu & Marka"
design system, with a status timeline drawn as road markings.

## Requirements
- READ `DESIGN.md` + `PRODUCT.md` at the repo root. Use only tokens + `components/ui`
  (Button, Field/Input/Select, Panel, SignPlate, MarkaRoute, StatusBadge, Dialog,
  EmptyState, useToast). Mode = Operate.
- Remove all `[#...]` hex classes and inline class strings for buttons/inputs in the Touch files.
- `/peta` (`ExploreMapPage`, `features/map/*`):
  - Desktop: the filter panel on the left (w-80, Panel, Select for status/category/regency +
    search Input), the map filling the rest (min-h `calc(100dvh - 4rem)` minus padding is
    fine via a utility class, rounded-xl, line border). Mobile: the map on top, a Button
    secondary `SlidersHorizontal` "Filter" opens the shared `Dialog` (replace the inline
    role=dialog).
  - Read the query `?regency=<name>` on mount as the initial value of the regency filter (link
    from the landing page, ticket 23).
  - Map markers: a circle in the status colour (`STATUS_MAP[s].color`) with a 2px white
    border; `ReportPopup`: code in Overpass Mono, category, StatusBadge, Button quiet
    "Lihat detail".
  - Empty filter result: an `EmptyState` overlay "Tidak ada laporan untuk filter ini." +
    Button "Hapus filter".
- `/laporan/:id` (`ReportDetailView`, `Comments`):
  - Header: code in Overpass Mono + category h1 (Overpass, NOT a SignPlate) + StatusBadge.
  - Grid md: 2 columns (photo + description + location map on the left; status timeline on the
    right). Photo rounded-xl, `object-cover`, alt text from the category.
  - Status timeline = `MarkaRoute` (without animate) from `history[]`: done = history entries
    already passed, current = latest status, upcoming = remaining statuses in the order
    submitted -> under_review -> verified -> in_progress -> completed; if `rejected`: the last
    step is "Ditolak" (danger) and there are no upcoming steps. meta = date + officer note.
  - Comments: a list with a 1px divider between items (not a card per comment), name 600 +
    date muted, the form = Textarea + Button primary "Kirim komentar". Replace the inline dialog
    with `Dialog`.
- `/laporan-saya` (`MyReportsView`): a list (not a grid of identical cards): each row has a
  thumbnail 64px rounded-lg, code + category, address muted, StatusBadge on the right,
  the whole row a link. EmptyState "Anda belum membuat laporan." + Button "Buat Laporan".
  Existing pagination becomes Button secondary prev/next.
- `/notifikasi` (`NotificationsPage`, `NotificationList`, `NotificationBell`): rows with a
  rambu dot for unread + 600 weight, read ones normal; Button quiet "Tandai semua dibaca".
  Bell: a lucide `Bell` icon with a count badge (danger, white text-xs, min 20px) and
  `aria-label="Notifikasi, {n} belum dibaca"`.
- Behaviour/API stays the same; adjust broken tests, add tests for `?regency` and the
  timeline in the rejected case.

## Touch
- `frontend/src/pages/{ExploreMapPage,ReportDetailPage,MyReportsPage,NotificationsPage}.tsx`
- `frontend/src/features/map/**`, `frontend/src/features/report-detail/**`, `frontend/src/features/notifications/**`

## Do not touch
- `frontend/src/components/**`, `index.css` (ticket 22), `features/*/api.ts` request shapes
- `features/create-report/**`, `components/LocationPicker.tsx` (ticket 24), officer pages (ticket 26)

## Decisions
- Direction "Rambu & Marka"; address users as "Anda"; SignPlate is not used on these pages
  (the signature lives in MarkaRoute + Overpass Mono codes).
- A list, not a card grid, for Laporan Saya and comments.
