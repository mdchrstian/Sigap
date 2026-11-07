# Eval result 17

| # | Result | Evidence |
|---|--------|----------|
| 1 | PASS | vitest: verified offers only in_progress, rejected |
| 2 | PASS | vitest: completed with 5-char note, submit disabled, hint shown |
| 3 | PASS | vitest: master_count 3 confirm text mentions 2 other reports |
| 4 | PASS | agent-browser as officer17: /petugas shows 7 status tabs with counts, category/kabupaten filters, search, table of 3 reports |
| 5 | PASS | Clicked Ditinjau tab: only SGP-000003 (status Ditinjau) listed |
| 6 | PASS | SGP-000003: chose Ditinjau + note, Simpan, "Ya, ubah"; timeline gained "Ditinjau oleh officer 17 (Petugas)"; status updated. Toast not captured (transient) |
| 7 | PASS | public17 opening /petugas sees "Akses ditolak" |
| 8 | PASS | viewport 375px: list renders as cards, filters stacked |

Known issue: after the status change the chips still showed Dikirim (3) / Ditinjau (0), and `GET /api/analytics/summary` still returned submitted=3. Likely a server-side cache of the analytics summary (backend, outside this ticket); the list itself refetched correctly.
