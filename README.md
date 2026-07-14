# Daily Accountability v2.0

This release fixes user switching and keeps each Firebase login fully isolated.

## Upload
1. Extract the ZIP.
2. Upload every file and the `icons` folder to the root of the existing GitHub repository.
3. Commit the changes and wait for GitHub Pages to deploy.
4. Delete the old Home Screen app and install it again from Safari.

No Firebase rule changes are required if the leaderboard rules are already published.

## Expected behaviour
- After sign-in, a loading screen appears briefly.
- The dashboard does not show another user's cached data.
- A new user with no records starts at zero.
- Agent name, targets, appointments and daily stats remain private to that Firebase UID.
- The shared leaderboard remains visible to signed-in users.


## Version 2.3
Built from the stable v2.0 authentication and sync foundation. Only the requested header and leaderboard-position UI changes were applied.


## v2.3 login fix

Firebase now uses standard Firestore initialisation for maximum iPhone and iOS beta compatibility. The app retains UID-separated local caching for offline use. No Firebase console or rule changes are required.


## v2.4 login repair
Firebase Authentication and Firestore now initialise before optional iOS persistence. Sign-in is disabled until Firebase is ready.
