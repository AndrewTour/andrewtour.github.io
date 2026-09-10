# AGNT v1.41.2 — Startup Fail-Open

## Morning startup correction

- AGNT reveals the usable app shell before restored-view and MarketPulse rendering begins.
- Previous-day knocking timers are finalised locally without waiting for Firestore.
- The resulting cloud save remains queued through the existing sync path.
- A slow, offline or failed cloud write can no longer keep the boot gate visible.
- If post-startup rendering fails, AGNT remains open and reports that live panels are refreshing.

## Retained v1.41.1 performance correction

- Seller Next Best Action remains cached, indexed, idle-time and chunked.
- Seller ranking is not part of the critical startup render.

## Protected systems

- No Firebase configuration, Authentication, Firestore paths, rules, indexes or data-shape changes.
- No MarketPulse import, inbox, routing, timing or automation changes.
- No changes to UID separation, local cache records, appointments, metrics, manifest or icons.
- Service-worker changes are limited to the v1.41.2 cache identifier and asset query strings.
