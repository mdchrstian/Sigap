# Officer table header not sticky
Repro: /petugas at 1280px, scroll 600px, thead top = -221px.
Root cause: Layout.tsx wrapper `overflow-x-hidden` makes overflow-y auto, so it becomes the sticky scroll container.
Fix: `overflow-x-clip` (no scroll container). Also tab underline border-b-4 -> border-b-[3px] per spec.
