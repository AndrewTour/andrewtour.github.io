# AGNT v1.37.5 — Micro Stability

## v1.37.5 changes

- Retains the 32px Home MarketPulse control while expanding its invisible touch target to 44px for more reliable iPhone tapping.
- Replaces non-standard instant scroll restoration with the iOS-safe automatic behaviour across MarketPulse, sessions and appointments.
- Makes contact and buyer follow-up completion local-first, refreshes every dependent app surface immediately and leaves cloud sync running in the background.
- Preserves all v1.37.4 MarketPulse sizing, alignment and entry-aware back navigation.

## Previous release — v1.37.4

## v1.37.4 changes

- Reduced the Home MarketPulse shortcut to a quieter 32px control and aligned it to the visual midpoint between the Home dividers.
- Added entry-aware MarketPulse navigation: Home opens back to Home, while Hot Spotting opens back to Hot Spotting.
- Preserved the v1.37.3 MarketPulse data hierarchy and shared follow-up completion behaviour.

## v1.37.3 changes

- Reduced the Home MarketPulse shortcut by 20% while retaining its existing right-side position and centring it within the Right Now stack.
- Reworked MarketPulse property intelligence into the flat, divided hierarchy used by Hot Spotting while retaining its full event detail, counts and filters.
- Removed the Pipeline heading from Hot Spotting.
- Reworked Today’s Follow-ups to use the Buyer-tab record hierarchy.
- Added a clear checkbox that completes the underlying buyer/contact or appointment follow-up and refreshes all dependent queues, counts, timeline and Right Now state.
- Preserved the v1.37.2 MarketPulse navigation split and v1.37.1 knocking flow.

## v1.37.2 changes

- Preserved the Home Right Now stack footprint while moving its label and activity copy into a left-aligned hierarchy.
- Added a centred AGNT-orange MarketPulse shortcut on the right of the Home stack.
- Separated the MarketPulse property review from Hot Spotting.
- Restored Hot Spotting to open directly on its session pipeline and added a MarketPulse entry at the bottom.
- Preserved the v1.37.1 knocking flow and all existing Firebase, authentication, storage and sync behaviour.

Built incrementally from AGNT v1.37.0 Stability Core, which retains the supplied confirmed-working v1.36.51 lineage.

## v1.37.1 changes

- Makes End Session local-first so the knocking UI exits immediately and the review appears without waiting for Firestore latency or connectivity.
- Preserves background cloud sync and prevents a rejected deferred write from trapping the user in an already-ended session.
- Updates only the live timer text each second instead of rebuilding the full knocking interface, preventing control replacement, lost press states and avoidable rendering work.
- Shows the current session elapsed time in the knocking header rather than the cumulative daily knocking total.
- Makes pause/resume timer writes local-first while retaining the existing local cache, offline queue and Firestore document structure.
- Adds explicit ending feedback and guards against duplicate End Session actions.

## Previous release — v1.37.0

# AGNT v1.37.0 — Stability Core

Built incrementally from the supplied confirmed-working `AGNT-v1.36.51-Hot-Spotting-Skip` release. No earlier application ZIP was merged into this codebase.

## v1.37.0 changes

- Persists unfinished Add Contact drafts in UID-scoped local storage and restores the exact form after normal iPhone PWA background, foreground and relaunch events. Successful saves and intentional discards clear the draft.
- Makes contact and buyer saves local-first and view-aware, so a late async completion can confirm success without taking control of the user’s current screen.
- Adds an exact Today follow-up queue covering contact, buyer and appointment follow-ups, with the reason, last context and direct call/outcome action on each record.
- Adds the latest stored call/SMS/follow-up outcome to the Hot Spotting call card alongside the existing last-contact date.
- Replaces the dialler display with a native telephone input that supports iPhone paste and safe Australian/international number normalisation while retaining the keypad.
- Adds a dedicated property-by-property MarketPulse Review with Listed, Sold, Price and Other filters, using the existing MarketPulse records and matching logic.
- Expands the morning MarketPulse briefing with the priority properties behind the summary and a direct route to the full review.
- Consolidates competing foreground/background listeners into one debounced lifecycle coordinator, preserves open editors during data renders and reduces unnecessary expired-timer scans.
- Retains all Firebase configuration, authentication, Firestore paths and document shapes, local cache keys, team behavior, offline support and GitHub Pages deployment structure.

