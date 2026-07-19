# AGNT V66 — Prospector Viewport & Pipeline Workflow

Built incrementally from the user-confirmed stable AGNT V65 package.

## Changed
- Locked the Prospector interface to the iPhone viewport and removed horizontal page movement.
- Added a completable Who Needs You Next checklist for due and overdue follow-ups.
- Completing a follow-up clears it from the list without adding it to Today’s Pipeline.
- Today’s Pipeline is a stable daily batch of up to 50 contacts with a valid phone number.
- Contacts with no genuine connection in the last three months are eligible.
- No answer, voicemail and SMS attempts do not start the three-month exclusion period.
- Do Not Contact records and due follow-ups are excluded from the pipeline.

## Unchanged
- Authentication, Firebase configuration, Firestore paths and security rules.
- UID separation and existing cloud data structure.
- Home, metrics, appointments, leaderboards, contacts and all non-Prospector workflows.
