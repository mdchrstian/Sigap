# Eval result 03

Run: `cd backend && uv run pytest accounts -q` -> 18 passed (self-verified; tester agent unavailable).

| # | Check | Result |
|---|-------|--------|
| 1 | register valid | PASS |
| 2 | register with role=admin | PASS |
| 3 | register duplicate email | PASS |
| 4 | register password "123" | PASS |
| 5 | login valid | PASS |
| 6 | login wrong password | PASS |
| 7 | refresh | PASS |
| 8 | GET me without token | PASS |
| 9 | PATCH me role=admin | PASS |
| 10 | IsOfficer | PASS |
| 11 | admin save role=admin | PASS |
| edge | email case | PASS |
