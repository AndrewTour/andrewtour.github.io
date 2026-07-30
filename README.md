# AGNT V91 — Booking / Editor Header Separation

Incremental update built from V90.

## Changed
- Removed the APPOINTMENTS, Editing Appointment and close controls from the normal new-appointment booking form.
- Kept those controls visible only inside the isolated editor when an existing appointment is being edited.
- Preserved the embedded yellow follow-up metric in the Past Appointments card.

## Unchanged
Firebase, authentication, Firestore paths and rules, UID separation, local cache, sync, appointment data and save logic, navigation, scoring and unrelated UI.

## V95.9
- Follow-up controls now use a single empty circle until an outcome is saved.
- Time-based timeline items remain active until the next timed item begins.

## V103.1.1
- Active prospecting session UI remains on Today while Contacts, Pipeline and Insights stay usable.
- Session progress uses lowercase ‘of’.
- Contacts with any logged event in the previous 21 days are excluded from session rotation.

## V105
- Uses one fresh, shared 50-contact daily prospecting queue for both the Today dashboard and session.
- Applies the 21-day interaction exclusion before selecting the daily 50.
- Dashboard remaining count reduces from the same queue as session outcomes are logged.
- Preserves lowercase “of” in the session progress counter.


## V106 — Appointment contact search and session hand-off
- Appointment contact name searches existing AGNT contacts and can prefill name, number and address.
- Selected appointments retain the linked prospect ID when available.
- Session outcome ‘Appointment booked’ opens the appointment form prefilled for that contact.
- The prospecting outcome is only saved after the appointment booking is successfully completed.
- Cancelling the booking returns safely to the active prospecting session.
- No Firebase paths, rules, authentication, sync, daily queue or unrelated UI were changed.

## V107 — Appointment history and session workflow refinement

- OFI appointments are excluded from Past Appointments while remaining available everywhere else they already appear.
- The appointment contact dropdown now uses native momentum scrolling and selects contacts only on a genuine tap.
- Session-created appointments now save and advance to the next client before the optional calendar hand-off, so returning from Calendar resumes the active session immediately.
- Firebase, authentication, Firestore paths/rules, UID separation, daily queue, 21-day exclusion and unrelated UI remain unchanged.

## v119.5 — Market Pulse Prototype
- Added a manual Market Pulse text importer inside Prospector.
- Parses supported property event labels and full addresses.
- Matches active callable contacts by normalised same street and suburb.
- Creates calling queues through the existing Prospector session workflow.
- Stores imported events per user in local storage with duplicate protection.
- No Outlook access, Cloud Functions, Firestore path changes or Firebase configuration changes.

## v119.10 — Hot Spotting address matching audit
- Rebuilt same-street keys from the stored event address on load so previously imported opportunities use the improved matcher.
- Normalises road type abbreviations and expanded common Australian street types.
- Handles unit, lot, shop, suite, apartment, villa, level and flat prefixes.
- Handles slash addresses, number ranges, alphanumeric street numbers, commas, semicolons and postcode/state formatting.
- Matches against all active callable Prospector contacts while continuing to exclude archived and Do Not Contact records.


## v119.12 — Hot Spotting dropdown and Day Log cleanup
- Collapsed Streets worth knocking into a compact expandable first card.
- Applied one event-status colour palette across Hot Spotting cards and knocking recommendations.
- Increased Day Log time-column spacing so time ranges and icons do not overlap.
- No Firebase, data-model, session-logic or sync changes.


## v119.13 — Hot Spotting cloud persistence
- Added each user’s Hot Spotting events to their existing private Firestore prospecting state.
- Retained the UID-specific local copy as the offline cache.
- Existing local-only Hot Spotting imports migrate to Firestore after the user’s first confirmed cloud load.
- Imports, individual removals and Clear All now sync across that user’s devices.
- No UI, matching, session, Firebase path, rule or unrelated functionality changes.
