# Daily Accountability v1.16

Built from the verified working v1.15 base.

## New
Each signed-in agent can choose their own accountability days under **Settings → Accountability days**. The schedule is saved to that agent's Firebase profile and follows them across devices.

The selected days control:
- which dates can be edited
- daily completion and trends
- weekly insights and averages
- rolling weekly knocking targets
- calendar active/off-day styling
- whether the agent appears on that day's leaderboard

No Firebase rule changes are required. Upload all files in this folder to the root of the existing GitHub repository.


## v1.17
- Added a live weekly leaderboard beneath the daily leaderboard.
- Added 12 weeks of selectable team history for Monday reviews.
- Added an Improvement Focus section showing each agent's weakest weekly metric and gap to target.
- No Firestore rule changes are required because weekly summaries are stored inside each agent's existing leaderboard document.
