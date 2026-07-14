Daily Accountability v2.1

Changes:
- Removed the blue all-caps Daily Accountability eyebrow from Today.
- Moved live sync status beside the date.
- Replaced This Week day buttons with current live leaderboard position.
- Preserved Firebase sync, private user data, leaderboard, calendar, appointments, insights, locking and offline support.

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
