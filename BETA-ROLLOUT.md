# AGNT BETA v1.36.34 — Rollout Check

## Time-sensitive buyer-alert acceptance

1. Give an active buyer a matching Just Listed property dated today and confirm **Listed today** appears on Today, the Buyer card, Buyer detail and the Outcome sheet.
2. Add an auction date seven days away and confirm the alert reads **Auction in 7 days**. Move it to tomorrow and today and confirm the wording escalates without creating another Today task.
3. Add an auction time and confirm it is carried into the alert and the pre-filled buyer SMS.
4. Give a Price Update a prior guide above the buyer's maximum and a new guide inside it; confirm **Now within budget** outranks an ordinary fresh listing for that buyer.
5. Confirm a Price Update that was already within budget says **Price changed today** rather than claiming that it newly entered the buyer's range.
6. Give one buyer several matches and confirm the most time-sensitive property becomes the primary property while the one-buyer conversation and additional-property count remain intact.
7. Give several buyers different alert levels and confirm imminent auctions and newly in-budget properties rise above ordinary fresh matches in the Buyer Opportunities block.
8. Confirm alerts expire naturally: a listing older than yesterday, a price update older than yesterday and an auction more than seven days away show as normal open matches.
9. Confirm an auction date passed by one or two days says **Auction date passed** and asks the agent to verify the status; older passed dates do not remain urgent.
10. Log a Call, confirmed SMS or intentional outcome and confirm the existing daily suppression and property-match lifecycle remain unchanged.
11. Confirm Phase 2 Buyer + Seller context remains attached to the same prioritised property and no duplicate seller task appears.
12. Repeat Today, Buyer card, Buyer detail, Outcome and SMS checks in Light and Dark mode. Geometry and hierarchy must remain identical; only colour changes.

## Buyer + seller opportunity acceptance

1. Give an active buyer a strict MarketPulse property match, a current address and the **Buyer Seller** position, then confirm Today keeps one buyer conversation and adds a **Confirmed buyer + seller** angle inside it.
2. Confirm the angle names the current home, retains the matched property and gives one concise conversation suggestion connecting the purchase and sale timing.
3. Remove the Buyer Seller position, add clear selling intent such as “needs to sell their current home” to buyer notes and confirm the opportunity returns as **Potential buyer + seller**.
4. Confirm an Upsizing or Downsizing buyer with a current home receives a potential angle tailored to that move.
5. Create a linked non-buyer contact with the same mobile or email and an active selling timeframe, then confirm the buyer opportunity is marked confirmed and references the seller pipeline.
6. Confirm a current address by itself does not create a seller opportunity. Also confirm notes containing “not selling”, “no need to sell” or “currently renting” do not create an inferred opportunity.
7. Remove the current home from the buyer and any linked seller record, then confirm no seller angle is shown even when a position tag remains; the normal property match must continue to work.
8. Confirm the Buyer card shows one compact Buyer + seller cue, Buyer detail shows the current-home → matched-property pair, and the existing Outcome sheet carries the same angle.
9. Complete a Call, confirmed SMS or property-match outcome and confirm the existing v1.36.32 daily suppression still removes the one buyer conversation without creating a separate seller task.
10. Repeat Today, Buyer card, Buyer detail and Outcome checks in Light and Dark mode. Geometry, spacing and content hierarchy must remain identical; only colour changes.

## Unified buyer-opportunity acceptance

1. Give one buyer two matching properties and a due follow-up, then confirm Today shows one buyer conversation rather than three separate prompts.
2. Confirm the Today row names the primary property, shows the additional-property count and carries the due/overdue follow-up context.
3. Log a Call or confirmed SMS and confirm that buyer disappears from Today for the rest of the day while unresolved properties remain visible in Buyer detail.
4. Cancel a launched call and confirm no call metric or buyer-match state is changed.
5. Log No answer or Left voicemail and confirm the property changes to Contact Attempted, stays open and can return on a later day.
6. Select Interested, choose a follow-up date and confirm the buyer moves to Inspecting with that date as their next action.
7. Select Send details or Maybe and confirm AGNT requires an intentional follow-up date.
8. Select Not suitable, choose a reason and confirm only that property closes; any other matching property and the buyer's saved brief remain intact.
9. Select Arrange inspection and confirm a BAP opens prefilled with the buyer and matched address. Cancel it and confirm the opportunity remains open; save it and confirm the match resolves as Inspection arranged.
10. Launch SMS, return without sending and select Not sent; confirm nothing is logged. Repeat, confirm SMS sent and verify an SMS interaction and outcome prompt appear.
11. Confirm Buyer detail uses one cohesive Call, SMS and Outcome row and shows New Match or Contact Attempted without Reviewed/Dismiss controls.
12. Repeat the Today, Buyer detail, outcome and SMS-confirmation checks in Light and Dark mode at narrow phone width.

