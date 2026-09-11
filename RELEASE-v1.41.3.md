# AGNT v1.41.3 — Cloud Sync Recovery

## Confirmed failure

- The reported `FIRESTORE (11.10.0) INTERNAL ASSERTION FAILED` stack includes `quota has been exceeded` and `setItem@[native code]`.
- This is a Firebase browser-persistence failure on the device, not evidence that the project's daily Firestore free quota was exhausted.
- The buyer/contact save path was materially unchanged from the confirmed-working v1.39.3 implementation.

## Recovery

- Firestore now uses its in-memory web cache; AGNT's established UID-scoped local records remain the durable local-first source.
- Each prospecting change receives a persistent retry marker until the cloud write succeeds.
- A locally newer profile or interaction is merged ahead of an older server snapshot and queued for recovery sync.
- Unsynced daily logging records remain protected from older cloud snapshots and retain their existing durable dirty-day queue.
- Solo and Team leaderboard publishing now has a durable retry marker and controlled reconnect retry.
- Successful recovery republishes the current local daily totals; no metric needs to be entered twice.
- Cloud payloads omit empty/default fields while normalisation restores the same application data shape.
- Failed writes retry with bounded backoff and again when connectivity returns.
- A successful write clears the sync error state.
- Raw SDK errors are no longer shown inside the Team settings card.

## Protected systems

- No Firebase project configuration, Authentication, Firestore path, rule, index or UID-separation change.
- No MarketPulse inbox, parsing, routing, timing or automation change.
- No buyer, contact, appointment, metric, team, manager or navigation feature removal.
- Manifest, icons and design files are unchanged. Service-worker edits are limited to the required release cache marker.
