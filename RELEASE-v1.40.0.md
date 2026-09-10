# AGNT v1.40.0 — Consistency and Orchestration

## Refined behaviour

- Restores the signed-in user's last safe app location after refresh, backgrounding or reopening the installed PWA.
- Retains the active tab, Today subpage, Prospector section, supported list modes, selected date, stable scroll position and read-only Contact or Buyer profile.
- Keeps transient overlays, confirmations and editors out of automatic restoration; existing draft and active-session recovery remains authoritative.
- Makes the Home `Right Now` surface action-aware. When the current priority already has a defined AGNT action, tapping it opens that destination directly; otherwise it opens the Today timeline.
- Keeps all restoration data UID-scoped and expires stale workspace state after 30 days.

## Protected systems

- No Firebase configuration, authentication, Firestore paths, rules, indexes or data-shape changes.
- No changes to metrics, timer calculations, MarketPulse import, local-first sync, contact identity or deployment settings.
