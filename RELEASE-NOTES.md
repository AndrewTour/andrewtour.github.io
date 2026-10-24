# AGNT v1.46.1 — Fixed Focus dashboard

Built incrementally from the approved v1.46.0 Conversation Workspace.

- Greeting replaces the Today heading on Focus, with the date below.
- Removed the next-action / appointment block from Focus. Schedule and booking
  workflows remain available through their existing tabs.
- Daily progress, leaderboard summary, quick actions and all four metrics fit
  within the available viewport without scrolling on scheduled Focus days.
- Kept actual-progress and expected-pace rings, counters and timer controls.
- Equal metric rows adapt to screen height; short screens use compact metric copy.
- Other destinations and off-day opportunity workflows retain their existing layout.

Changed files: index.html, app.js, visual-system.css, runtime.js,
service-worker.js and RELEASE-NOTES.md. Runtime and worker changes are release
identifiers only. No Firebase, rules, indexes or GitHub settings changes required.
Original styles.css and cleanup.css are unchanged. No deployment performed.

Validation: 118 browser navigation/layout checks; five booking/draft/counter
workflow checks; 12 fixed-layout checks across six viewport sizes in both themes
with simulated 47px top and 34px bottom safe areas; off-day workflow checks.
Browser checks used local fixture data and Firebase stubs. Physical iPhone,
installed Safari PWA and live Firebase authentication have not been tested.
On compact screens long metric descriptions are ellipsised to preserve controls.

Upload all 14 files, including icons/, via the established deployment workflow.

---

# AGNT v1.46.0 — Conversation-first workspace

Built from the v1.45.2 Progress and Contrast ZIP provided in this conversation.
Source lineage remains approved GitHub main v1.44.22, commit
2f2a24d3929f6e49a5912cc0ad8bb8b2bfae8792. No beta or older recovery code used.

## New application structure

- Today: Focus, Schedule, Log and Bookings. Focus leads with the next action and
  contact context, then daily completion, leaderboard position, utilities and
  the existing metric rings/pacing. Content scrolls on compact/installed viewports.
- People: All people, Buyers, Sellers, Follow-ups and Reach. All people includes
  active contact records and active buyer-only records without duplicating or
  migrating them. Opening a buyer-only record from All people uses the existing
  buyer profile and returns to All people.
- Market: Overview, MarketPulse and Hot Spotting, retaining the established
  import, matching, outreach, property and entry-aware return workflows.
- Performance: weekly scorecard/trends and Leaderboard. Existing period controls,
  statistics and ranking calculations are retained.
- Settings is behind the persistent profile button with an explicit contextual
  return. The greeting becomes quiet supporting copy on Today.

## Person and booking interfaces

Contact and buyer profiles share identity, spacing and three-action layout while
retaining their role-specific fields, lifecycle actions and activity history.
The duplicate buyer Update action is removed from the main action row; Edit stays
in the profile header. No fields or records are migrated or removed.

Booking history is separate from a single full-page appointment editor. Existing
quick-book/contextual paths use that same editor. Back retains an unfinished new
booking; successful normal save returns to browsing; edit save returns to its
existing history context and retains the appointment ID. Seller/buyer session
booking, assignment and calendar logic remain the existing workflows.

The four-destination header/navigation is presentation state only. It introduces
no new storage keys, collections or persistent record fields. Existing per-UID
local caches, drafts, session state and cloud sync remain authoritative.

## Changed files

- index.html: four main destinations, subview navigation host, profile entry,
  booking browse/editor headings and release references.
- app.js: presentation routing/chrome, UI-only booking browse/editor state,
  People list scope, role-profile presentation and release identifier. Existing
  save/cancel/contextual-entry operations are reused.
- visual-system.css: new navigation, conversation-first Today hierarchy, shared
  profile/booking/editor layout, responsive refinements and readonly scorecard
  legibility. Original styles.css and cleanup.css are not modified.
- runtime.js: release identifiers only.
- service-worker.js: release/cache identifiers only; asset/lifecycle/fetch policy
  unchanged.
- RELEASE-NOTES.md: this entry, with previous release history retained below.

## Protected systems

Firebase configuration, Authentication, Firestore paths/rules, UID separation,
normalisation, save functions, storage keys, data formats, offline queue and cloud
sync remain unchanged. Original CSS files, manifest, icons, firebase-config.js,
firebase.json and firestore.rules are byte-identical to v1.45.2.

Compared unchanged source for startCloudSession, loadLocal, saveLocal, saveDay,
saveProspecting, flushProspectingSave, normaliseProspect,
normaliseAppointmentRecord, addAppointment and editAppointment.

