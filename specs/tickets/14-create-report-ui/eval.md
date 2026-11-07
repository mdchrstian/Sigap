# Eval 14

## How to verify
- Unit: `cd frontend && npx vitest run src/features/create-report src/components/LocationPicker`
- UI: DB `docker compose -f docker-compose.test.yml up -d --wait`; backend (AI_PROVIDER=fake)
  `cd backend && uv run python manage.py migrate && uv run python manage.py runserver 8000`;
  `cd frontend && npm run dev`; log in as a registered user

## Checks
| # | Check | Type | Expected |
|---|-------|------|----------|
| 1 | analyze-photo mocked 503 | unit | manual notice, empty form, can continue |
| 2 | analyze-photo success | unit | category + description prefilled, "Perlu ditinjau" badge |
| 3 | duplicates decision low | unit | goes straight to Kirim |
| 4 | duplicates high | unit | candidate preselected, "Bukan masalah yang sama" available |
| 5 | reverse in_bali false | unit | Next disabled with Bali message |
| 6 | full flow with a jpg, click map in Denpasar | ui | lands on /laporan/{id} with the report |
| 7 | 2nd report same spot, same text | ui | similar-report step shows the 1st report |
| 8 | stop backend AI (AI_PROVIDER=openai, no key) | ui | manual fallback works, report submitted |
| 9 | 375px viewport | ui | all steps usable, no horizontal scroll |
| 10 | `npm run lint` | unit | exit 0 |

## Edge cases
- Geolocation denied -> message, map still usable; 4th photo -> rejected with message

## Done means
All checks PASS, no file outside "Touch" changed, work committed on the ticket branch.
