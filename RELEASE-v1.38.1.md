# AGNT v1.38.1 — Review Stats

Built directly on AGNT v1.38.0.

## Changes

- Restored the v1.37.9 native share-first vCard contact flow and its `.vcf` download fallback.
- Removed the Open Today Log shortcut from the Today heading.
- Kept the existing Send Stats action unchanged.
- Added Send Stats to the end-of-day review screen.
- Changed the end-of-day entry and review heading to **Review Day and Send Stats**.

## Preserved

- Daily statistics continue to count knocked doors rather than knocking time and omit zero-value rows.
- Existing task, Prospector, Today Log and completed Knocking refinements remain in place.
- Firestore rules, authentication, data storage, appointments, teams, manager access and MarketPulse are unchanged.

## Validation

- JavaScript and service-worker syntax checks.
- Full dependency-free regression suite.
- Contact flow, Send Stats, end-of-day action, duplicate-ID and cache-reference checks.
- ZIP integrity check.
