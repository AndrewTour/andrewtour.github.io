# AGNT v1.44.5 — Contacts search responsiveness

Baseline: v1.44.4 Core Controls.

Contacts search now refreshes only the visible Contacts results and selection controls on input. Rapid keystrokes are coalesced into one animation frame. Buyer search updates Buyers, and Pipeline search updates Pipeline; the full Core renderer still runs for data changes and navigation. Contact matching fields, A–Z order, archived mode, bulk selection, row design and all contact actions remain the same. Filtering precedes the A–Z sort, so narrow results do not sort the entire database on each keystroke.

Changed: app.js (isolated search render and filter order); index.html, runtime.js and service-worker.js (release identifiers); RELEASE-NOTES.md (current notes only). No visual files changed.

Firebase configuration/auth/UID separation, Firestore paths/rules, local data shapes, sync, MarketPulse, metrics, all other workflows, manifest and icons are unchanged. No Firebase Console, Firestore rules or GitHub settings changes are required.

Validation: JavaScript syntax, search-result parity on representative data, handler routing, unique IDs, local references, protected-file comparison and ZIP integrity. A physical iPhone, live Firebase and production were not tested.
