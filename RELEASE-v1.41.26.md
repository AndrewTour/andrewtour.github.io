# AGNT v1.41.26 — Weekly Appointments and Seller Actions

This release is an incremental refinement of the confirmed v1.41.25 build.

## Home quick actions

- The Calendar action now opens `This Week`, a future-only list of appointments remaining in the current Monday-to-Sunday calendar week.
- The view uses the established Upcoming Appointments UI and remains vertically scrollable.
- Its back arrow returns to Home only when launched from the Home quick menu. The normal Appointments-tab history route is unchanged.
- Both scheduled and non-scheduled menus now read: Call, Add Appointment, Add Task, This Week and Bulk SMS.

## Today priority

- The Right Now content and MarketPulse button are vertically centred as one line between the surrounding dividers.
- Hot seller deferral now also offers Contacted and Not Required.
- Contacted records a Follow-up interaction, updates last contact, and clears a currently due follow-up.
- Not Required records the decision and removes the current follow-up date.

## Data and Firebase

- No Firebase collection, document path, UID boundary, rule, index, listener or authentication behaviour changed.
- Seller actions use the existing prospect/interactions document and the existing background save queue.
- No new local-storage or session-storage key was added.
