# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
- Warga Bali of every age, including older residents with low vision and teenagers. They report
  damage to public facilities (jalan berlubang, lampu jalan mati, drainase, dll.), usually on a
  phone, outdoors at the location, often in bright sunlight.
- Petugas (officer) and admin: they review, verify and update report status at a desk, on a laptop.

## Product Purpose
Sigap turns a photo plus a location into a complete public-facility damage report. AI drafts the
category and description, the resident confirms it, and an officer verifies it and follows up
until it is finished. Success: reports reach an officer without friction, and residents can see
progress transparently.

## Positioning
The report flow starts from a photo: AI writes the draft, and the resident only checks it.
Duplicate reports at the same location get grouped. Status is public and traceable step by step.

## Operating Context
- Citizen flow: Foto -> Lokasi -> Cek draf AI -> Kirim -> track the status (Dikirim, Ditinjau,
  Terverifikasi, Dalam Pengerjaan, Selesai / Ditolak).
- Officers: report table, detail view, status changes with notes, statistics + AI insights.
- Coverage: the 9 regencies/cities of Bali (kabupaten/kota).

## Capabilities and Constraints
- Stack: Vite + React + TS + Tailwind v4 (frontend), Django (backend). UI in Bahasa Indonesia.
- AI can be unavailable: the flow must still work manually.

## Brand Commitments
- Name: Sigap. Voice: polite, short, clear; address users as "Anda". No hype, no emoji.

## Evidence on Hand
- No real photos or testimonials yet. Seed images are solid-colour placeholders.
  Do not invent user counts, partner logos or testimonials. Sample content must be
  labelled "Contoh".

## Product Principles
- Clear enough for a 70-year-old reading in direct sunlight.
- One obvious main action per screen.
- Status is always visible and never conveyed by colour alone.
- AI helps; people decide.

## Accessibility & Inclusion
- WCAG 2.2 AA minimum; body text and controls target AAA contrast (≥7:1).
- Body text 18px, touch targets ≥48px, full keyboard support, `prefers-reduced-motion`.
