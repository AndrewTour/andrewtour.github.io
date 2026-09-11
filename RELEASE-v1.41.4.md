# AGNT v1.41.4 — Team Sync Restoration

## Scope

This release changes Team/cloud synchronisation only. It was audited against the supplied confirmed-working `AGNT-beta-main 4.zip`.

## Restoration

- Restores the beta release's direct Team leaderboard schedule, publish and live-listener flow.
- Removes the additional Team leaderboard dirty-marker and retry wrapper introduced in v1.41.3.
- Retains the memory-only Firestore web cache so the failed persistent browser cache shown in the supplied iPhone error cannot intercept writes.
- Replays existing UID-scoped dirty daily records through the direct day-write path before the current Team leaderboard payload is published.
- Preserves locally newer unsynced day data until Firestore confirms it.

## Unchanged

- Firebase project configuration, Authentication, Firestore paths, rules, indexes and UID separation.
- Team membership, roles, joining, leaving, management and appointments.
- Buyers, contacts, prospecting, MarketPulse automation, Today orchestration, navigation and design.
- Manifest, icons and visual styles.
