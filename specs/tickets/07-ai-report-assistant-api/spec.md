# 07 AI Report Assistant API
ui: no

## Goal
Given a photo, the backend returns an AI draft (category, description, visual observations)
that the user must review. Failures fall back to manual reporting. Also provides the shared
AI client (embeddings, JSON generation) used by tickets 08 and 13.

## Requirements
- `ai_services/models.py` `AIProcessingLog`: user FK null, kind (`analyze_photo`|`embedding`|
  `insights`), model, status (`success`|`failed`), latency_ms, error (text), prompt_tokens,
  completion_tokens, created_at. Django admin read-only list.
- `ai_services/client.py` (provider picked by `settings.AI_PROVIDER`):
  - `analyze_photo(image_bytes: bytes, categories: list[dict]) -> dict`
  - `embed_text(text: str) -> list[float]` (1536 dims, OPENAI_EMBEDDING_MODEL)
  - `generate_json(system: str, payload: dict, schema: dict) -> dict` (OPENAI_TEXT_MODEL)
  - Every call writes an AIProcessingLog row; errors raise `AIUnavailable`.
  - OpenAI: Chat Completions, `response_format={"type":"json_schema", strict}`, timeout 30 s.
  - Fake provider: deterministic. analyze → `{is_infrastructure:true, category_slug:"road",
    description:"[Uji AI] Terlihat lubang pada permukaan jalan.", observations:["Lubang pada aspal"]}`;
    embed → feature-hashing of lowercased words into 1536 dims, L2-normalized (similar texts →
    similar vectors); generate_json → `{"summary": "[Uji AI] Ringkasan tidak tersedia.", "highlights": []}`.
- `POST /api/ai/analyze-photo` (auth, multipart `image`; jpg/png/webp ≤8 MB):
  - Downscale to ≤1024 px JPEG, strip EXIF, send image only (no location, no user data).
  - Response 200 `{is_infrastructure, category_slug|null, description, observations[], requires_review:true, log_id}`.
    `category_slug` not an active Category slug → null. description ≤600 chars, observations ≤5.
  - AIUnavailable/timeout → 503 `{"detail":"Analisis AI tidak tersedia. Silakan isi laporan secara manual.","fallback":"manual"}`.
  - Throttle scope `ai_analyze` 10/hour per user.
- System prompt (Indonesian output) must state: describe only what is visible; do not judge
  technical severity or urgency; do not identify people or plate numbers; pick category only
  from the given list or null; set is_infrastructure=false if no public infrastructure problem.

## Touch
- `backend/ai_services/**`, `backend/config/settings.py` (throttle rate only)

## Do not touch
- `backend/reports/` (read Category only), other apps

## Decisions
- No confidence score in MVP (self-reported model confidence is not a validated metric);
  the UI shows "Perlu ditinjau" instead. AI output is a suggestion, never final.
- Default models: gpt-4o-mini (vision + text), text-embedding-3-small; overridable by env.
- Tests never call OpenAI: use fake provider or mock the OpenAI client.