## Previous release — v1.36.51

# AGNT BETA v1.36.44 — Prospect Add Contact Null Guard

Built incrementally on the supplied v1.36.42 Unified Buyer + Seller Profiles release, with v1.36.41 used as the confirmed-working reference for Prospecting contact creation.

## v1.36.44 changes

- Fixes the v1.36.42 Prospecting Add Contact regression where a brand-new contact could fail before persistence because the unified buyer/seller path attempted to read buyer position tags from a null existing record.
- Adds a null-safe empty-record fallback at that single call site.
- Restores the original v1.36.42 save/sync workflow; the v1.36.43 local-first workaround is not included.
- Canonical buyer/seller identity matching, existing-contact reuse, duplicate merge, `also buying` flow and linked profile behaviour remain unchanged.
- Firebase configuration, authentication, UID/team separation, Firestore paths/rules, local-storage keys, save/sync behaviour, MarketPulse and appointment behaviour are unchanged.

## Previous release — v1.36.42

## v1.36.42 changes

- Buyers and seller-pipeline contacts can now share one canonical profile, one interaction history and one follow-up instead of creating parallel contact records.
- Add Buyer now starts with an existing-contact picker that prioritises active seller-pipeline records. Searching by name, mobile or address opens that same contact and adds the buyer brief in place.
- Contact create/edit and contact detail now include an `also buying` action, so the buyer brief can be added directly from the normal contact or pipeline workflow.
- Selecting `Buyer Seller` in the buyer brief exposes the seller-side timeframe while retaining the current home, seller stage, contact notes and existing pipeline history.
- Seller Pipeline, Contacts, buyer cards and both profile views show a clear `Buyer + Seller` identifier and provide direct navigation between the buyer brief and seller profile.
- Exact existing matches reuse the canonical contact. If an older separate buyer record is encountered during a save, its buyer criteria and interactions are merged into the seller contact, the duplicate record is removed, and its former ID is retained only as an internal alias so historic appointment links continue to resolve.
- Archiving or completing the buyer journey affects the buyer side only when a seller/contact role exists; the seller pipeline, current-home address and seller follow-up remain intact.
- Legacy buyer-only records remain valid and are upgraded in place when a seller/contact role is added. No bulk migration or destructive automatic matching runs on launch.
- Firebase configuration, authentication, UID/team separation, Firestore paths and rules, local-storage keys, MarketPulse, appointment outcome behaviour and GitHub Pages deployment structure are unchanged. The optional role and alias fields live inside the existing prospect record.

## Previous release — v1.36.41

- Appointment outcomes now follow the appointment type: MAP/LAP use seller outcomes, while BAP uses buyer-specific Interested, Further Inspection, Offer Pending, Not Suitable and Purchased outcomes.
- Open outcomes require a current or future follow-up date in the same outcome sheet, removing the separate second step.
- Linked MAP/LAP outcomes immediately update the existing seller pipeline record and write the result into contact history.
- Linked BAP outcomes move the buyer through Inspecting or Negotiating; Purchased converts the existing buyer to an owner contact using the established buyer fields.
- Listed, Purchased and other closed outcomes leave the appointment history intact while removing the completed opportunity from active appointment or pipeline queues.
- The sheet identifies whether an existing Prospector record is linked before saving. Unlinked appointments remain appointment-only and retain their outcome and notes without creating or guessing a contact.
- Today, Appointments and Prospector recalculate immediately from the saved result.
- No new page, collection, Firebase configuration, Firestore rule, authentication flow, storage key or migration is required.

## Previous release — v1.36.40

