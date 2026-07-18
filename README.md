# AGNT v1.36.1 — Appointment UI Refinement

Incremental update built from the confirmed working v1.34.2 package.

## Added
- Upcoming, Follow-Up and Completed appointment filters.
- Follow-up due dates with tomorrow, three-day, next-week or custom-date options.
- Quick Call, Mark Followed Up and Update Outcome actions.
- Outcomes: Still Nurturing, Price Update Booked, Listing Appointment Booked, Signed and Not Proceeding.
- Optional appointment outcome notes.
- Due-today and overdue follow-up labels.
- Smart Coach reminders when past appointments need an outcome.
- Weekly Scorecard appointment outcome summary and follow-up actions.

## Compatibility
Appointment follow-up information is stored as optional fields on existing appointment objects. Existing records remain compatible. Firebase paths, Firestore rules, authentication, UID separation, metric logging, calendar export, local cache and sync architecture are unchanged.


## v1.36.1
- Restored the login subtitle to sentence case.
- Standardised displayed appointment times to the `6:18PM` format.
- Matched Scorecard Update Outcome actions to the Call button height, width and alignment.
- No functional, Firebase, Firestore, authentication, sync or data-model changes.


## v1.36.2
- Replaced follow-up text prompts with an iOS-native date input inside an AGNT sheet.
- Replaced appointment outcome text prompts with a branded in-app outcome selector and optional note field.
- No Firebase, Firestore, authentication, metric, calendar export or scoring changes.
