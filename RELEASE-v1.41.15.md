# AGNT v1.41.15 — Home Viewport Balance

Built incrementally from the verified AGNT v1.41.14 Stability & Trust release.

## Changes

- The personalised Home greeting is permanently constrained to one line.
- The existing Home controls sit on the date line, allowing the greeting to retain its established size without consuming extra vertical space.
- The metric rows automatically share the recovered viewport height.
- The Knocking row has an additional eight-pixel bottom cushion above the fixed navigation.

## Protected behaviour

- `app.js` is unchanged from v1.41.14.
- Firebase configuration, Firestore rules and paths, UID separation, Team sync, leaderboard sync, MarketPulse automation, local storage and loading behaviour are unchanged.
- The service worker changes only its cache identifier and matching asset query strings.
- No Firebase Console, Firestore migration or GitHub configuration change is required.
