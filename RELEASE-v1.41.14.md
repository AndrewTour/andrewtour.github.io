# AGNT v1.41.14 — Stability & Trust

Built incrementally from the confirmed AGNT v1.41.13 Balanced Right Now release.

## Changes

- Every in-app telephone link now primes an outcome workflow before iOS opens the Phone app. Existing Buyer, Buyer Match and Pipeline workflows remain unchanged; appointment calls use the existing appointment outcome return, while otherwise unclassified calls use the existing manual-call outcome.
- A seven-second authentication watchdog releases the startup loading gate to the existing sign-in/device-only screen if Firebase authentication does not resolve. A late valid authentication response can still enter live sync safely.
- Settings now reports the actual offline, saving, error or live sync state rather than inferring sync health from Firebase availability alone.
- Complete backup export now includes daily data, settings, appearance, contacts, buyers, interactions, MarketPulse records/history, campaigns, test launches and the imported Buyer List session. Restore requires confirmation, merges records by ID without deleting current records, saves locally first and then uses the existing background cloud queues.
- Frequently used small actions have larger touch areas, and the lowest-contrast orange and blue control states have been corrected in light and dark appearance.

## Protected behaviour

- Firebase configuration and Firestore rules are byte-for-byte unchanged.
- Firestore document and collection paths, UID-scoped local storage, Team membership and leaderboard paths, MarketPulse automation, cloud retry queues, manifest and icons are unchanged.
- The only service-worker change is the v1.41.14 cache identifier and matching asset query strings.
- No Firebase Console, Firestore migration or GitHub configuration change is required.
