# AGNT v1.41.0 — Seller Next Best Action

## Smarter Today behaviour

- Ranks active seller opportunities using existing seller and activity signals.
- Prioritises overdue and due follow-ups, Hot sellers, near-term selling timeframes, appraisal opportunities, motivation, contact freshness and relevant MarketPulse activity.
- Excludes archived, listed, do-not-contact, already-contacted-today and currently deferred sellers.
- Shows the strongest three reasons behind each recommendation.
- Opens the exact seller profile from Home or Today.
- Recalculates after an existing outcome save or a local deferral.

## Deferral behaviour

- `Not now` is available on Today only, keeping Home focused on one primary action.
- Sellers may be deferred for two hours, the rest of today or until the next scheduled workday.
- Deferrals are UID-scoped, retained on-device for ranking context and expire from history after 30 days.
- Deferral does not change the contact, follow-up date, interaction history or cloud data.

## Protected systems

- No Firebase configuration, Authentication, Firestore paths, rules, indexes or data-shape changes.
- No changes to UID separation, local-first sync, offline queue, MarketPulse import, appointment logic, metrics, timers, manifest, icons or GitHub Pages settings.
- Service-worker changes are limited to the required v1.41.0 cache identifier and asset query strings.
