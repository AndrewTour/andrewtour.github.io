# AGNT v1.44.10 — Tab return

- Tapping the selected bottom-navigation tab returns that tab to its main screen. Home and Today return to the current day; Core returns to My Market; Appointments returns from history to its main screen; Leaderboard returns to the current daily view; Settings returns to the top.
- Switching between different tabs continues to preserve the open workflow, including calling sessions. A second tap on the selected tab is the explicit return action.
- An unfinished new contact draft is retained. An open edit or outcome form asks before discarding unsaved work; an appointment draft stays in its form. Active call and knocking sessions are hidden without being ended.
- No Firebase configuration, Firestore paths, storage formats, business logic, visual styles or service-worker lifecycle behaviour changed.
