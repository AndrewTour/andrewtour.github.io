# AGNT v1.41.31 — Consistent action buttons

Built from v1.41.30 Steady Priority, as requested to build on the preceding update. GitHub main still identified v1.41.29 when checked; the newer delivered v1.41.30 fixes were retained. The project documents were previously read in full in this session; their older version references did not replace the working source.

## Visual reference and scope

Reference: the existing Appointments Book Appointment control and Andrew's supplied screenshot. Source measurements: 50px minimum height, 20px corner radius, 850 text weight, mobile .84rem font size and 12px padding. These now define shared action-control values.

Applied to primary, secondary, destructive and file actions; task submission; contact and buyer actions; prospecting session actions; buyer/property matching; timeline actions; follow-ups; broadcast actions; team/settings actions; manual call outcomes; Send Stats and session completion actions.

Light primary actions use the approved black/white treatment, secondary actions use the Appointments outlined treatment, and destructive actions remain distinguishable in red. Dark mode retains theme-appropriate colours. Action labels are centred, keep a common weight/size, and may wrap rather than be clipped. Action groups use flexible columns so dense groups can move to another row. Native icon-only tools, navigation/back controls, filters/segmented choices and full contact/destination cards retain their distinct roles.

The reference Appointments tab itself and every Home metric control are explicitly excluded. The shared rules also exclude hidden controls so they cannot accidentally reveal an inactive action. Icon-only Bulk SMS controls retain their compact geometry.

## Changed files

- cleanup.css: scoped shared action-button styles, semantic colours and flexible action groups.
- app.js: backup release metadata only; all executable logic remains identical to v1.41.30.
- index.html: release asset query identifiers only.
- service-worker.js: cache and release identifiers only; behaviour unchanged.
- cleanup-checks.cjs: release expectations only.
- RELEASE-v1.41.31.md: this audit/change record.

No new product functionality, dependencies or build step. No code cleanup or feature removal.

## Verification and limitations

Existing workflow, stability and priority regression suites passed. JavaScript syntax and ZIP integrity passed. No duplicate static HTML IDs or missing required HTML/manifest/worker file references found. Source comparison confirms app logic including viewport handling is unchanged; styles.css, ui-system.css, Firebase config/rules, manifest and icons are unchanged. Only the appended action styling changes the visual layer.

CSS precedence was reviewed to ensure primary/destructive colours override the shared secondary base and hidden/metric/appointment exclusions remain explicit. The supplied screenshot was available in the conversation; its local file was unavailable. No browser rendering or physical-iPhone testing was performed. Pixel-level matching, Safari wrapping and final touch behaviour therefore remain unverified on device; source checks do not replace those tests.

All v1.41.29 viewport/task fixes and v1.41.30 seller-priority/session safeguards are retained. Firebase authentication, paths, permissions, storage schemas, sync and GitHub Pages workflow are unchanged. No Firebase Console, Firestore rules or GitHub settings changes required. Not deployed; use the complete ZIP with the existing replacement workflow.
