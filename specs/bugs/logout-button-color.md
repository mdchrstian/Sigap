# Bug: Keluar button not red
Repro: log in, open /profil or the nav menu; Keluar shows ink border/text.
Root cause: Button already has a danger variant; ticket 24 used secondary plus className border-danger text-danger, which loses to variant classes. Nav buttons used text-ink.
Fix: ProfilePage uses variant="danger"; TopNav Keluar buttons use text-danger without text-ink.
