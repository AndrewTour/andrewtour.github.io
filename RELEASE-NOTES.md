# AGNT v1.44.4 — Core controls

Baseline: v1.44.3 My Market Contacts.

My Market Show, Refine choices and the seller estimate contact picker now display as full-width flat rows with the same straightforward label and chevron hierarchy as the contact-detail actions. They remain native select controls. The My Market MarketPulse button and glyph are exactly 20% smaller than their previous 44 px / 15 px measurements (35.2 px / 12 px); its transparent tap extension remains. The property list also shows the number of recorded outreach contacts beside the existing street-contact count, making already worked properties visible before opening them.

Changed: index.html (field-label wrappers/release references); styles.css (scoped My Market row control and icon sizing); app.js (property-row outreach count and release metadata); runtime.js and service-worker.js (matching release identifiers); RELEASE-NOTES.md (current notes only).

Contacts, Buyers and Pipeline editor fields keep their existing approved form treatment. Firebase configuration, authentication, UID and Firestore paths/rules, saved data shapes, MarketPulse parsing, matching, metrics, SMS actions, navigation, service-worker behaviour, manifest and icons remain unchanged. No Firebase Console, Firestore rules or GitHub settings changes are required.

Validation: JavaScript syntax, local file references, unique HTML IDs, control structure, release coherence, protected-file comparison and ZIP integrity. A physical iPhone, live Firebase and production were not tested.
