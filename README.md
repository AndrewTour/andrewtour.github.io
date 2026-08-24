# AGNT BETA v1.36.22 — Daily MarketPulse Refresh

Incremental BETA update built directly on the supplied AGNT BETA v1.36.21 MarketPulse automation package, which extends the `AndrewTour/AGNT-beta` GitHub `main` baseline (`b8f6d0e187b00a1eca0d1dc5aeb9d960be83c8ff`, AGNT BETA v1.36.20).

## Release baseline
- Application/UI source: current `AndrewTour/AGNT-beta` GitHub `main` baseline at the commit above.
- Firebase environment: existing BETA project `daily-accountability-be0ac`.
- Existing Firebase Authentication accounts and UIDs are retained.
- Existing personal data remains under the current `users/{uid}` paths.
- Existing Team membership, invite-code and Team leaderboard paths are retained.
- No user-data migration is required.

## Included functionality
- Complete Team create/join/leave/owner-management workflow, including Team deletion.
- Daily and current-week Team leaderboard sync.
- Persistent Pipeline Session refresh with per-user/per-day served-contact exclusion.
- Broadcast contrast and viewport refinements.
- Universal nested/session navigation polish.
- Returning Daily Snapshot for four seconds on every second returning app open.
- Consumer-ready login with persistent Firebase authentication restore.
- Team appointment assignment after Book Appointment, defaulting to Me.
- Assignment choices use the live Team leaderboard display name and show first name only.
- The original setter keeps the appointment statistic and personal source appointment.
- The assigned teammate receives a Team-owned appointment mirror without another user writing into their private `users/{uid}` records.
- Recipient sees the appointment in their appointment/timeline surfaces without receiving the setter's appointment statistic.
- Live/next-open appointment notification with Got it and Add to Calendar.
- Setter-facing appointment/log/leaderboard context shows `Booked for [First name]` where applicable.
- Targeted dark-mode contrast fixes for appointment contact suggestions and Editing Appointment.

## Daily MarketPulse refresh added in v1.36.22
- The collective inbox bridge now runs once daily at approximately 6:00 am in `Australia/Sydney`, after the expected 4:30 am MarketPulse delivery window.
- Running the updated `setupMarketPulseBridge` removes the earlier five-minute trigger and installs exactly one daily trigger. Manual `runMarketPulseBridgeNow` remains available.
- A valid newer MarketPulse email replaces the prior active Hot Spotting event deck instead of accumulating old daily cards.
- If a prior-day Hot Spotting session was left open, rollover closes that obsolete session safely before presenting the new deck; already logged activity remains in history.
- Yesterday's active Hot Spotting remains available when today's email is missing, delayed, unauthenticated or cannot be parsed. Settings shows **Awaiting today's MarketPulse** until a valid new import succeeds.
- Same-day duplicate or corrected emails refresh matching events while preserving session started/completed/skipped progress. Delayed older emails cannot roll the active deck backwards.
- Contacts, notes, call outcomes, follow-ups and interaction history are preserved. Only the active `marketPulseEvents` deck rolls forward.
- Firebase configuration, Authentication, UID-scoped paths, Team data, Firestore rules and the service-account arrangement remain unchanged. No migration or Blaze plan is required.

## MarketPulse automation added in v1.36.21
- One collective inbox, `agnt.marketpulse@gmail.com`, can receive MarketPulse forwards for multiple AGNT users.
- Each AGNT account registers its normalized login email on the existing private `users/{uid}` profile. The bridge allocates a forward only when the forwarding address, embedded original recipient and AGNT login email all match.
- A bundled Google Apps Script bridge checks the dedicated Gmail inbox on the configured daily schedule, validates the approved original sender and subject plus McGrath DKIM/DMARC authentication, and writes an idempotent pending item to `users/{uid}/marketPulseInbox/{gmailMessageId}`.
- AGNT waits for the authoritative Prospector cloud snapshot, imports pending MarketPulse data directly into Hot Spotting, merges by deterministic event ID, and preserves existing session progress.
- Successful intake removes the raw email body from Firestore and retains only processing metadata. Manual paste remains available as a fallback.
- Settings now shows the forwarding address, connection state and latest successful import.
- The bridge uses the existing Firebase BETA project through a service account held only in Apps Script Properties. No credential is bundled in this repository.
- No Firebase Blaze plan, Cloud Function, Firestore rule change, UID migration, Team-path change or data migration is required.
- One-time installation instructions are in `automation/marketpulse-apps-script/SETUP.md`.

