# AGNT v1.56.9 — Local Storage Efficiency

Built from the confirmed working AGNT v1.56.8.1 release.

## Changes

- Daily records, profile settings and Prospector data now use independent local save paths.
- A change to one category no longer serialises and rewrites every other category.
- Prospector cache writes are deferred briefly to keep session and contact interactions responsive.
- Deferred writes are flushed when the app is hidden or closed.
- Local writes skip unchanged values.
- The existing daily recovery backup remains in place.
- Added a local cache schema marker for future controlled migrations.

## Untouched

- Firebase configuration, authentication and Firestore paths.
- Firestore security rules and UID separation.
- All visible layouts and workflows.
- Session queue, outcome logging and metric logic.
- Contacts, appointments, Home and leaderboards.

## Deployment

Replace the existing GitHub Pages files with the contents of this ZIP. No Firebase or GitHub settings changes are required.

## Previous release notes

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
