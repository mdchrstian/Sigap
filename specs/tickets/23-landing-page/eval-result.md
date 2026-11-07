# Eval result 23

| # | Check | Result | Note |
|---|-------|--------|------|
| 1 | Logged in file pick navigates with photo | PASS | landing.test.tsx |
| 2 | Logged out href /masuk?next=%2Flapor | PASS | landing.test.tsx |
| 3 | PublicStats stats + sorted regency links | PASS | landing.test.tsx |
| 4 | limited_data banner role=status | PASS | analytics + landing tests |
| 5 | check:design exit 0 | PASS | lint (tsc) also passes |
| 6 | 1280px first viewport | PASS | SignPlate, both buttons, ticket visible in 1280x720 |
| 7 | 390px | PASS | order correct; buttons 56px high; no horizontal overflow seen |
| 8 | Marka line draws once; 5 steps, no cards | FAIL | 5 steps, no cards, but yellow dashes never visible (grey line only) |
| 9 | Reduced motion: marka visible immediately | FAIL | same cause: dashes not visible |
| 10 | Regency row click | PASS | goes to /peta?regency=Denpasar |
| 11 | Ticket "Contoh" + SGP-CONTOH | PASS | visible |

Cause of 8/9: `frontend/src/components/ui/MarkaRoute.tsx` (ticket 22, not in Touch). The dashed line sits in a
`<mask>` with default objectBoundingBox units; the vertical line has a zero-width bbox, so the mask
clips everything. Fix: `maskUnits="userSpaceOnUse"` on the mask (plus x/y/width/height), or drop the mask.
