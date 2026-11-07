# Eval result 11
(tester agent unavailable; verified by `uv run pytest community -q`: 11 passed)

| # | Check | Result |
|---|-------|--------|
| 1 | POST comment as user | PASS |
| 2 | reporter comments own report | PASS |
| 3 | officer comments | PASS |
| 4 | GET as anonymous | PASS |
| 5 | POST unauthenticated | PASS |
| 6 | body "ok" | PASS |
| 7 | comment with jpg | PASS |
| 8 | DELETE by other user | PASS |
| 9 | DELETE by author then GET | PASS |
| 10 | 21st comment in an hour | PASS |
| edge | hidden report -> 404 | PASS |
