# AGNT v1.24.3

## Safe-area and branding update

- Renamed the application to **AGNT** across the PWA title and manifest metadata.
- Matched the iPhone status-bar and Dynamic Island surround to the app's white background.
- Kept existing header spacing and all application functionality unchanged.
- No Firebase Console changes are required.

---

# Daily Accountability v1.23.7

Incremental update from v1.23.6.

## Headline status
- ON TRACK: remaining work is comfortably achievable before the relevant close time.
- AT RISK: still achievable, but with limited spare time.
- OFF TRACK: the remaining target is no longer achievable at the normal working rate before the planned close time.

Calls, connects and data use the remaining 9am–5pm workday. Knocking joins the status calculation from 2pm and uses the 2pm–5pm window. Logging remains available until the calendar day closes.

Firebase, authentication, Firestore rules, storage, leaderboard and logging actions are unchanged.

- v1.23.6: Updated bottom navigation to a unified flat 2D SVG icon family.

- v1.23.7: Combined the four Today metric cards into one rounded capsule with faint internal dividers while preserving the completion side indicators.


## v1.23.8
- Corrected the Today metrics layout so Calls, Connects, Data and Knocking render inside one shared capsule.
- Added faint internal dividers while preserving each completed row’s green side indicator.
- No Firebase changes required.


## v1.24.0 — Phase 1 visual refresh
- Preserved the complete DA v16 Today-page sizing and spacing.
- Applied the refined system typography and cleaner visual hierarchy.
- Refreshed buttons and inputs without changing their established geometry.
- Kept the unified flat bottom navigation icon family.
- Replaced the top-right emoji settings control with the matching SVG cog.
- Capitalised each word in the personalised welcome greeting.
- No Firebase Console changes required.


## v1.24.1 — Contextual header actions
- Today and Appointments use compact previous/next day chevrons in the top-right header.
- Leaderboard retains the settings cog.
- Settings uses a matching home icon that returns to Today.
- Firebase, data paths, sync, logging and all existing business logic remain unchanged.


## v1.24.2 — Profile title and knocking controls
- Renamed the Settings page content heading to **Your Profile**.
- Replaced the knocking Start/Pause text with matching flat SVG play and pause icons.
- Preserved the existing knocking button dimensions and timer/reset behaviour.
- No Firebase Console changes required.


## v1.24.4 — Appointments workflow upgrade
- Added required contact name and contact number fields.
- Added booking date and booking time fields; removed duration.
- Replaced appointment types with BAP, MAP, LAP and PU in a single row.
- Added safe fallback labels for legacy appointment records.
- Sorted saved appointments chronologically by booking time.
- Preserved Firebase, Firestore paths, authentication, sync and all unrelated functionality.
- No Firebase Console changes required.


## v1.24.5 — Appointments UI refinement
- Increased BAP, MAP, LAP and PU tap targets while keeping all four on one row.
- Restyled booking date and time as equal rounded pills with consistent spacing.
- Standardised form margins, gaps and the Book Appointment pill treatment.
- No Firebase, Firestore, validation, data-model or appointment-functionality changes.


## v1.24.6 — Appointments layout fix
- Corrected native iPhone date/time controls to remain inside two equal grid columns.
- Rebuilt BAP, MAP, LAP and PU as four equal horizontal pills.
- Added fixed gaps and consistent form alignment without changing appointment logic.


## v1.25.0 — Experience polish
- Premium appointment cards with type badge, clearer hierarchy and one-tap call action.
- Leaderboard overview dashboard with progress ring, rank, team KPIs and row progress.
- Polished Your Profile screen with avatar initials and live performance KPIs.
- Subtle native-feeling transitions with reduced-motion support.
- No Firebase Console changes required.


## v1.25.1 — Functionality patch
- Restored the shared HTML escaping helper removed during the v1.25.0 visual upgrade.
- Fixed immediate appointment-card rendering after booking.
- Restored live leaderboard rows and individual agent metric visibility.
- Restored snapshot-driven UI refreshes so cloud and local changes appear without reopening the PWA.
- Bumped the service-worker cache and versioned assets to prevent mixed old/new files.
- No Firebase Console changes required.


## v1.25.2 — Appointment Logs and Scheduled Reminders
- Appointments are now stored against the date they were created for accurate daily activity tracking.
- Future scheduled appointments also appear as linked reminder cards on their scheduled date without duplicating the stored record or leaderboard count.
- Reminder cards show the appointment time, booking date, one-tap call action and “Call 2 hours prior to confirm”.
- Existing appointment records remain compatible.
