# Bug: password eye toggle detached at 390px (/masuk, /daftar)
Repro: agent-browser --session x set viewport 390 800; open /masuk (or /daftar); screenshot.
Cause: password row was `flex gap-2` with a separate quiet Button, so the toggle sat beside the input with a gap.
Fix: row is `relative`; input `w-full pr-14`; button `absolute right-0 top-0 h-12`. Verified visually at 390px on both pages; tsc lint and auth tests (5) pass.
