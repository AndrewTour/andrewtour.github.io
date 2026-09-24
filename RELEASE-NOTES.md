# AGNT v1.44.8 — Action logic

- Buyer Update now keeps untouched property matches actionable after another match for the same buyer was worked. A match contacted or attempted today leaves today’s queue; a newly matched property can still appear.
- Today’s buyer follow-up handoff uses the same actionable match set. Reviewing or dismissing a match without outreach no longer counts as contacting the buyer.
- Reach’s 21-day cooldown now uses outreach interactions instead of profile edits, pipeline updates, scheduling and other administrative history. Off-day conversation recency uses the same definition while explicit completed/cleared work stays cleared for today.
- No saved-data fields, Firestore paths, rules, Firebase configuration, visual styles or service-worker lifecycle changed. Only app.js and release identity files changed; this file contains the current release notes.
