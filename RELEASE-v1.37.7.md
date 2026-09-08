# AGNT v1.37.7 — Tasks and workflow cleanup

Built directly on AGNT v1.37.6 UI & Workflow Cleanup. No older recovery package or parked security branch was merged.

## Changes

- Added a compact `+` task action to the Today timeline.
- Added task title, context, date, time and agent allocation.
- Tasks reserve their selected time in Today so generated activity blocks do not use the same slot.
- Tasks persist in existing per-user day data. Team allocations use a dedicated team task record, sourced from the same member list as appointment allocation.
- Added a timeline completion control. The allocated agent or task setter can complete or reopen a team task.
- Added an optional contextual MarketPulse SMS after `No answer` or `Left voicemail` in Hot Spotting. The call outcome and conversation note are saved before Messages opens. Sending or declining the SMS then advances the session once.
- Contact logs now use the existing local-first save path for metrics and interaction history, return to the contact card immediately, and continue cloud sync in the background.
- Prospector search is now limited to Contacts, Buyers and Pipeline. Quick Call and Add Contact remain on Prospector Today.
- Reduced the visible size of Today and universal Back controls while retaining a 44px effective touch area.
- The top Today-return control only appears on date-driven Home and Today timeline screens.
- Bumped the PWA cache to `agnt-v1.37.7-tasks-workflow`.

## Required team-task setup

`firestore.rules` adds `/teams/{teamId}/tasks/{taskId}` permissions. Deploy the included rules before testing task allocation between accounts. Personal tasks work through the existing user day path without this additional deployment.

The team-task rule allows team members to read team tasks, the setter to create/manage an allocation, and the allocated agent to update only `completedAt` and `updatedAt`.

## Validation completed

- Application and service-worker JavaScript syntax checks.
- HTML parse and duplicate-ID check.
- CSS structure check.
- Focused source/unit regression checks for task normalisation and persistence, time reservation, allocation UI, task completion controls, contextual SMS continuation, single queue advancement, local-first contact-log saves, Prospector search visibility, Today-button visibility, team-task rules, PWA assets and the v1.37.6 buyer-session fixes.
- ZIP integrity check before handoff.

No live Firebase write, installed-iPhone PWA, screen-reader or full browser end-to-end test was performed in this build environment.

## Device smoke test

1. Add personal tasks for today and a future date. Refresh and reopen the PWA; confirm time order and completion state persist.
2. Deploy the included Firestore rules, allocate a task to another team account, and confirm it appears on that agent's Today timeline. Complete and reopen it from both accounts.
3. Start a Hot Spotting session, log `No answer`, keep the contextual SMS option selected, add a note and save. Confirm the note is visible in history, Messages opens with MarketPulse context, and the queue advances only once after `SMS Sent` or `Not Sent`.
4. Repeat with the SMS option cleared and with `Connected`; confirm the normal outcome path remains unchanged.
5. Log a contact interaction from Contacts while online and offline. Confirm the contact card appears immediately and the saved history remains after reconnecting.
6. Check Prospector Today, Contacts, Buyers, Pipeline and Insights in light/dark mode. Confirm search appears only on Contacts, Buyers and Pipeline, while Quick Call and Add Contact remain on Today.