## MarketPulse buyer-match acceptance

1. Create an active buyer with a mobile, maximum budget, suburb, property type and bedroom requirement, then import a matching Just Listed event and confirm an orange property-match count appears on the buyer card.
2. Open that buyer and confirm the match names the property, price/guide, configuration and the exact verified reason it fits the brief.
3. Confirm a House buyer does not match a Townhouse, Unit/Apartment/Villa, Duplex or Land event even when suburb and price fit.
4. Confirm the match is rejected when the property is outside the selected suburb, above budget or below a configured bedroom, bathroom or car minimum.
5. Confirm an event with no usable price or property type is not recommended rather than being guessed.
6. Confirm active Just Listed and Price Update matches appear in one Buyer Opportunities block on Today, with one row per buyer and Call, SMS and Outcome actions.
7. Select Call and confirm the correct buyer number opens; select SMS and confirm AGNT prepares a reviewable message naming the property and guide where available.
8. Confirm a completed Call or confirmed SMS opens the intentional outcome workflow. Cancel a Call and confirm the alert remains outstanding without changing its state.
9. Import Sold, Auction Result, Withdrawn or Under Offer for the same property and confirm the earlier buyer match disappears automatically.
10. Confirm archived, purchased and uncontactable buyers do not enter the match queue.
11. Confirm existing buyers and current MarketPulse events are evaluated safely on first launch after deployment, without duplicate match badges.
12. Repeat Buyer and Today checks in Light and Dark mode at narrow phone width and confirm all content remains contained.

## Morning live-update acceptance

1. Before 11:00 am, launch AGNT twice and confirm launch one opens normally while launch two shows the live update for four seconds.
2. Continue launching and confirm the screen appears only on even-numbered launches for that user and day.
3. At or after 11:00 am, confirm no launch shows the morning update.
4. Confirm the screen fits inside one phone viewport with no vertical or horizontal scrolling.
5. Confirm Light and Dark mode use identical spacing, card dimensions and hierarchy; only colour changes.
6. Confirm the hero percentage matches Today completion and the MarketPulse debrief shows Listed, Sold, Price and Other counts.
7. Confirm the influenced-client figure de-duplicates saved clients who match more than one property update.
8. Confirm Activity Left, Appointments, Pipeline and Knocking remain visible and the screen contains no action buttons.
9. Confirm the countdown and progress rail complete after four seconds and AGNT opens automatically.
10. Confirm a pending Team appointment notice waits until the live update has closed.

## Timeline theme-parity acceptance

1. Open Today in Light mode and confirm the rail runs continuously through the centre of every status marker.
2. Switch to Dark mode and confirm the timeline retains the exact same columns, spacing, card dimensions, marker positions and rail position.
3. Confirm the rail begins and ends at the same timeline points in both themes and remains uninterrupted through the active block.
4. Confirm switching themes changes colour only and causes no horizontal movement or layout reflow.

## Appointment and follow-up polish acceptance

1. On Today, select **View appointment** for a personal appointment and confirm its edit form opens immediately with the correct record populated.
2. Confirm a team-assigned appointment remains read-only and opens the appointments view without exposing edit controls.
3. In a qualifying Hot Spotting contact log, confirm the follow-up control matches Outcome in height, padding and corner radius and its heading is blue.
4. Confirm the menu includes **Withdrawn** and that a later Withdrawn event for the exact property fulfils that watch once.
5. Confirm **All Updates** fulfils on Sold/Auction Result, Price Change, Auction Date, Withdrawn or any other later MarketPulse update for the exact property.
6. In light and dark mode, confirm the vertical timeline rail passes through the centre of the active blue marker and every inactive status marker.

