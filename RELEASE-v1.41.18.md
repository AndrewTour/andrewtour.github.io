# AGNT v1.41.18 — Buyer Pattern on Home

## What changed

- Removed the bespoke Home conversation-row component.
- Home now uses the existing Buyers-list structure: `buyer-card`, `buyer-row-profile`, `buyer-row-head`, supporting lines and `buyer-card-actions`.
- Kept the single `NEXT CONVERSATIONS` heading.
- Shows the client name and role, last recorded contact and next-contact reason.
- Uses the established Buyer-list blue Call treatment and existing call-return workflow.

## Firebase and data implications

None. Firebase configuration, Firestore paths, rules, indexes, UID separation and sync behaviour are unchanged. No storage key, query, startup request or background process was added.

## Deployment

Replace the existing GitHub Pages files with the complete contents of this release folder.