- Hot Spotting removes the repeated oversized introduction and keeps its heading, event count and controls together inside one viewport-safe bordered surface.
- Hot Spotting event rows now use the compact type, spacing, controls and divider rhythm established by the Buyers section.
- Completed events retain their existing collapsed disclosure behaviour in a substantially lighter summary row.
- Market Insights now opens as an inset, bordered overlay with the underlying app visibly retained behind a dimmed backdrop.
- Market Insights content and actions are unchanged, but typography, row spacing and buttons now match the surrounding AGNT interface.
- MarketPulse matching, appointment behaviour, Hot Spotting session logic and buyer matching remain unchanged.
- No Firebase, Firestore, authentication, rules, sync, cache or data-shape changes.

## Previous release — v1.36.39

- Market Insights now opens as a full-height, single-surface view with a fixed header and bottom actions.
- Market Insight listings use whitespace and dividers rather than nested rounded cards.
- Upcoming appointment cards show one concise, tappable MarketPulse summary row; the richer talking points remain available in Market Insights.
- Hot Spotting sessions use flat event sections rather than stacked outer and inner cards.
- Completed Hot Spotting sessions collapse to a quiet summary row and can be expanded to review their detail.
- MarketPulse matching, appointment behaviour, Hot Spotting session logic and buyer matching remain unchanged.
- No Firebase, Firestore, authentication, rules, sync, cache or data-shape changes.

## Previous release — v1.36.38

Built incrementally on the confirmed working v1.36.37 Today Buyer Summary release.

## v1.36.38 changes

- Today is vertically scrollable only; horizontal page overflow is contained at the source.
- Today header/date, tabs, panels and timeline children can shrink inside the iPhone viewport.
- The day/date remains on one horizontal line with safe truncation rather than widening the page.
- Buyer `Property Match` count now sits beside the buyer name.
- The orange time-sensitive/action alert remains in its existing position below the buyer criteria/location.
- Pipeline, Listed, Sold, Price Update and all other Hotspotting behaviour is unchanged.
- No Firebase, Firestore, authentication, rules, sync, cache or data-shape changes.

Incremental BETA update built directly on the supplied confirmed-working AGNT BETA v1.36.36 Market Insights Context package. The rejected v1.36.27 Home-page experiment is not included.


## Today buyer summary refinement added in v1.36.37

- Fixed the Today day/date heading so the weekday and date remain in their normal horizontal format on narrow iPhone screens instead of collapsing into a vertical word stack.
- Buyer activity on Today is now summarised in the same compact timeline language as Pipeline and MarketPulse Hot Spotting rather than listing every buyer, property alert, seller angle and outcome control inline.
- The Buyer block now uses `BUYER UPDATE · X CLIENTS`, shows the number of clients to speak to and protected time, and prioritises a concise `Buyer + Seller` count when those opportunities exist.
- When there is no Buyer + Seller opportunity, the heading falls back to time-sensitive buyers when relevant, otherwise `Matched Buyer Opportunities`.
- `Open Buyers` remains the single action from Today and opens the existing detailed Buyer section, where buyer matches, Call/SMS/Outcome controls, time-sensitive alerts and Buyer + Seller context remain unchanged.
- Pipeline, Just Listed, Sold, Price Update and all other Hot Spotting workload logic and presentation are unchanged.
- No Firebase configuration, Firestore path/rule, authentication, UID/team separation, storage key, MarketPulse import or appointment changes are required.

## Market Insights context added in v1.36.36

- Appointment MarketPulse intelligence now identifies the actual matched MarketPulse property address, configuration and price/guide so each insight is immediately usable as a talking point.
- The Today timeline replaces `View appointment` with `Market Insights` when a reliable MarketPulse suburb + House/Strata match exists.
- Market Insights opens in a compact iPhone-first bottom sheet with Recent Sold, Recent Listed and Market Movement sections.
- The sheet retains a `View appointment` action, so the existing appointment workflow remains available.
- Appointments without a reliable MarketPulse match keep the existing `View appointment` behaviour.
- No Firebase configuration, Firestore path/rule, authentication, UID/team separation, storage key or MarketPulse import changes are required.