## Timeline and knocking cleanup acceptance

1. Add an appointment and confirm Today shows the appointment itself but no Appointment Prep card.
2. At 31 minutes before the appointment, confirm the current working block remains the focus; at 30 minutes before, confirm the shared focus headline switches to the appointment.
3. Confirm the final 30 minutes before the appointment remain free of calling or knocking blocks even though no prep card is displayed.
4. Confirm there is no Field Prep or route-setting card before the 2:00 pm field block.
5. With saved contacts on a street and a Just Listed or Sold MarketPulse event on that street, confirm the timeline title reads **Knock [Street]**.
6. Confirm Price Update, Withdrawn, Under Offer and other event types do not create a knocking recommendation by themselves.
7. Confirm a Just Listed or Sold event on a street with no saved AGNT contact-address data does not create a recommendation.
8. With no qualifying street in the current deck, confirm AGNT uses the most recent retained Just Listed/Sold street that has saved contact data and clearly shows its recency.
9. With no qualifying current or retained street, confirm AGNT shows a waiting state and does not offer a Start Knocking action.
10. Start knocking and confirm the street selector is visible, contains only qualifying streets and retains the chosen street while the session remains active.
11. Start a Just Listed session and confirm the contact log shows a standard **Hot Spotting Follow-Up** field with No Follow-Up, Sold, Price Change, Auction Date and All Updates.
12. Start a Sold or Auction Result session and confirm the Hot Spotting Follow-Up field is absent.
13. Confirm the follow-up control matches the size, border, surface and typography of the surrounding contact-log fields in light and dark mode.

## Market follow-up acceptance

1. Start a Just Listed Hot Spotting session, log a connected outcome and confirm **Hot Spotting Follow-Up** appears with Sold selected by default.
2. Change the outcome to No Answer and confirm the market-follow-up selector is removed from the active form flow.
3. Save a Sold, Price Change, Auction Date or All Updates watch and confirm it appears in the contact's existing history with the property address.
4. Import a later matching event for the exact property and confirm the requested client appears first with the previous note and latest market detail.
5. Where MarketPulse supplies them, confirm the prompt shows the new price/guide, movement and auction date/time.
6. Confirm the same fulfilled watch does not trigger again on a duplicate import.
7. Confirm archived and Do Not Contact records are never promoted.

## Before release verification
1. Confirm the existing `firestore.rules` remain active in Firebase project `daily-accountability-be0ac`; this release does not change them.
2. Confirm the complete BETA web package is live, including `icons/`.
3. Reopen the installed PWA and allow the new service worker/cache to activate.
4. Confirm an existing account loads historical Today, Contacts/Prospecting, Appointments and Insights data.
5. Confirm the existing Team and current members are still present.

## Today command centre acceptance

1. Open Today on a workday after the current MarketPulse import and confirm **Right Now** shows one priority, its protected time range, a concise reason and one action.
2. Confirm the Home **Right Now** card and the morning briefing recommend the same underlying next block as the Today page.
3. Confirm separate Just Listed/Listed and Sold Hot Spotting blocks appear before Price Update or other MarketPulse activity and before the standard pipeline.
4. Confirm clients matched to multiple events are counted once across the plan and clients already worked today are no longer presented as outstanding.
5. Tap a MarketPulse action and confirm it starts the exact property session; leave it active and confirm Today changes to **Resume calls**.
6. Add an appointment during a planned call window and confirm calls move or split around the invisible 30-minute focus handover and the appointment itself, without rendering a prep card.
7. Add an appointment at 3:00 pm and confirm the named-street knocking target can run from 2:00–2:30 pm, pauses for the 30-minute focus handover and appointment, then resumes afterwards without overlap.
8. Confirm the knocking block shows no more than three priority streets, each with a clear time allocation, and that their total matches the protected field time.
9. Start knocking and confirm the same qualifying streets appear in the restored selector while the timer and capture workflow remain unchanged.
10. Let an actionable block pass without completing it and confirm it shows **Needs attention**, not a completion tick.
11. After 6:30 pm, confirm **Right Now** directs the agent to close the day and review carry-forward work rather than suggesting a new call session.
12. Repeat the timeline in light and dark mode at 320 px, 375 px and 390 px widths; confirm the time axis, street rows and action controls remain contained with no horizontal overflow.
13. Confirm Today → Log still holds actual completed session history and the timeline remains the plan rather than duplicating the log.
14. Confirm past/future Today dates, appointments, Team-assigned appointments, metrics and existing navigation retain their previous behaviour.

