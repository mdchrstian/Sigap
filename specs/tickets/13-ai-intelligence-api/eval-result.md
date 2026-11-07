| # | Check | Result | Evidence (1 line) |
|---|-------|--------|-------------------|
| 1 | officer POST, fake provider | PASS | test_officer_fake_provider: 200 with summary, highlights, based_on, generated_at keys (7/7 pytest pass) |
| 2 | public user POST | PASS | test_public_forbidden: 403; probe: 25 public POSTs all 403 |
| 3 | mocked AI returns number not in stats ("999 laporan") | PASS | test_bad_number_summary: verified False, summary is fallback "Ringkasan AI tidak dapat diverifikasi terhadap data." |
| 4 | mocked AI highlight with bad number | PASS | test_bad_highlight_dropped: highlights == ["Total 0"], verified False |
| 5 | payload sent to AI (mock inspect) | PASS | test_payload_aggregates_only plus probe: no email, full_name, report text or address in payload; top-level keys exactly the aggregate set plus previous_period |
| 6 | AIUnavailable | PASS | test_unavailable: 503 and detail "Ringkasan AI tidak tersedia saat ini." |
| 7 | same params twice | PASS | test_cached: generate_json called exactly once for two identical POSTs |
| E1 | No reports -> still 200, based_on.total 0 | PASS | test_officer_fake_provider on empty DB: 200 and based_on.total == 0 |
| T1 | 20/hour throttle (ai_insights, requested) | PASS | probe: requests 1-20 return 200, request 21 returns 429; 429 request makes no AI call; limit is per user; a second officer is unaffected |
| D1 | Done: no file outside Touch changed | PASS | removed tests/__init__.py; tests run without it (15 passed) |
| D2 | Done: work committed on ticket branch | PASS | Clean tree; HEAD 4bcf3d1 "feat(dashboard): AI insights endpoint" on ticket/13-ai-intelligence-api |
