# Eval result 24 (run by worker; tester hit turn limit)

| # | Result | Note |
|---|--------|------|
| 1 | PASS | unit: state.photo File preselects, not auto-advanced |
| 2 | PASS | unit: 503 notice + empty form |
| 3 | PASS | unit: aria-current="step" |
| 4 | PASS | unit: role=alert on 401 |
| 5 | PASS | unit: toggle type + aria-label |
| 6 | PASS | `npm test -- --run create-report auth` 13/13 |
| 7 | PASS | check:design OK, tsc lint clean |
| 8 | PASS | agent-browser 390px: register -> photo -> location (map click) -> AI draft (category + description prefilled) -> Kirim -> success screen "Laporan terkirim" with code SGP-000031. Buttons render h-12/h-14 (48/56px); no horizontal overflow seen in screenshots (scrollWidth not measured, eval blocked in sandbox) |
| 9 | PASS (partial) | Tab moves through controls in order and the marka focus ring is visible on the dark footer link; full per-control sweep not done |
| 10 | PASS (partial) | /daftar at 390 and /profil at 1280 verified by screenshot: centred Panel, visible labels. /masuk at 390/1280 and /daftar at 1280 not screenshotted (same component structure as /daftar) |

Observation: "Keluar" button renders with ink border/text rather than danger colour (Button variant class order wins over className); not fixable in Touch files.
