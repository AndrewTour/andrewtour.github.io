# Daily Accountability v1.13

Adds a live team leaderboard as a second page inside Insights.

## Important Firebase rules update
Before using the leaderboard, replace your Firestore Rules with the contents of `firestore.rules` in this folder and click **Publish**. This keeps each agent's detailed data private while allowing all signed-in agents to see the shared leaderboard summaries.

## Agent setup
1. Add each login in Firebase Authentication.
2. Each agent signs into the app using their own login.
3. Each agent opens **Settings**, enters their name under **Agent name**, and taps **Save settings**.
4. Their current-day metrics will then appear live under **Insights → Leaderboard**.

## GitHub update
Upload every file and the `icons` folder to the root of the existing GitHub repository, replacing the current files, then commit.


## v1.14 user isolation fix
Local cache keys are now namespaced by Firebase UID. Signing out clears the active in-memory session, and signing into another account loads only that user's cached and cloud data.
