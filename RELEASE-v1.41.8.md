# AGNT v1.41.8 — Beta Call Return Restoration

## Restored workflow

- Pressing `Call` inside a Contact, Follow-up or Pipeline workflow records the pending call in session storage before opening the iPhone Phone app.
- Returning to AGNT consumes that one pending state and opens the existing `Log Contact` outcome screen automatically.
- The implementation of `rememberProspectCallReturn` and `resumeProspectCallReturn` is restored exactly from the supplied working beta ZIP.
- The v1.41.7 UID-scoped persistent call-return state, cold-start interception and two-hour pending state are removed.

## Scope protection

- This release is built from v1.41.6, which already contains the current Team sync restoration, profile refinements and MarketPulse valuation guardrails.
- No Firebase configuration, Authentication, Firestore rule/path/index, Team sync, leaderboard, MarketPulse automation, prospecting data or logging metric code was changed.
- Manifest and icons are unchanged. Only the release cache marker was updated so installed PWAs receive the corrected files.

## Validation

- JavaScript syntax validation passed.
- The complete regression suite passed.
- Automated checks confirm that both beta call-return functions are byte-for-byte identical to the supplied working beta source.
- Protected Firebase, Firestore, MarketPulse automation, manifest and icon files were compared against v1.41.6.
- Physical iPhone testing remains required after deployment.
