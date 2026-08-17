# AGNT BETA v1.36.6 — Rollout Check

## Before release verification

1. Deploy the bundled `firestore.rules` to Firebase project `daily-accountability-be0ac`.
2. Confirm the complete BETA web package is live, including `icons/`.
3. Reopen the installed PWA and allow the new service worker/cache to activate.
4. Confirm an existing account loads historical Today, Contacts/Prospecting, Appointments and Insights data.
5. Confirm the existing Team and current members are still present.

## Core acceptance

1. Change Calls/Connects/Data for one member and confirm Daily leaderboard updates for another member.
2. Confirm current Weekly leaderboard data updates for another member.
3. Confirm personal Contacts/Prospecting data remains private to each UID.
4. Confirm existing appointments/history remain present.
5. Confirm Team owner management and ordinary member leave workflow still work.

## Team appointment acceptance

1. Member A books a LAP, MAP or BAP and assigns it to Member B.
2. Confirm the assignment popup uses the same first-name display as the Team leaderboard.
3. Confirm Member A receives the appointment statistic and sees `Booked for [Member B]` context.
4. Confirm Member B receives the appointment notification live or on next open.
5. Confirm Member B's appointment statistic does not increase.
6. Confirm Member B sees the assigned appointment in the relevant appointment/timeline surfaces.
7. Confirm Got it closes the notification cleanly.
8. Confirm Add to Calendar performs the calendar handoff and the notification does not reopen immediately.
9. Edit/delete the appointment as Member A and confirm the shared Team appointment updates/disappears for Member B.

## Acceptance criteria

- No existing Firebase account is recreated.
- No existing Team member needs to rejoin.
- Existing personal history remains intact.
- Daily and Weekly Team leaderboards remain live.
- Appointment statistics remain attributed to the setter.
- Cross-team appointment delivery works without weakening UID-private personal data.
