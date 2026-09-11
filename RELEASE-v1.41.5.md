# AGNT v1.41.5 — Profile Flow Refinement

## Buyer profile

- Individual Buyer profiles now use the flat, continuous full-viewport presentation established by individual Contact profiles.
- High-level Next Action, device contact, linked seller, move opportunity, MarketPulse matches, search criteria, notes and lifecycle sections use dividers instead of enclosing cards.
- Existing action buttons, status badges and workflow controls remain available.

## Contact property details

- A configured property now appears as one Property Details row with its configuration and a blue chevron.
- The duplicate Edit Property Details row above the property summary has been removed.
- Tapping the Property Details row opens the same property editor.

## Save flow

- Saving property details updates AGNT's UID-scoped local record immediately and returns to the Contact profile.
- Firestore saving continues through the established background prospecting queue.
- The existing local recovery marker remains until cloud confirmation.

## Protected systems

- The confirmed-working v1.41.4 Team sync path is unchanged.
- Firebase configuration, Authentication, Firestore rules, paths, indexes and UID separation are unchanged.
- MarketPulse automation, parsing and timing are unchanged.
