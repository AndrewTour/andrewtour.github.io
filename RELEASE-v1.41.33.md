# AGNT v1.41.33 — Runtime stability

## Baseline

Built exclusively from Andrew's supplied AGNT-v1.41.29-Viewport-Task-Fix(1).zip.
The older supplied documents describe v1.28.2; the user's explicit baseline overrides them.
No v1.41.30, v1.41.31 or rejected v1.41.32 changes were carried forward.

## Audit findings and fixes

1. Background day/cloud updates rendered hidden Prospector lists, Today timelines and Insights.
   These renderers now defer work until their screen is active. Existing navigation renders
   each screen when it opens. The redundant pre-initialisation Prospector render was removed.
2. MarketPulse sorting and totals repeatedly recomputed contact matches for the same events.
   Matches are now reused within one synchronous render only; nothing is cached across edits.
3. Each matching contact previously filtered and sorted the entire interaction history just
   to check Do not contact. One set built from that history now supplies the identical check.
   On the test fixture (1,500 contacts, 5,000 interactions), the original required 5,000,000
   interaction comparisons; the new exclusion pass scans 5,000 records. Match membership and
   ordering were identical. This is an operation-count result, not an iPhone timing measurement.
4. Authentication notifications could overlap while startCloud was still awaiting maintenance.
   Concurrent starts for the same account now share one pending startup operation. Rejection
   permits retry; changing accounts starts a separate operation. Sign-out clears the pending guard.
   Day/profile/prospecting snapshot callbacks and deferred startup rendering ignore obsolete users.

The boot screen is present in the initial HTML and is only hidden by application code.
No ordinary navigation/foreground handler explicitly reloads the page. The only location.reload()
is the existing deliberate sign-out action. Worker updates do not have a controllerchange reload handler.
JavaScript errors are logged, not routed to a reload. The boot screen has not been hidden as a workaround.

These are verified workload and startup-race defects. iOS terminating the web process under
memory pressure remains a plausible explanation for the reported full restart, not a reproduced
or proven diagnosis. An operating-system termination cannot be prevented with a JavaScript error handler.

## Files changed

- app.js: rendering/matching/startup fixes above and backup version metadata.
- index.html: asset version references only.
- service-worker.js: cache and asset identifiers only; worker lifecycle unchanged.
- cleanup-checks.cjs: release assertions updated.
- runtime-checks.cjs: new isolated regression checks for this fix.
- RELEASE-v1.41.33.md: this audit and validation record.

Only obsolete work removed: the duplicate pre-init Prospector render. Its navigation/startup
call sites remain. No features, controls, fields, data or workflows were removed.

## Preservation

All CSS, metrics controls, navigation proportions and task viewport fixes are byte-identical
to v1.41.29. Firebase configuration, login methods/persistence, collection paths, security rules,
UID data separation, storage keys/formats, import formats, sync architecture, manifest and icons
remain unchanged. Authentication session orchestration changed only to prevent overlapping/stale work.
No Firebase Console, Firestore rules or GitHub settings changes are required. Nothing was deployed.

## Validation and limits

- JavaScript/CJS syntax; existing workflow and stability suites: passed.
- Hidden render guards, visible MarketPulse rendering, render-local matching reuse: passed.
- Duplicate startup, account transition and startup failure retry: passed.
- Large fixture match equivalence and interaction-operation counts: passed.
- Duplicate static IDs, HTML/manifest/worker local references and ZIP integrity: passed.
- Baseline preservation checks for CSS, Firebase config, rules, manifest and icons: passed.

No physical iPhone, browser layout, live Firebase, offline browser launch or production testing
was performed. The intermittent restart was not reproduced in this environment, so this release
does not claim to prove every source of the reported crash is eliminated.

After deploying: open Home, Today and Prospector; make and return from a call/SMS; background
and reopen AGNT several times. Confirm workflows remain open and saved data remains present.
If the splash still returns, record the time, screen/action and whether it followed backgrounding;
that is needed to distinguish an iOS process restart from another application fault.
