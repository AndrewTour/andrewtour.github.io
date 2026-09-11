# AGNT v1.41.6 — MarketPulse Valuation Guardrails

## Valuation decision rules

- Same suburb remains mandatory.
- Property type and bedroom count must now match exactly.
- Bathroom and parking counts may differ by a maximum of one when both records contain those fields.
- Only sold results with a recorded price from the last 12 months are eligible.
- Missing optional land-size or title information does not manufacture an adjustment.

## Evidence presentation

- One matching sale is presented as the closest sold evidence and does not produce an estimated range.
- Two matching sales produce a clearly labelled provisional range with low confidence.
- Three or more matching sales can produce a MarketPulse estimate using the existing median and price-distribution method.
- All outputs remain explicitly approximate and are not formal valuations.

## Scope protection

- Built directly from the confirmed-working v1.41.5 release.
- MarketPulse ingestion, email routing, automation timing and stored event shapes are unchanged.
- MarketPulse street matching and seller Next Best Action logic are unchanged.
- Firebase configuration, Authentication, Firestore rules, paths and indexes are unchanged.
- UID separation, local-first saving, recovery queues, Team sync and leaderboard publishing are unchanged.
- No Firebase Console or GitHub configuration changes are required.
