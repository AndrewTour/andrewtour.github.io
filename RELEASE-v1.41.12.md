# AGNT v1.41.12 — Buyer Call Return

## Buyer List calls

The Buyer List now records the prepared call outcome in the active PWA session before iPhone opens the phone app. A device-local copy remains available if iOS rebuilds the PWA while the call is in progress. When the PWA returns, the prepared outcome opens before maintenance, rendering or cloud work begins. No Firebase, cloud, elapsed-time or call-completion verification controls whether the outcome screen opens.

## Today priority

Seller rescheduling now creates an immediate in-memory suppression as well as the retained deferral. This prevents stale priority ranking work from placing the same seller back into the title after the action succeeds.

## Header

- Previous and next day controls are constrained inside the viewport.
- Today is hidden on the current calendar date.
- Today appears only when the active Today, Schedule or Appointments date differs from the current date.

## Unchanged systems

Firebase configuration, Firestore rules and paths, Team sync, leaderboard publishing, MarketPulse automation, Buyer List retention, contact drafts, valuation logic, manifest and icons are unchanged.