## Buyer save performance added in v1.36.20
- Editing an existing buyer now saves to the device once, returns to the updated buyer profile immediately and completes Firestore sync in the background.
- The visible save no longer waits for the 160ms prospecting debounce or the full cloud round trip.
- Existing background-sync error handling remains active, including the local-save fallback and cloud-sync warning.
- New-buyer creation retains the existing Data-credit-first ordering before the buyer cloud write.
- Buyer records remain inside the current UID-scoped Prospector state document; no Firebase migration or rule change is required.
- Firebase configuration, Authentication, Firestore paths/rules, UID separation, Team, appointments and leaderboard behaviour remain unchanged.

## Buyer card hierarchy added in v1.36.19
- Scheduled buyer follow-ups use AGNT blue, while due-today, overdue and unset states retain distinct amber, red and neutral treatments.
- Buyer cards separate configuration and budget from the primary suburb, preventing long requirement summaries from competing on one line.
- Buyer-list budgets use compact values such as `$1.6m` and `$950k`; the full amount remains available in buyer detail and editing views.
- Card metadata and action controls use a calmer weight while retaining iPhone-safe 44px tap targets.
- Stage, Temperature and Buyer notes values use 15px medium-weight form text in both themes.
- The sticky Prospector toolbar and search field use fully opaque light and dark surfaces so scrolled content cannot show through.
- Firebase configuration, Authentication, Firestore paths/rules, UID separation, Team, appointments and leaderboard behaviour remain unchanged.

## Buyer visual refinement added in v1.36.18
- Buyer follow-up now uses an explicitly opaque, non-glass sheet with no backdrop blur in both light and dark mode.
- The sheet, fields, close control and actions have explicit theme surfaces so underlying buyer content cannot bleed through.
- A saved current address is shown directly under the buyer's mobile in the detail header using the same size, weight and colour.
- Journey select values and Buyer notes use the standard AGNT form-text weight instead of inheriting the heavier field-label weight.
- The Prospector search field's native inner outline is removed while retaining the existing outer control shape and focus behaviour.
- Firebase configuration, Authentication, Firestore paths/rules, UID separation, Team, appointments and leaderboard behaviour remain unchanged.

## Buyer UI cohesion and trust fixes added in v1.36.17
- Buyer cards now use the same AGNT hierarchy throughout: name and temperature, concise search criteria, visible next action, then equal Call / SMS / Follow up controls.
- Buyer position tags are contained to one visible tag plus `+N` in the list, with the full set retained in buyer detail.
- Buyer follow-up dates and overdue state are visible on cards, in buyer detail and in activity history.
- Buyer detail is organised into Next Action, Buyer Brief and Activity sections using the existing AGNT visual language.
- Advanced filters now include Position and Follow-up state, alongside the existing property-matching filters.
- Buyer actions, quick filters, configuration choices, suburb chips and modal close controls use iPhone-safe tap targets.
- Light-mode buyer metadata contrast is strengthened while existing dark-mode separation is retained.
- The buyer suburb editor now uses one custom suggestion system instead of competing native and custom autocomplete lists.
- Editing a buyer and opening a follow-up no longer force the iPhone keyboard open; the follow-up dialog also contains keyboard focus.
- Empty, filtered, archived and offline PDF-import states now provide clear context and next actions.
- Buyers can be archived and restored without deleting their interaction history.
- Permanent deletion is available only from Archived, keeping Archive as the safe default lifecycle action for active buyers.
- Matching an existing buyer mobile now reuses the existing buyer record instead of creating a duplicate.
- Cancelling a buyer-list call leaves that buyer outstanding and does not advance the session.
- Buyer-list session state is reset before loading the current UID, preventing stale device/account state carrying into another user session.
- New-buyer Data credit is persisted before the buyer cloud write, so a prospecting sync failure cannot silently lose leaderboard credit.
- Buyer CSS from v1.36.7–v1.36.16 is consolidated into one scoped v1.36.17 section to reduce cascade conflicts.
- Firebase configuration, Authentication, Firestore paths/rules, UID data separation, Team, Today, appointments, leaderboards and unrelated workflows are unchanged.

