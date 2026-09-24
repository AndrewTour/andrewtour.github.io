# AGNT v1.44.9 — Core speed and market clarity

- Core now builds the visible Contacts, Buyers, Pipeline or Reach panel when it is needed instead of rendering all hidden panels on every refresh. Existing navigation and editor state remain in place.
- My Market reuses campaign rows, filtered analytics, contact links and list markup while their source data and filters are unchanged. Imports, contact/interactions updates, filter changes and a new calendar day invalidate the cached view.
- Property activity distinguishes connected calls, sent SMS, call attempts, launched bulk SMS and pending follow-ups. Administrative property links remain visible in the detail without being presented as outreach.
- Firebase configuration, Firestore paths and rules, stored record formats, matching and ranking rules, and service-worker lifecycle behaviour remain unchanged.
