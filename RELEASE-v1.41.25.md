# AGNT v1.41.25 — Calendar Quick Action

Built directly from AGNT v1.41.24.

## Diagnosis

- The supplied recording shows the first Home Search launch opening Contacts successfully.
- After returning Home, the second launch triggers WebKit's repeated-problem page failure.
- The Home shortcut enters `renderProspecting()`, which rebuilds Contacts, Buyers, Pipeline, Insights and follow-up markup together. With more than 600 contacts, repeating that full render creates an avoidable iPhone memory spike.
- Correcting that architecture safely requires a separate Prospector rendering refactor and is outside this narrow stability release.

## Changes

- Removes Search Contacts from both Home quick menus.
- Keeps Search Contacts available through Prospector → Contacts without altering that established workflow.
- Replaces the removed shortcut with View Calendar using AGNT's existing calendar modal.
- Retains five equally weighted buttons: Call, Add Task, Book Appointment, View Calendar and Bulk SMS.

## Data and Firebase

- No Firebase configuration, Authentication, Firestore rules, indexes, paths, UID separation or sync behaviour changed.
- No stored data shape, local-storage key or session-storage key changed.
- No save, load, MarketPulse, call-outcome or startup workflow changed.

## Deployment

Replace the current GitHub Pages files with the complete contents of this package. No Firebase Console or GitHub configuration change is required.
