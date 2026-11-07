# Eval 21

## How to verify
- DB: `docker compose -f docker-compose.test.yml up -d --wait`
- Unit: `cd backend && uv run pytest -q ai_services dashboard duplicates`
- Full regression: `cd backend && uv run pytest -q`

## Checks
| # | Check | Type | Expected |
|---|-------|------|----------|
| 1 | nusarouter client built with base_url, key, timeout from settings (mock `openai.OpenAI`) | unit | constructor args match settings |
| 2 | analyze_photo (nusarouter) calls the vision model with an `image_url` part and `response_format` json_object | unit | model == NUSAROUTER_VISION_MODEL; no `json_schema` |
| 3 | Valid mocked JSON reply (also wrapped in ```json fences) | unit | parsed dict with the same keys as the fake output |
| 4 | Invalid JSON, then valid JSON | unit | 2 calls; returns the valid result |
| 5 | Invalid JSON twice | unit | raises AIUnavailable; POST /api/ai/analyze-photo -> 503 `fallback:"manual"` |
| 6 | generate_json uses NUSAROUTER_TEXT_MODEL; when empty it falls back to the vision model | unit | correct model in the call |
| 7 | Missing NUSAROUTER_API_KEY/BASE_URL/VISION_MODEL | unit | AIUnavailable, no network call |
| 8 | `openai.APITimeoutError` / `APIError` from the mock | unit | AIUnavailable |
| 9 | embed_text under nusarouter | unit | 1536-d vector, client never called |
| 10 | Default AI_PROVIDER=fake behavior unchanged | unit | whole backend suite passes |
| 11 | `.env.example` lists NUSAROUTER_API_KEY, _BASE_URL, _VISION_MODEL, _TEXT_MODEL, _TIMEOUT | unit | `grep -c NUSAROUTER_ backend/.env.example` >= 5 |

## Edge cases
- Model returns `category_slug` not among active categories -> null (existing filter keeps working)
- Model returns extra keys -> ignored, not an error
- Fields with the wrong type (observations not a list) -> treated as invalid, triggers the retry

## Done means
All checks PASS, no file outside "Touch" changed, work committed on the ticket branch.
Optional manual smoke (needs a real key, do not run in CI): set NUSAROUTER_* in backend/.env,
`AI_PROVIDER=nusarouter`, upload a pothole photo in the report form -> AI suggestion appears.
