# Eval result 17

| # | Check | Result | Evidence (1 line) |
|---|-------|--------|-------------------|
| 1 | status select for "verified" | PASS | `npx vitest run src/features/officer`: "StatusForm > verified offers only in_progress and rejected" passed |
| 2 | completed with 5-char note | PASS | vitest "StatusForm > completed with short note disables submit and shows hint" passed |
| 3 | master_count 3 confirm text | PASS | vitest "StatusForm > confirm text mentions other reports in group" passed (`confirmText(3)` contains "2 laporan lain") |
| 4 | officer opens /petugas | NOT RUN | Needs backend + officer account; the cloud DB has no app tables (only `spatial_ref_sys`), and `manage.py migrate` was denied by the permission classifier as a shared-resource modification |
| 5 | filter Ditinjau tab | NOT RUN | Same blocker as #4 (no backend data, no officer login) |
| 6 | open report → Ditinjau → save | NOT RUN | Same blocker as #4 (no reports, no officer login) |
| 7 | public user opens /petugas | NOT RUN | Needs a logged-in public account, which needs the backend; not checked against an unauthenticated visit either |
| 8 | 375px | NOT RUN | Needs list data and a browser viewport run; blocked by the same backend issue as #4 |

Unit: 4/4 tests in `frontend/src/features/officer/officer.test.tsx` pass (`Test Files 1 passed, Tests 4 passed`).

Scope: branch diff vs `main` touches only `frontend/src/pages/OfficerDashboardPage.tsx`, `frontend/src/pages/OfficerReportPage.tsx`, `frontend/src/features/officer/**` (all in Touch) plus this ticket's `eval-result.md`. Nothing under `frontend/src/lib/**`, `frontend/src/features/auth/`, or `backend/` changed.

Edge case "concurrent change makes transition invalid -> 400 detail shown, data refetched": not run (needs backend).

Result: 3/8 PASS, 0 FAIL, 5 NOT RUN. UI checks 4-8 remain open until the backend DB is migrated and seeded with an officer and public account.
