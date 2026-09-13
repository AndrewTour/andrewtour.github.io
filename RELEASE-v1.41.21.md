# AGNT v1.41.21 — Viewport Containment

This incremental release is built directly from confirmed AGNT v1.41.20.

## Changes

- Keeps Next Workday, the five quick actions and the Next Conversations heading fixed on the current unscheduled-day Home screen.
- Makes only the Next Conversations rows vertically scrollable.
- Reduces the complete Next Conversations typographic stack by 20%; action target heights are unchanged.
- Prevents clipping in the single-line Home greeting.
- Keeps appointment form fields, contact results, appointment types, destination cards, history headings and action buttons inside the safe viewport.

## Data and Firebase

- No Firebase configuration, Authentication, Firestore rules, indexes, collection paths, document paths, UID separation or sync behaviour changed.
- No local-storage or session-storage key changed.
- No MarketPulse, save, load, startup or PWA workflow changed.

## Deployment

Replace the current GitHub Pages files with the complete contents of this package. No Firebase Console or GitHub configuration change is required.
