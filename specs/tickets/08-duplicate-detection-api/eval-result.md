# Eval result 08
Run by implementer (tester agent unavailable): `uv run pytest duplicates reports -q` -> 27 passed.

| # | Check | Result |
|---|-------|--------|
| 1 | 20 m same category -> high | PASS (test_high) |
| 2 | 300 m -> low, no candidates | PASS (test_far_low) |
| 3 | 40 m other category -> medium | PASS (test_medium_other_category) |
| 4 | old/rejected/hidden excluded | PASS (test_excluded) |
| 5 | AIUnavailable -> medium, null sim | PASS (test_ai_unavailable) |
| 6 | no auth -> 401 | PASS (test_check_requires_auth) |
| 7 | link, target no master | PASS (test_link_new_master) |
| 8 | link to existing master, count 3 | PASS (test_link_existing_master) |
| 9 | link 1 km -> 400 message | PASS (test_link_far) |
| 10 | embedding row 1536 dims | PASS (test_create_stores_embedding) |
| 11 | store_embedding fails -> 201 | PASS (test_embedding_failure_still_201) |
