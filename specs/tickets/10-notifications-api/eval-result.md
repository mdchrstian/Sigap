# Eval result 10 (self-verified; tester agent unavailable)
Run: `uv run pytest notifications -q` -> 5 passed

| # | Check | Result |
|---|-------|--------|
| 1 | create report -> no notification | PASS |
| 2 | status change with note -> notification w/ label + note | PASS |
| 3 | master propagation -> each reporter gets 1 | PASS |
| 4 | GET list own only, unread_count | PASS |
| 5 | mark read other user's id -> 404 | PASS |
| 6 | read-all -> unread_count 0 | PASS |
| 7 | unauthenticated -> 401 | PASS |
| edge | officer own report -> none | PASS |
