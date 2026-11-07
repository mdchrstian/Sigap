# Bug: report detail page blank after create with AI suggestion

Repro (read-only): GET /api/reports/3 returns ai.suggested_category as an object {id,slug,name}
(serializers._cat). ReportDetailView rendered it directly inside <p>, so React throws
"Objects are not valid as a React child" ("above error occurred in the <p> component") and the
whole page unmounts (no error boundary).

Fix: frontend normalizes category via catName() and stringifies non-string observations.

The /media/... 404 is a separate, environmental issue (STORAGE_BACKEND=local with a different
worktree's MEDIA_ROOT); the page only shows a broken img for it, not a crash.