No Firebase Console, Firestore rules/indexes or GitHub settings changes required.
Nothing has been pushed or deployed.

## Validation

Passed:
- JavaScript syntax and CSS syntax/standard selector checks. The native WebKit
  scrollbar selector was exercised in the browser rather than cssselect2.
- Protected-file/function comparisons and required asset checks.
- 118 headless Chromium navigation/layout checks across 320, 390 and 430px in both
  themes, including all main destinations and their working subviews, profiles,
  profile returns and unfinished booking retention. No horizontal page overflow.
- Five additional workflow checks: create booking once, edit without duplicating
  its ID and return to history, contextual quick booking, contact draft retention
  across profile navigation, counter and ring connection.
- Off-day Today visibility and quick booking entry with the original work-day
  configuration.
- Screenshots inspected for main destinations, profiles, booking editor/history,
  Follow-ups, Reach and relevant light/dark states.
- Worker install/cached navigation/visual CSS precache using local asset fixtures.
- ZIP integrity and complete 14-file package.

Browser checks used synthetic local records and Firebase SDK stubs in device-only
mode, Australia/Sydney timezone, with a fixed 24 October morning fixture.
Live Firebase sign-in/team permissions, real offline transitions, Safari/WebKit,
physical installed iPhone PWA, external phone/calendar handoffs and live deployment
were not tested. The inherited regression scripts omitted from the clean package
retain their earlier baseline fixture failures; they are not represented as passing.

## Deployment

Replace the existing GitHub Pages source with all 14 files, including icons/,
using the established workflow. No build step or additional configuration.
Uploading these files does not delete older documentation already in GitHub.

---

# AGNT v1.45.2 — Progress rings and balanced controls

Built directly from v1.45.1 Bright Visual System. This is a presentation-only
update in the same 14-file clean deployment package.

## What changed

- Restored all four metric progress rings, including their existing actual progress,
  expected pace, percentage labels, accessible descriptions and green completion
  state. Ring values and calculations remain the original application logic.
- Added tonal separation with black primary actions, grey secondary controls and
  quiet grey utility/priority rows. The bright page canvas and light, blur-free
  dialogs remain.
- MarketPulse uses a consistent AGNT orange circle with a white icon on Home,
  off-day Home, My Market and its page-entry icon.
- Standardised primary/secondary buttons, record actions, back/dismiss controls,
  booking/task actions and form-field corners. Common full-size actions use 44px
  minimum height, 8px radius and 13px medium-weight labels; compact icons and record
  actions retain their practical footprints and touch areas.
- Coaching and pacing copy remains visible with its informational emphasis.

## Changed files

- visual-system.css — progress rings, tonal palette, MarketPulse and shared controls.
- index.html — asset query versions and Settings version label.
- app.js — backup release identifier only.
- runtime.js — release identifiers only.
- service-worker.js — release/cache identifiers only.
- RELEASE-NOTES.md — this entry; previous release notes retained below.

## Protected systems

Firebase configuration/authentication, Firestore paths/rules, UID separation,
records, calculations, storage, offline cache/queue and sync are unchanged.
Original styles.css/cleanup.css, manifest, icons, Firebase configuration and
Firestore rules are byte-identical to v1.45.1. Application/runtime/worker comparison
confirms that only their release identifiers changed.

No Firebase Console, rules, indexes or GitHub settings changes are required.
Nothing has been pushed or deployed.

## Verification

Passed JavaScript syntax, CSS syntax/selector parsing, protected-file comparisons,
complete ZIP integrity and required asset checks. Worker installation/cached
navigation checks passed with local fixture responses.

49 headless Chromium layout/workflow checks passed: six main screens at
320/390/430px in light and dark mode, Core sections, profiles/editors, counter
changes, metric containment and task dialog open/close. Eleven additional checks
passed for ring restoration and 50%/100% completion, orange MarketPulse, matching
booking/task action tokens, type selection, booking access and light/no-blur
modal presentation. Relevant screenshots inspected.

Checks used synthetic records and Firebase SDK stubs in device-only mode, with
Australia/Sydney timezone. Live Firebase sign-in/team permissions, real network
loss, Safari/WebKit, physical installed iPhone PWA and deployed-site testing were
not performed. Inherited regression scripts remain omitted from this clean ZIP;
their previously documented baseline fixture failures were not changed.

Upload all 14 files, including the icons folder, through the existing GitHub Pages
workflow. No new deployment settings or configuration steps are required.

---

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
