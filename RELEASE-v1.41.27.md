# AGNT v1.41.27 — Hot Spotting SMS Flow

## Scope

This is an incremental Hot Spotting workflow refinement built from the confirmed v1.41.26 Weekly Appointments and Seller Actions release.

## Changes

- No-answer and left-voicemail call outcomes save locally without waiting for Firestore.
- After the outcome is recorded, AGNT immediately presents one established confirmation surface: `SMS <client>` with `Send SMS` and `Skip`.
- `Skip` advances to the next Hot Spotting contact.
- `Send SMS` opens the prefilled contextual MarketPulse message, logs the SMS contact note locally, starts background sync, and advances the saved session queue before AGNT leaves for Messages.
- Duplicate queue advancement is guarded at the decision surface.
- The manual Hot Spotting SMS button and its existing review/confirmation workflow are unchanged.
- All v1.41.26 weekly appointment, quick-action, call-outcome, seller-priority, and UI refinements are retained.

## Firebase implications

None. Firebase configuration, authentication, Firestore rules, collection/document paths, UID separation, payload structure, and sync strategy are unchanged. Existing day metrics and prospect interactions continue to use the established local-first save paths and background cloud queues.

## Validation

- Application and service-worker JavaScript syntax checks.
- Existing regression suite, including v1.41.26 weekly appointment and seller-action coverage.
- Focused Hot Spotting checks for immediate background saves, SMS-note creation, metric-path preservation, single queue advancement, and both decision actions.
- Protected-file byte comparison against v1.41.26.
