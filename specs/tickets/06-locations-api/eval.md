# Eval 06

## How to verify
- DB: `docker compose -f docker-compose.test.yml up -d --wait`
- Unit: `cd backend && uv run pytest locations -q`

## Checks
| # | Check | Type | Expected |
|---|-------|------|----------|
| 1 | is_in_bali(-8.65, 115.22) Denpasar | unit | True |
| 2 | is_in_bali(-6.2, 106.8) Jakarta | unit | False |
| 3 | reverse_geocode with county "Kabupaten Gianyar" | unit | regency "Gianyar" |
| 4 | reverse_geocode with city "Kota Denpasar" | unit | regency "Denpasar" |
| 5 | second identical reverse call | unit | requests called once (cache) |
| 6 | GET /api/locations/search?q=ab | unit | 400 |
| 7 | search upstream timeout | unit | 503 |
| 8 | reverse outside Bali | unit | 200 in_bali false, no upstream call |
| 9 | User-Agent header sent | unit | equals setting value |

## Edge cases
- Nominatim returns [] -> search returns [], reverse returns empty strings

## Done means
All checks PASS, no file outside "Touch" changed, work committed on the ticket branch.
