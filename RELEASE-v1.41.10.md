# AGNT v1.41.10 — Simple Return State

## Restored beta behaviour

- Removed general workspace persistence for tabs, dates, profiles, subpages and scroll positions.
- Retained the beta contact-draft persistence used while entering a new contact.
- Contact and Pipeline call-return functions remain identical to the supplied beta.
- Imported Buyer Lists remain isolated local sessions and retain the v1.41.9 primary/backup protection.

## Call outcome

- The manual Call button writes one fixed device-local pending-call record before opening the Phone app.
- Returning to AGNT reads that local record and opens the existing call-outcome screen.
- Firebase, UID restoration, cloud availability and Firestore do not determine whether the prompt appears.
- The pending record is cleared through the existing completed/cancelled outcome workflow.

## Current day

- A fresh app launch always resets the selected and appointment dates to today.
- Foregrounding after midnight and the running 30-second maintenance check both move AGNT to the new day and its unlocked Today screen.

## Protected systems

- Firebase configuration, Authentication, Firestore rules/paths/indexes, Team sync, leaderboard publishing, MarketPulse automation, valuation guardrails, logging metrics, manifest and icons are unchanged.
- Only `app.js`, release documentation, regression checks and cache-version references changed.

## Validation

- JavaScript syntax and the complete regression suite pass.
- Automated checks confirm that workspace restoration is absent, the manual-call key is device-local, contact drafts remain, Buyer List retention remains and daily rollover updates both active dates.
- Physical iPhone PWA testing remains required after deployment.
