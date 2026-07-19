# AGNT V68 — Typography & Motion Polish

Built incrementally from the confirmed stable AGNT V67 release.

## Changed
- Standardised page titles, section headings, card titles, labels, body and supporting text using Home as the visual reference.
- Preserved every page layout, card, control, workflow and colour treatment.
- Restored a short, restrained page-entry transition and subtle pressed states.
- Added reduced-motion support.
- Updated cache/version references to V68.

## Firebase
No Firebase configuration, Firestore path, rule, authentication or data-model changes are required.

# AGNT V67 — Targeted Rendering & Sync Efficiency

Built incrementally from the confirmed stable AGNT V66 release.

## Changes
- Day logging now refreshes only day-related views instead of redrawing Prospector.
- Prospector cloud saves are deduplicated when content has not changed.
- Rapid Prospector updates are briefly batched into one Firestore write.
- Pending Prospector writes are flushed when the PWA backgrounds or closes.
- Firestore metadata-only events do not trigger unnecessary Prospector redraws.
- Existing UI, pipeline logic, authentication and Firestore document paths are unchanged.

## Firebase
No Firebase configuration, Firestore rule, collection or document-path changes are required.
