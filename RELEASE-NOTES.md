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
