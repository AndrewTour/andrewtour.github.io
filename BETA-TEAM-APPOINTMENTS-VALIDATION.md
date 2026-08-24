# BETA Team Appointment Validation

Deploy the bundled Firestore rules before testing cross-team assignment.
- A books for B: A's appointment statistic increments; B's does not.
- Assignment dropdown uses the Team leaderboard name, first name only.
- B receives the live/next-open notification and assigned appointment display.
- Got it dismisses the notification without changing the underlying AGNT screen.
- Add to Calendar completes the existing calendar handoff and does not immediately reopen the same notification.
- A's record shows `Booked for B` context.
- A's edit/delete keeps the Team appointment mirror in sync.
- Personal `users/{uid}` records remain UID-private.
