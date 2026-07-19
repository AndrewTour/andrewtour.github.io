# AGNT v1.56.4 — Organisation Address & Prospector Tab Fix

Built incrementally from v1.56.3.

## Changed
- CSV imports now prioritise the `Organisation` column for the contact property address.
- Address display is normalised to street number/street name and suburb.
- Backslash characters are removed; forward slashes are retained.
- New and imported contacts default to Cold unless a valid temperature is supplied.
- Prospector Today and Contacts now switch strictly inside the Prospector module.
- PWA cache bumped to v1.56.4.

## Untouched
- Firebase configuration and authentication
- Firestore paths, rules and UID separation
- Home, appointments and leaderboards
- Existing prospecting document structure

Firebase changes required: none.