## MarketPulse automation acceptance

1. Follow `automation/marketpulse-apps-script/SETUP.md` to install the bridge while signed in as `agnt.marketpulse@gmail.com`.
2. Sign in to AGNT with an existing account and confirm Settings → MarketPulse Automation shows that same login email and the collective forwarding address.
3. Forward the supplied real MarketPulse sample from the same login email, then run `runMarketPulseBridgeNow` for immediate testing or wait for the next daily check around 6:00 am Sydney time.
4. Confirm eight sample events appear in Prospector → Hot Spotting: four Sold, three Just Listed and one Price Update.
5. Confirm `251A Metella Road` retains its agent names and `Ray White United Group` even though its price reads `Contact agent`.
6. Confirm `B23/35-43 Toongabbie Rd` matches the street key `toongabbie road|toongabbie`, without the unit identifier.
7. Confirm a second bridge run does not create duplicate inbox items or Hot Spotting events.
8. Confirm an existing same-day Hot Spotting session keeps its started/completed/skipped progress when a duplicate event refreshes.
9. Forward from an email that is not the embedded original recipient and confirm it is quarantined rather than allocated to a user.
10. Sign in as another AGNT user and confirm the first user's MarketPulse intake is not visible.
11. Confirm a successful intake clears `plainText` from the processed Firestore inbox document and Settings reports the last import.
12. Confirm manual MarketPulse paste and all existing Prospector workflows still work.
13. Run the updated `setupMarketPulseBridge`, then confirm Apps Script shows exactly one `processMarketPulseInbox` trigger scheduled daily rather than every five minutes.
14. With yesterday's events active and no valid email for today, confirm the cards remain available and Settings shows **Awaiting today's MarketPulse**.
15. Import a valid newer daily email and confirm it replaces the prior active MarketPulse cards while contacts, notes, call outcomes, follow-ups and interaction history remain unchanged.
16. Submit an invalid or unparseable new email and confirm the prior active cards remain available.
17. Process an older delayed email after today's successful import and confirm it is marked processed without rolling the active Hot Spotting deck backwards.
18. Leave a prior-day Hot Spotting session open, import today's valid email, and confirm the obsolete session closes while its already logged activity remains in the contact history.

## Daily briefing acceptance
1. Sign in on a workday with today’s MarketPulse already imported and confirm the briefing opens once with the current greeting and agent first name.
2. Confirm the MarketPulse total matches the active event deck and the client total counts unique, unworked matches only.
3. Confirm a client matched to more than one property is counted once and is allocated to only one property in **Focus first**.
4. Confirm clients already called today, event contacts already worked and completed event sessions are excluded from the remaining client total.
5. Confirm Listed/Just Listed and Sold properties appear before Price and other event types when they have unworked matches.
6. Confirm the top three property rows open Prospector → Hot Spotting and bring the selected card into view.
7. Confirm **Start Priority Session** opens the recommended property session and **Resume Priority Session** returns to the existing active session.
8. Create an appointment within the next 30 minutes and confirm AGNT protects it ahead of starting a new MarketPulse session.
9. Create a later appointment and confirm the recommendation either fits before the 30-minute focus handover or gives a clear stop time/client count.
10. Confirm the appointment, follow-up and pipeline summary cards open their existing AGNT destinations.
11. With no current MarketPulse matches, confirm overdue follow-ups are recommended before today’s follow-ups and the standard pipeline.
12. Open before today’s MarketPulse arrives and confirm the waiting state does not describe yesterday’s data as today’s priority.
13. After dismissing that waiting state, import a valid current-day MarketPulse and reopen AGNT; confirm the fresh briefing is shown once.
14. Simulate a slow connection and confirm the preparing state falls back to locally available data without blocking AGNT.
15. Confirm close, Escape, primary and secondary actions all dismiss the briefing and that it does not reopen again for the same daily MarketPulse state.
16. Repeat the core flow on a narrow phone viewport in light and dark mode, including vertical scrolling, 44px-or-larger actions and no horizontal overflow.

