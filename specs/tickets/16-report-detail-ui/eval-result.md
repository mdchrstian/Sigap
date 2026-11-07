# Eval result 16
Tester agent hit its turn limit; checks run by hand. Unit via vitest + tsc, UI via agent-browser
against Vite (5173) and Django (8000, Supabase cloud DB, seeded report SGP-000001 and user).

| # | Result |
|---|--------|
| 1 | PASS (unit) |
| 2 | PASS (unit) |
| 3 | PASS (unit) |
| 4 | PASS (unit) |
| 5 | PASS (photo, status badge, map marker, timeline visible) |
| 6 | PASS (comment with photo appears labelled "Pelapor") |
| 7 | PASS (Hapus removes it; list shows "Belum ada komentar.") |
| 8 | PASS (/laporan-saya lists report, click opens /laporan/1) |
| 9 | PASS (375px viewport screenshot is single column; no horizontal scrollbar seen) |

Minor note: after sending a comment the selected photo filename stays in the form.
