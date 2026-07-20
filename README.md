# AGNT V70 — Pipeline Logic & UI Refinement

Incremental update from V69. Pipeline-only UI and seller timeframe logic refinement. No Firebase configuration, Firestore path, rule, authentication, UID separation, sync architecture, or unrelated UI changes.


## V71 — Beta Feedback Refinement
- Focus subheading typography aligned to Metrics.
- Navigation reordered: Home, Today, Prospector, Appointments, Leaderboard, Settings.
- Existing Today icon moved to Home; Today now uses a calendar/check icon.
- Existing appointments can be edited in place without changing their underlying record ID or follow-up state.
- Weekly calculations are anchored to Monday–Sunday calendar weeks.
- Door-knocking rollover resets at each Monday boundary and continues only within that calendar week.
- No Firebase schema or rules changes required.