## MarketPulse appointment intelligence added in v1.36.35
- Upcoming appointment cards now calculate a lightweight MarketPulse brief at render time from the appointment address and the existing UID-scoped MarketPulse event deck. Existing pipeline appointments require no migration or manual linking.
- Suburb matching is formatting/case tolerant. House addresses, including street numbers ending A/B, use House activity; clear slash/unit/villa/townhouse style addresses use Strata activity. Ambiguous classifications are intentionally omitted.
- MarketPulse property details are used as supporting type evidence when they explicitly identify House, Duplex, Townhouse, Unit/Apartment/Villa/Flat. Address inference is the fallback.
- The card prioritises matching Listed and Sold counts, then price updates, with relevant recent/median sale and guide figures where MarketPulse provides usable prices.
- Missing suburb, property type or matching MarketPulse data leaves the existing appointment card unchanged. Firebase configuration, Authentication, UIDs, Firestore paths/rules, Team data, local cache/sync and MarketPulse automation are unchanged.

## Time-sensitive buyer alerts added in v1.36.34
- AGNT now separates a normal property match from a match with a genuine market deadline. Imminent auctions, a price change that moves a property inside the buyer's saved ceiling, and genuinely fresh Just Listed or Price Update activity receive a concise reason.
- Auction alerts escalate automatically from **Auction in 7 days** through **Auction tomorrow** and **Auction today**. A recently passed auction date asks the agent to verify availability rather than presenting the property as active fact.
- Price changes become critical only when the previous guide was above the buyer's maximum and the new guide is inside it. Other price changes and fresh listings remain useful but lower-priority signals.
- Today still creates one conversation per buyer. Time sensitivity reorders that existing queue, selects the most urgent matching property as the primary conversation and updates the shared Right Now command without creating another block or duplicate task.
- The same alert wording appears on the Buyer card, each relevant property in Buyer detail and the existing Outcome sheet. The pre-filled buyer SMS now carries an available auction deadline and describes a Price Update as a changed guide.
- Alerts are derived from the existing buyer brief and stored MarketPulse match. They strengthen and expire with time automatically, require no new collection and remain visible on unresolved attempted matches.
- Phase 1 outcomes, daily suppression, BAP booking and SMS confirmation remain unchanged. Phase 2 buyer-seller angles continue inside the same conversation. Firebase paths/rules, Team data, MarketPulse automation and the working Home page remain untouched.

## Buyer + seller opportunity detection added in v1.36.33
- AGNT now connects three pieces of existing information inside one conversation: the live MarketPulse property match, the buyer's current home and a suggested seller-side conversation angle.
- Detection is deliberately evidence-based. A seller angle appears only when the buyer also has a known current home and AGNT finds an explicit Buyer Seller position, a linked active seller-pipeline record, clear selling intent in notes, or an Upsizing/Downsizing position.
- A recorded address alone never causes AGNT to assume that a buyer is a seller. Explicit not-selling or renting language prevents potential opportunities inferred from notes or a movement position.
- Confirmed opportunities are distinguished from potential opportunities so the agent can see whether the signal came from verified structure or a conversation cue.
- Today keeps the v1.36.32 one-buyer conversation. The seller angle sits inside that same row, so no second task, duplicate call or competing timeline block is created.
- Buyer cards show a compact Buyer + seller cue; Buyer detail shows the current home and matched property side by side with the suggested angle; the same context remains visible while choosing the existing property-match outcome.
- Existing buyers are evaluated immediately from their current brief, position tags, notes, linked pipeline data and open property matches. No migration, new collection or manual refresh is required.
- Phase 1 Call, SMS, outcomes, follow-up dates, BAP flow and daily suppression remain unchanged. Firebase paths/rules, Team data, MarketPulse automation and the working Home page remain untouched.

