# AGNT v1.42.1 — Appointment CSS consolidation

Baseline: v1.42.0 Communication and Appointment Context.

Moved the existing appointment context notes, outcome notes, history grouping and Message action styles from `cleanup.css` into `styles.css`. Removed the obsolete outcome-note padding and italic rule. Preserved existing visual values and light/dark behaviour. The Message colour retains one necessary `!important` to override the existing secondary-action colour rule.

No workflows, business logic, Firebase configuration, storage formats, manifest, icons or service-worker behaviour changed. Release identifiers and asset URLs were updated to keep the new CSS release coherent for the PWA cache.

Static CSS and package checks passed. Physical iPhone, live Firebase and GitHub Pages deployment were not tested.
