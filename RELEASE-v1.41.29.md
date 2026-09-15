# AGNT v1.41.29 — Restore viewport and fix task controls

This targeted correction supersedes the viewport changes in v1.41.28. The working code is the supplied/generated v1.41.28 package, with v1.41.27 used directly as the approved portrait shell measurement reference. The previously read project documents are older; no older feature code was merged.

## Corrections

- Restored the v1.41.27 installed portrait app-height calculation. v1.41.28 used innerHeight alone, which shortened the app shell on Andrew's phone, raised its navigation area and compressed metric rows. Navigation, metric, font and spacing rules themselves remain the original rules.
- Kept short-screen support through content scrolling and intrinsic minimum row heights. These overrides apply only below 741px height. They do not shrink buttons, metrics or the navigation bar. Landscape uses the available window rather than a portrait physical screen height.
- Fixed the full-screen task overlay ending above the screen bottom: with the keyboard closed, the overlay uses the restored app height. With the keyboard open, it uses the separate visible viewport height and offset.
- Date and Time now stack on phone-sized viewports up to 520px wide. Reused the existing AGNT Prospector/Buyer native date-control pattern: appearance reset, explicit logical/physical width limits, min-width zero, border-box sizing and constrained native date/time values. Existing control height, colours and corner radii are retained.

## Files changed from v1.41.28

- app.js — viewport calculation and release metadata only. All other application logic is byte-equivalent to v1.41.28.
- cleanup.css — task overlay height, native date/time containment, phone stacking and short-screen metric row scrolling.
- index.html — release asset query identifiers only.
- service-worker.js — cache/release identifiers only; v1.41.28 worker repairs retained.
- cleanup-checks.cjs — release expectations only.
- stability-checks.cjs — portrait shell, keyboard and landscape regression cases.
- RELEASE-v1.41.29.md — this correction record.

## Validation

- Existing workflow regression suite: passed.
- Stability regression suite: passed.
- Direct old/new viewport comparison: restored shell height equals v1.41.27 for 320x568, 375x667, 390x844, 430x932 and 440x956 portrait cases, with and without keyboard compression. These tests include innerHeight being smaller than physical screen height, which the preceding release's tests did not cover.
- All non-viewport app.js logic compared with v1.41.28: identical, excluding release metadata.
- JavaScript syntax, duplicate HTML IDs, static asset/manifest/worker references and ZIP integrity: passed.
- Original styles.css, ui-system.css, Firebase configuration, Firestore rules, manifest and icons: byte-identical to the baseline.
- Screenshots supplied by Andrew were inspected in the conversation. Local image files were unavailable. Browser rendering and physical-iPhone tests were not available in this environment; no claim of device verification is made. Native keyboard/picker behaviour needs on-device confirmation.

All other stability repairs, features, data formats, authentication, UID isolation, cloud sync and the deployment workflow are retained. No Firebase Console, Firestore rules or GitHub settings changes are required. No deployment was performed. Replace the existing GitHub Pages files using the complete ZIP.
