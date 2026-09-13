# AGNT v1.41.22 — Scheduled-Day Quick Actions

This incremental release is built directly from confirmed AGNT v1.41.21.

## Changes

- Moves the live leaderboard position into the former Day-on-Day graph position.
- Replaces the former leaderboard strip with the existing five-action quick menu.
- Reuses the established Call, Add Task, Book Appointment, Search and Bulk SMS handlers.
- Leaves the focus stack and all daily metrics structurally and behaviourally unchanged.

## Data and Firebase

- No Firebase configuration, Authentication, Firestore rules, indexes, collection paths, document paths, UID separation or sync behaviour changed.
- No local-storage or session-storage key changed.
- No save, load, MarketPulse, call-outcome, startup or PWA workflow changed.

## Deployment

Replace the current GitHub Pages files with the complete contents of this package. No Firebase Console or GitHub configuration change is required.
