# AGNT v1.41.30 — Steady seller priority and session-safe background work

## Source and scope

Baseline: AGNT-v1.41.29-Viewport-Task-Fix.zip. GitHub main's app.js blob hash e46f882a7886482b649435360637f643091c9279 matched the local baseline; its service worker also identified v1.41.29. The older project documents were already read in full earlier in this session. Their v1.28.2 reference and attachment metadata naming v1.39.3 were not used to replace current code.

One focused source audit of seller-priority startup, cache invalidation, asynchronous ranking, publication and adjacent prospecting save completion. No broad UI pass, redesign, scoring overhaul, dependencies or new backend.

## Findings and corrections

- Cache invalidation erased the last result before recalculation finished. That exposed fallback priorities between completed calculations. Retain the last eligible result during refresh, and replace it only when the current calculation finishes. On initial startup, show existing neutral “Loading today…” text in the priority slot while ranking is pending. The rest of the app remains usable; current appointments, active sessions and urgent tasks retain precedence.
- Equal-score/equal-follow-up candidates depended on input order. Use the existing prospect ID as a final deterministic tie-break, including equal pre-rank candidates at the existing candidate limit. All scores, thresholds and weights remain unchanged.
- Deferred calculations could schedule more work after a reset, and queued paint callbacks lacked a cancellation check. Track whether another refresh was requested and reject stale paint callbacks using the existing build token.
- Ranking reads yielded during interaction scanning. Capture the interaction/event array references as shallow snapshots to avoid mixing array replacements inside a single calculation; token checks still reject invalidated builds.
- Cached results are scoped to UID and date. Contacted, do-not-contact, deferred, archived, removed, listed or no-phone contacts cannot remain displayed as a stale seller recommendation. Clear the temporary in-memory deferral map on account reset; persisted per-user deferrals remain unchanged.
- Identical priority renders rewrote text nodes. Update text and action attributes only when their values change.
- Prospecting writes had no account/session guard around completion bookkeeping. An old account's delayed acknowledgement or failure could change the current account's dirty marker, sync state, retry timer or write lock. Bind completion to the issuing UID and user session. Firestore paths, payloads, local dirty data and retry architecture are retained.

A genuinely changed eligible priority can still update after new cloud data arrives or a time-sensitive event becomes relevant. This repair removes intermediate churn; it does not freeze an obsolete recommendation or ignore new information.

## Changed files

- app.js: priority cache/scheduling/publication, deterministic ties, session guards, conditional text updates and version metadata.
- index.html: release asset identifiers only.
- service-worker.js: release/cache identifiers only; behaviour unchanged from v1.41.29.
- cleanup-checks.cjs: release expectations only.
- priority-checks.cjs: new dependency-free focused regression checks; not loaded by the app.
- RELEASE-v1.41.30.md: this audit record.

No feature or migration code was removed. Obsolete clear-before-rebuild and unconditional repaint statements were replaced in the existing functions.

## Validation

Passed: existing workflow regression suite; stability regression suite; focused priority checks; JavaScript syntax across all JS/CJS files; duplicate HTML IDs; required local HTML/worker/manifest references; final ZIP integrity.

Focused tests cover retained priority during repeated invalidation, immediate contact/defer exclusion, date/UID isolation, deterministic ties despite reversed source order, cancelled builds and paints, neutral cold-start state, appointment precedence, unchanged DOM text on repeat renders, and delayed prospecting writes across account changes.

The viewport function, cleanup.css, styles.css, ui-system.css, Firebase config, Firestore rules, manifest and icons are byte-identical to v1.41.29. The corrected navigation, metric spacing, smaller-screen handling and Add Task layout are retained exactly.

Testing used dependency-free runtime mocks and source/file checks. No physical-iPhone, rendered browser, live Firebase, authenticated offline or production deployment testing was performed. The specific phone jitter was not reproduced on a device; the verified source paths responsible for intermediate result changes were repaired. Unrelated latent defects are not ruled out by this focused pass.

## Deployment and protected systems

All existing features retained. Firebase configuration, authentication mechanism, permissions, collection/document paths, security rules, storage keys, saved-data shapes, imports and GitHub Pages workflow unchanged. Only in-memory priority coordination and guarded completion of existing writes changed.

No Firebase Console, Firestore rules or GitHub settings changes required. One complete replacement ZIP, index.html at its root, using the existing GitHub Pages workflow. Not deployed by this task.
