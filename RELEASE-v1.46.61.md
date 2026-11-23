# AGNT v1.46.61 — Performance toolbar

Based on the v1.46.60 Reminder Checks PWA release.

- Leaderboard and Overview share one row with Daily, Weekly and the team connection status. A divider separates the view tabs from the leaderboard controls.
- Your Day or Your Week starts directly below that row. Removing the leaderboard guidance footer gives the rankings more scrolling space.
- Period switching, date history, agent appointment summaries and Overview retain their existing behaviour.

Upload the archive contents to the existing GitHub Pages source, preserving the `icons/` and `android/` directories. The release updates the service worker cache version. Firebase, Firestore rules and indexes, and GitHub Pages settings require no changes.
