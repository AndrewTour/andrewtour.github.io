# AGNT v1.44.27 — Visual System (Production)

- Production counterpart to the staging visual release. Firebase configuration is `daily-accountability-be0ac`, matching the v1.44.25 production baseline.
- Full presentation-system redesign across Home, Today, Core, Appointments, Leaderboard, Settings, sign-in and sheets. A navy command area anchors daily progress and leadership; one continuous metric ledger replaces isolated KPI cards. Flat record lists retain subtle dividers, while action groups and forms remain clearly contained.
- Shared semantic colour, hierarchy, contrast, pressed/focus states and dark-mode tokens are centralised in `refinement.css`. The iPhone-safe viewport and six existing top-level destinations are preserved.
- The worker's release cache includes the exact stylesheet reference used by the HTML. No authentication, Firestore, storage, sync, feature or data logic changed.
- Production-only ZIP. Do not deploy to AGNT-staging.

## Previous release

### AGNT v1.44.26 — Staging Firebase Configuration

- Staging-only replacement built from v1.44.25 Design Pass.
- Restores the original `agnt-staging-cb6ce` Firebase web app configuration from the staging repository's August working history. The staging repository had been serving `daily-accountability-be0ac`, the production Firebase project.
- Advances the offline release cache identifier so the restored configuration is fetched on the next installed release.
- Firestore rules and all authentication, data, sync and UI logic are unchanged. This ZIP must only be deployed to AGNT-staging.

## Previous release

# AGNT v1.44.25 — Design Pass

- Built from v1.44.24 Trust & Continuity. This release adds `refinement.css` after the existing styles and updates the offline asset list for the new visual layer.
- Across Home, Today, Core, Appointments, Leaderboard and Settings, information surfaces use a flatter hierarchy, cleaner dividers, consistent supporting text and restrained colour in light and dark mode.
- Existing rounded action controls remain. `cleanup.css` retains all structural rules in their existing location.
- No Firebase, authentication, Firestore, storage, sync, metric, match, navigation or workflow logic changed.

## Previous release

### AGNT v1.44.24 — Trust & Continuity

- Built from the approved v1.44.22 Morning Update package; its screens and features remain in place.
- The cloud status now stays at Connecting until the day listener confirms a server snapshot. Offline/reconnect resets that confirmation.
- Solo and team leaderboard publishes are serialized so an older write cannot complete after a newer one and become the remembered state.
- A seller priority resolved as Contacted or Not required is rejected from a retained in-memory priority card for the rest of that day.
- Warm PWA return continues to preserve an open form or workflow; this release has its own coherent offline asset cache.
- Firestore rules, Firebase configuration, collection paths, document shapes, and CSS are unchanged.
