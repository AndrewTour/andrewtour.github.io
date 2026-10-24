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
