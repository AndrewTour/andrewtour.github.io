# Daily Accountability v1.21.4

Incremental pacing refinement built from v1.21.3.

## Changes
- Logging remains available for the full calendar day.
- Live pacing is calculated against a 9:00am–5:00pm workday.
- Updated terminology to **On track**.
- Ahead messaging now uses **ahead of target**.
- Behind pacing provides a direct next action and checkpoint.
- After 5:00pm, incomplete metrics show the remaining amount for today.

Firebase configuration, Firestore rules, authentication, storage paths, sync and layout remain unchanged.


## v1.21.5
- Activity logged before 9:00am now shows as ahead of target rather than Ready to start.
- Early activity automatically carries into the 9:00am-5:00pm pacing calculation.
- No Firebase, storage, sync, layout or logging changes.
