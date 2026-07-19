# AGNT v1.56.7 — Session Interface State Fix

Built incrementally from the confirmed working v1.56.6 package.

## Changed

- Active Prospector sessions now remain visible during Firebase, prospect and Home metric re-renders.
- Save & Next stays inside the same session and advances to the next queued contact.
- Back from a session log returns to the current session contact.
- Start Session resumes an already active session rather than creating a replacement queue.
- Session queue, position and review totals are saved locally and restored when the installed PWA is reopened.
- Skips and completed outcomes persist the current session position.

## Unchanged

- Authentication and login flow
- Firebase configuration
- Firestore paths and rules
- Prospect logging and metric logic
- Contact import and management
- Home, appointments and leaderboards

No Firebase changes are required.
