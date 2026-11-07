# Eval 24

## How to verify
- Unit: `cd frontend && npm test -- create-report auth && npm run lint`
- Design guard: `cd frontend && npm run check:design -- src/pages/CreateReportPage.tsx src/pages/LoginPage.tsx src/pages/RegisterPage.tsx src/pages/ProfilePage.tsx src/features/create-report src/components/LocationPicker.tsx`
- UI: `cd backend && uv run python manage.py runserver` + `cd frontend && npm run dev`, log in as the demo user

## Checks
| # | Check | Type | Expected |
|---|-------|------|----------|
| 1 | Render `/lapor` with `state.photo` = File | unit | photo preview appears on the Foto step, not auto-advanced |
| 2 | analyzePhoto mock rejects (503) | unit | notice "AI sedang tidak tersedia..." + empty category/description form |
| 3 | StepNav current step | unit | `aria-current="step"` on the active step |
| 4 | Login error 401 | unit | error box role=alert |
| 5 | Password toggle | unit | input type changes password<->text, button has an aria-label |
| 6 | All old create-report & auth tests (adjusted) | unit | pass |
| 7 | check:design on the Touch paths | unit | exit 0 |
| 8 | Full wizard at 390px: photo -> location -> AI draft -> submit | ui | every button ≥48px, no horizontal scroll, success screen with code |
| 9 | Keyboard only through the wizard | ui | every control reachable, focus ring visible |
| 10 | `/masuk`, `/daftar`, `/profil` at 390 and 1280px | ui | centred Panel, labels visible, consistent spacing |

## Edge cases
- `state.photo` not a File (string/undefined) -> ignored, normal empty Foto step
- Very long AI description -> Textarea grows/scrolls, layout intact
- Geolocation denied -> danger message under the location button, can still search manually

## Done means
All checks PASS, no file outside "Touch" changed, work committed on the ticket branch.
