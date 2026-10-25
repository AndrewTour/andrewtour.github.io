# AGNT v1.46.15 — Complete Visual System

Baseline: the complete v1.46.14 Performance and Broadcast replacement ZIP.
This completes the remaining visual inventory against the approved Vercel MD
and the Sellers / Day Plan design language. Earlier release history follows.

- Profile and Settings use a continuous layout, shared type, quiet dividers,
  consistent fields and controls. Team permissions and device-only states remain.
- Team creation/joining, invite codes, member management and destructive
  confirmations use the same hierarchy. Permission and consequence copy remains.
- The annual calendar has a legible monochrome completion scale, consistent month
  dividers, 44px day controls and no calendar entry animation.
- Task creation, booking assignment, team appointment notices and seller-priority
  deferral share the form and decision language. Destructive/short decisions keep
  a restrained backdrop; longer workflows use the full viewport.
- Buyer outcome, follow-up/reason, SMS decisions, pipeline refresh, agent summary
  and appointment market insights follow the same structure and control sizing.
- MarketPulse review, Hot Spotting, Day Log and prospecting health receive the
  remaining spacing, row, field and type refinements. Day Log wins become flat
  rows. Functional rings, charts and semantic status information remain.
- Sync popover and toast treatment is aligned with the shared system.

Engineering: all 1,104 function declarations other than the backup version
marker match v1.46.14 byte for byte. This is a CSS completion pass; app.js,
index.html, runtime.js and service-worker.js only receive release version bumps.
No new listeners, timers, observers, state, storage keys, records or migrations.
Navigation coalescing/cancellation, inactive list/markup release, bounded
navigation diagnostics, page isolation and draft retention are unchanged.
Original styles.css, cleanup.css, Firebase configuration/rules, manifest and
icons are unchanged. No configuration or backend deployment is required.

Validation: automated Chromium and Linux WebKit fixture coverage checks 32
secondary screen states in light/dark themes at 320/390/430px, including 568px
height at the narrow size. Checks cover visibility, viewport/internal bounds,
44px buttons, team owner/member visibility, local settings/workday save, team
setup panel navigation, calendar year/date selection and buyer decision branches.
Screenshots were inspected. Existing People layout/search/filter/selection,
archive/profile and cleanup checks are retained. Each engine receives 1,000
rapid menu events with 1,500 dual-role contacts; assertions require one route
commit per burst and bounded DOM. Final runs have no uncaught browser errors.
Static validation covers syntax, protected-file comparison, local assets and a
complete mocked service-worker install of all 10 precache assets. ZIP contents
and CRC are checked before delivery.

Limits: fixture tests do not sign in, alter live teams, send SMS, launch iOS
Shortcuts or verify backend writes. Linux WebKit is not a physical iPhone/PWA
run. Those live/device checks remain necessary before a production release.
The completed visual inventory is not a claim of exhaustive runtime coverage.

Installation: replace the previous upload with all 14 files from this ZIP.
No node_modules, build dependencies or test fixtures are included. Close/reopen
the installed PWA after updating and confirm AGNT v1.46.15 in Profile/Settings.

---

# AGNT v1.46.14 — Performance and Broadcast

Baseline: v1.46.13 Profiles, Properties and Bookings. This batch applies the
approved Sellers/Day Plan hierarchy to Performance Overview and Broadcast.

- Weekly scorecard uses a compact period header, score/grade, open activity
  metrics, strongest/focus summary and projection. Reporting sections use flat
  trend, productivity, momentum, personal-best, coaching and achievement rows.
- Reporting values, scheduled-day calculations, week navigation, comparisons,
  streaks, achievements and recommendations are unchanged.
- Broadcast type selection uses flat rows. Audience controls, recipient lists,
  message fields, review/test tabs, readiness indicators, previews, exclusions,
  success summary and campaign history share the approved type and controls.
- Steps retain visible headings and progress. The Market header is no longer
  cramped by an inherited width limit. Readiness uses small status dots and
  warnings remain explicit without filled badge stacks.
- A UI scroll correction resets the actual prospecting scroller on user step
  changes and builder open/close. Rerendering the current step retains scroll.
  No asynchronous scrolling, navigation queuing or saved state was added.

Engineering: 1,101 other function declarations match the baseline byte for byte.
Only setBroadcastStep, openBroadcastBuilder and closeBroadcastBuilder receive
UI scroll adjustments, plus the backup version marker. Report calculations,
eligibility/exclusions, deduplication, message token expansion, shortcut payload
construction, launch/handoff and record/sync handlers are unchanged.
Navigation coalescing/cancellation, list release, cache invalidation, page
isolation, form/draft retention and diagnostics remain intact. No new listeners,
observers, timers, records, storage keys or persisted state.

Validation: Chromium and Linux WebKit fixture tests cover ten reporting/Broadcast
states in light/dark at 320/390/430px, including a 568px-high narrow viewport.
Checks cover viewport/control/field bounds, 44px controls, populated/empty
reports and previous/current-week navigation. Audience tests verify do-not-contact
and contacted-today exclusions, personalised token expansion, review readiness,
retained message/scroll when returning/rerendering, isolated test preview,
live/test panel visibility and an empty audience being unable to advance.
Success is a simulated fixture: no SMS, iOS Shortcut or external handoff is
launched during testing. Screenshots were inspected. Existing People/profile/
filter/selection/archive/cleanup checks remain, plus 1,000 rapid menu events in
each engine with 1,500 dual-role contacts, one route commit per burst and bounded
DOM. Final runs have no uncaught browser errors.
Syntax, protected-file comparisons, local assets, complete mocked worker install
(10 assets), manifest/icons and replacement ZIP CRC pass. Inherited legacy
fixture failures documented previously are not claimed to pass.

