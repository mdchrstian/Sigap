# Eval result 07

Run: `cd backend && uv run pytest ai_services -q` -> 11 passed. Self-verified by the implementer (tester agent unavailable in this environment).

| # | Check | Result | Test |
|---|-------|--------|------|
| 1 | fake provider jpg -> 200, road, requires_review | PASS | test_fake_ok |
| 2 | unauthenticated -> 401 | PASS | test_unauth |
| 3 | mocked slug "bridge" -> null | PASS | test_unknown_slug_null |
| 4 | mocked timeout -> 503 fallback manual, log failed | PASS | test_timeout_503 |
| 5 | success log row analyze_photo/success | PASS | test_log_success |
| 6 | image to OpenAI <=1024 px, no EXIF | PASS | test_image_downscaled_no_exif |
| 7 | fake embed 1536 dims, norm ~1 | PASS | test_embed_norm |
| 8 | similar cosine > unrelated | PASS | test_embed_similarity |
| 9 | 11th call -> 429 | PASS | test_throttle |
| 10 | .gif -> 400 | PASS | test_gif_400 |
| E1 | invalid JSON -> 503, log failed | PASS | test_invalid_json_503 |
