# AGNT v1.41.17 — Off-Day Conversation Cleanup

## What changed

- Reduced the unscheduled-day section to one `NEXT CONVERSATIONS` heading.
- Removed the additional title, explanatory copy and client-initial avatars.
- Removed the table-like vertical borders and boxed appearance.
- Added concise `Last` and `Next` contact history to each person.
- Retained the existing ranking, profile navigation and Call outcome workflows.

## Firebase and data implications

None. Firebase configuration, Firestore paths, rules, indexes, UID separation and sync behaviour are unchanged. The added history labels use interaction and follow-up data already loaded by AGNT. No new storage key or startup request is introduced.

## Deployment

Replace the existing GitHub Pages files with the complete contents of this release folder.
