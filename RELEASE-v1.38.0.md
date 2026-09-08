# AGNT v1.38.0 — Workflow Polish

Built directly on AGNT v1.37.9.

## Changes

- Replaced the contact share/download flow with a direct iOS contact-card handoff. iOS still presents its native confirmation before a contact is saved.
- Updated the task composer title to **Add a task** and aligned its contrast, field sizes, spacing, close control and submit button across light and dark mode.
- Applied the established green completed state to the Knocking completion message.
- Reworked the Prospector Today Call and New Contact actions into a cohesive equal-width row without changing the content or layout below it.
- Added **Open Today Log** beside the Today heading.
- Added **Send Stats** inside Today Log. WhatsApp receives a prefilled, newline-separated summary of non-zero calls, knocked doors, connects, data, LAP, MAP and BAP totals for the selected day.

## Preserved

- Existing contact records and field mapping.
- Daily metric, appointment, knocking-session and MarketPulse logic.
- Firebase, Firestore, authentication, team and manager functionality.
- The all-inclusive Firestore rules supplied with v1.37.9.

## Validation

- JavaScript and service-worker syntax checks.
- Existing dependency-free regression suite plus source checks for the new Today, WhatsApp, contact handoff and completion-state paths.
- Duplicate-ID and cache-reference checks.
- ZIP integrity check.
