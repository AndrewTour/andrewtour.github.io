# AGNT v1.41.23 — Scheduled-Day Visual Balance

Built directly from confirmed AGNT v1.41.22.

## Changes

- Centres the five scheduled-day quick actions equally between their dividers.
- Simplifies leaderboard context to `position • agents logged` and gives its label, rank and context separate lines.
- Aligns the MarketPulse shortcut with the focus chevron.
- Makes Back return to Home when Broadcast or a contact profile was opened through a Home quick action.
- Leaves the focus stack and metric structure and sizing unchanged.

## Data and Firebase

- No Firebase configuration, Authentication, Firestore rules, indexes, paths, UID separation or sync behaviour changed.
- No stored data shape, local-storage key or session-storage key changed.
- No save, load, MarketPulse, call-outcome, startup or PWA workflow changed.

## Deployment

Replace the current GitHub Pages files with the complete contents of this package. No Firebase Console or GitHub configuration change is required.
