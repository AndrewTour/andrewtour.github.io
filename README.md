# AGNT v1.36.1 — Appointment UI Refinement

Incremental update built from the confirmed working v1.34.2 package.

## Added
- Upcoming, Follow-Up and Completed appointment filters.
- Follow-up due dates with tomorrow, three-day, next-week or custom-date options.
- Quick Call, Mark Followed Up and Update Outcome actions.
- Outcomes: Still Nurturing, Price Update Booked, Listing Appointment Booked, Signed and Not Proceeding.
- Optional appointment outcome notes.
- Due-today and overdue follow-up labels.
- Smart Coach reminders when past appointments need an outcome.
- Weekly Scorecard appointment outcome summary and follow-up actions.

## Compatibility
Appointment follow-up information is stored as optional fields on existing appointment objects. Existing records remain compatible. Firebase paths, Firestore rules, authentication, UID separation, metric logging, calendar export, local cache and sync architecture are unchanged.


## v1.36.1
- Restored the login subtitle to sentence case.
- Standardised displayed appointment times to the `6:18PM` format.
- Matched Scorecard Update Outcome actions to the Call button height, width and alignment.
- No functional, Firebase, Firestore, authentication, sync or data-model changes.


## v1.37.0
- Replaced follow-up text prompts with an iOS-native date input inside an AGNT sheet.
- Replaced appointment outcome text prompts with a branded in-app outcome selector and optional note field.
- No Firebase, Firestore, authentication, metric, calendar export or scoring changes.


## v1.37.2
- Restored the previous appointment history source and rendering behaviour.
- Added separate Past Appointments and Upcoming Appointments history tabs, with Past first.
- Preserved the selected-day appointment log at the bottom of the Appointments page.
- Kept appointment creation, storage, follow-up and outcome workflows unchanged.


## v1.37.3

- Appointment Log now shows only appointments booked on the selected day, using the original booking timestamp where available.
- Past and Upcoming screens now classify every appointment from its scheduled timestamp compared with the current time.
- Future appointments booked on earlier days are retained and displayed in Upcoming Appointments.
- Follow-ups scheduled for the selected date appear as AM-priority items in the Today timeline with contact details and a Call button.
- Existing appointment history, Firebase paths, follow-up UI, outcome UI and daily appointment storage remain unchanged.


## v1.37.5
- Past appointment follow-up flow is Set Follow-Up → Mark Followed Up → action removed when complete.
- Selected outcomes now replace the Update Outcome button label while remaining editable.
- Upcoming appointments restore Add to Calendar with the saved green/ticked state.
- No Firebase, history, logging, timeline or sync changes.

## v1.37.5
- Restored Smart Coach metric deadlines to the established prospecting timeline; calls, connects and data are planned toward the 2:00pm door-knocking transition rather than the last appointment time.
- Appointments remain chronological timeline items without changing metric timing rules.
- Added a compact delete control to daily log, past appointments and upcoming appointments.
- Deletion requires confirmation and removes the appointment, follow-up state, calendar tracking state and timeline reminder without changing daily metrics.
- No Firebase configuration, path or rules changes.


## v1.37.6
- Simplified appointment outcomes to Still Nurturing, Listed, Not Proceeding and Missed.
- Renamed the previous Signed display state to Listed while retaining compatibility with existing records.
- Added outcome colours: blue, green, amber and red respectively.
- Removed Price Update Booked and Listing Appointment Booked from the outcome selector without deleting historical appointment data.
- No Firebase, appointment history, follow-up, calendar, timeline, logging or sync changes.


## v1.37.7
- Appointment booking time now defaults to 12:00PM instead of the current device time.
- Today's appointment log now includes the same Add to Calendar / Added to Calendar control used by Upcoming Appointments.
- Calendar state is retained when the appointment is added during submission; cancelled calendar prompts leave the card action available.
- Same-day appointments now use the richer timeline format with contact details and a Call button while remaining positioned at their scheduled time.
- No Firebase, Firestore, authentication, history, follow-up, outcome, deletion, metric, or sync changes are required.

## v1.38.0 — Foundation Stability Update
- Added defensive data normalisation for locally cached and Firestore day and appointment records.
- Added appointment duplicate-submit protection without changing the booking workflow.
- Serialised per-day cloud writes to reduce race conditions during rapid updates.
- Added a local backup copy before replacing cached day data and safe recovery from malformed cache values.
- Hardened Firestore snapshot handling and online reconnection writes.
- Restricted service-worker runtime caching to same-origin app assets and improved navigation fallback behaviour.
- Added non-visual global error diagnostics in the browser console.
- No UI, layout, styling, labels, navigation, metric logic, appointment workflow, Firebase paths or Firestore rules changes.


## v1.38.1 — Shared Timeline Focus Logic
- Timeline status and Focus Now now use one shared priority decision.
- The timeline's existing current emphasis follows the same item surfaced by Focus Now.
- Appointment preparation, scheduled follow-ups, prospecting, door knocking, progress review and wrap-up map to their existing timeline entries.
- No timeline markup, styling, layout or visual design changes.
- No Firebase configuration, rules, paths or migration changes.


