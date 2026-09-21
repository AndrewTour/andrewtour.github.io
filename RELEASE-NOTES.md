# AGNT v1.41.42 — Device-save warning correction

Baseline: approved v1.41.41 Runtime Recovery.

## Corrections

- An optional previous-day device backup no longer reports a required-save failure.
- Required device-save warnings wait briefly and remain silent when Firebase is already live and synced.
- Genuine offline device-save failures still report when attention is required.

## Files

- app.js: optional-backup handling and device-save warning gating.
- index.html: release references only.
- runtime.js: release identifier only.
- service-worker.js: cache release identifier and integrity checks only.
- RELEASE-NOTES.md: these notes replace the previous release notes.

## Preservation

Firebase configuration, authentication, UID separation, Firestore paths and rules, service-worker behaviour, data formats, workflows, navigation, visual layout and all user-facing features remain unchanged.

## Verification note

Static, syntax, package-integrity and focused storage-warning checks passed. Physical iPhone, live Firebase and production GitHub Pages behaviour still require real-device verification.
