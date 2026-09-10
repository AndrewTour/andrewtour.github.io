# AGNT v1.39.2 — Contacts Full Viewport

## Changed

- Contacts now use the Buyers tab's flat, full-viewport presentation.
- Removed the enclosing Contacts card treatment and individual row card styling.
- Kept simple dividers, contact details, status indicators and existing interactions.
- Strengthened property-configuration persistence across refreshes and app restarts.

## Data and Firebase

- No schema, Firebase configuration or Firestore rules changes.
- Existing seller property fields continue to be stored on the same contact record.
- A newer local property configuration is retained when an older cloud snapshot arrives, then synced back to Firestore.
