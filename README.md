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
