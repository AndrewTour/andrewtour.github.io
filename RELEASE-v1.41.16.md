# AGNT v1.41.16 — Off-Day Conversations

## What changed

- `NOT SCHEDULED` now sits beneath the date instead of occupying or overflowing a header control.
- On the current unscheduled day, the locked Calls, Connects, Data and Knocking metrics are replaced by `NEXT CONVERSATIONS`.
- The list shows up to three people across appointments, buyer property matches, due follow-ups, seller opportunities, active buyers and stale pipeline contacts.
- Each row explains why the conversation matters and uses the existing profile and Call actions.
- Contacts already attempted today and contacts marked Do Not Contact are excluded.
- The existing Right Now stack uses the same top conversation when the current day is unscheduled.

## Firebase and data implications

None. This release adds no Firebase or Firestore collection, document path, rule, index, query or write. It adds no local-storage or session-storage key and no startup dependency. The list is calculated from records AGNT has already loaded.

## Deployment

Replace the current GitHub Pages files with the complete contents of this release folder. The service-worker cache marker is updated so installed PWAs retrieve the release assets.
