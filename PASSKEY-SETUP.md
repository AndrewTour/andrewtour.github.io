# AGNT OG Passkey Proof-of-Concept

This package adds optional WebAuthn passkey sign-in to the uploaded OG build. It is an isolated trial package, not the current BETA release.

## What the trial proves

- An existing Firebase email/password user can add a passkey without changing their UID.
- Apple devices can authenticate through Face ID, Touch ID or the device passcode.
- Android devices can authenticate through their available biometric or screen-lock method.
- The verified passkey returns a Firebase custom token for the original UID, preserving existing AGNT data access.
- Email/password and device-only access remain available.

AGNT intentionally keeps Firebase authentication persisted. A biometric prompt appears when a user signs in with a passkey, not every time the installed PWA opens.

## Important isolation warning

Do not replace the live BETA with this package.

The safest GitHub Pages test is a subfolder on the same host, for example:

`https://andrewtour.github.io/passkey-test/`

Because all paths are relative, the OG package can run from that folder while the existing BETA remains at its current location. A subfolder uses the same WebAuthn origin as the root site.

This OG test still points to the existing Firebase project. Passkey setup does not alter accountability records, but logging calls, appointments, contacts or other activity inside the OG app will write to the signed-in user's real Firebase data.

## Requirements

1. Firebase project `daily-accountability-be0ac` upgraded to Blaze.
2. Node.js 22.
3. Firebase CLI 14 or later.
4. Owner or deployment access to the Firebase/Google Cloud project.
5. An exact HTTPS test origin. Paths are not included in an origin.

Examples:

- Test URL `https://andrewtour.github.io/passkey-test/` uses origin `https://andrewtour.github.io`.
- Test URL `https://test.example.com/agnt/` uses origin `https://test.example.com`.

Passkeys are bound to the origin's relying-party domain. If the proof-of-concept uses a different hostname from the BETA, the test passkey will need to be created again after the feature is ported.

## 1. Install the server dependencies

From this package's root folder:

```bash
npm install -g firebase-tools
firebase login
firebase use daily-accountability-be0ac
npm --prefix functions install
```

## 2. Set the authorised origin

The function uses the parameter `PASSKEY_ALLOWED_ORIGINS`. Its default is:

`https://andrewtour.github.io`

During the first deployment, Firebase may ask for this value. Enter the exact test origin with no path or trailing slash. Multiple origins can be entered as a comma-separated list.

For local configuration, copy `functions/.env.example` to `functions/.env.daily-accountability-be0ac` and update the value before deployment.

## 3. Deploy only the passkey function

```bash
firebase deploy --only functions:passkeyApi
```

The function is configured for Sydney, scales to zero and is limited to two instances. The frontend is already configured to call:

`https://australia-southeast1-daily-accountability-be0ac.cloudfunctions.net/passkeyApi`

Do not deploy Firebase Hosting. The AGNT frontend remains on GitHub Pages.

After the first function deployment, apply Firebase's one-day Artifact Registry cleanup policy:

```bash
firebase functions:artifacts:setpolicy --location australia-southeast1 --days 1
```

## 4. Custom-token permission

The function must be able to sign a Firebase custom token after a passkey is verified. If the final passkey sign-in returns an `iam.serviceAccounts.signBlob` permission error, grant the function's Node.js 22 runtime service account the `Service Account Token Creator` role on itself.

For a second-generation function, the default runtime account is normally:

`PROJECT_NUMBER-compute@developer.gserviceaccount.com`

This can be managed under Google Cloud Console → IAM & Admin → Service Accounts → the runtime account → Permissions.

## 5. Upload the OG test frontend

Upload the package's frontend files to an isolated GitHub Pages folder such as `passkey-test/`. The `functions/` folder, `.firebaserc`, `firebase.json` and this guide are deployment source files and do not need to be served by GitHub Pages.

Required web files include:

- `index.html`
- `app.js`
- `styles.css`
- `firebase-config.js`
- `manifest.json`
- `service-worker.js`
- `icons/icon-192.png`
- `icons/icon-512.png`

## 6. iPhone test

1. Open the isolated HTTPS test URL.
2. Sign in with the existing email and password.
3. Open Settings.
4. Select **Set up a passkey**.
5. Complete the Apple Face ID/Touch ID/device-passcode prompt.
6. Confirm Settings shows **Active**.
7. Sign out.
8. Select **Continue with passkey**.
9. Confirm the same Firebase account, name and AGNT data load.
10. Add the test URL to the Home Screen and repeat the sign-out/sign-in test inside the installed PWA.

## 7. Android test

Repeat the same flow in Chrome and from the installed Home Screen PWA. Android chooses the available face, fingerprint, PIN or pattern verification method through its passkey provider.

## Acceptance checks before porting

- Email/password sign-in still works.
- Device-only mode still works.
- Passkey enrolment requires an already authenticated Firebase user.
- Passkey sign-in returns the original Firebase UID.
- Existing user data appears under that UID without migration.
- Cancelling the biometric prompt leaves the user signed out and shows a clear message.
- Removing a passkey disables that credential while password recovery remains available.
- iPhone Safari, iPhone Home Screen, Android Chrome and Android Home Screen all pass.

Before BETA release, add Firebase App Check and production-grade distributed rate limiting to the public passkey-start endpoint. This proof-of-concept includes a low instance ceiling and lightweight per-instance throttling for controlled testing only.

## Files added or changed

Frontend changes:

- `index.html`
- `app.js`
- `styles.css`
- `firebase-config.js`
- `service-worker.js`

Server/deployment additions:

- `functions/index.js`
- `functions/package.json`
- `functions/package-lock.json`
- `functions/.env.example`
- `functions/.gitignore`
- `firebase.json`
- `.firebaserc`

Packaging correction:

- Added `icons/icon-192.png` and `icons/icon-512.png` from the unchanged root icon files because the manifest and service worker already referenced the `icons/` directory.

No Firestore rule changes are required. The new underscore-prefixed credential and challenge collections remain inaccessible to web clients under the existing default-deny rules; the Admin SDK accesses them from the function.
