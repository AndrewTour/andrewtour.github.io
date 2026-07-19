# AGNT v1.56.8 — Safe Sync Efficiency

Built incrementally from the confirmed working v1.56.7 package.

## Changed

- Added a per-user dirty-day retry queue so reconnecting retries only day records that genuinely remain unsynced.
- Successful day writes clear their matching retry item without clearing newer local changes.
- Unchanged leaderboard payloads are no longer republished.
- Day, profile, Prospector and leaderboard listeners avoid full interface renders when their underlying data has not changed.
- Added central pending-operation tracking so the sync badge does not report Live while another save is still running.
- Sync errors remain visible until a confirmed reconnect or successful server snapshot clears them.

## Unchanged

- All screens and visible workflows
- Prospector sessions and outcome-to-metric logic
- Authentication and Firebase configuration
- Firestore paths and security rules
- UID separation and existing stored data shapes
- Contacts, appointments, Home and leaderboard behaviour

No Firebase Console, Firestore rules or GitHub settings changes are required.


## v1.56.8.1 — Login Initialisation Fix

- Restored the viewport/bootstrap functions accidentally omitted in v1.56.8.
- Firebase Auth now initialises before login actions are available.
- No changes to sync efficiency logic, app screens, data structures, Firebase paths, or rules.
