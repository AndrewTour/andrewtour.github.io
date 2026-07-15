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


## v1.23.9-safe
- Rebuilt appointment booking from the confirmed working v1.23.8 baseline.
- Added first name, last name, contact number, appointment date, start time and duration.
- Added optional calendar export after booking and from each saved appointment.
- Kept all new DOM bindings null-safe so appointment UI code cannot block Firebase initialisation or login during an app update.
- Versioned CSS and JavaScript asset URLs to prevent old HTML and new JavaScript being mixed by the installed PWA cache.
- No Firebase Console changes required.


## v1.23.10
- Restored visible appointment contact and schedule fields.
- Added an inline Add to calendar prompt and clear calendar actions on saved appointments.
- Capitalised each word in the welcome greeting.
- Strengthened service-worker activation to prevent stale appointment UI.


## v1.23.11
- Condensed the appointment date, start-time and duration controls and prevented native iPhone inputs from overlapping.
- Removed the diagonal calendar action and replaced it with a compact, horizontal Calendar button.
- Removed the iOS share-sheet calendar workflow and now opens the generated iCalendar event directly for Apple Calendar import.
- No Firebase Console changes required.


## v1.23.12
- Returned appointment date, start time and duration to one compact row.
- Reduced control widths, padding and gaps to prevent overlap on iPhone.
- Removed appointment calendar prompts, buttons and iCalendar export code.
- No Firebase Console changes required.

## v2.1.0 — Premium light UI rebuild
- Rebuilt the visible interface hierarchy rather than applying token-only changes.
- Introduced a premium light design system with stronger typography, flatter surfaces, deliberate spacing, capsule controls and a dark active navigation state.
- Redesigned Today, Appointments, Leaderboard, Settings and login presentation without changing app logic or Firebase behaviour.


## v2.1.2
- Restored the Today page to the exact pre-redesign sizing and spacing.
- Retained the v2 typography, colours, icons and component design language.
- Left Appointments, Leaderboard and Settings unchanged.


## v2.1.3
- Reduced the Today metric stack so it clears the bottom navigation.
- Reduced metric control sizes slightly for better visual balance.
- Reduced the Knocking Start label to match the surrounding UI.
- No Firebase Console changes required.


## v2.1.4
- Definitively restored the Today metric stack to the proven compact pre-redesign geometry.
- Reduced metric controls and Start typography.
- Replaced the top-right emoji gear with the same outline SVG cog used in bottom navigation.
- No Firebase Console changes required.


## v2.1.5 — Today viewport reservation fix
- Restored the fixed bottom navigation reservation on the Today page.
- Metric capsule now finishes above the navigation bar.
- Redistributed all four metric rows within the available viewport.
- Restored readable metric typography while keeping controls compact.
- No Firebase Console changes required.


## v2.1.6 — Today sizing matched to DA v16 reference
- Kept the v2 visual language and typography.
- Restored the approved pre-redesign Today viewport proportions and metric-stack spacing.
- Reserved the full bottom-navigation footprint so the metric capsule finishes above it.
- No Firebase Console changes required.


## v2.1.7 — Today spacing and completion colour
- Slightly increased the Today performance and metric stack visual scale within the approved v16 geometry.
- Preserved the navigation clearance and existing Today layout.
- Matched “Daily goal achieved” to the same green used by the completion strip.
- Reduced the Start label slightly to keep it proportional.
- No Firebase Console changes required.


## v2.1.8 — Today geometry and timer icons
- Restored the Today page geometry from DA v16 while retaining the v2 visual design.
- The metric capsule now ends above the fixed navigation with a deliberate visible gap.
- Replaced Start/Pause text with accessible play/pause SVG icons.
- Matched completed status text to the metric completion green.
- No Firebase Console changes required.


## v2.1.9 — Today navigation boundary fit
- Removed the artificial white gap between the Today metric capsule and bottom navigation.
- Maximised the available vertical space without allowing the capsule to overlap the fixed navigation.
- Preserved the v2.1.8 play/pause icons, sizing reference, Firebase behaviour and all app functionality.
- No Firebase Console changes required.