Tests use local fixtures with startup instrumentation only in test responses;
none is shipped. Physical installed iPhone PWA, live auth/team sync, real
Shortcuts/SMS delivery, native keyboard and network-loss testing were not performed.
No deployment performed.

Changed files: visual-system.css, app.js, index.html, runtime.js,
service-worker.js, RELEASE-NOTES.md. Runtime/worker/index edits are release/cache
markers only. Original styles.css, cleanup.css, Firebase configuration/rules,
manifest and icons are unchanged. Auth/Firestore paths, UID/team isolation,
canonical data, offline queues, storage keys and sync remain untouched.
No Firebase Console, rules/indexes or GitHub settings changes are required.

Replace all 14 files including icons/, then fully close and reopen AGNT.
Settings should show v1.46.14. No reset, sign-out or reinstall is needed.
Remaining passes include Profile/Settings, team administration, calendar and
secondary buyer-match/property decision screens.

---

# AGNT v1.46.13 — Profiles, Properties and Bookings

Baseline: v1.46.12 Editors and Outcomes. This batch brings buyer profiles,
Market property details and appointment browsing into the approved Sellers/
Day Plan language without changing their data or workflows.

- Buyer profiles use open next-action, seller-side, criteria, match and lifecycle
  sections with shared typography and controls. Requirement values and long
  addresses wrap safely. Restore remains a clear action on archived profiles.
- Property matches retain source event, price, reason, state, urgency and call/
  message/contact/outcome actions. Match counts and urgency indicators become
  quiet labels/dots rather than filled circles and nested cards.
- Buyer/seller move opportunities retain evidence and qualifications, with flat
  current-home/matched-property context. Existing follow-up and history remain.
- Market property details use clear address/price hierarchy, restrained statuses,
  open campaign facts, reported history and property-linked activity. Address
  matches still do not imply ownership, and all evidence qualifications remain.
- Appointment browsing uses flat Past/Upcoming destinations, group headings,
  clear property/contact/date rows and uniform 44px actions. MAP/LAP/BAP and
  OFI/auction schedule information remain. Dates, source IDs, team assignments,
  follow-ups, outcomes, calendar/message/edit/delete hooks are retained.
- Browse formatting does not reveal history panels in the New Booking editor.

Engineering: all 1,104 application function declarations match v1.46.12 apart
from the backup version marker. No new listeners/observers, persisted state,
form or record fields, matching/ranking calculations or data writes. App/index/
runtime/worker edits are release/cache identifiers only; presentation is scoped
CSS. Confirmed navigation coalescing, cancellation, inactive-list release,
cache cleanup, page isolation, draft retention and diagnostics remain unchanged.

Validation: Chromium and Linux WebKit cover ten populated/empty/archived detail
and browsing states in light/dark at 320/390/430px (320px height 568). Fixtures
include active buyer matches, linked buyer/seller context, current/sold property,
past/upcoming/empty bookings, new booking, and MAP/LAP/BAP/OFI+auction records.
Checks cover bounds, 44px browse controls and editor/browse separation. Screenshots
were inspected, including lower buyer criteria/match sections. Entry tests cover
buyer follow-up, linked seller profile, property back, retained ownership
qualification, past appointment outcomes, history back and keyboard appointment
editing. Existing People/filter/archive/profile checks remain. Both engines
also process 1,000 rapid menu events with 1,500 dual-role contacts, one final
route commit per burst, bounded DOM and no uncaught browser errors.
Syntax, protected-file comparisons, local assets, complete mocked worker install
(10 assets), manifest/icons and replacement ZIP CRC pass. Previously documented
inherited legacy fixture failures are not claimed to pass.

Tests use local fixture data and test-response startup instrumentation only;
no instrumentation is shipped. Physical iPhone/Home Screen PWA, live auth/team
sync, native sharing/calendar/calls/SMS and network-loss testing were not performed.
No deployment performed.

Changed files: visual-system.css, index.html, app.js, runtime.js,
service-worker.js, RELEASE-NOTES.md. Original styles.css, cleanup.css, Firebase
configuration/rules, manifest and icons are unchanged. Auth/Firestore paths,
UID/team isolation, records, storage keys, offline queues and sync are untouched.
No Firebase Console, rules/indexes or GitHub settings changes are required.

Replace all 14 files including icons/, then fully close and reopen AGNT.
Settings should show v1.46.13. No reset, sign-out or reinstall is needed.
Remaining major passes include Performance Overview, Broadcast and Profile/team.

---

# AGNT v1.46.12 — Editors and Outcomes

Baseline: v1.46.11 Sessions and Knocking. The approved Sellers/Day Plan language
now covers the main contact/buyer editors and common outcome/decision screens.

- New/edit Contact, new/edit Buyer, Property Details, Log Contact and buyer
  purchase forms use continuous surfaces, measured sections, 12px labels,
  readable 16px fields, consistent 44px controls and 48px primary saves.
- Buyer budget, suburb selection, property configuration, position, features
  and journey controls remain present. Configuration selectors wrap with usable
  touch targets rather than squeezing three sets of choices into narrow columns.
- Selected states use the same near-black/white treatment as approved controls.
- Buyer follow-up date/notes use a continuous editor with matching Cancel/Save.
- Appointment follow-up and MAP/LAP/BAP outcome dialogs use open headers,
  property/contact context, consistent options, notes and action controls.
- Manual keypad and call outcomes share the same field, type and control system.
  Existing disabled-call guards and post-call actions remain authoritative.
