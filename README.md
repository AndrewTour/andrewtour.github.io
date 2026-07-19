# AGNT v1.56.5 — Session Queue & Metric Integration

Built incrementally from the confirmed working v1.56.4 release.

## Changed
- Restored the session Save & Next queue flow.
- Saving a session outcome now advances immediately to the next queued contact.
- Prospecting outcomes now update the daily Calls and Connects metrics.
- Connected, Appraisal opportunity, Appointment booked, Not interested and Do not contact add 1 Call and 1 Connect.
- No answer, Left voicemail and Sent SMS add 1 Call only.
- Added protection against duplicate submissions and duplicate metric application for the same interaction.
- PWA cache bumped to v1.56.5.

## Unchanged
- Firebase configuration, authentication and Firestore paths.
- UID separation and local cache architecture.
- Contact import, management, address formatting and Prospector tabs.
- Home, appointments and leaderboards.

Firebase changes required: none.
