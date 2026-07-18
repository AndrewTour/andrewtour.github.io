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


## v1.37.0
- Replaced follow-up text prompts with an iOS-native date input inside an AGNT sheet.
- Replaced appointment outcome text prompts with a branded in-app outcome selector and optional note field.
- No Firebase, Firestore, authentication, metric, calendar export or scoring changes.


## v1.37.2
- Restored the previous appointment history source and rendering behaviour.
- Added separate Past Appointments and Upcoming Appointments history tabs, with Past first.
- Preserved the selected-day appointment log at the bottom of the Appointments page.
- Kept appointment creation, storage, follow-up and outcome workflows unchanged.


## v1.37.3

- Appointment Log now shows only appointments booked on the selected day, using the original booking timestamp where available.
- Past and Upcoming screens now classify every appointment from its scheduled timestamp compared with the current time.
- Future appointments booked on earlier days are retained and displayed in Upcoming Appointments.
- Follow-ups scheduled for the selected date appear as AM-priority items in the Today timeline with contact details and a Call button.
- Existing appointment history, Firebase paths, follow-up UI, outcome UI and daily appointment storage remain unchanged.


## v1.37.4
- Past appointment follow-up flow is Set Follow-Up → Mark Followed Up → action removed when complete.
- Selected outcomes now replace the Update Outcome button label while remaining editable.
- Upcoming appointments restore Add to Calendar with the saved green/ticked state.
- No Firebase, history, logging, timeline or sync changes.
