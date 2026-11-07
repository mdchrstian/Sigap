# Eval result 21

| # | Check | Result | Evidence (1 line) |
|---|-------|--------|-------------------|
| 1 | nusarouter client built with base_url, key, timeout from settings (mock `openai.OpenAI`) | PASS | test_nr_client_args: `OpenAI(api_key="k", base_url="https://nr.example/v1", timeout=12)` |
| 2 | analyze_photo (nusarouter) calls the vision model with an `image_url` part and `response_format` json_object | PASS | test_nr_analyze_request_and_fences: model "vis-m", response_format json_object, image_url part present |
| 3 | Valid mocked JSON reply (also wrapped in ```json fences) | PASS | test_nr_analyze_request_and_fences: fenced reply parsed, keys == GOOD keys |
| 4 | Invalid JSON, then valid JSON | PASS | test_nr_retry_then_ok: 2 calls, returns "Lubang" |
| 5 | Invalid JSON twice | PASS | test_nr_invalid_twice_503: 2 calls, POST analyze-photo -> 503 fallback "manual" |
| 6 | generate_json uses NUSAROUTER_TEXT_MODEL; when empty it falls back to the vision model | PASS | test_nr_generate_json_models: "txt-m", then "vis-m" when text model empty |
| 7 | Missing NUSAROUTER_API_KEY/BASE_URL/VISION_MODEL | PASS | test_nr_missing_config (3 params): AIUnavailable raised, openai.OpenAI not called |
| 8 | `openai.APITimeoutError` / `APIError` from the mock | PASS | test_nr_api_errors (2 params): AIUnavailable raised |
| 9 | embed_text under nusarouter | PASS | test_nr_embed_no_network: 1536-d vector, _nusarouter and _openai not called |
| 10 | Default AI_PROVIDER=fake behavior unchanged | PASS | `uv run pytest -q` full suite: 127 passed |
| 11 | `.env.example` lists NUSAROUTER_API_KEY, _BASE_URL, _VISION_MODEL, _TEXT_MODEL, _TIMEOUT | PASS | `grep -c NUSAROUTER_ backend/.env.example` = 5 |
| E1 | Model returns `category_slug` not among active categories -> null | PASS | Code inspection: views.py:58-60 filter is provider-agnostic; no nusarouter-specific test |
| E2 | Model returns extra keys -> ignored, not an error | PASS | test_nr_extra_keys_ok |
| E3 | Fields with wrong type (observations not a list) -> retry | PASS | test_nr_wrong_type_retries: 2 calls |
| D1 | Done: all checks PASS, no file outside Touch changed | PASS | Commit 2823838 touches only README.md, backend/.env.example, backend/ai_services/client.py, backend/ai_services/test_ai.py, backend/config/settings.py (all in Touch) |
| D2 | Done: work committed on the ticket branch | PASS | Branch ticket/21-nusarouter-ai-provider at 2823838, worktree clean |
| M1 | Optional manual smoke (real key) | SKIP | Needs a real NusaRouter key; not run in CI |

Summary: 16 pass, 0 fail, 1 skip (manual smoke). Unit subset `pytest -q ai_services dashboard duplicates`: 50 passed. Full suite: 127 passed.
