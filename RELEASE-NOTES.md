# AGNT v1.44.11 — Appointment form and rendering

- Removed the visible Appointment Context box from the booking form. Existing saved context and context supplied by other appointment workflows remain in appointment records and messages.
- Day-screen updates now redraw only the visible Home, Today, Appointments, Leaderboard or Settings screen. Opening a tab refreshes its current view; returning from another app updates the active day screen without rebuilding hidden ones.
- Removed the unused textarea styling. Firebase configuration, Firestore paths, local data shapes, sync logic, navigation destinations and service-worker behaviour are unchanged. The service-worker cache version was advanced to deliver this release coherently.
