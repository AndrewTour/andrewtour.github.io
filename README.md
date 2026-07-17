# AGNT v1.27.5

Incremental update from the confirmed working v1.27.4 release.

## Changes
- Calls, Connects and Data grey supporting text now matches the existing Knocking grey text size.
- Calls, Connects and Data blue coaching text now matches the existing Knocking blue text size.
- Before 2:00pm, Knocking retains its existing wording, including `Start at 2:00pm` when no early time is logged.
- After 2:00pm, incomplete Knocking shows only `On track` or `Off track`, using the existing rollover-adjusted target and 2:00pm–5:00pm expected-pace calculation.
- Completed Knocking retains the existing completed wording and state.

## Unchanged
Firebase, authentication, Firestore paths and rules, UID separation, local cache, sync, Calls/Connects/Data wording and logic, timer, rollover, alarm, rings, pace arcs, controls, layout, navigation, leaderboards, calendar, history, appointments, orientation, saved data and deployment workflow.

---

# AGNT v1.27.4

## Today-screen proportional polish

- Slightly reduced Calls, Connects, Data and Knocking title sizing.
- Slightly increased the primary metric values and matched the Knocking value scale.
- Reserved a stable three-line area for the day-on-day momentum message.
- Reduced the visible Calls, Connects and Data plus/minus controls by approximately 20% while retaining the existing progress-ring size.
- Preserved all ring rendering, pacing, Firebase, Firestore, timer, navigation and data behaviour.
- No Firebase Console or Firestore rule changes are required.

---

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


## v1.25.3 — Appointment card refinement
- Booking an appointment now keeps the Appointments view on the date already being viewed.
- Removed duplicate floating timestamps from original and reminder cards.
- Future reminder cards now repeat the blue booked-for date/time beneath the booked-on date.
- Positioned the confirmation reminder to the right of the booked-for detail with responsive spacing.


## v1.27.0 — UI refresh and dual-layer pacing rings
- Refreshed native iPhone typography, card hierarchy, spacing and bottom navigation polish.
- Upgraded Calls, Connects, Data and Knocking progress displays to dual-layer rings.
- Solid arcs show actual completion; translucent arcs show expected time-based pace.
- Reused the existing 9:00am–5:00pm pacing logic for Calls, Connects and Data.
- Reused the existing 2:00pm–5:00pm pacing logic and rollover-adjusted target for Knocking.
- Ring visuals cap at 100% while stored over-target values remain unchanged.
- Added accessible ring labels for actual progress, expected pace and target.
- No Firebase, Firestore rules, authentication, data model or sync changes required.


## v1.27.1 — Post-refresh ring and counter refinement
- Reduced dual-layer metric ring diameter and stroke by approximately 10–15%.
- Vertically centred each ring with its neighbouring minus and plus controls.
- Restored relaxed spacing between the current metric value, slash and target.
- Preserved all dual-layer ring rendering, pacing calculations, completion states and application functionality.
- No Firebase or Firestore changes required.


## v1.27.2 — Layout Stability + Portrait Request

- Locked metric recommendation areas to a stable two-line height so row and navigation positions do not shift.
- Rebuilt metric counters as controlled value, slash and target elements for consistent `x / x` spacing.
- Preserved the current dual-layer ring dimensions, pacing logic and completion states.
- Updated the manifest orientation request to `portrait-primary`.
- Added a safe centred landscape browser fallback without forcing device rotation.
- No Firebase, Firestore, authentication, data model or business-logic changes.


## v1.27.3 — V8 Today Sizing + Dual Rings
- Restored the AGNT V8 Today-page title, momentum stack and metric-row geometry.
- Removed the artificial recommendation-height gap introduced in v1.27.2.
- Restored the V8 actual/target counter structure and proportions.
- Retained the v1.27 dual-layer actual/expected pace rings and all pacing logic.
- No Firebase, Firestore, authentication, storage, sync or workflow changes.

## v1.29.1
- Matched the Knocking progress ring percentage typography and colour behaviour exactly to Calls, Connects and Data.
- Equalised the three Knocking data-line margins and line heights with the other metric cards.
- No Firebase, Firestore, authentication, sync, storage, timer or metric-logic changes.