- Hidden Land configuration and conditional outcome follow-up/purchase fields
  retain their existing visibility; hidden call choices stay hidden after logging.

Engineering: all 1,104 application function declarations are unchanged apart
from the backup version marker. Index/app/runtime/worker edits are release/cache
identifiers only. No form schemas, record shapes, submit/outcome handlers,
validations, focus/draft logic, observers, timers or persistence changes.
Navigation coalescing/cancellation, inactive-list release, page isolation,
local-first saves, background sync and diagnostics remain unchanged.

Validation: Chromium and Linux WebKit cover 12 editor/decision states in both
themes at 320/390/430px, including a 568px-high narrow viewport. Checks cover
viewport/control/field bounds and at least 44px button targets. Screenshots were
inspected. Functional fixture checks cover Land/House conditional fields,
appointment option selection and required-follow-up visibility, Contact save
retaining property configuration/buyer data, Buyer save retaining the canonical
property record, unsaved Contact draft retention through Profile navigation,
Buyer follow-up save/close, keypad input/invalid-number guard and the post-call
choice/action transition. Existing People, filter/search, archive, editor-entry
and cleanup checks remain. Each engine also passes 1,000 rapid menu events with
1,500 dual-role contacts, one route commit per burst and bounded generated DOM.
No uncaught browser errors. Syntax, protected-file comparisons, local assets,
complete mocked worker install (10 assets), manifest/icons and ZIP CRC pass.
Previously documented inherited legacy fixture failures are not claimed to pass.

Tests use local fixtures and test-response startup instrumentation, which is
not shipped. Physical installed iPhone PWA, native keyboard/date picker behaviour,
live Firebase/auth/team sync, real calls/SMS and network-loss testing were not
performed. No deployment performed.

Changed files: visual-system.css, index.html, app.js, runtime.js,
service-worker.js, RELEASE-NOTES.md. Original styles.css, cleanup.css,
Firebase configuration/rules, manifest and icons remain unchanged. Firebase/auth
logic, paths/rules, UID/team separation, storage keys, records, offline queues and
sync are untouched. No Firebase Console, rules/indexes or GitHub changes needed.

Replace all 14 files including icons/, then fully close and reopen AGNT.
Settings should show v1.46.12. No reset, sign-out or reinstall is needed.
Remaining batches include deeper buyer-match/property workflows, bookings,
Performance Overview, Broadcast and Profile/team administration.

---

# AGNT v1.46.11 — Sessions and Knocking

Baseline: v1.46.10 Opening and Reviews. This coordinated visual batch covers
active pipeline calls, buyer list calls, import review, queue completion,
calling/knocking reviews, active knocking, knocking capture and session history.
The approved Sellers/Day Plan language provides the common type/spacing system.

- Calling screens use quiet session progress, open identity/context sections,
  a clear primary call action and consistent secondary SMS/outcome/skip controls.
- Buyer import review keeps editable names, mobiles, addresses and Do Not SMS
  flags, using flat rows with 44px remove controls and readable 16px inputs.
- Queue-complete screens keep their original finish/refresh actions.
- Calling and knocking reviews use open metric rows and a consistent Done action.
- Knocking uses 28px timer/tallies, flat capture actions, restrained conversion
  rates and open client-log rows with visible Edit/Delete actions. Captured names
  wrap rather than truncate. Tally adjustment buttons remain side by side.
- Property/contact capture uses a continuous surface, consistent form controls,
  and date/time fields constrained to narrow viewports.
- Session history uses flat totals and expandable session/log rows; original
  dates, durations, conversion rates, counts and captured records remain intact.
- WebKit text-fill styling follows the actual button colour in both themes,
  preventing inherited legacy text fills from making dark controls illegible.

Engineering: 1,104 application function declarations are unchanged apart from
the backup version marker. All operational app/runtime/worker edits are version
identifiers only; presentation changes are scoped CSS. No timer/queue/outcome,
record, storage or sync code changes. Timer text-only rendering, immediate local
session end, background sync, pause/re-entry, drafts, navigation burst coalescing,
list release, stale-route cancellation, page isolation and diagnostics remain.

Validation: Chromium and Linux WebKit fixture checks cover nine session states
in both themes at 320/390/430px (320px height 568), viewport/control bounds, text
fill matching button colour and minimum 44px targets. Screenshots were inspected.
Workflow checks cover the pipeline call link/outcome editor, removing an import
row, timer node retention, tally adjustment, pause returning to Today, retained
session re-entry, local session end and review dismissal. Existing People list,
filter/search, selection, archive, profile/editor and cleanup checks also pass.
Each engine processes 1,000 rapid menu events with 1,500 dual-role contacts,
one final route commit per burst, bounded DOM and no uncaught browser errors.
Syntax, protected-file comparisons, local assets, complete mocked worker install
(10 assets), manifest/icons and replacement ZIP CRC pass. Inherited legacy test
fixture failures documented earlier are not represented as passing.

Tests use local fixture records with startup bypassed only in test responses.
No instrumentation is shipped. Physical iPhone/Home Screen PWA, live auth/team
sync, real calls/SMS, real PDF extraction and offline network transitions were
not tested. No deployment performed.

Changed files: visual-system.css, index.html, app.js, runtime.js,
service-worker.js, RELEASE-NOTES.md. Index/app/runtime/worker edits are release
markers only. Original styles.css, cleanup.css, Firebase configuration/rules,
manifest and icons are unchanged. Auth, Firestore paths, UID/team separation,
canonical data, storage keys, offline queues and sync remain unchanged.
No Firebase Console, rules/indexes or GitHub settings changes required.

