# AGNT v1.33.0 — Smart Coaching

Incremental update built from the confirmed working AGNT v1.32.0 Daily Timeline package.

## Added
- Deterministic, read-only smart coaching engine.
- Coaching appears in the existing Home Now card and Today timeline priority panel.
- Appointment-aware preparation and in-progress guidance.
- Time-aware door-knocking guidance from the existing 2:00pm start.
- Weakest-metric prioritisation using current progress and pace.
- Recovery-block guidance when activity falls behind pace.
- Clear completed-day and non-workday states.

## Preserved
- Firebase configuration, authentication, Firestore paths and rules.
- UID separation, cloud sync and local cache structures.
- Daily logging, targets, knocking timer and rollover logic.
- Appointment creation, deletion, ordering, reminders and calendar export.
- Outlook and Apple calendar preferences and status indicators.
- Existing navigation, appointment cards, analytics, icons and PWA behaviour.

No Firebase or Firestore changes are required.
