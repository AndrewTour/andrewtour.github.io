# AGNT v1.37.6 — UI and workflow cleanup

Baseline: supplied AGNT-v1.37.5-Micro-Stability(2).zip. No merge from the older recovery ZIP or parked security branch. No production deployment performed.

## Audit findings and changes

| Area | Finding | Change |
| --- | --- | --- |
| Buyer prospecting | Buyer and pipeline sessions share a host, but render recovery only recognised pipeline sessions. | Distinguish buyer/pipeline screens, preserve the open buyer screen during refreshes, and save its visibility alongside existing queue progress. Restore after login/reload unless an unfinished contact draft takes priority. |
| Explicit navigation | An active queue is not the same as a currently open screen. | Buyer Back hides the screen without losing progress; leaving the app from another section does not force a buyer-screen reopen. |
| Knocking appointments | MAP/LAP capture did not expose the appointment tab's existing-contact search. | Add keyboard-accessible result buttons using the same name/address/suburb/phone matcher; selection fills booking details. Manual entry remains available. |
| Contact prefill | Save as Contact from a buyer call passed only the phone number. | Carry the imported buyer name and address forward as well. |
| Contact save/back | Background local-first saving already exists in this baseline. The reported stuck Save was not reproduced on a device. | Preserve background sync, explicitly show the contact overview on detail rendering, and make Back from an existing contact editor return to that overview. Buyer-session context can be resumed from the overview. |
| Back/close controls | Different shapes, sizes and alignment across secondary screens. | Shared 44px-minimum back/close targets, spacing, colour and borders for the listed navigation controls. |
| Theme and accessibility | Existing styles have many layered overrides; a wholesale rewrite would risk unrelated layouts. | Add a small final stylesheet for theme-aware navigation, readable placeholders, strong keyboard focus, knocking fields/results, reduced motion and forced-colour support. Preserve current page layouts and metric colours. |

## Changed files

- app.js — the workflow/navigation changes above.
- index.html — load the cleanup stylesheet and versioned app.
- service-worker.js — cache version/asset list only; unchanged caching strategy.
- cleanup.css — new shared control/accessibility layer.
- cleanup-checks.cjs — dependency-free focused regression checks; not loaded by the app.
- UI-CLEANUP-v1.37.6.md — this audit and handoff.

Original styles.css and ui-system.css remain unchanged. Firebase configuration, Firestore rules, authentication, backend paths, existing storage keys, metric calculations and MarketPulse matching are not changed. Buyer-session records gain an optional visibility field; no migration or data clearing is required.

## Validation

Passed JavaScript/module syntax checks and focused Node tests for buyer persistence, queue progression, duplicate/cancelled outcome handling, buyer-versus-pipeline rendering priority, editor preservation, shared search, local-first save contract, prefill and versioned PWA asset references. The original archive comparison confirms no other baseline files changed. ZIP integrity is checked before handoff.

These are source/unit checks with minimal UI stubs, not a full DOM integration suite. No live Firebase writes, Safari/iPhone visual testing, screen-reader testing or end-to-end appointment booking was performed. This is not a security certification or a claim that every app route is bug-free.

## Device smoke test before rollout

1. In both light and dark mode, check Home, Contacts, Buyers, Appointments, MarketPulse, Knocking and Settings; check narrow screens, large text, keyboard focus and Back/Close controls.
2. Edit a contact and save: overview should appear without waiting for cloud sync. Reopen it and confirm values. Test offline, then reconnect and verify sync.
3. Start a buyer list, log an outcome, save a buyer/contact, resume the queue, refresh and background/reopen. Check the correct next buyer and no duplicate progress. Explicitly leave the session and confirm it stays closed after refresh.
4. From knocking, book MAP and LAP using existing-contact search (name, street, suburb, phone). Check prefilled details, one correct contact link and one appointment/metric increment. Also test a new contact manually.
5. Install/update the PWA and confirm the new stylesheet loads online and remains available offline. Keep the original ZIP for rollback; no data reset is needed.
