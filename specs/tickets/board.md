# Board — Sigap MVP

Edit statuses with `.claude/scripts/board.sh set <ID> <status>`.
Status: draft | ready | running | done | blocked. Started is filled by the script.

| ID | Ticket | Status | Mode | Runs | UI | Started |
|----|--------|--------|------|------|----|---------|
| 01 | 01-backend-foundation | done | solo | alongside | no | - |
| 02 | 02-frontend-foundation | done | solo | alongside | yes | - |
| 03 | 03-auth-api | done | solo | after:01 (User model, settings) | no | - |
| 04 | 04-auth-ui | done | solo | after:02,03 (api client, auth endpoints) | yes | - |
| 05 | 05-reports-core-api | done | solo | after:03,06 (permissions, is_in_bali) | no | - |
| 06 | 06-locations-api | done | solo | after:01 (project skeleton) | no | - |
| 07 | 07-ai-report-assistant-api | done | solo | after:05 (Category model) | no | - |
| 08 | 08-duplicate-detection-api | done | solo | after:05,07 (geo.nearby, embed_text) | no | - |
| 09 | 09-status-tracking-api | ready | solo | after:05,08 (both edit reports/serializers.py) | no | - |
| 10 | 10-notifications-api | draft | solo | after:09 (status history signal) | no | - |
| 11 | 11-comments-api | done | solo | after:05 (Report, images helper) | no | - |
| 12 | 12-analytics-api | draft | solo | after:09 (IsOfficer, statuses) | no | - |
| 13 | 13-ai-intelligence-api | draft | solo | after:07,12 (generate_json, compute_summary) | no | - |
| 14 | 14-create-report-ui | ready | solo | after:04,06,07,08 (auth, geocode, AI, duplicates) | yes | - |
| 15 | 15-explore-map | done | solo | after:04,05 (layout, reports) | yes | - |
| 16 | 16-report-detail-ui | draft | solo | after:04,09,11 (history, comments API) | yes | - |
| 17 | 17-officer-dashboard-ui | draft | solo | after:04,09,12 (officer API, summary) | yes | - |
| 18 | 18-notifications-ui | draft | solo | after:04,10 (TopNav, notifications API) | yes | - |
| 19 | 19-analytics-ui | draft | solo | after:13,17 (insights API, officer pages) | yes | - |
| 20 | 20-demo-seed-readme | draft | solo | after:08,09,11 (services to seed with) | no | - |
