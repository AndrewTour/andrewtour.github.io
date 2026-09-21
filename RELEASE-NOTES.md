# AGNT v1.41.41 — Runtime recovery

Baseline: v1.41.39 Buyer Messaging and Keypad. The discarded v1.41.40 build was not used.

## Corrections

- Failed buyer-match write-back no longer resets successfully recovered records.
- Daily, profile and prospecting saves use their existing keys without rewriting unrelated datasets; unchanged values are not written again.
- Device-storage failures are recorded and flagged in Settings. Backup-write failure does not block the primary record save.
- Unchanged timeline markup and focus text retain their DOM nodes.
- Cloud-driven visual refreshes are combined and deferred while hidden. Snapshot acknowledgements, merging and retries remain intact.
- Settings fields being edited are protected from background updates.
- An independent startup watchdog and error capture run before Firebase imports finish. Neither forces a reload nor bypasses authentication.
- Service-worker installation caches a complete release and the existing Firebase 11.10.0 modules. Running pages are not forcibly taken over. Navigation uses installed HTML and cleanup is restricted to AGNT release caches.
- Local diagnostics retain at most 48 events, without names, UIDs, contacts, messages, URLs or form content. No telemetry is sent. A technician can retrieve them with `window.agntRuntime.export()` in the browser console.

## Files

- app.js: targeted persistence, recovery, render and Settings protections.
- runtime.js: independent startup handling and bounded local diagnostics (new).
- index.html: runtime script and release references only.
- service-worker.js: coherent cache, SDK offline startup, scoped cleanup and bounded fetch.
- RELEASE-NOTES.md: these notes replace the previous release notes.

## Deployment

Upload the ZIP contents to the existing GitHub Pages root with index.html at the root. No Firebase Console, Firestore rules or GitHub settings changes are required. Open online so the worker can install, then close all AGNT windows and reopen. Updates do not interrupt a running session. Do not clear website data or uninstall to update.

## Preservation and limits

CSS, layout, icons, manifest, Firebase configuration, rules, paths, existing data formats, buyer messaging/keypad updates, business calculations, scheduled/locked-day behaviour and morning launch feature are retained. This release repairs verified failure paths; it does not establish or guarantee prevention of iOS process termination.

Syntax/static checks and isolated regression tests cover the changed code. Physical iPhone, live Firebase and deployed Pages verification remain required. Metadata callbacks deliberately retain the existing recovery checks rather than being discarded as an optimisation.
