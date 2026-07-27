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
