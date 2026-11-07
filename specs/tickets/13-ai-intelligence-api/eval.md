# Eval 13

## How to verify
- DB: `docker compose -f docker-compose.test.yml up -d --wait`
- Unit: `cd backend && uv run pytest dashboard/tests/test_insights.py -q`

## Checks
| # | Check | Type | Expected |
|---|-------|------|----------|
| 1 | officer POST, fake provider | unit | 200 with summary, highlights, based_on |
| 2 | public user POST | unit | 403 |
| 3 | mocked AI returns number not in stats ("999 laporan") | unit | verified false, fallback summary |
| 4 | mocked AI highlight with bad number | unit | that highlight dropped |
| 5 | payload sent to AI (mock inspect) | unit | contains only aggregates, no emails/names |
| 6 | AIUnavailable | unit | 503 Indonesian detail |
| 7 | same params twice | unit | generate_json called once |

## Edge cases
- No reports -> still 200, based_on.total 0

## Done means
All checks PASS, no file outside "Touch" changed, work committed on the ticket branch.
