# 23 Landing Page
ui: yes

## Goal
Within seconds of landing on `/`, visitors understand what Sigap is, can start a report by
taking a photo straight from the first viewport, and see how a report travels to completion.

## Requirements
- READ `DESIGN.md` + `PRODUCT.md` at the repo root. Use only the tokens and the
  `components/ui` from ticket 22. Mode = Persuade: the road-sign world carries the page.
- `/` is full-bleed (Layout from 22). Sections in order, all inside the container
  `mx-auto max-w-6xl px-4 sm:px-6`, rhythm `py-16 md:py-24`:
  1. **Hero** (ground). Left (md: 7/12 columns): `SignPlate tone=rambu level=1 arrow`,
     filling the column width, `text-display`, copy: "Laporkan kerusakan fasilitas publik di
     Bali". Below it, one paragraph in `text-lg` muted (max 52ch): "Foto kerusakannya, AI
     menyusun laporannya, petugas menindaklanjuti. Anda bisa memantau setiap langkahnya."
     Actions: `Button size=lg primary icon=Camera` "Foto kerusakannya" + `Button size=lg
     secondary icon=Map` "Jelajahi Peta" (`/peta`).
     Right (md: 5/12): `SampleTicket`, a "karcis laporan" in a Panel: a label "Contoh"
     (marka-soft badge, ink), code `SGP-CONTOH` in Overpass Mono, category "Jalan berlubang",
     location "Jl. Raya Ubud, Gianyar", a "Draf AI" block: "Lubang selebar ±40 cm di lajur
     kiri, tergenang air saat hujan. Berbahaya bagi pengendara motor.", StatusBadge
     `in_progress`, and a mini MarkaRoute (horizontal, 5 dots, without text). No images/photos.
     Mobile: stacked, SignPlate first, the ticket below the buttons.
  2. **Cara kerja**: h2 "Dari foto sampai selesai". `MarkaRoute animate` with 5 steps
     (title + one-line description): Foto & lokasi ("Ambil foto, titik lokasi terisi
     otomatis.") · AI menyusun draf ("Kategori dan deskripsi disarankan; Anda yang
     memastikan.") · Ditinjau petugas ("Laporan serupa di lokasi yang sama digabung.") ·
     Dalam Pengerjaan ("Status diperbarui beserta catatan petugas.") · Selesai ("Anda
     mendapat notifikasi."). The first step is `current`, the rest `upcoming`. NOT cards.
  3. **Laporan per wilayah** (surface, top and bottom line borders): h2 "Laporan di seluruh
     Bali". One plain sentence from data: "Sejauh ini {total} laporan masuk, {done} sudah
     selesai." (numbers in `<span data-testid="stat-total">` / `stat-done`, Overpass Mono
     tabular). Below it, `RegencySigns`: a direction-sign list from `by_regency` (sorted
     desc), each row a green rambu panel with an inner border, regency name on the left,
     "{n} laporan" + `ArrowRight` on the right, linking to `/peta?regency={name}`. 2 columns
     on md. Keep the `limited_data` banner (marka-soft, ink) and the loading/error states.
     Remove `CategoryBar` from this page.
  4. **Penutup** (rambu background, full-bleed): h2 white "Ada yang rusak di sekitar Anda?"
     + Button (surface on rambu) "Buat Laporan" to `/lapor`. Then the Footer from Layout.
- "Foto kerusakannya" behaviour: when logged in, it opens a hidden `<input type="file"
  accept="image/*" capture="environment">`; on change `navigate("/lapor", { state: { photo:
  file } })` (the contract with ticket 24). When not logged in: a Link to `/masuk?next=%2Flapor`.
- The only motion is MarkaRoute `animate` in section 2.
- Use the existing `fetchSummary()` (`features/analytics/analyticsApi.ts`); do not change the API.

## Touch
- `frontend/src/pages/HomePage.tsx`
- `frontend/src/features/landing/**` (new: Hero, SampleTicket, HowItWorks, RegencySigns, landing.test.tsx)
- `frontend/src/features/analytics/PublicStats.tsx`, and only the PublicStats tests in `analytics.test.tsx`

## Do not touch
- `frontend/src/components/**`, `frontend/src/index.css` (ticket 22; ask the router if a token is missing)
- `frontend/src/features/create-report/**`, `CreateReportPage.tsx` (ticket 24 reads `state.photo`)
- `frontend/src/features/analytics/{Charts,InsightsCard,analyticsApi}.ts(x)` (ticket 26)

## Decisions
- Hero = typography + a code-built sample ticket labelled "Contoh"; no stock photos.
- Statistics are NOT the big-number template: a sentence + a direction-sign list.
- Address users as "Anda"; no emoji (lucide icons).
- Runs in parallel with 24; the only interface is router state `{ photo: File }` on `/lapor`.
