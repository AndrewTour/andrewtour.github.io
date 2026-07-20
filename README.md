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


## V72 — Prospecting Intelligence
- Built the Prospector Insights tab from existing contact, interaction, pipeline, follow-up and appointment data.
- Added shared period controls, conversion, pipeline, follow-up, appointment, database-quality and priority-direction cards.
- Added action links into existing pages without duplicating records or workflows.
- No Firebase configuration, Firestore path or rules changes.


## V73.1 — Contact Timeline
- Added a read-only chronological contact timeline using existing interaction and appointment records.
- Linked appointments are matched for display by phone, then name, then property address.
- No existing save, authentication, startup, Firestore, UID, cache or sync logic was changed.
- No migration or backfill is performed.
