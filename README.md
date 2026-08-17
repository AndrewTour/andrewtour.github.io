# AGNT BETA v1.36.6 — Team Appointment Assignment Release

Consumer-ready BETA promotion of the confirmed working AGNT Staging v1.36.6 application into the existing functioning BETA environment.

## Release baseline

- Application/UI source: confirmed working `AGNT Staging v1.36.6 — Targeted Appointment Contrast`.
- Firebase environment: existing BETA project `daily-accountability-be0ac`.
- Existing Firebase Authentication accounts and UIDs are retained.
- Existing personal data remains under the current `users/{uid}` paths.
- Existing Team membership, invite-code and Team leaderboard paths are retained.
- No user-data migration is required.

## Included functionality

- Complete Team create/join/leave/owner-management workflow, including Team deletion.
- Daily and current-week Team leaderboard sync.
- Persistent Pipeline Session refresh with per-user/per-day served-contact exclusion.
- Broadcast contrast and viewport refinements.
- Universal nested/session navigation polish.
- Returning Daily Snapshot for four seconds on every second returning app open.
- Consumer-ready login with persistent Firebase authentication restore.
- Team appointment assignment after Book Appointment, defaulting to Me.
- Assignment choices use the live Team leaderboard display name and show first name only.
- The original setter keeps the appointment statistic and personal source appointment.
- The assigned teammate receives a Team-owned appointment mirror without another user writing into their private `users/{uid}` records.
- Recipient sees the appointment in their appointment/timeline surfaces without receiving the setter's appointment statistic.
- Live/next-open appointment notification with Got it and Add to Calendar.
- Setter-facing appointment/log/leaderboard context shows `Booked for [First name]` where applicable.
- Targeted dark-mode contrast fixes for appointment contact suggestions and Editing Appointment.

## Firebase

The frontend is connected to the existing BETA Firebase project:

`daily-accountability-be0ac`

The bundled `firestore.rules` retains the current Team/private-data permission model and adds the Team appointment-assignment path:

`teams/{teamId}/appointments/{appointmentId}`

Deploy the bundled rules to the BETA Firebase project as part of this release. No data migration is required.

## Protected systems retained

- Existing BETA Firebase project and Authentication accounts.
- Existing Firebase UIDs.
- `users/{uid}` personal data and child paths.
- Existing days, contacts, prospecting, appointments, notes and history.
- Existing Team membership and Team leaderboard data.
- UID-scoped local storage/cache data shapes.
- Offline Firestore persistence and sync architecture.
- PWA manifest and icon identity.
- Service-worker behaviour; only release cache/asset version identifiers were bumped.

## Deployment

1. Deploy the bundled `firestore.rules` to Firebase project `daily-accountability-be0ac`.
2. Publish the complete web package to the `AndrewTour/AGNT-beta` GitHub Pages workspace.
3. Reopen the installed PWA so the v1.36.6 service worker/cache activates.
4. Existing users sign in with their existing accounts; no account recreation or Team rejoin is required.
5. Complete the checks in `BETA-ROLLOUT.md` and `BETA-TEAM-APPOINTMENTS-VALIDATION.md`.


## v1.36.7 — Safe cleanup candidate
- Removed definition-only legacy JavaScript and no-op bindings for UI that no longer exists.
- Removed obsolete hidden prospecting calculations that were still running on every Prospector render.
- Reused Market Pulse / Hot Spotting match results within the same render instead of recalculating identical street matches repeatedly.
- Removed CSS comments and rules anchored exclusively to retired UI components; live cascade order and declarations were otherwise left intact.
- No Firebase configuration, Firestore rules, authentication, paths, UID separation, local cache/data shapes, sync, Team logic, appointment attribution, leaderboard calculations, session logic, navigation or PWA fetch strategy changed.
- Candidate only: not deployed to GitHub or Firebase.
