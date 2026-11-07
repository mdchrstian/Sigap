# Bug: TopNav user menu did not open in agent-browser
Result: NOT a product bug. Menu works; failure was an agent-browser session artifact.

Repro (vite dev, mock API for /api/auth/me and /api/notifications/unread-count, token in localStorage key sigap.tokens, viewport 1280x800):
- Long-lived agent-browser session (after `set viewport`): click on "Budi" button, Enter key, and raw mouse down/up all failed. A debug console.log in onClick never fired, and even the "Beranda" link did not navigate. So no click reached the page at all; unrelated to TopNav.
- Fresh session (`agent-browser close`, reopen, set token, open /notifikasi): `find role button click --name Budi` fires onClick, aria-expanded=true, dropdown shows Profil and Keluar.

Keluar check: computed color rgb(180, 35, 24) = --color-danger #b42318; screenshot shows it red. 1d6d009 fix verified.

Note: the button is `hidden md:block`, visible only at >=768px; on mobile the same Keluar is in the hamburger menu (also text-danger).
Tip: restart agent-browser (`close`) if clicks stop registering.
