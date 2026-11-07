# 21 NusaRouter AI Provider
ui: no

## Goal
With `AI_PROVIDER=nusarouter`, photo analysis and dashboard insights call real open-weight
models through NusaRouter (an OpenAI-compatible router) instead of the fake provider.

## Requirements
- New provider value `nusarouter` next to the existing `fake` / `openai` in
  `backend/ai_services/client.py`. The `fake` and `openai` paths keep working exactly as
  they do now.
- New settings (django-environ, `backend/config/settings.py`):
  - `NUSAROUTER_API_KEY` (str, default "")
  - `NUSAROUTER_BASE_URL` (str, default "")
  - `NUSAROUTER_VISION_MODEL` (str, default "")
  - `NUSAROUTER_TEXT_MODEL` (str, default "": empty means use `NUSAROUTER_VISION_MODEL`)
  - `NUSAROUTER_TIMEOUT` (int seconds, default 30)
- Client: `openai.OpenAI(api_key=NUSAROUTER_API_KEY, base_url=NUSAROUTER_BASE_URL,
  timeout=NUSAROUTER_TIMEOUT)`. Build it in a helper (e.g. `_nusarouter()`) next to
  `_openai()`. A missing key, base URL or model raises `AIUnavailable`, and so do
  `openai.APIError` and timeouts. Views already turn that into a 503 `fallback:"manual"`.
- `analyze_photo` (nusarouter) sends the existing data-URL image as an `image_url` content
  part to `NUSAROUTER_VISION_MODEL`. The output dict is the same as today:
  `category_slug`, `description`, `observations`, plus the `is_infrastructure` flag the
  view uses.
- `generate_json` (nusarouter) uses the text model.
- JSON handling for nusarouter: send `response_format={"type":"json_object"}`, NOT
  `json_schema`. Append the JSON schema as text to the system prompt
  ("Balas HANYA dengan JSON valid sesuai skema: ..."). Strip ```json fences if present,
  then `json.loads`, then validate required keys and types against the schema with a
  small hand-written check (no new dependency). Invalid output gets 1 retry, then
  `AIUnavailable`.
- `embed_text` with nusarouter: use the existing fake md5 1536-d vector (no network
  call). Leave a comment noting that NusaRouter embeddings are not used.
- Log: keep writing the existing AI log rows (log_id), with the model name taken from
  settings.
- `backend/.env.example`: add all NUSAROUTER_* vars with placeholder comments
  (`# isi dari dashboard NusaRouter`), and the example
  `NUSAROUTER_VISION_MODEL=<id MiMo Flash 2.6 di NusaRouter>`.
- README (backend section): 5 lines or fewer on how to turn on `AI_PROVIDER=nusarouter`.

## Touch
- `backend/ai_services/client.py`  nusarouter provider, JSON parse/validate helper
- `backend/config/settings.py`  NUSAROUTER_* settings
- `backend/.env.example`  new vars
- `backend/ai_services/test_ai.py`  tests with the OpenAI client mocked
- `README.md`  short section

## Do not touch
- `backend/conftest.py`  tests stay on `AI_PROVIDER=fake` by default
- `backend/ai_services/views.py`, `backend/dashboard/insights.py`  the output contract is unchanged
- `backend/duplicates/`, `backend/reports/`, `frontend/`, and any migration
- `pyproject.toml`  the `openai` SDK is already installed; add no new dependency

## Decisions
- Router -> NusaRouter, OpenAI-compatible; use the existing `openai` SDK with `base_url`.
- Base URL and model IDs -> env vars only. The user fills them from the NusaRouter
  dashboard. Do NOT hard-code a URL or model ID.
- Vision model -> MiMo Flash 2.6 (cheapest model with image support).
- Text model (insights) -> also MiMo Flash by default; can be swapped via
  `NUSAROUTER_TEXT_MODEL`.
- Embeddings -> stay on the fake md5 vector; no NusaRouter embeddings.
- JSON -> `json_object` plus the schema in the prompt plus server-side validation, with
  1 retry.
- Tests never call the network: mock the client (monkeypatch the helper).
