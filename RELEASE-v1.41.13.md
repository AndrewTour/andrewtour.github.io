# AGNT v1.41.13 — Balanced Right Now

Built incrementally from the confirmed AGNT v1.41.12 Buyer Call Return release.

## Changes

- Right Now now ranks flexible seller, buyer, pipeline, follow-up and MarketPulse work in one balanced decision.
- Current and near appointments, active prospecting sessions and active knocking remain protected.
- Critical buyer matches and overdue follow-ups remain urgent; otherwise the generated plan alternates work lanes where practical to avoid a single-area bias.
- Each open property match now has a `Contacted` action. It closes that individual property outreach without requiring an outcome and uses the existing buyer match status data.
- The Today checklist tick is centred.
- Calendar arrows remain within the viewport. The Today button occupies a reserved slot and is visually hidden on the current calendar day, preserving identical date-header geometry.

## Protected behaviour

- Buyer List and Buyer Profile Call Return behaviour from v1.41.12 is unchanged.
- Firebase configuration, Authentication, Firestore paths and rules, UID separation, Team sync, leaderboard publishing, local-first recovery, MarketPulse automation, valuation logic, manifest, icons and GitHub Pages deployment structure are unchanged.
- No Firebase Console, Firestore migration or GitHub configuration change is required.
