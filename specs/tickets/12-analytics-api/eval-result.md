# Eval result 12
Run: `uv run pytest dashboard -q` -> 8 passed (self-verified; tester agent unavailable)

| # | Check | Result |
|---|-------|--------|
| 1 | hidden excluded, per-category counts | PASS |
| 2 | by_status 6 entries zero-filled | PASS |
| 3 | regency filter Gianyar | PASS |
| 4 | from>to -> 400 | PASS |
| 5 | in_progress 20d -> stale_count 1 | PASS |
| 6 | completed 20d not stale | PASS |
| 7 | stale as public denied | PASS |
| 8 | total<20 limited_data | PASS |
| E | empty DB no error | PASS |
