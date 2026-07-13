# Daily Accountability v1.0

## What is included
- Private Firebase sign-in and live Firestore sync across iPhone, Safari, Mac and iPad.
- Offline Firestore cache plus local backup storage.
- One-screen Today dashboard with no scrolling for core actions.
- Calls, connects, data and ongoing knocking timer.
- Four-hour rolling weekly knocking balance across Monday, Tuesday, Thursday and Friday.
- 12-hour Call Recommendations from 9:00 AM to 5:00 PM.
- Activity timeline with date and metric filters, correction and deletion.
- Weekly insights, monthly trend bars, personal bests and yearly heatmap.
- End-of-day review, voice logging, optional GPS start marker, break reminder, backup import/export and printable weekly report.

## Firebase setup
1. Firebase Console → **Security → Authentication** → **Get started**.
2. Open **Sign-in method** → enable **Email/Password**.
3. Firebase Console → **Databases & Storage → Firestore Database** → **Create database**.
4. Choose **Standard edition**, **Production mode**, and **australia-southeast1 (Sydney)** where available.
5. In Firestore, open **Rules**. Replace everything with the contents of `firestore.rules`, then click **Publish**.
6. Firebase Console → **Settings → Project settings → General → Your apps**.
7. Tap the `</>` web icon, name it `Daily Accountability`, leave Firebase Hosting unticked, then register it.
8. Copy the Firebase configuration values into `firebase-config.js`.
9. Upload all files and the `icons` folder to the root of your GitHub Pages repository.
10. Open the app, tap **Create account** once, then use the same email/password on every device.

## Important limitations
- Voice logging uses the browser speech-recognition feature and may not be available in every browser.
- GPS is only requested when knocking starts and stores a start marker, not continuous background tracking.
- iOS can suspend web apps in the background. The elapsed knocking time still catches up when the app reopens, but alarms and break notifications cannot fire while iOS has fully suspended the app.
- Apple Watch and deep Siri integration require a native iOS app and are not part of this PWA build.
