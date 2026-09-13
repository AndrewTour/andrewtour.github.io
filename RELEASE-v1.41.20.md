# AGNT v1.41.20 — Day-Off Quick Actions

## What changed

- Added a single five-column quick menu between Next Workday and Next Conversations.
- The controls open the existing manual dialler, task composer, appointment form, Contacts search and Broadcast/Bulk SMS workflow.
- Rebalanced spacing and type sizing across the unscheduled-day Home without introducing new cards or page structures.
- Kept all controls equal, viewport-safe and consistent in light and dark appearance.

## Firebase and data implications

None. Firebase configuration, Firestore collections and document paths, security rules, UID separation, save behaviour and sync are unchanged. The quick menu adds no storage key, query, request or background process.

## Deployment

Replace the existing GitHub Pages files with the complete contents of this release folder.
