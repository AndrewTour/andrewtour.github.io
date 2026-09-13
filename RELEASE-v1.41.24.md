# AGNT v1.41.24 — Quick Actions Stability

Built directly from AGNT v1.41.23.

## Changes

- Routes scheduled-day and non-scheduled-day quick buttons through the same Home event handler.
- Restores Call, Add Task, Book Appointment, Search Contacts and Bulk SMS on scheduled working days.
- Removes automatic Search-field focus during navigation, avoiding a redundant render/focus transition in the installed iPhone PWA.
- Preserves the existing destination workflows and conditional Back-to-Home behaviour.

## Data and Firebase

- No Firebase configuration, Authentication, Firestore rules, indexes, paths, UID separation or sync behaviour changed.
- No stored data shape, local-storage key or session-storage key changed.
- No save, load, MarketPulse, call-outcome or startup workflow changed.

## Deployment

Replace the current GitHub Pages files with the complete contents of this package. No Firebase Console or GitHub configuration change is required.
