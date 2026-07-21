# AGNT V88 — Focused Appointment Editor

- Appointment-card editing now opens in a focused full-screen overlay on iPhone.
- The editor displays an Editing Appointment title and only the existing booking fields and actions.
- Appointment history destinations, lists and surrounding Appointments UI remain behind the overlay and are not shown during editing.
- Closing or saving returns the user to the same appointment list mode and scroll position.
- Existing appointment save logic and app-wide render refresh remain intact, so edits continue to update all appointment-driven views.
- No Firebase, authentication, Firestore path, UID separation, data-shape, local cache, scoring, navigation or sync changes.
