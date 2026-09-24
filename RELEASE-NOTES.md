# AGNT v1.44.7 — Core responsiveness

- Pipeline uses one appointment snapshot per render, then groups and sorts each seller once. Its existing timeframes, labels, order and insights remain the same.
- Buyers applies text search before the same filters and preserves unchanged list markup instead of replacing the visible rows.
- Bulk SMS previews check contact history in one pass, coalesce rapid text inputs to the next frame, and leave test and campaign history views alone while typing. The actual Shortcut payload still recalculates eligibility and messages at launch.
- Only app.js, index.html, runtime.js and service-worker.js changed for code and release identity. Existing CSS, data keys, Firebase, rules, manifest, icons and service-worker lifecycle are unchanged.