## Unified buyer opportunities added in v1.36.32
- Today now creates one contact envelope per buyer rather than one task per matching property. Multiple matches are carried inside the same conversation.
- A buyer's due or overdue follow-up is merged into that same opportunity and removed from the separate Follow-ups workload, preventing duplicate prompts.
- Once a Call, confirmed SMS or intentional match outcome is logged, that buyer is suppressed from Today for the rest of the day.
- Buyer-match outcomes are now **Interested**, **Send details**, **Arrange inspection**, **Maybe**, **Not suitable** and **No answer**.
- Interested, Send details and Maybe require an intentional return date. Interested advances the buyer to Inspecting; the other outcomes preserve the appropriate journey stage.
- Arrange inspection opens a prefilled BAP for the matched property and only resolves the opportunity after the appointment is successfully saved.
- Not suitable records the reason and closes only that property. No answer records an attempt, keeps the match open and allows it to return on a later day.
- Buyer cards and Buyer detail retain the orange match count, while each property now uses a cohesive Call, SMS and Outcome action row with New Match or Contact Attempted state.
- SMS is never assumed to have been sent. AGNT asks for confirmation after returning from Messages before logging the interaction or opening the outcome workflow.
- Existing buyer briefs, contacts, interaction history, Firebase paths/rules, Team data, MarketPulse automation and daily rollover remain unchanged. No migration or new collection is required.

## Buyer matching added in v1.36.31
- MarketPulse Just Listed and Price Update events are checked against active buyer briefs using exact suburb, strict property type, maximum budget and configured bedroom, bathroom and car minimums.
- Matching is deliberately conservative. A House brief cannot receive a Townhouse, Unit/Apartment/Villa, Duplex or Land recommendation; missing property type or price data does not create a guess.
- Buyers without a usable mobile number, archived buyers and purchased buyers are excluded from the actionable match queue.
- Buyer matches are stored inside the existing UID-scoped buyer record and remain visible until an intentional outcome resolves them or later MarketPulse activity makes the property unavailable. Contact attempts remain open.
- Sold, Auction Result, Withdrawn and Under Offer activity automatically retires an earlier open match for the same property.
- Today consolidates new buyer-property opportunities into one protected block with one conversation per buyer. Each row names the primary MarketPulse property and provides direct Call, pre-filled SMS and Outcome actions.
- Buyer cards show a compact orange count badge. Opening the buyer reveals each matching property, the verified match reason and cohesive Call, SMS and Outcome controls.
- Existing buyer fields, Firebase paths/rules, authentication, Team data, morning live update, MarketPulse bridge and daily rollover remain unchanged. No migration or new collection is required.

## Morning live update added in v1.36.30
- Before 11:00 am, every second genuine app launch opens a passive four-second live update. The first launch opens normally, the second shows the update, and the pattern repeats per user each day.
- The fixed one-page screen never scrolls and has identical geometry in Light and Dark mode.
- Today’s completion percentage remains the hero, followed by a concise MarketPulse debrief and the number of unique saved clients influenced by today’s property activity.
- Listed, Sold, Price and Other event totals are shown as information only; the screen has no task buttons or competing calls to action.
- Existing Activity Left, Appointments, Pipeline and Knocking summaries remain visible in a compact two-by-two grid.
- The update renders immediately from current local state, refreshes when cloud/MarketPulse data arrives and opens AGNT automatically after four seconds.
- Existing Home, Today, Prospector, Appointments, Team, Firebase and MarketPulse automation behaviour remains unchanged.

## Timeline theme parity added in v1.36.29
- Light and Dark mode now use the same timeline columns, spacing, marker placement and rail coordinates.
- The correctly aligned Light-mode centreline is now the canonical position in both themes.
- One continuous rail runs from the start to the finish of the timeline behind every status marker.
- Theme rules change colour only; they no longer change timeline geometry.
- No timeline content, scheduling logic, Firebase paths, Team data or MarketPulse automation has changed.

## Appointment and follow-up polish added in v1.36.28
- **View appointment** on Today opens that exact personal appointment directly in edit mode. Team-assigned appointments retain their existing read-only route.
- The **Hot Spotting Follow-Up** control now exactly matches the height, padding and corner radius of the Outcome control, with a blue field heading.
- **Withdrawn** is available as an intentional property-lifecycle follow-up.
- **All Updates** continues to respond to every later MarketPulse change for the property, now explicitly including Withdrawn.
- The Today timeline rail and every status marker now share one fixed centreline, including the wider active blue marker in light and dark mode.
- Existing Firebase configuration, Authentication, UIDs, Firestore paths/rules, Team data and MarketPulse email automation remain unchanged.