## Buyer journey added in v1.36.7
- Dedicated Buyers tab inside Prospector, separate from Contacts.
- Add as buyer from the quick-call/buyer-list call outcome flow.
- Fast buyer brief capture: budget, configuration, suburbs, property type and requirement tags.
- Buyer cards show requirement snapshots with one-tap Call and SMS actions.
- Quick and advanced buyer filtering by budget, suburb, configuration, property type, stage, temperature and requirements.
- Buyer journey stages: Looking, Inspecting and Negotiating, followed by Purchased/Owner conversion.
- Mark as Purchased converts the same record into an Owner contact while retaining buyer history and purchase details.
- Buyer records use the existing UID-scoped Prospector sync document; no new Firestore collection or rule is introduced.

## Buyer UI refinement added in v1.36.8
- Fixed Buyers-tab horizontal overflow and clipped content on iPhone-width viewports.
- Simplified the buyer database controls to All / Hot / Warm plus the existing advanced Filters control.
- Removed the duplicate in-panel + Buyer action; the existing Prospector + button remains the single add action.
- Shortened the buyer search placeholder so it remains readable beside the keypad and add controls.
- Buyer cards now use a containment-safe grid with compact Call/SMS actions beside the buyer name.
- Last-contact text now sits on its own contained line instead of competing with stage/temperature pills.
- Buyer overview, list and filter surfaces now use the same rounded nested-card geometry as the rest of AGNT.
- Buyer logic, data shape, filtering capability and Buyer → Owner conversion are unchanged.

## Buyer simplicity refinement added in v1.36.9
- Buyer database rows are now intentionally single-line: buyer name, maximum budget, Call and SMS.
- Buyers are sorted A–Z by name for fast scanning.
- Budget capture is now one maximum-budget slider; the previous minimum/maximum range UI is removed.
- Existing buyer records remain compatible; legacy minimum-budget data is only used as a fallback display value when no maximum was previously stored.
- New/edited buyer records save `buyerBudgetMin` as `0` and store the selected maximum in the existing `buyerBudgetMax` field, so no Firebase schema or migration is introduced.
- Buyer filtering now uses one `Buyer budget at least` slider, designed to find buyers whose maximum budget can meet a property price.
- The buyer suburb field now includes a preloaded searchable Sydney suburb list while still allowing manual suburb entry when required.
- Quick filters are reduced to All / Hot / Filters; stage, temperature, configuration, property type and requirements remain in advanced Filters.
- Buyer detail, call/SMS actions, call-result logging and Buyer → Owner conversion remain unchanged.

## Buyer UI balance refinement added in v1.36.10
- All / Hot / Warm / Filters now share the same width, height, font weight, border treatment and sit on one row.
- Warm is restored as a working quick filter while deeper stage, temperature and property matching remain in Filters.
- Buyer rows are shorter and more balanced: name and maximum budget share one clear hierarchy with smaller equal Call/SMS actions.
- Buyer list metadata and card spacing are tightened to reduce visual weight without removing information.
- Buyer suburb capture now reads `Add suburb`; its type size, weight and control height match the surrounding buyer form.
- The Sydney suburb autocomplete dataset and manual suburb fallback remain unchanged.
- No buyer data shape, Firebase path, rules, sync or Buyer → Owner behaviour changed.

## Buyer context + follow-ups added in v1.36.11
- Buyer list rows now surface maximum budget and the saved bedroom / bathroom / car configuration without using `+` suffixes.
- Buyer rows retain compact Call and SMS actions and add a third equal-weight `Follow Up` action.
- `Buyer Seller` is an optional buyer attribute indicating that the buyer has a property to sell if they purchase; it is editable on the buyer brief and displayed as a compact tag.
- Buyer follow-ups use the existing Prospector `nextFollowUp` and interaction sync channel rather than a new task collection or Firestore path.
- Follow-up creation captures a date and notes. Buyer follow-ups then appear on the existing Today timeline alongside Pipeline/appointment follow-ups.
- Completing a buyer follow-up from the Today timeline uses the existing Prospector follow-up completion pattern and clears the due task.
- No new Firebase collection, Firestore rule, local-storage key or backend service is introduced.

