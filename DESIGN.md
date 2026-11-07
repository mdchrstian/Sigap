# Sigap Design System: "Rambu & Marka"

Binding for every frontend change. The source of truth for tokens is `frontend/src/index.css` (`@theme`).
When this file and the code disagree, fix the code, or update this file in the same commit.

## World
The visual language of Indonesian roads: green direction-sign panels with a white inner border,
yellow road markings (marka) that form a dashed line, and the dark grey of asphalt. Light mode only:
users stand at the roadside in sunlight.
- Landing page (Persuade): the world carries the page (giant sign panel, a marka line as the
  journey of a report, statistics as a direction-sign list, an asphalt footer).
- App pages (Operate): standard layouts and controls. The world contributes only type, palette,
  and one signature move: the `SignPlate` for page titles and the `MarkaRoute` for status timelines.

## Color (tokens `--color-*`)
| token | hex | use |
|---|---|---|
| ground | #F4F5F2 | page background (concrete) |
| surface | #FFFFFF | panels, inputs |
| ink | #1B2420 | main text |
| muted | #4A5550 | secondary text (≥7:1 on ground) |
| line | #D5D9D4 | 1px borders |
| line-strong | #9AA39C | input borders, dividers that need contrast |
| rambu | #0A6B4E | primary: sign panels, primary buttons, links |
| rambu-dark | #08513B | hover/active rambu |
| rambu-soft | #D9EFE6 | rambu-tinted background |
| info | #1F4FA3 | blue information signs: officer-area SignPlate, info |
| info-soft | #DCE6F7 | |
| marka | #F2C200 | marka lines, focus on dark surfaces, attention highlight. NEVER as text colour |
| marka-soft | #FFF1B8 | warning background |
| aspal | #23292B | footer, dark map overlays |
| danger | #B42318 | errors, destructive actions |
| danger-soft | #FBE0DD | |
Text on rambu/info/aspal/danger is always white; text on marka/marka-soft is always ink.
Status (badge = soft background + dark text + icon; never colour alone):
submitted #E6E8EA/#2E3A40 `Inbox` · under_review #DCE6F7/#173D80 `Search` · verified #D9EFE6/#08513B
`BadgeCheck` · in_progress #FFF1B8/#5A4500 `Construction` · completed #0A6B4E/#FFFFFF `CircleCheck` ·
rejected #FBE0DD/#8A1C12 `CircleX`. Chart colours come from these same tokens (status = its own colour).

## Type
- Display/headings: **Overpass** 700/800 (`@fontsource/overpass`), the voice of signage. tracking -0.01em.
- Body/UI: **Atkinson Hyperlegible Next** 400/600/700 (`@fontsource/atkinson-hyperlegible-next`).
- Report codes and tabular numbers: **Overpass Mono** 600 (`@fontsource/overpass-mono`), plus `tabular-nums`.
- Self-hosted via fontsource; NO Google Fonts link. Inter is removed.
- Scale: 14px (metadata only, minimum) · 16 · **18 body** · 22 · 28 · 36 · 48 · display clamp(2.5rem,6vw,4.5rem).
  line-height: body 1.6, headings 1.15. Text measure max 68ch.
- Tailwind mapping (redefined in `@theme`): `text-xs` 14px · `text-sm` 16px · `text-base` 18px · `text-lg` 22px ·
  `text-xl` 28px · `text-2xl` 36px · `text-3xl` 48px · `text-display` clamp. Arbitrary `text-[..]` is banned.
- Chart colours (solid, in `lib/status.ts`): submitted #6B7780 · under_review #1F4FA3 · verified #2F8F72 ·
  in_progress #C99A00 · completed #08513B · rejected #B42318. Categories: rambu, info, #C99A00, aspal, #2F8F72, muted.

## Spacing & layout (4px base: use ONLY these steps)
Allowed Tailwind steps: 1 2 3 4 6 8 12 16 24 (4–96px). Steps 5, 7, 9, 10, 11 and arbitrary `[..px]` are banned.
- Container: `mx-auto max-w-6xl px-4 sm:px-6`. App page: `py-8 md:py-12`. Landing section: `py-16 md:py-24`.
- Panel: `p-6`; compact list item: `p-4`. Gap inside a group `gap-2`/`gap-3`; between fields `gap-6`;
  between page blocks `gap-8`/`gap-12`. Space above a heading > space below it.
- Radius: controls/badges `rounded-lg` (8px), panels/SignPlate `rounded-xl` (12px), `rounded-full` only for dots.
- Depth: panels use a 1px `line` border, no shadow. Only overlays (dialog, dropdown, popup, toast):
  `0 8px 24px rgb(27 36 32 / .16)`.

## Signature components (`frontend/src/components/ui/`)
- `SignPlate`: rambu (or info) background, rounded-xl, a 2px white inner border inset 6px (rounded-lg),
  white Overpass text, optional `ArrowRight` icon on the right. For page titles and the landing hero.
  At most 1 per screen.
- `MarkaRoute`: a vertical list of steps; to the left runs a 4px line made of marka-yellow dashes
  (8px dash, 8px gap) on aspal/line; stops: done = filled rambu circle + check, current = marka
  circle with an ink ring, upcoming = surface circle with a line-strong border. Used for "Cara kerja"
  and status timelines.
- `Button` primary rambu / secondary surface+ink border / quiet / danger; height 48px (lg 56px); icon + text.
- `Field` + `Input`/`Select`/`Textarea`: label always visible above (600), hint muted, error danger + icon,
  height 48px, `line-strong` border, focus outline.
- `Panel`, `StatusBadge`, `Dialog`, `Toast`, `EmptyState`.

## Browser surfaces
`::selection` marka background + ink text; `caret-color` rambu; focus-visible `outline: 3px solid ink;
outline-offset: 2px` (on rambu/info/aspal: outline marka); links underlined with `underline-offset: 3px`;
a thin scrollbar with a line-strong thumb; `accent-color: rambu`.

## Motion
Only one authored moment: the marka line on the landing page "draws" itself (stroke-dashoffset) as
it enters the viewport, 600ms ease-out. Everywhere else: 150ms colour/transform transitions. All motion
is off under `prefers-reduced-motion`. Content is visible from the start (no fade-in that hides content).

## Banned
Glow / zero-offset coloured shadows, gradients (backgrounds or text), glass/backdrop blur, kickers/eyebrows
above headings, section numbers 01/02, a grid of identical icon+title+text cards, the hero-metric template
(big number + small label), a thick coloured left border on cards, hard offset shadows, emoji/unicode as
icons (use lucide-react), hex colours or `[#...]` in components (use tokens), text below 14px, icons
without a text label (except with an `aria-label`).