Replace all 14 files including icons/, then fully close and reopen AGNT.
Settings should show v1.46.11. No reset, sign-out or reinstall is needed.
Next batch: remaining detailed editors and secondary outcome/decision screens.

---

# AGNT v1.46.10 — Opening and Reviews

Baseline: v1.46.9 Cohesive People. This coordinated batch covers six surfaces:
loading, sign-in/create-account entry, welcome, returning morning briefing,
end-of-day review and off-day weekly review. The approved Sellers/Day Plan
language provides typography, spacing, flat sections and control sizing.

- Quiet AGNT loading mark with the existing loading/fallback behaviour.
- Flat sign-in form, 48px fields/actions and accessible names on email/password.
  Existing sign-in/create-account/device-only handlers and light sign-in policy
  are retained; this is a visual update, not an authentication rewrite.
- Welcome uses a compact brand/date header, clear greeting and open appointment,
  pipeline and momentum sections. Appointment rows use the shared timing rhythm.
  A long appointment list scrolls independently of the Start My Day control.
- Morning briefing keeps its score, current source states, MarketPulse events,
  review-market action, four operational summaries and existing four-second
  countdown. Restrained orange identifies MarketPulse and countdown progress.
- Weekly review uses open score, day-by-day overview, metric progress bars and
  appointment rows. Its content scrolls independently of Open AGNT.
- End-of-day review uses a continuous full-screen surface, four clear metrics,
  flat plan-versus-completed rows, coaching and matched Send Stats/Finish controls.
- Existing content, data calculations, launch eligibility, timers, storage,
  dismiss actions, Send Stats composition and selected-workday behaviour remain.

Engineering: all 1,104 application function declarations are byte-identical to
v1.46.9 except the backup version marker. No JavaScript workflow changes, new
listeners, timers, observers or persistence. The confirmed navigation coalescing,
cancellation, inactive-list release, cache invalidation, page isolation, draft
protections and diagnostics are carried forward unchanged. Runtime and worker
edits are release/cache identifiers only.

Validation: local Chromium and Linux WebKit checks cover the six screens in
light/dark presentation at 320/390/430px (320px uses a 568px-high viewport).
Sign-in retains its existing always-light policy. Checks cover overflow, control
bounds, 44px-or-larger targets, a twelve-appointment scroll fixture, achieved
metrics, welcome/review exit actions and named sign-in fields. Screenshots were
inspected. Existing People formatting, search, filters, selection, archive,
editor entry and inactive-list tests are retained. Each engine also tests 1,000
rapid menu events with 1,500 dual-role fixture contacts, one route commit per
burst and bounded generated DOM. No uncaught errors in the final browser runs.
Syntax, local assets, protected-file comparisons, complete mocked worker install
(10 assets), manifest/icons and replacement ZIP integrity pass. Inherited legacy
fixture failures documented previously are not represented as passing.

Tests use local fixture data with startup bypassed only in browser responses;
no test instrumentation is shipped. Physical installed iPhone PWA, live sign-in,
team sync, external sharing and network-loss testing were not performed.
No deployment performed.

Changed files: index.html, visual-system.css, app.js, runtime.js,
service-worker.js, RELEASE-NOTES.md. App/runtime/worker changes are version
markers only. Original styles.css, cleanup.css, Firebase configuration/rules,
manifest and icons are unchanged. Auth logic, Firestore paths, UID/team
separation, record shapes, local storage, offline queue and sync are untouched.
No Firebase Console, rules/indexes or GitHub settings changes are needed.

Replace all 14 files including icons/, then fully close and reopen AGNT.
Settings should show v1.46.10. No reset, sign-out or reinstall is needed.

Next batches remain active calling/knocking sessions, followed by detailed
editors and secondary workflows. These were not broadly restyled in this release.

---

# AGNT v1.46.9 — Cohesive People

Baseline: v1.46.8 Clear People. Sellers is the approved design specification.
All people, Buyers and Follow-ups now follow its visual hierarchy; the Sellers
screen itself and its eligibility, filters, sorting and calculations are intact.

- Shared row rhythm: 64px timing gutter (54px on narrow screens), 12px gap
  (10px below 375px), 16px vertical padding, 15px/500 names with 1.35 line height,
  12px supporting copy, 10px labels and small labelled temperature dots.
- Buyers moves follow-up timing to the left, status/role above the name and
  keeps criteria, suburbs, property-match alerts and opportunities together.
  Existing Call/SMS/Follow up controls remain equal sized, 44px high and aligned
  under the record copy. Narrow rows stay within the available width.
- Buyer overview matches Sellers' 20px heading, 28px total, 11px scope copy and
  20px summary values above 10px labels, with flat 12px filter controls.
- All people uses the same summary and row typography, with follow-up timing,
  name, role, property, phone and existing value-trend indicator. Alphabet jump,
  search, CSV import, manage/select and archive workflows remain available.
- Follow-ups uses the same compact summary and count, one quiet queue heading,
  timing gutter, 15px names and 12px context. Clear, call and outcome controls
  retain original record/type/source attributes and workflow bindings.

Only presentation renderers change: buyerCard, renderBuyerProfiles, prospectCard,
renderContactsList and followUpContextCardMarkup. Two shared markup helpers avoid
separate timing/temperature treatments. 1,097 other function declarations are
unchanged apart from the backup version marker. No new observers, timers, row
listeners, persistent state, navigation changes or data writes are introduced.
The confirmed rapid-navigation queue, cancellation, list release/cache cleanup,
page isolation, form/draft retention and diagnostics contract is unchanged.

