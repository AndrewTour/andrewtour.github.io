# Daily Accountability v1.22 — VNDR Light Visual Refresh

This release is a visual-only redesign built from the working v1.21.5 release.

## Changed visually
- White/light-grey interface
- Black primary typography and actions
- Soft grey borders and shadows
- Blue coaching and live-status accents
- Green completion states
- Clean white tab bar
- Updated DA app icons and PWA theme colours

## Unchanged
- Firebase configuration and rules
- Authentication
- Firestore paths and sync
- User-specific storage
- Logging logic
- Targets, pacing and calculations
- Leaderboards, appointments, settings and calendar behaviour

Upload every file in this folder to the root of the existing GitHub repository.


## v1.23.1 visual header update
- Today page uses the selected date as the main title.
- Sync state is a tappable colour dot with a compact status guide.
- Other page titles remain unchanged.
- Welcome message is forced to one sentence-case line.


Today header refinement: personalised welcome title, restored date subtitle, and sync dot moved beside Settings on Today only.


## v1.23.2
- Sync status guide now renders above the entire app with a dimmed, blurred backdrop.
- Door-knocking coaching begins at 2:00pm and paces completion toward 5:00pm. Early knocking is recognised as ahead of target.


## v1.23.3
- Fixed the sync status guide so its content renders above the blur overlay.
- Replaced the top-card label with ON TRACK / OFF TRACK using live pacing across calls, connects, data and knocking.
- Prevented the track-status heading from truncating with an ellipsis.


## v1.23.4 — Knocking window refinement
- Before 2:00pm, knocking is excluded from the headline ON TRACK / OFF TRACK status.
- Before 2:00pm, the knocking card shows “Start at 2:00pm” when no time is logged.
- Early knocking is recognised as ahead of target and still counts toward daily and weekly totals.
- From 2:00pm to 5:00pm, knocking joins the headline status and is paced toward completion by 5:00pm.
- After 5:00pm, incomplete knocking remains off track while logging stays available until day end.
- Firebase, storage, authentication, leaderboard and all other metric logic are unchanged.