## v1.38.2 — Flowing Timeline Focus
- Combined the separate home Focus Now prompt with the existing Timeline click-through card.
- Removed the standalone Focus Now heading without redesigning the Timeline card or timeline screen.
- Added a rolling 15-minute prospecting momentum window for positive Calls, Connects and Data activity.
- Active prospecting sessions now receive steady momentum coaching instead of changing direction after each individual entry.
- Core prioritisation now respects Calls → Connects → Data, while still allowing a materially behind metric to recover based on its existing pace timing.
- Existing appointment, follow-up, 2:00pm knocking, progress-check and wrap-up timing rules remain unchanged.
- No Firebase configuration, rules, paths or migration changes.


## v1.38.3 — Living Focus Headlines
- Changed the compact home card label from TIMELINE to FOCUS.
- Added context-aware focus headlines including Prospecting Momentum, Strong Calling Run, Time To Knock, Appointment Window, Follow-Up Priority, Afternoon Push and Finish Strong.
- Preserved Calendar Management and Plan Ahead for the end-of-day workflow.
- Daily Timeline structure, titles, order, UI and timing remain unchanged.
- No Firebase, Firestore, authentication, storage or data migration changes.


## v1.38.4 — Unified Leaderboard
- Merged the separate Daily and Weekly leaderboard cards into one larger stack.
- Added Day and Week tabs, with Day selected first.
- Added previous, current and next navigation controls to the Daily leaderboard.
- Preserved Weekly history navigation.
- Refined leaderboard rows with clearer metric progress while retaining the existing AGNT design language.
- Extended the leaderboard stack to use the available space above the bottom navigation.
- No Firebase rules, authentication, UID separation or unrelated app functionality changed.

## v1.38.6 — Glanceable Leaderboard
- Replaced wide leaderboard metric columns with compact percentage progress rings.
- Removed horizontal leaderboard scrolling; team growth remains vertically scrollable.
- Removed the secondary Appointments content label while retaining the large selected date.
- Renamed the Today page heading to “Your Schedule” while preserving the Today bottom navigation label.
- No Firebase, data model, authentication, scoring or workflow changes.


## v1.38.6
- Removed the compact top date from Your Schedule and Leaderboard only.
- Reduced and repositioned the universal live sync dot as requested.
- Leaderboard metric rings now show raw metric totals while the ring conveys progress.
- Condensed leaderboard row spacing to keep approximately four agents visible on a typical iPhone screen.


## v1.38.7 — Contextual Compact Leaderboard
- Added contextual grey subtitles under Your Schedule and Leaderboard.
- Further condensed leaderboard row spacing to prioritise four complete agent data sets in the visible leaderboard window.
- No Firebase, authentication, storage, scoring or workflow changes.


## v1.38.8 — Shared Metric Header
- Added contextual subtitles beneath Appointments and Settings.
- Moved Calls, Connects, Data and Knock labels into one shared leaderboard header.
- Removed repeated metric labels from each agent row.
- Improved Day and Week tab text clarity while preserving the existing UI.
- No Firebase, Firestore, authentication, sync, scoring, appointment workflow or data-model changes.


## v1.39.0 — Subheading Date Correction

- Removed the compact grey date from Your Schedule, Appointments, Leaderboard and Settings.
- Kept the contextual subtitle in the previous supporting-text position beneath each page title.
- Restored the original title-to-supporting-text spacing and formatting.
- No Firebase, authentication, Firestore, cache, sync, metric, appointment or leaderboard logic changes.


## v1.39.0 — Prospecting OS

Added a separate, user-specific prospecting workspace without changing the Home dashboard. Includes CSV import, contacts, search, priority follow-up queues, contact profiles, interaction history, tap-to-call/message actions, call logging, next-follow-up scheduling, pipeline stages, temperature, motivation and a focused Next → Call → Log → Next session workflow. Prospecting records use the existing permitted private Firestore subtree at `users/{uid}/prospecting/state` and the existing per-user local cache pattern. No Firebase rule changes are required.


## v1.55.0 — Prospector Visual Foundation

Built incrementally from the confirmed working AGNT V54 Experimental package.

### Changed
- Renamed the bottom navigation label from Prospects to Prospector.
- Added the Prospector identity line: “Remember everything. Know who’s next.”
- Added a four-section visual navigation shell for Today, Contacts, Pipeline and Insights.
- Kept Today active while future sections remain non-interactive placeholders.
- Refined spacing, typography, cards, search and priority styling to establish the new Prospector design language.
- Updated the service-worker cache version so installed PWAs receive the release.

### Unchanged
- Authentication and login flow.
- Firebase configuration, Firestore paths and security rules.
- UID separation, local cache and sync architecture.
- Prospect storage, import, session, filters and contact actions.
- Home, accountability, appointments and leaderboards.

Firebase changes required: none.


## v1.56.0 — Contacts Redesign

Built incrementally from the confirmed working v1.55.0 package.

### Changed
- Activated the Contacts section inside Prospector while keeping Today available.
- Added a dedicated contact database view with a live result count.
- Expanded search guidance across existing name, address, suburb, phone, email, tags, source and stage fields.
- Refined contact cards with clearer property-first supporting information, temperature, follow-up status and a small activity indicator.
- Improved empty states and compact iPhone spacing.
- Updated the service-worker cache version for installed PWAs.

### Unchanged
- Authentication, login and Firebase initialisation.
- Firestore paths, rules, UID separation, local cache and sync architecture.
- Existing prospect records, importer, contact editor, call logging, session workflow and actions.
- Home, accountability, appointments and leaderboards.

Firebase changes required: none.