## Buyer context + contrast refinement added in v1.36.12
- Buyer maximum budgets now display as full dollar amounts, for example `$1,300,000`, instead of abbreviated `$1.3m` values.
- Buyer list context now keeps configuration and location on one compact line. The first-entered suburb is treated as the priority suburb and additional selections display as `+ X suburb(s)`.
- Buyer list, action buttons, search/filter controls and Buyer Seller tag receive explicit light- and dark-mode contrast treatment.
- Buyer follow-up overlay, sheet, fields, labels, close button and primary/secondary actions receive explicit opaque light/dark surfaces so the sheet remains clearly separated from the dimmed background.
- Buyer data shape, suburb ordering, follow-up task behaviour and Firebase architecture are unchanged.

## Firebase
The frontend is connected to the existing BETA Firebase project `daily-accountability-be0ac`.
The bundled `firestore.rules` is unchanged from the supplied v1.36.6 baseline, including its existing Team/private-data and Team appointment permissions.
No Firestore rule, schema or data migration change is required for this release. The bundled rules are retained unchanged from the GitHub baseline. The only Firebase Console action is the one-time bridge credential setup described in `automation/marketpulse-apps-script/SETUP.md`.

## Protected systems retained
Existing Firebase/Auth UIDs, `users/{uid}` personal data, days, contacts, prospecting, appointments, notes/history, Team membership/leaderboard data, UID-scoped local cache shapes, offline Firestore sync, manifest/icon identity and service-worker behaviour remain preserved. Only release cache identifiers were bumped.


## Buyer follow-up modal + alignment refinement added in v1.36.13

- Buyer follow-up overlay now mounts at document level so it covers the full installed-PWA viewport consistently.
- Removed the heavy backdrop blur from the buyer follow-up overlay; uses the same restrained dimmed backdrop language as AGNT confirmation overlays.
- Follow-up card now uses contained AGNT rounded geometry with full light/dark mode surfaces.
- Follow-up date and note controls are explicitly constrained to the modal width, including iOS date input sizing.
- Buyer configuration/suburb context is left aligned directly beneath the buyer name while the full maximum budget remains right aligned.
- Buyer/follow-up data, Today timeline logic, Firebase, Firestore paths/rules, UID separation and sync remain unchanged.


## Buyer follow-up control + hierarchy refinement added in v1.36.14

- Restored the Buyer Follow Up modal to a broader mobile card footprint while retaining full viewport containment and AGNT rounded geometry.
- Rebalanced follow-up kicker, buyer name, labels, fields and actions so the modal hierarchy matches the surrounding AGNT UI.
- Added direct document-level modal controls so the close `×`, Cancel, backdrop tap and Escape key reliably dismiss the modal and return focus to the exact buyer screen/action that opened it.
- Buyer follow-up form submission is now handled directly by the document-level modal, preventing the body-mounted overlay from falling outside the Prospector form event scope.
- iOS date input sizing now uses explicit inline containment and native-safe sizing so it cannot extend beyond the modal card.
- Buyer/follow-up data, Today timeline behaviour, Firebase, Firestore paths/rules, UID separation and sync remain unchanged.


## Buyer leaderboard detail refinement added in v1.36.15

- Creating a new buyer continues to credit the existing Data metric and leaderboard score exactly as before.
- In the leaderboard agent-detail list only, buyer-sourced data entries are now labelled `Buyer` instead of `Data`.
- Buyer detail rows show the saved bedroom / bathroom / car configuration plus the full maximum budget where the address line normally appears, for example `3 Bed · 2 Bath · 1 Car · $1,300,000`.
- Normal contact data remains labelled `Data` and continues to show its existing address context.
- No leaderboard scoring, target, Firebase, Firestore, UID separation, local cache or sync behaviour changed.


## Buyer position/context tags added in v1.36.16
- Expanded the existing Buyer Seller position control into a lightweight multi-select buyer context set.
- Available tags: Buyer Seller, Upsizing, Downsizing, Builder, Investor, First Home Buyer.
- Tags are saved on the existing buyer record as `buyerPositionTags`; the existing `buyerSeller` boolean remains maintained for backwards compatibility.
- Selected tags are visible on buyer list cards and in the buyer detail view, and are searchable from the Buyers search field.
- No new Firestore collection/path, rule change, migration, leaderboard scoring change or Firebase configuration change is required.
