# AGNT MarketPulse inbox bridge

This one-time bridge reads approved MarketPulse forwards from `agnt.marketpulse@gmail.com`, matches the forwarding address to the same AGNT login email, and sends the email to that user's private Hot Spotting intake queue.

## Before setup

1. Publish this AGNT release and have each user sign in once. AGNT automatically registers the normalized login email on their existing `users/{uid}` profile.
2. Each user creates an Outlook forwarding rule:
   - From: `marketpulse@mcgrath.com.au`
   - Subject: `Your Real Estate Update for Today`
   - Action: **Forward** to `agnt.marketpulse@gmail.com`
3. The user must forward from the same email address they use to sign in to AGNT. Do not use Redirect or a shared mailbox sender.

## Install the collective inbox bridge

1. Sign in to Google as `agnt.marketpulse@gmail.com`.
2. Open [Google Apps Script](https://script.google.com), create a new standalone project, and name it `AGNT MarketPulse Bridge`.
3. Replace `Code.gs` with the bundled `Code.gs` file.
4. In **Project Settings**, enable **Show "appsscript.json" manifest file in editor**. Replace that file with the bundled `appsscript.json`.
5. In the Firebase console, open the existing BETA project `daily-accountability-be0ac`, then go to **Project settings → Service accounts → Generate new private key**.
6. In Apps Script **Project Settings → Script properties**, add:
   - Property: `FIREBASE_SERVICE_ACCOUNT_JSON`
   - Value: the complete contents of the downloaded service-account JSON file
7. Never add that JSON to GitHub, this ZIP, email, or chat. Delete the downloaded local copy after the Script Property is saved securely.
8. Select `setupMarketPulseBridge` in the Apps Script editor and click **Run**. Approve the Gmail and external-request permissions while signed in as the collective inbox.
9. Open **Executions** and confirm the setup run succeeds. The script installs one five-minute trigger and immediately checks the last 36 hours of forwards.

No Firebase Blaze plan, Cloud Function, Firestore rule change, or data migration is required.

## Confirm it is working

1. Forward a real MarketPulse email using the rule above.
2. Run `runMarketPulseBridgeNow` for an immediate check, or wait up to five minutes.
3. Open AGNT as that user. The events should appear directly in **Prospector → Hot Spotting**.
4. In **Settings → MarketPulse Automation**, confirm the account says **Connected** and shows the latest import time.

For a safe status check, run `getMarketPulseBridgeStatus`. It reports the last run, summary, and trigger count but never returns the service-account credential.

## Operational behaviour

- Only an authenticated McGrath forward with the exact original sender and subject is accepted.
- The outer forwarding address and original MarketPulse recipient must match each other and the registered AGNT login email.
- Unmatched users remain queued for a later run; suspicious messages are quarantined.
- Gmail message IDs and Hot Spotting event IDs make reprocessing idempotent.
- The raw email body is cleared from Firestore after AGNT imports it. Failed parser items retain their body for diagnosis until retried or manually removed.
- The existing manual-paste importer remains available as a fallback.

## Maintenance

- Run `runMarketPulseBridgeNow` to process immediately.
- Run `getMarketPulseBridgeStatus` to inspect health.
- Run `removeMarketPulseBridgeTrigger` to stop future runs without deleting Gmail or AGNT data.
- If the service-account key is ever exposed, revoke it in Google Cloud/Firebase, generate a replacement, and update the Script Property.
