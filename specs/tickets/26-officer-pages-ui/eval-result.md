# Eval result 26

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | Status tabs | PASS | dashboard.test.tsx (tablist, aria-selected, counts from by_status); also seen in browser |
| 2 | StatusForm short note | PASS | officer.test.tsx (Field error, aria-invalid, submit disabled) |
| 3 | Status change dialog then toast | PASS | officer.test.tsx (Dialog confirm -> toast text via ToastProvider); dialog mentions "2 laporan lain" test |
| 4 | InsightsCard unavailable/unverified marka-soft | PASS | analytics.test.tsx adjusted, passes |
| 5 | Old officer/analytics tests | PASS | `npm test -- officer analytics` 10/10; lint/tsc clean |
| 6 | check:design | PASS | exit 0 on Touch paths |
| 7 | grep amber/orange-/slate- | PASS | 0 results |
| 8 | /petugas 1280px | PASS | agent-browser: blue SignPlate, tabs with marka underline, aligned table, header row (sticky via CSS, not scroll-tested) |
| 9 | /petugas 390px | PASS | agent-browser: list of rows, filters stacked, tabs wrap; no horizontal scroll seen |
| 10 | /petugas/laporan/1 | PARTIAL PASS | 2/3 + 1/3 layout, MarkaRoute timeline seen; seed report has no AI data so "Saran AI vs Final" side-by-side was not visible (covered by code only) |
| 11 | /petugas/statistik | PASS | status table, charts use token/status colours, no gradients; category x-labels overlapped, fixed with angled ticks (re-render not re-inspected visually in detail) |