Validation: 23 check groups per engine pass in Chromium and Linux WebKit, using
local fixture records. Across light/dark themes at 320/390/430px, computed row
font size, weight, line height, padding, gap and timing column match Sellers.
Checks also cover viewport bounds, contained equal-width 44px Buyer actions,
summary counts, contact selection, follow-up logging, search/filters, contact and
property editor entry, archive/restore controls, empty states and profile timing.
Screenshots of all three pages were inspected in both themes. Each engine passes
1,000 rapid menu events with 1,500 dual-role records: one final route commit per
burst, bounded DOM, correct inactive-list release and retained Buyers on repeat
People entry. No uncaught browser errors.

Syntax, protected-file comparisons, local asset links, complete mocked worker
installation with 10 assets, manifest/icons and replacement ZIP CRC pass.
Previously documented inherited legacy fixture failures are not claimed to pass.
Physical installed iPhone PWA, live auth/team sync, real calls/SMS and network-loss
testing were not performed. Test startup instrumentation is not shipped.

Changed files: index.html, app.js, visual-system.css, runtime.js,
service-worker.js, RELEASE-NOTES.md. Runtime/worker edits are release/cache
identifiers only. Original styles.css, cleanup.css, Firebase configuration/rules,
manifest and icons are unchanged. Firebase/auth, paths, UID/team isolation,
records, local storage keys, offline behaviour and sync are untouched.
No Firebase Console, rules/indexes or GitHub settings changes are required.
No deployment performed.

Replace all 14 files, including icons/, then fully close and reopen AGNT.
Settings should show v1.46.9. No reset, sign-out or reinstall is needed.

---

# AGNT v1.46.8 — Clear People

Baseline: v1.46.7 Clear Leaderboard, retaining the confirmed navigation stability
contract. Buyers and contact profiles now use the open Day Plan hierarchy and
the approved Vercel reference: monochrome surfaces, restrained status dots,
measured spacing and consistent 44px action controls.

Buyers:
- A compact summary shows Hot, Due now (today and overdue), and No follow-up
  for buyers in the current search/filter/archive view. The scope is labelled.
- Flat quick-filter tabs with announced selected states, compact results/archive
  controls and open record rows.
- Names wrap safely, with criteria, suburb and follow-up timing beneath.
- Temperature uses a labelled dot; buyer position is quiet text.
- Call, SMS and Follow up share equal widths and 44px heights.
- Search, A–Z order, advanced filters, archived access, restore, buyer matches,
  seller opportunities and all existing action hooks are retained.

Contact profiles:
- Compact Back/Edit controls and identity without decorative avatar circles.
- Consistent Call, Message and Log Contact controls.
- Next follow-up, last contact, motivation and contact count now appear directly
  after the main actions, ahead of secondary tools and property intelligence.
- Phone contact export and property details remain adjacent in their existing
  order. Property estimates retain evidence and confidence qualifications.
- Buyer/seller links, selling timeframe, background and history remain available.
- Shared profile controls also retain the established Buyer detail rhythm.

Engineering:
Only renderBuyerProfiles and renderProspectDetail change outside version markers.
No new observers, timers, row listeners, persisted UI state or data writes.
All navigation coalescing/cancellation, list release/cache invalidation,
form/draft protections, page isolation and diagnostics helpers are unchanged.
1,100 other function declarations match the selected baseline byte for byte.
Firebase/auth, rules/paths, UID/team isolation, record shapes, storage, local-first
persistence, offline queues and sync remain unchanged. Worker/runtime edits are
release/cache identifiers only. No Firebase Console, rules, indexes or GitHub
settings changes are needed.

Validation:
JavaScript syntax, local HTML assets and mocked complete service-worker install
(10 assets) pass. WebKit and Chromium each pass 15 browser check groups covering both themes at
320/390/430px, bounds and 44px/equal-width actions, profile information order,
summary counts, quick filters, search, advanced filters, follow-up entry,
contact/property editors, archive/restore control and empty states. Screenshots
were inspected in light and dark mode. Each engine also passes 1,000 rapid menu
events using 1,500 dual-role test contacts: one final commit per burst, bounded
DOM, repeat People preserving Buyers, and inactive list release. No uncaught
browser errors. Complete replacement ZIP integrity is verified.
Inherited legacy check-fixture failures documented in previous releases remain;
they are not represented as passing. Testing uses local fixture records with
Firebase startup bypassed only in the test response, never in the shipped app.
Physical installed iPhone PWA, live authentication/team sync, real calls/SMS and
network-loss testing were not performed. No deployment performed.

Changed files: index.html, app.js, visual-system.css, runtime.js,
service-worker.js, RELEASE-NOTES.md. Original styles.css, cleanup.css,
Firebase configuration/rules, manifest and icons are unchanged.

Replace all 14 files, including icons/, then fully close and reopen AGNT.
Settings should show v1.46.8. No reset, sign-out or reinstall is needed.

---

# AGNT v1.46.7 — Clear Leaderboard

Baseline: v1.46.6 Sellers and Market. Day Plan hierarchy now carries into
Performance > Leaderboard, with the existing ranking/scoring model retained.

- Visible Daily/Weekly controls replace the cryptic header DAY shortcut.
- A compact personal progress ring, position, gap to lead and ranked-agent count
  follow the selected day/week, including historical periods. The ring is labelled
  as the user's progress rather than the daily leader's score.
- Gap is shown in percentage points. Zero-completion and appointment-only activity
  have distinct summaries; neither falsely declares a lead before a score exists.
- Flat ranked rows show rank, agent identity/You, overall completion and five
  labelled metrics with their existing actual/target progress bars.
