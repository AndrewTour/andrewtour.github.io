# AGNT v1.37.9 — Device Contacts

Built directly on AGNT v1.37.8.

## Changes

- Added an explicit **Add to Phone Contacts** action to unified Contact, Buyer and Buyer + Seller profiles.
- Generates a vCard 3.0 `.vcf` file and uses the native file-share flow when supported.
- Falls back to downloading the `.vcf` for manual opening and import.
- Maps name, mobile, email, organisation and address into native contact fields.
- Maps AGNT operational context and buyer requirements into the native Notes field.
- Preserves all existing AGNT, Firebase, Firestore, team, manager, metric and workflow behaviour.

## Validation

- JavaScript and service-worker syntax checks.
- vCard field-mapping checks covering name, phone, email, Australian address, tags, buyer details and notes.
- Existing AGNT regression suite.
- ZIP integrity check.