## Core acceptance
1. Change Calls/Connects/Data for one member and confirm Daily leaderboard updates for another member.
2. Confirm current Weekly leaderboard data updates for another member.
3. Confirm personal Contacts/Prospecting data remains private to each UID.
4. Confirm existing appointments/history remain present.
5. Confirm Team owner management and ordinary member leave workflow still work.

## Buyer UI acceptance
1. Open Prospector → Buyers on a narrow iPhone-sized viewport and confirm the search, add action, four quick filters, buyer cards and action controls remain contained with no horizontal overflow.
2. Confirm buyer cards show name/temperature, concise criteria, the next-action state and no more than one position tag plus `+N`.
3. Filter buyers by Position and by each Follow-up state: Overdue, Due today, Scheduled and Not set.
4. Add a buyer with budget, suburbs, configuration, position, property type and must-haves; confirm the detail view groups Next Action, Buyer Brief and Activity clearly.
5. Edit an existing buyer and open the follow-up dialog; confirm neither action forces the mobile keyboard open and that Escape, backdrop, × and Cancel all close the dialog.
6. Schedule a buyer follow-up and confirm its date appears on the buyer card, in buyer detail, in Activity and in the existing Today follow-up flow.
7. Archive a buyer with an outstanding follow-up; confirm the follow-up is cleared, history remains intact and the buyer moves to Archived. Restore the buyer and confirm it returns to the active list.
8. Confirm permanent deletion is offered only from Archived and displays an explicit confirmation.
9. Attempt to add the same mobile twice and confirm AGNT opens the existing buyer instead of creating a duplicate.
10. Cancel a buyer-list call and confirm no call/connect metric is added and the buyer remains outstanding in the session.
11. Sign out and into a different account on the same device; confirm buyer-list session state does not carry between UIDs.
12. Go offline with no imported call list and confirm the PDF import action explains that a connection is required; confirm an existing local list can still be continued.
13. Add a new buyer while simulating a prospecting cloud-write failure and confirm the buyer plus the Data credit remain local and show pending-sync feedback.
14. Open the buyer follow-up sheet in light and dark mode; confirm the sheet is fully opaque, the background is dimmed without blur and no underlying text competes with the form.
15. Open a buyer with a saved current address and confirm the mobile and address appear as equal-weight rows below the buyer's name.
16. Edit a buyer and confirm Stage, Temperature and Buyer notes use the same form-value weight in both themes.
17. Schedule a future buyer follow-up and confirm its card text appears blue; confirm due-today remains amber, overdue remains red and an unset follow-up remains neutral.
18. Confirm each buyer card shows configuration/budget and location on separate lines without clipping at iPhone width.
19. Confirm buyer-list budgets use compact notation while buyer detail retains the full currency amount.
20. Scroll Buyers and the buyer editor beneath the sticky Prospector toolbar in light and dark mode; confirm underlying controls and text do not show through.
21. Edit an existing buyer while online and confirm the updated profile appears immediately without waiting for the cloud sync indicator to clear.
22. Edit an existing buyer with a slow or unavailable connection; confirm the change remains available locally and the existing cloud-sync warning appears if required.
23. Add a new buyer and confirm the Data metric is still credited before the buyer cloud write, with no duplicate Data event.

## Team appointment acceptance
1. Member A books a LAP, MAP or BAP and assigns it to Member B.
2. Confirm the assignment popup uses the same first-name display as the Team leaderboard.
3. Confirm Member A receives the appointment statistic and sees `Booked for [Member B]` context.
4. Confirm Member B receives the appointment notification live or on next open.
5. Confirm Member B's appointment statistic does not increase.
6. Confirm Member B sees the assigned appointment in the relevant appointment/timeline surfaces.
7. Confirm Got it closes the notification cleanly.
8. Confirm Add to Calendar performs the calendar handoff and the notification does not reopen immediately.
9. Edit/delete the appointment as Member A and confirm the shared Team appointment updates/disappears for Member B.
