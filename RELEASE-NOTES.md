# AGNT v1.44.6 — Confirmed property conversations

- Core > My Market now lets the agent confirm or remove a contact–property link after checking an exact address match. A street or address match alone remains unconfirmed.
- Confirmed contacts are listed first on the property. Their existing follow-up date appears there, and the same property is linked from their Contact profile.
- The property row opens the existing contact editor for the next follow-up, existing contact logging, or an appointment prefilled with the contact and property context. Existing appointment type and save requirements remain in place.
- The link is a bounded field on the existing UID-isolated prospect record and uses current local persistence and Firestore sync. No new listener, timer, index, collection, or background scan was added.
- Changed: app.js (relationship, navigation and rendering); index.html, runtime.js, service-worker.js (release identity); RELEASE-NOTES.md (current notes).
- No Firebase configuration, Firestore paths or rules, service-worker lifecycle, manifest, icons, metrics, rankings, or data import formats changed.