- Historical score-only records retain unavailable metric values, not false zeros.
- Find me scrolls/focuses the signed-in user's row without creating a new view.
- Existing pointer/keyboard agent entry opens the unchanged appointment summary.
- Daily history arrows/Today remain. Weekly arrows retain history access; the
  centre control now explicitly returns to This week instead of Last week.
- Team connection status remains visible and uses the existing source state.
- Overview, team permissions, ranking order/tie-breaks, scores, daily/weekly
  calculations, historical records and appointment counts are unchanged.

Stability contract retained: navigation bursts coalesce, inactive list DOM is
released, old requests cancel, forms/drafts survive, and page containers do not
animate. No additional observers, timers, data writes, persisted state or row
listeners were introduced. New controls use existing delegated summary entry or
single static handlers.

Validation: 12 browser checks in each of WebKit and Chromium cover light/dark
layouts at 320/390/430px, visible and unclipped metrics, 44px controls, descending
ranks, own score/gap, past-day/score-only data, weekly history/reset, Find me with
keyboard appointment entry, zero activity, appointment-only activity and empty
states. Screenshots were inspected in both themes. 1,000 rapid menu events pass
in each engine with 1,500 dual-role fixture contacts; one final commit per burst,
correct destinations and released inactive lists. No uncaught errors.

1,097 baseline function declarations compare unchanged except five presentation
renderers/helpers and the backup version marker. Syntax, mocked worker install,
all 10 precache assets, manifest icons, local HTML links and ZIP CRC were checked.
Legacy fixture failures previously documented are not claimed as passing.

Changed files: index.html, app.js, visual-system.css, runtime.js,
service-worker.js, RELEASE-NOTES.md. Runtime/worker changes are release/cache
identifiers only. Original styles.css and cleanup.css are unchanged.

Firebase/authentication, rules/paths, UID/team isolation, storage keys, records,
local-first persistence, offline queues and sync are untouched. No Firebase
Console, rules/indexes or GitHub settings changes are required.
Tests used local fixtures/Firebase stubs. Live team/authentication and physical
installed iPhone PWA testing were not performed. No deployment performed.

Replace all 14 files, including icons/, then fully close and reopen AGNT.
Settings should show v1.46.7. No reset, sign-out or reinstall is needed.

---

# AGNT v1.46.6 — Sellers and Market, Day Plan language

Baseline: v1.46.5 Reach and Performance. All v1.46.4 stability protections and
subsequent navigation decisions are carried forward unchanged.

Sellers / Pipeline:
- Compact next-conversation summary replaces the oversized introduction.
- Due-now and missing-follow-up totals describe the currently filtered sellers.
- Four timeframe totals remain, with matching counts beside each group heading.
- Temperature filters use the flat tab rhythm; sorting stays available.
- Each flat row puts follow-up timing in a left gutter, followed by temperature,
  buyer/seller role, name, property address and linked listing appointment.
- Temperature uses a small labelled dot; decorative avatar circles are removed.
- All existing record-entry hooks, eligibility, filtering and sorting remain.

Market Overview:
- Imported-report totals separate current listings, sold results and withdrawals.
  The existing six-month scope for closed results remains clearly labelled.
- Existing eligible analytics use compact, open typography rather than cards.
- Property rows use report date, status, address/configuration, reported guide or
  sold price, and saved-contact opportunity/context in descending hierarchy.
- Status tags become small labelled dots. Street/address matches retain their
  existing qualifications; they are not represented as confirmed ownership.
- Suburb/category/status filters, Show more, detailed property history, contact
  linking, agency analysis and seller estimates remain available.
- Matching, prices, confidence, calculations and source-scope rules are unchanged.

Stability: no new observers, per-row listeners, page animations or stored state.
The rapid-navigation queue, cancellation, list release and cache invalidation,
form/draft protections and diagnostics helpers are byte-identical to v1.46.5.

Validation: 15 WebKit checks cover both pages in light/dark at 320/390/430px,
correct seller totals/due/missing counts, temperature filter, sort, profile entry,
Market summaries, Sold/90-day filters, reported price, detail/history/back and
inactive list release. WebKit and Chromium each pass 1,000 rapid menu events
with 1,500 dual-role fixture contacts; one final route commit per burst and no
uncaught errors. Screenshots were inspected for both themes. 1,098 baseline
function declarations are unchanged outside four presentation renderers and the
backup release marker. Syntax, mocked worker install, 10 precache assets, local
HTML links, manifest icons and ZIP CRC were checked.

Changed files: index.html, app.js, visual-system.css, runtime.js,
service-worker.js, RELEASE-NOTES.md. Runtime/worker edits are release/cache
identifiers only. Original styles.css and cleanup.css are unchanged.

Firebase/authentication, Firestore paths/rules, UID/team separation, records,
storage keys, offline queues, local-first writes and sync remain untouched.
No Firebase Console, rules/indexes or GitHub settings changes required.
Physical iPhone/PWA and live Firebase/team/network-loss tests were not performed.
Legacy fixture failures documented below are not claimed as passing.
No deployment performed.

Replace all 14 files, including icons/, then fully close and reopen AGNT.
Settings should show v1.46.6. No reset, sign-out or reinstall is required.

---

# AGNT v1.46.5 — Reach and Performance navigation

Baseline: v1.46.4 Rapid Navigation Fix, confirmed crash-free by Andrew.

- Reach moves from People to Market. Its active navigation, profile return and
  broadcast workflow consistently identify Market as the parent destination.
- Performance opens on Leaderboard. Leaderboard is the first subtab; Overview
  remains available beside it. Existing Daily/Weekly leaderboard mode is retained.