## Timeline and knocking cleanup added in v1.36.26
- Visible Appointment Prep and Field Prep cards have been removed from Today. The shared focus headline now takes over 30 minutes before an appointment, while that handover window remains clear in the underlying schedule.
- AGNT only recommends knocking streets that have saved contact-address data and a Just Listed or Sold MarketPulse event.
- If the current MarketPulse deck has no qualifying street, AGNT falls back to the most recent qualifying event retained in a compact MarketPulse street history. If no qualifying street exists, AGNT does not issue a Start Knocking action.
- Each knocking block names the street directly, including split blocks around appointments.
- The live knocking session again includes a visible street selector. It contains only qualifying streets, retains the selected street during the session and shows the market reason, saved-contact count and time target.
- **Bring back when** is replaced by the standard **Hot Spotting Follow-Up** form field with Sold, Price Change, Auction Date, All Updates or No Follow-Up.
- Sold and Auction Result sessions do not show the follow-up field because the property lifecycle has already concluded.
- The follow-up selector now uses the same field styling as Outcome, Temperature and the surrounding contact-log controls.
- Existing Firebase configuration, Authentication, UIDs, Firestore paths/rules, Team data and MarketPulse email automation remain unchanged. The compact history is stored inside the existing UID-scoped prospecting state document.

## Market follow-ups added in v1.36.25
- Connected MarketPulse outcomes include one intentional property-lifecycle follow-up. In v1.36.26 this is presented as **Hot Spotting Follow-Up**: Sold, Price Change, Auction Date, All Updates or No Follow-Up.
- The selection is stored with the original interaction and exact property identity. Free-text notes remain conversation context and never silently create a trigger.
- A later matching MarketPulse event fulfils the watch once, promotes that client ahead of general street matches and carries the prior conversation note into the call screen.
- Follow-up prompts include the new guide or sale price, price movement and auction date/time whenever those fields are available in MarketPulse.
- Auction dates are parsed from supported MarketPulse property lines without changing the existing eight-event parser result for the supplied live email.
- Explicit market follow-ups are promoted into the existing shared Daily Plan Engine; no additional dashboard or task collection is added.
- Archived contacts, Do Not Contact records, clients already worked today and fulfilled watches are not recycled.
- Existing Firebase configuration, Authentication, UIDs, Firestore paths/rules, Team data, MarketPulse bridge and Today command-centre scheduling remain unchanged. No migration or Blaze plan is required.

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
- Once-daily decision-first briefing covering MarketPulse, appointments, follow-ups and pipeline.
- Time-aware Today command centre with dedicated MarketPulse calling blocks, protected appointments and priority knocking streets.
- Consumer-ready login with persistent Firebase authentication restore.
- Team appointment assignment after Book Appointment, defaulting to Me.
- Assignment choices use the live Team leaderboard display name and show first name only.
- The original setter keeps the appointment statistic and personal source appointment.
- The assigned teammate receives a Team-owned appointment mirror without another user writing into their private `users/{uid}` records.
- Recipient sees the appointment in their appointment/timeline surfaces without receiving the setter's appointment statistic.
- Live/next-open appointment notification with Got it and Add to Calendar.
- Setter-facing appointment/log/leaderboard context shows `Booked for [First name]` where applicable.
- Targeted dark-mode contrast fixes for appointment contact suggestions and Editing Appointment.

