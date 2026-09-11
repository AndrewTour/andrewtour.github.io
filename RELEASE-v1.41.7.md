# AGNT v1.41.7 — Call Outcome Restoration

## Corrected workflow

- Pressing Call from a Contact, Follow-up or Pipeline workflow records a pending outcome before AGNT opens the iPhone Phone app.
- Returning to AGNT automatically opens the existing Log Contact outcome screen.
- The pending outcome survives normal backgrounding, a cold PWA restart and ordinary workspace restoration.
- Saving or cancelling the outcome clears the pending state.
- Booking an appointment from the outcome clears the pending state when the booking is completed or cancelled.
- An abandoned pending call expires after two hours.

## Reliability protections

- Pending call state is UID-scoped and cannot be restored into another user's session.
- A startup lifecycle event cannot discard the state before that user's contacts have loaded.
- Repeated iOS focus, page-show and visibility events do not duplicate the outcome screen.
- The established Contact outcome form, logging metrics and background cloud save remain unchanged.

## Protected systems

- Built directly from the confirmed-working v1.41.6 release.
- Firebase configuration, Authentication, Firestore rules, paths and indexes are unchanged.
- Team sync, leaderboard publishing, local recovery and offline queues are unchanged.
- MarketPulse ingestion, automation, seller intelligence and valuation guardrails are unchanged.
- Buyer profiles, appointments, navigation, manifest and icons are unchanged apart from the required release cache marker.
- No Firebase Console or GitHub configuration changes are required.
