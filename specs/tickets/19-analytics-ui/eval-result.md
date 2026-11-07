# Eval 19 result

| # | Check | Result | Evidence (1 line) |
|---|-------|--------|-------------------|
| 1 | summary mock limited_data true | PASS | vitest "shows limited data warning and empty state" passed (3/3 files tests pass) |
| 2 | insights verified false | PASS | vitest "unverified insights use warning style": data-verified="false", class contains amber, caption shown |
| 3 | insights 503 | PASS | vitest "503 shows unavailable message": "Ringkasan AI tidak tersedia saat ini." |
| 4 | open / logged out | PASS | `/` snapshot: hero heading, 3 steps (AI membantu / Warga mengonfirmasi / Petugas memverifikasi), Total laporan 0 and Laporan selesai 0 match API summary total=0, completed=0 |
| 5 | officer /petugas/statistik | PASS | officer login: 7 KPI tiles (Total + 6 statuses), charts "Laporan per kategori" and "Laporan per minggu", "Laporan per kabupaten/kota" section, "Laporan tertunda (0)" list. Note: DB empty, so table/list show empty-state text, not rows |
| 6 | click "Buat Ringkasan" | PASS | result shows "[Uji AI] Ringkasan tidak tersedia.", "Dibuat: 7/11/2026, 15.55.11", caption "Dibuat AI dari statistik di halaman ini. Periksa kembali sebelum digunakan." |
| 7 | public user /petugas/statistik | PASS | public login then /petugas/statistik shows "Akses ditolak" |
| 8 | 375px home and stats | PASS | viewport 375x812, full-page screenshots home-375.png and stats-375.png: no clipping or overflow visible; KPI tiles in 2 columns, charts fit. Visual check only (scrollWidth not measured) |
| E | total 0 -> charts empty state, no crash | PASS | both pages render "Belum ada data untuk ditampilkan." with no errors |

Result: 8/8 checks PASS (plus edge case E).

## Notes
- Done-means: `git status` clean, work is on branch ticket/19-analytics-ui.
- Touch deviation: `frontend/package-lock.json` changed (+397 lines) vs main. It is not listed under "Touch" (only `frontend/package.json` is). Likely a side effect of adding `recharts`.
- Test data created in test DB (container agent-a924ff840784f4166-db-1, port 54329): users eval-officer@test.local and eval-public@test.local (password EvalPass123!). No reports were seeded.
- Ports: vite ran on 5174 (5173 was busy with another process). Backend on 8000 with AI_PROVIDER=fake.