## Today command centre added in v1.36.24
- The Today page now opens with one **Right Now** command containing the active time window, reason and one direct action. The Home focus card and morning briefing use the same priority engine.
- Today’s fresh MarketPulse is converted into dedicated call blocks. Active sessions are resumed first, then Just Listed/Listed and Sold opportunities, overdue or due follow-ups, other MarketPulse events and the eligible pipeline.
- Matched clients are de-duplicated across properties. Completed Hot Spotting work remains represented as complete, while unfinished blocks that pass their protected window are shown as needing attention rather than being falsely marked complete by the clock.
- Calling work is placed into available morning and late-afternoon capacity. Blocks move or split around appointments instead of overlapping them; the final 30 minutes before each appointment are reserved for the focus-headline handover without a separate prep card.
- The field plan starts from 2:00 pm. The remaining knocking target is split around appointment conflicts and uses up to three Just Listed/Sold streets with saved contact data.
- Street time is allocated in five-minute increments from MarketPulse priority, matched contacts and recency. Each block names its first street and the same choices appear in the live knocking selector.
- When the current deck has no qualifying street, AGNT uses the most recent qualifying retained MarketPulse street. With no qualifying history, it shows a clear waiting state instead of telling the agent to knock blindly.
- Each actionable timeline block has one destination: start/resume the exact Hot Spotting session, open follow-ups or pipeline, view the appointment, start knocking or open the day log.
- Past and future dates retain the established timeline behaviour. Existing session logging remains in Today → Log rather than being duplicated in the plan.
- Firebase configuration, Authentication, UIDs, private user paths, Team paths, Firestore rules and the once-daily MarketPulse bridge remain unchanged. No migration or Blaze plan is required.

## Daily briefing added in v1.36.23
- The old rotating returning snapshot is replaced with a clean once-daily AGNT briefing for each signed-in agent on a scheduled workday; the existing off-day review remains unchanged.
- The briefing waits for authoritative account and MarketPulse inbox snapshots before calculating priorities, with a short local-data fallback when the connection is slow.
- MarketPulse is summarised as event totals, unique unworked clients and estimated focused calling time. Clients already called today, completed event sessions and event contacts already worked are excluded.
- Just Listed/Listed and Sold activity is ranked ahead of other MarketPulse event types, with the top three properties shown as direct Hot Spotting shortcuts.
- The priority plan switches to an appointment 30 minutes before it starts, resumes an active session, then recommends the best Listed/Sold session. Workload estimates stop at that same 30-minute focus handover.
- When no current MarketPulse work is ready, AGNT falls back in order to overdue follow-ups, today’s follow-ups, remaining appointments and the existing eligible pipeline.
- Appointment, follow-up and pipeline summaries open the corresponding existing AGNT surfaces. The primary recommendation can start or resume the correct session directly.
- Waiting, no-match and connection-error states retain previous Hot Spotting data for context without presenting it as today’s new priority.
- The briefing is shown once for the current MarketPulse state each day. If an agent opens before the new email arrives, the valid fresh import can receive its own briefing on the next open.
- Firebase configuration, Authentication, UIDs, private user paths, Team data, Firestore rules and the daily 6:00 am MarketPulse bridge remain unchanged. No migration or Blaze plan is required.

## Daily MarketPulse refresh added in v1.36.22
- The collective inbox bridge now runs once daily at approximately 6:00 am in `Australia/Sydney`, after the expected 4:30 am MarketPulse delivery window.
- Running the updated `setupMarketPulseBridge` removes the earlier five-minute trigger and installs exactly one daily trigger. Manual `runMarketPulseBridgeNow` remains available.
- A valid newer MarketPulse email replaces the prior active Hot Spotting event deck instead of accumulating old daily cards.
- If a prior-day Hot Spotting session was left open, rollover closes that obsolete session safely before presenting the new deck; already logged activity remains in history.
- Yesterday's active Hot Spotting remains available when today's email is missing, delayed, unauthenticated or cannot be parsed. Settings shows **Awaiting today's MarketPulse** until a valid new import succeeds.
- Same-day duplicate or corrected emails refresh matching events while preserving session started/completed/skipped progress. Delayed older emails cannot roll the active deck backwards.
- Contacts, notes, call outcomes, follow-ups and interaction history are preserved. The active `marketPulseEvents` deck rolls forward while a compact Just Listed/Sold street history supports qualified knocking fallback.
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
