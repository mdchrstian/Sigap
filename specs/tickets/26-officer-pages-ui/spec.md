# 26 Officer Pages UI
ui: yes

## Goal
The officer dashboard, officer report detail and statistics use the "Rambu & Marka" design
system: dense, consistent and quick to scan at a desk.

## Requirements
- READ `DESIGN.md` + `PRODUCT.md` at the repo root. Use only tokens + `components/ui`.
  Mode = Operate. The officer area is marked with blue information signs: page titles
  use `SignPlate tone=info level=1` (no arrow), one per page.
- Remove all `[#...]` hex classes and inline class strings for buttons/inputs in the Touch files.
- `/petugas` (`OfficerDashboardPage`):
  - SignPlate "Dasbor Petugas" + to its right Button secondary `ChartColumn` "Statistik" and,
    for admin, Button quiet "Buka Admin" (`/admin/`).
  - Status tabs: a row of tabs (`role="tablist"`), active = ink text + 3px marka underline;
    each tab shows its count from `by_status` in Overpass Mono. Category/regency filters =
    Select, search = Input with a `Search` icon. One row on desktop, wrapping on mobile.
  - Table: `<table>` with a sticky header (ground background), rows h-16, a 1px line between
    rows, a hover row background, columns: code (Mono), category, regency, StatusBadge,
    group (`{n} laporan` when master_count>1), updated (relative date muted). Hidden = a
    "Disembunyikan" badge (marka-soft). Mobile <md: the table becomes a list of rows (not cards).
  - Pagination = Button secondary; EmptyState "Tidak ada laporan untuk filter ini.".
- `/petugas/laporan/:id` (`OfficerReportPage`, `features/officer/*`):
  - Header: SignPlate info with the code; layout md 3 columns: left 2/3 (photos, description,
    AI section comparing "Saran AI" vs "Final" side by side in two Panels, map), right 1/3
    (reporter Panel, status form Panel, MarkaRoute timeline from history).
  - `StatusForm`: Select of allowed statuses + Textarea note (Field error when <10 chars for
    completed/rejected); the confirmation uses the shared `Dialog` (replace the inline dialog);
    success = `useToast()` "Status diperbarui ({k} laporan)" (replace the local toast state).
- `/petugas/statistik` (`OfficerStatsPage`, `features/analytics/{Charts,InsightsCard}`):
  - Period selector = a row of Button secondary (active = primary).
  - Charts (recharts): colours ONLY from `STATUS_MAP[s].color` / the DESIGN.md category list,
    axis + grid in `muted`/`line`, the Atkinson font, tooltip = surface + overlay shadow,
    `tabular-nums`. No gradient fills.
  - InsightsCard: a Panel titled "Ringkasan AI" (rambu-soft badge "AI"), bullets in body text,
    the AI-unavailable notice in marka-soft. Replace the `amber` class with marka-soft tokens
    and adjust `analytics.test.tsx:32` to match.
  - Stale list = a list of rows like the dashboard table.
- Behaviour/API stays the same; adjust broken tests.

## Touch
- `frontend/src/pages/{OfficerDashboardPage,OfficerReportPage,OfficerStatsPage}.tsx`
- `frontend/src/features/officer/**`
- `frontend/src/features/analytics/{Charts,InsightsCard}.tsx`, the officer/insights tests in `analytics.test.tsx`

## Do not touch
- `frontend/src/components/**`, `index.css` (ticket 22)
- `features/analytics/{PublicStats,analyticsApi}.ts(x)` (ticket 23 / API), `officerApi.ts` request shapes
- `HomePage`, citizen features (tickets 23–25)

## Decisions
- Direction "Rambu & Marka"; the officer area uses blue information signs (tone=info).
- Mobile officer table = a list of rows, not cards. No card grid for summaries.
