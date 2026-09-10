# AGNT v1.41.1 — Non-Blocking Seller Priority

## Startup hotfix

- Seller Next Best Action no longer calculates synchronously during Home or Today rendering.
- AGNT enters with its existing Today command, then prepares seller intelligence during browser idle time.
- A failed or interrupted seller calculation returns no seller recommendation and never blocks startup or navigation.

## Performance correction

- Builds interaction, deferral and MarketPulse street indexes once per refresh.
- Removes the previous repeated `seller × MarketPulse event × contact` matching loop.
- Scores candidates in cooperative chunks of 100 with a 2,500-candidate safety ceiling.
- Refreshes only after seller, interaction, deferral or MarketPulse data changes.
- Quietly refreshes a cached recommendation every five minutes so expired deferrals return without blocking the interface.

## Protected systems

- No Firebase configuration, Authentication, Firestore paths, rules, indexes or data-shape changes.
- No MarketPulse import, inbox, timing, routing or automation changes.
- No changes to UID separation, local cache data, offline queue, sync, appointments, metrics, timers, manifest, icons or GitHub Pages settings.
- Service-worker changes are limited to the required v1.41.1 cache identifier and asset query strings.
