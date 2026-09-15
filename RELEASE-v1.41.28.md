# AGNT v1.41.28 — Stability and consistency repairs

## Baseline and source discrepancy

Built only from AGNT-v1.41.27-Hot-Spotting-SMS-Flow(1).zip. GitHub main's latest inspected commit was dfaf292847fc27fac8ad06706c8c8d4195ab60f4 (14 September 2026). app.js, index.html and cleanup.css Git blob hashes match this ZIP exactly; the repository service worker also identifies v1.41.27.

The three locally supplied source/brief/instruction documents were read in full. They identify v1.28.2. Attachment metadata also names v1.39.3 documents, which were not present at the supplied scratch paths. These documents do not identify the same release as the current working app. No old app code or old UI descriptions were merged. No GitHub files or deployment settings were changed.

## Verified causes and repairs

1. Viewport sizing selected the largest of window, document, visual and physical screen heights. Physical screen height is inappropriate in landscape or a restricted window. Use the layout window height; keep a separate visual viewport height and offset for keyboard-aware sheets. Existing base styles, typography and navigation dimensions remain unchanged.
2. Later Add Task CSS forced two date/time columns even below the earlier narrow-screen breakpoint. Restore the single-column schedule below 391px, constrain form fields to their column, and use intrinsic grid row heights. Bound the sheet to the visible viewport so its content can scroll above the keyboard. Preserve the existing 48px controls and appearance.
3. Warm resume performed renderAll and contact draft restoration even while a usable form was open. Focus/pageshow also scheduled maintenance without an actual suspension. Coalesce suspend/return events; refresh only live day surfaces on an ordinary warm return. Keep full restoration at cold start and full date refresh at day rollover. Skip periodic maintenance while hidden or before startup is ready.
4. The auth callback could restart an already active same-user cloud session. Guard that case; check session identity after asynchronous startup maintenance. Cloud startup omitted the team-task listener from teardown; include it.
5. Add Task lacked a repeated-submit guard and finally cleanup. Add both, reject past scheduling, retain a stable temporary form task ID for retry, and update an existing pending task rather than duplicate it. Errors remain visible and controls unlock. No saved data schema changes.
6. Manual call outcomes and ordinary metric updates awaited cloud acknowledgement despite already saving locally. Use the existing background save option; guard concurrent manual outcome submissions. Preserve call/connect counts and outcome sequence.
7. Appointment save/edit/delete, linked listing prospect creation and knocking capture also awaited cloud before finishing their local UI. Use the established background save paths. Start existing team appointment writes with their existing error messages in the background. Include pipeline linking in appointment lock cleanup and reject repeated knocking capture submissions.
8. Queued day saves looked up the current global account when the queue eventually ran. Bind queued work to its originating UID and session; discard stale work on account changes and clear the old chain map on session teardown. Ignore old-account write completions when clearing dirty markers. Local dirty records remain available for the original account to resync. Paths, payloads and the existing queue architecture are unchanged.
9. Service-worker response cloning happened inside an asynchronous cache-open callback, potentially after the returned response was consumed. Clone immediately and attach cache writes to the fetch event lifetime, with handled failures. Fetch strategy, installation and activation behaviour remain unchanged; cache/version identifiers are updated.

## Changed files

- app.js: viewport, resume/startup guards, task/manual-call submission safety, non-blocking local-save workflows, listener cleanup, queued day-save account isolation and backup version metadata.
- cleanup.css: targeted task controls, visual-viewport sheet constraints and short-screen scrolling overrides.
- index.html: release asset query identifiers only.
- service-worker.js: release identifiers and safe response cloning/cache-write lifetime.
- cleanup-checks.cjs: updated release identifiers and success label; existing assertions retained.
- stability-checks.cjs (new): dependency-free regression tests for the repaired paths; not loaded by the app.
- RELEASE-v1.41.28.md (new): this audit and limitations record.

No feature code or compatibility/migration code was deleted. Only the replaced faulty implementation statements were removed. All baseline files remain included.

## Validation performed

- JavaScript syntax checks: all .js and .cjs files passed.
- Existing cleanup-checks.cjs suite: passed. It includes buyer import/session persistence, matching/contacted states, call/SMS queue advancement, appointment and seller-priority regressions, local/cloud recovery and other established workflows.
- New stability-checks.cjs runtime tests: passed. Mocked viewport inputs cover 320x568, 375x667, 390x844, 430x932 and 667x375, plus a reduced keyboard viewport and offset. These are numeric viewport tests, not rendered screenshots.
- Runtime tests cover lifecycle event coalescing, cold pageshow not triggering warm resume, warm return avoiding full form reconstruction, Add Task duplicate/error/retry handling, idempotent call metrics, queued writes across account changes, stale completion isolation and cache response consumption.
- HTML IDs: no duplicates. No duplicate top-level named functions or repeated literal element/event listener bindings found. Dynamic IDs in event bindings are supplied by generated markup; this is not an exhaustive proof of all possible delegated bindings.
- HTML, service-worker assets and manifest/icon local references: present. PWA files retained.
- Firebase config, Firestore rules, manifest, both icons, styles.css and ui-system.css: byte-identical to the baseline.
- Complete ZIP: integrity checked after packaging.

## Limits and remaining uncertainty

No browser executable was installed. A browser download timed out and was stopped. Consequently no rendered browser, physical-iPhone, keyboard, touch, Phone/Messages handoff, large-device screenshot comparison, live Firebase, authenticated offline cold-start or GitHub Pages production tests were completed. No claim is made that every screen is visually verified or that the full acceptance criteria are proven.

No automatic location reload was found apart from deliberate sign-out. The verified warm-return churn and cache-write defect were repaired, but the reported full loading-screen flash was not reproduced. iOS process termination or network/module-loading behaviour remains unverified. Firebase modules remain external imports, as in the baseline; this pass does not vendor them or redesign offline boot.

Authoritative account/team administrative operations retain their existing server requirements. The source audit and regression coverage do not establish that every possible saving action resolves under every network failure. Wider sync architecture, retry policy and business rules were deliberately retained.

## Preservation and deployment

All existing feature implementations and baseline files are retained. No new product features, framework, dependencies, build step or visual language. Approved sizing outside the targeted constraints is preserved in code but requires rendered device confirmation.

Firebase project configuration, authentication provider/persistence, Firestore paths/rules, permissions, UID schema, storage keys, saved-data shapes, imports, manifest/icons and GitHub Pages workflow remain unchanged. Explicit repair exceptions are the same-user startup guard, listener teardown, account-bound queue checks, use of existing background save options and the service-worker cache-write defect described above.

No Firebase Console, Firestore rules or GitHub settings changes are required. Replace the GitHub Pages source files with this ZIP's contents using the existing workflow. This package has not been deployed.
