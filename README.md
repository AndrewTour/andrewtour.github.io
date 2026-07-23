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


## V95.10 — Copy Case Standardisation

- Applied title case to interface titles, headings, and action buttons.
- Applied sentence case to labels, helper text, placeholders, confirmations, and longer interface copy.
- Preserved user-entered notes and stored content exactly as entered.
- No layout, sizing, viewport, styling, Firebase, sync, or functionality changes.
