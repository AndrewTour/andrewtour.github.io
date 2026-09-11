# AGNT v1.41.9 — Buyer Session Resume

## Corrected behaviour

- A confirmed imported Buyer List remains available after the installed iPhone PWA is fully closed and reopened.
- iOS suspension no longer recalculates an active Buyer List as hidden immediately before saving it.
- Buyer List state is written to a primary and backup UID-scoped local record and the primary write is verified.
- If the primary record is unavailable or malformed, AGNT restores the backup and repairs the primary copy.
- If device storage prevents retention, AGNT shows a clear warning while the in-memory list remains usable.
- A pending call launched from an imported Buyer List is checked after Firebase authentication restores the correct UID. The existing manual call-outcome screen then opens above the restored Buyer List.

## Scope protection

- Built directly from v1.41.8.
- Contact and Pipeline call behaviour remains on the beta implementation restored in v1.41.8.
- Firebase configuration, Authentication, Firestore rules/paths/indexes, Team sync, leaderboard publishing, MarketPulse automation, valuation guardrails, logging metrics and prospecting cloud data are unchanged.
- Manifest and icons are unchanged. Only the cache marker was updated.

## Validation

- JavaScript syntax and the complete regression suite pass.
- Automated tests cover primary Buyer List persistence, backup recovery, authenticated startup call restoration and non-destructive PWA suspension.
- Protected Firebase, Firestore, MarketPulse automation, styling, manifest and icon files remain unchanged from v1.41.8.
- A physical iPhone PWA call-and-relaunch test remains required after deployment.
