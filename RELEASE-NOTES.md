# AGNT v1.41.39 — Buyer messaging and keypad

Based on v1.41.38. No unrelated changes.

- SMS for a buyer with multiple open matches offers checkboxes and sends one combined message containing only selected properties.
- The existing sent/not-sent confirmation is retained. Confirmed messages log outreach against each included match. Multi-property sends leave individual Outcome actions available; a single-property send retains its existing outcome prompt.
- Buyer match rows retain Contacted and Outcome, use icons for Call/SMS, and add a one-tap Not suitable action using the existing dismissal outcome.
- The custom keypad number field requests no system keyboard while retaining paste and hardware-keyboard editing.

Changed: app.js, cleanup.css, index.html, service-worker.js, and this release note.
Firebase configuration, authentication, paths/rules, sync implementation, daily metrics, manifest and icons are unchanged. The existing temporary SMS-return record gains an optional matchIds list; older single-match records remain supported.

Validation: JavaScript syntax, focused messaging logic tests, static asset/ID checks and ZIP integrity. Physical iPhone keyboard/paste, Messages return and live Firebase/Pages behaviour require real-device verification.
No Firebase Console, Firestore rules or GitHub settings changes required.
