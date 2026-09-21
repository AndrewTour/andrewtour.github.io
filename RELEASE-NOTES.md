# AGNT v1.42.0 — Communication and appointment context

Baseline: approved v1.41.42 Storage Warning Fix.

## What changed

- Appointments can retain an optional context note, including context carried from Buyer Match, Prospecting and MarketPulse booking flows.
- Upcoming and past appointment cards display that context without changing the approved card design.
- Upcoming appointments are grouped into Today, Tomorrow and Later; past appointments are grouped into Needs Outcome, Follow-Up and Completed.
- Appointment confirmation and follow-up SMS actions open directly in Messages, with no in-app preview.
- AGNT asks whether the SMS was sent after returning, then records it once without duplicate entries.
- Buyer property-match messages use consistent paragraphs and numbered formatting for multiple properties.
- Hotspotting SMS is now logged only after confirmed sending.
- Appointment context is included in Apple and Outlook calendar exports and team appointment assignments.

## Files

- app.js: appointment context, SMS formatting, confirmed-send handling and history grouping.
- index.html: appointment context field and release references.
- cleanup.css: restrained context, grouping and control styles.
- runtime.js: release identifier only.
- service-worker.js: release cache identifier and integrity checks only.
- RELEASE-NOTES.md: these notes replace the previous release notes.

## Preservation

Firebase configuration, authentication, UID separation, existing Firestore paths and rules, metrics, calculations, navigation and all existing workflows remain intact. Existing appointments remain compatible; context is optional.

## Verification note

Syntax, static references, focused appointment/SMS logic and package integrity were validated. Physical iPhone, live Firebase and production GitHub Pages behaviour still require real-device verification.
