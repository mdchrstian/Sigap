# Eval 07

## How to verify
- DB: `docker compose -f docker-compose.test.yml up -d --wait`
- Unit: `cd backend && uv run pytest ai_services -q`

## Checks
| # | Check | Type | Expected |
|---|-------|------|----------|
| 1 | analyze-photo fake provider, jpg | unit | 200, category_slug "road", requires_review true |
| 2 | analyze-photo unauthenticated | unit | 401 |
| 3 | mocked OpenAI returns slug "bridge" | unit | category_slug null |
| 4 | mocked OpenAI raises timeout | unit | 503 with fallback "manual"; log status failed |
| 5 | success path | unit | AIProcessingLog row kind analyze_photo, success |
| 6 | image sent to OpenAI (mock inspect) | unit | ≤1024 px, no EXIF |
| 7 | fake embed_text length + norm | unit | 1536, norm ≈ 1.0 |
| 8 | fake embed similar vs unrelated text | unit | cosine(similar) > cosine(unrelated) |
| 9 | 11th call in an hour | unit | 429 |
| 10 | .gif upload | unit | 400 |

## Edge cases
- OpenAI returns invalid JSON -> 503 fallback, log failed

## Done means
All checks PASS, no file outside "Touch" changed, work committed on the ticket branch.
