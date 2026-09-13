# AGNT v1.41.19 — Day-Off Home

## What changed

- Current unscheduled days now replace inactive performance reporting with a compact Next Workday summary.
- The summary uses existing appointment, follow-up, task and MarketPulse data already loaded by AGNT.
- Next Conversations retains the proven Buyers-list hierarchy and now provides equal Call, SMS and Move actions.
- Moving a person uses their existing `nextFollowUp` field; moving an appointment opens the existing appointment editor.
- Contacts moved to a future date leave the day-off list immediately while the existing background sync continues.

## Firebase and data implications

None. Firebase configuration, Firestore collections and document paths, security rules, UID separation and sync behaviour are unchanged. No local-storage key, Firestore query, startup request or background process was added.

## Deployment

Replace the existing GitHub Pages files with the complete contents of this release folder.
