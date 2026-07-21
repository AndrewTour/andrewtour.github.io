# AGNT V81 — Approved Leaderboard Restored

Built on AGNT V80 Design System Sprint 4.

## Change
- Restored the approved V75 leaderboard performance-strip presentation.
- Rows show rank, agent, overall score, overall progress, Calls, Connects, Data and Knock progress.
- Completed metrics show a tick.
- Preserved the Sprint 1–4 interaction, navigation, progress, typography and spacing polish.

## Unchanged
- Firebase configuration, authentication, Firestore paths and rules.
- UID separation, local cache and sync workflow.
- Leaderboard calculations, Day/Week logic and all other app functionality.

No Firebase changes are required.


## v1.38.8
- Added state-aware supporting lines for Today, Schedule, Appointments and Leaderboard.
- Added shared, context-aware empty states for Appointments and Leaderboard.
- No Firebase, data-model, scoring or workflow changes.

## V82.1 — Home Header Cleanup

- Removed the dynamic supporting line from the Today/Home view only.
- Dynamic supporting lines remain on Schedule, Appointments and Leaderboard.
- All V82 empty states and existing functionality remain unchanged.
- No Firebase changes required.


## V82.2 — Approved Welcome Restored
- Restored the approved appointment-led welcome screen.
- Welcome greeting now uses only the saved profile/display name and never derives a name from the email address.
- No Firebase, scoring, tracking, appointment, leaderboard, navigation or sync logic changed.

## V83 — Unified Language & Empty States
- Standardised empty-state language across Schedule, Appointments, Leaderboard, Prospecting, Pipeline and Scorecard.
- Preserved all app logic, data models, Firebase configuration, authentication, Firestore paths, UID separation, cache and sync behaviour.
- Home remains free of a dynamic supporting line.
