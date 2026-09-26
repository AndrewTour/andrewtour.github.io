# AGNT v1.44.19 — Contacts stability

- Reduced contact save normalisation from quadratic duplicate checks to a linear pass while preserving first-record wins and the 10,000-contact cap.
- Reused unchanged MarketPulse contact estimates across cloud object refreshes, and indexed sold comparisons by suburb.
- Skipped hidden Contacts list rebuilds while a contact detail or editor is open.
- Kept the contact editor open when the required device save fails, while retaining cloud retry behaviour.
- Restored unfinished edits to existing contacts after a fresh launch, using the existing per-user draft storage.
- Added a privacy-safe runtime diagnostic export in Settings and contact-save lifecycle markers.

The existing visual layout, contact matching, Firebase configuration, and sync workflow are unchanged.
