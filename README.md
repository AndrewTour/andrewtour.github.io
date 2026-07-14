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


## v1.18 changes
- Renamed the bottom Insights tab to Leaderboard.
- Leaderboard is now the first page shown in that section.
- Insights remains available as the secondary page tab.
- Improvement Focus rows now use the same rounded glass-card design as the leaderboard sections.


## v1.20 quality-of-life update
- Added a compact Today at a Glance focus line.
- Added ahead/behind pace guidance to calls, connects and data.
- Added day-on-day momentum indicators to the daily leaderboard.
- Added personal best cards inside Insights.
- Added an automatic previous-week Monday Review summary.
- No Firebase rules or login changes are required.


## v1.21 — Micro coaching

- Added compact, time-based pacing prompts inside the existing Calls, Connects and Data cards.
- Added a subtle momentum line inside the existing Daily Completion area.
- No Firebase, authentication, storage, logging, leaderboard or Firestore changes.


## v1.21.1 metric copy refinement
- Removed redundant “Daily target” labels from the Today KPI cards.
- The first supporting line now shows the remaining amount.
- The highlighted supporting line now shows live pace and the next checkpoint action.
- Firebase, authentication, storage, sync and logging behaviour are unchanged.