- All four Reach outreach action buttons use the same fixed 128 x 48px size,
  including Start Session, Active Session, Session Complete, Import PDF and
  Broadcast labels. Button text may wrap inside the fixed control.

Preserved stability contract: queued rapid navigation commits only its final
intent; inactive generated lists are released; drafts and canonical records are
retained; page-entry animations remain disabled; header writes are idempotent;
background/owner changes cancel obsolete requests. All related helpers compare
byte-for-byte unchanged against the confirmed stable v1.46.4 source.

Validation: ten WebKit checks cover navigation, profile return, broadcast parent,
Performance landing and Overview access, plus button dimensions/overflow in light
and dark themes at 320/390/430px with five label states. Rapid-navigation suites
exercise 1,000 menu events in WebKit and 1,000 in Chromium with 1,500 dual-role
fixture contacts, verifying one commit per burst and released inactive lists.
No uncaught errors. 1,099 baseline function declarations are unchanged outside
three requested presentation/routing edits and the backup version marker.
JavaScript syntax, mocked worker installation, all 10 release assets, HTML links,
manifest icons and ZIP CRC checks passed.

Changed files: app.js, visual-system.css, index.html, runtime.js,
service-worker.js, RELEASE-NOTES.md. HTML/runtime/worker edits are release/cache
identifiers only. Firebase/authentication, rules/paths, UID/team separation,
records, storage keys, local saves, offline queues, sync, original styles.css
and cleanup.css are unchanged. No Firebase Console, rules/indexes or GitHub
settings changes required.

Browser tests use local fixtures and Firebase stubs. Physical iPhone/PWA,
live Firebase/team access and deployment were not tested. Previously documented
legacy regression fixture failures are not claimed as passing.

Replace all 14 deployment files, including icons/, then fully close and reopen
AGNT. Settings should show v1.46.5. No data reset or reinstall is needed.

---

# AGNT v1.46.4 — Rapid navigation and resource containment

Baseline: v1.46.3 Navigation Stability, which Andrew reports still crashes.
The v1.46.3 patch did not resolve the reported device crash. Its tests exercised
serial transitions and did not cover an event burst or retained list DOM.

Reproduced evidence in Linux WebKit:
- 80 menu click events dispatched together kept the main thread busy for
  30,307 ms in v1.46.3 and executed 80 complete route transitions.
- Visiting Contacts, Buyers and Pipeline with 1,500 dual-role fixture contacts
  retained 51,589 page elements after returning to Today.
- With this patch the same burst dispatch took 40 ms and committed just the final
  route after a 60 ms settling window and animation-frame scheduling. Dispatch
  timing is not a claim that the whole final screen rendered in 40 ms.
- The same list-navigation sequence retained 2,078 page elements on Today.

Changes:
- Footer, toolbar and profile navigation coalesce rapid requests; only the final
  pending destination is rendered. Internal workflows remain synchronous.
- A direct workflow, backgrounding or owner change cancels stale pending routes.
- Inactive generated contact/buyer/pipeline/market list DOM and its HTML caches
  are released. Canonical records, filters, selected IDs and draft forms remain.
  Lists rebuild on entry. The current selected People subsection is retained.
- Page-entry animations, transforms and backdrop filters are disabled on page
  containers. CSS isolation retains their stacking boundary without animation.
- Existing bounded diagnostics gain navigation-start/navigation-ready events.
  Settings adds Download app diagnostics. The export contains at most 48 runtime
  events with version, time, screen IDs and error codes; no client/form content.

Validation:
- 1,000 menu click events in 20 bursts in WebKit and 1,000 in Chromium, with
  1,500 dual-role contacts. All 40 bursts committed the final destination once;
  no uncaught errors, wrong destinations or unreleased inactive lists.
- Contacts/Buyers revisits rebuild from canonical records. A repeat People tap
  while on Buyers preserves its selected list.
- Six WebKit workflow checks: actual unsaved contact form node and values,
  booking draft, background cancellation, immediate-workflow precedence, search
  restoration after list release, privacy-bounded diagnostics download.
- Fourteen browser checks in both Chromium and WebKit cover themed layouts,
  task completion/reopen, booking entry, day-log action, fixed Focus, past/future
  dates, morning priority, empty off-day and baseline planning equivalence.
- Nine idle/header/profile checks passed in Chromium.
- 1,094 baseline function declarations are byte-identical, excluding the five
  intended route/lifecycle/release-marker edits. New helper functions are UI-only.
- JavaScript syntax, mocked worker installation, all 10 precache assets, manifest
  icons, HTML references and complete ZIP CRC verified.

Protected: authentication, Firebase configuration, Firestore rules/paths,
UID/team separation, persistent record shapes/keys, local-first writes, offline
queues, matching and sync. No data reset, sign-out or reinstall is needed.
No Firebase Console, rules/indexes or GitHub settings changes are required.

Changed files: app.js, visual-system.css, runtime.js, index.html,
service-worker.js, RELEASE-NOTES.md. Worker behaviour is unchanged except release
and cache identifiers. Original styles.css and cleanup.css remain unchanged.

This reproduces and fixes a WebKit main-thread freeze and resource-retention
problem. An actual native iPhone process termination was not reproduced. Linux
WebKit is not physical iPhone Safari/PWA; on-device verification is still needed.
Live Firebase/team permissions and real network-loss testing were not performed.
The previously documented legacy suite fixture failures remain; they are not
claimed as passing. No deployment performed.

Replace all 14 files, including icons/, then fully close and reopen AGNT so the
new service worker can activate. Settings must show v1.46.4. If a device issue
remains, Download app diagnostics provides bounded device-side evidence.

---

# AGNT v1.46.3 — Navigation runtime and stability

