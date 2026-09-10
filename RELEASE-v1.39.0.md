# AGNT v1.39.0 — Seller Intelligence

Built directly from the confirmed-working AGNT v1.38.3 Buyer Full Viewport package.

## Changed

- Added optional seller property configuration to new and existing pipeline contacts.
- Added bedrooms, bathrooms, cars, property type, house land-size band and title selectors.
- Prioritised same-street MarketPulse contacts by configuration similarity.
- Added a clear Close match marker inside Hot Spotting sessions.
- Added a sold-only MarketPulse price range with Low, Medium or High confidence.
- Extended retained MarketPulse history to preserve sold price and configuration evidence.

## Estimate safeguards

- Uses same-suburb MarketPulse sold results from the last 12 months only.
- Weights the closest available configuration matches first.
- Shows a range and confidence level rather than a single price promise.
- Does not appear until property configuration has been added.

## Preserved

- Existing buyer requirements and buyer matching.
- Existing street-based Hot Spotting eligibility.
- Firebase configuration, authentication, Firestore paths and rules.
- UID separation, local cache, sync and deployment workflow.
- Navigation, manifest, icons and service-worker behaviour.
