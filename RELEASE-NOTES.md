# AGNT v1.45.1 — Bright, open visual system

Built from the v1.45.0 clean deployment package tested in this conversation.
Source lineage: approved main v1.44.22, commit
2f2a24d3929f6e49a5912cc0ad8bb8b2bfae8792. No beta or recovery code used.

## Presentation changes

- Neutral white canvas and near-black type; neutral dark mode. Removed the green
  cast and dark feature panels from Home, leaderboard, settings and off-day Home.
- Home uses an open score summary, a compact utility row and flat activity rows.
  Completion percentages replace decorative metric rings; calculations and pacing
  messages are unchanged. The Home tab now uses an outline home icon.
- One neutral primary-action treatment; quiet secondary actions; orange selection
  and progress markers. Typography is restrained, with consistent sentence case
  for body copy and a common hierarchy across record lists, profiles and editors.
- Appointment history rows are compact. Forms share field sizes and label styling.
  Appointment types use flat tabs with one selected underline, removing nested
  borders. The booking action remains accessible above navigation.
- Task, deferral, keypad and other focused dialogs use a light backdrop without
  blur, one surface and open option rows. Existing dismissal, focus, timing and
  save behaviour are unchanged.
- Retained the clean 14-file deployment package, original CSS structural rules,
  safe-area handling and all existing app workflows.

## Changed files

1. visual-system.css — brighter palette, open summaries, shared controls and forms,
   lighter dialogs, coherent typography and responsive presentation.
2. index.html — release references, Settings version label, outline Home icon.
3. app.js — backup version identifier only.
4. runtime.js — release identifiers only.
5. service-worker.js — release/cache identifiers only; lifecycle and fetch policy
   unchanged, including precaching the existing shared visual stylesheet.
6. RELEASE-NOTES.md — this entry; previous package note retained below.

## Protected systems and configuration

Firebase configuration, authentication, Firestore paths/rules, UID separation,
records, data shapes, cache/storage keys, offline queue and sync are unchanged.
Original styles.css and cleanup.css, manifest, icons, firebase-config.js,
firebase.json and firestore.rules are byte-identical to v1.45.0. App/runtime/worker
comparison confirms that their only changes are release identifiers.

No Firebase Console, rules, indexes or GitHub settings changes are required.
Nothing has been pushed or deployed.

## Verification

- JavaScript syntax and CSS syntax/selector validation passed.
- 49 headless Chromium layout/workflow checks passed, including six main screens
  at 320/390/430 px in both themes, all Core sections, contact/buyer profiles and
  editors, counter changes, metric containment and task composer open/close.
- Seven additional presentation checks passed: open Home, plain completion
  percentages, appointment-type selection without nested borders, booking action
  clear of navigation, and task/deferral/keypad dialogs without blur.
- Screenshots inspected for Home, Today, Appointments, Settings, Leaderboard,
  Core sections, profiles/editors and dialogs in relevant light/dark states.
- Release/precache checks passed using fixture responses: complete worker install,
  cached navigation and visual stylesheet availability offline.
- Protected-file comparisons, required assets and ZIP integrity passed.

Browser checks used synthetic records and Firebase SDK stubs in device-only mode,
with Australia/Sydney timezone and an additional fixed 24 October afternoon case.
Live Firebase sign-in/team permissions, real network loss, Safari/WebKit, physical
installed iPhone PWA and deployed-site testing were not performed. Existing
regression scripts omitted from the clean package still have the documented
pre-existing fixture failures; no claim is made that they pass.

Upload all 14 files, including the icons folder, through the established GitHub
Pages workflow. Existing files outside this ZIP are not deleted by uploading it.

---

# AGNT v1.45.0 — Refined visual system, clean deployment package

Built from approved main v1.44.22, commit 2f2a24d3929f6e49a5912cc0ad8bb8b2bfae8792.
This is the same v1.45.0 application, trimmed to 14 deployment files.

Retained: application HTML, JavaScript and CSS; manifest and service worker;
Firebase configuration and Firestore rules; required icons; this release note.

Removed 64 files: historical release notes, old setup/beta/passkey documents,
development checks, unused stylesheets, duplicate root icons, and Apps Script
source files not loaded by the PWA. The complete original package retains those
sources for reference. Existing externally deployed Apps Script automation is
unchanged; this deployment package does not contain its editable source.

All 13 retained files other than this note are byte-identical to the previous
v1.45.0 ZIP. No application, visual, authentication, Firebase, storage, sync or
worker behaviour changed during this packaging cleanup. No version bump is needed.
No Firebase Console, rules, indexes or GitHub settings changes are required.

Upload the contents and icons folder to the existing GitHub Pages source.
No deployment has been performed. This ZIP omits unnecessary files; uploading it
over existing files will not delete old documentation already in your repository.

Validation: ZIP integrity; all HTML/local imports, CSS URLs, manifest icons and
service-worker precache assets resolve; retained files compared byte-for-byte;
release/precache checks pass against the trimmed folder. No new browser/device
testing was required for this packaging-only cleanup. Prior v1.45.0 browser checks
used local fixture data and Firebase stubs; physical iPhone, live Firebase sign-in
and live deployment remain untested. The four inherited regression checks failed
on unchanged main and v1.45.0; they are development files omitted from this ZIP.