Baseline: v1.46.2 Clear Schedule. Compared with the pre-Vercel approved main
v1.44.22 at commit 2f2a24d3929f6e49a5912cc0ad8bb8b2bfae8792.
The v1.46.2 design is retained; no rollback or source mixing.

Confirmed regressions in the workspace navigation layer:
- One route change could call workspace-header synchronisation up to six times.
- Buyers and Market could render twice; Performance rendered its scorecard twice
  and also generated the inactive daily timeline.
- Header synchronisation repeatedly filtered/sorted the full contact database,
  even though the contact list already supplied its count.
- Repeated writes to app state attributes and header content caused unnecessary
  DOM mutations and style invalidation across the expanded stylesheet.

Fixes:
- Workspace navigation batches header synchronisation until the transition ends.
- Route setup defers content rendering to the selected destination.
- Performance renders the scorecard once and does not render the inactive agenda.
- The header uses the rendered contact count instead of sorting contacts again.
- Workspace attributes, classes and text are only written when they change.
- Detail/session observer callbacks are coalesced into one animation frame.
- Added page-wide relational CSS selectors use explicit existing workspace state
  instead, with equivalent selector specificity and visual declarations.

Protected: Firebase/authentication, rules and paths, UID/team separation, data
shapes, storage keys, local saves, offline queues, matching and planning logic.
No Firebase Console, rules/indexes or GitHub settings changes required.
Worker policy is unchanged; release/cache markers advance to 1.46.3.

Changed files: app.js, visual-system.css, index.html, runtime.js,
service-worker.js, RELEASE-NOTES.md. HTML/runtime/worker edits are release
identifiers only. Original styles.css and cleanup.css are unchanged.

Validation:
- 112 navigation transitions with 1,500 fixture contacts in Chromium; zero
  uncaught errors and no ongoing idle DOM mutations. This did not reproduce an
  actual process crash, and does not establish native iPhone memory behaviour.
- Instrumented navigation confirms Buyers, Market and scorecard render once.
  Contact navigation filters once instead of five times in the measured route.
- 800 direct repeated header calls across eight routes cause zero DOM writes.
- Profile open/close retains contextual toolbar behaviour.
- 14 existing browser layout/workflow checks pass: both themes, three viewport
  widths, task add/complete/reopen, booking entry, day-log routing, past/future
  dates, empty off-day, retained fixed Focus and baseline planning equivalence.
- 1,088 baseline functions compare byte-for-byte unchanged, excluding intended
  navigation/render changes and the release marker. Protected files match.
- JavaScript syntax, mocked worker installation, 10 precache assets, local HTML
  references, manifest icons and complete ZIP integrity checked.

Legacy regression scripts were rerun against the historical and patched source.
They retain their pre-existing stale asset/function/fixture failures; they were
not rewritten or represented as passing. They remain outside the clean ZIP.

The reported native iPhone process crash could not be reproduced here. The patch
removes confirmed navigation work amplification; on-device verification is still
required to establish whether it resolves Andrew's crash. Live Firebase/team,
real offline network transitions and deployment were not tested. WebKit could not
run in this host environment because its required native dependencies were not
available in a usable form. No deployment performed.

Upload all 14 deployment files, including icons/, via the established GitHub
Pages process. No data reset, reinstall, sign-out or cache clearing is required.

---

# AGNT v1.46.2 — Clear Schedule

Baseline: AGNT v1.46.1 Fixed Focus Dashboard, carried forward in full.

Schedule now uses one date in the header, a compact current priority, a labelled
Add task action and flat time/content rows. The vertical rail, warning circles,
large repeated date and colour-coded category headings have been removed.

- Clear status text: Now, Planned, Needs attention, Done or Elapsed.
- A street lacking qualifying data reads Waiting for data rather than Done.
- The day-plan summary shows block count and blocks needing attention.
- Time allocations, priority selection, task state and eligibility are unchanged.
- Existing row actions, call links, booking editor, bulk SMS, buyer opportunities,
  street details, seller deferral and day-review workflow are retained.
- Buttons use the shared control radius and minimum 44px touch target.
- White/grey/near-black surfaces and small status dots adapt to both themes.
- The fixed Focus screen and other workspace destinations are retained.

Changed files: index.html, app.js, visual-system.css, runtime.js,
service-worker.js, RELEASE-NOTES.md. Runtime/worker changes are release markers
only. Original styles.css and cleanup.css are byte-identical to the baseline.

No Firebase Console, Firestore rules/indexes or GitHub settings changes needed.
Authentication, user/team separation, data shapes, storage keys, local saves,
offline queues and sync functions are unchanged. No deployment performed.

Validation: JavaScript syntax checks; 14 browser checks covering six themed
viewport layouts, identical baseline planning/status output, task add/complete/
reopen, booking entry, wrap-up navigation, retained Focus, past/future dates,
morning priority and empty off-day state. Six additional browser checks covered
long street and buyer-match content at 320/390/430px in both themes. Local test
fixtures and Firebase stubs were used; no real client records were changed.
Function comparisons verify protected code is unchanged. Service-worker install
was tested with mocked fetch/cache and all 10 release assets resolve. ZIP CRC,
manifest icons and local HTML references were checked.

Physical iPhone/installed Safari PWA, live Firebase authentication/team access,
external telephone/SMS handoffs and deployed-site testing were not performed.
The clean deployment baseline includes no legacy standalone regression scripts;
its earlier documented fixture failures are not claimed as passing.

Replace all 14 deployment files, including icons/, through the established
GitHub Pages workflow. Uploading this ZIP does not remove old repository docs.

---

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
