# Prompt 15 — Record Services, Search, and Not-Found Handling

Strengthen record pages so they stop silently falling back to arbitrary mock records and start behaving like real record surfaces.

## Goals

- make record pages use clear record-loading helpers or services
- introduce proper not-found handling
- support basic search/list continuity for records
- improve record trustworthiness

## Tasks

1. Review current household, lead, deal, and inventory list and record pages.
2. Remove silent fallbacks like “show first record if the ID doesn’t exist.”
3. Introduce clear record-loading helpers/services for:
   - households
   - leads
   - deals
   - inventory units
4. Ensure record pages support:
   - loading
   - not found
   - error
   - empty related sections
5. Improve list-to-record navigation and add simple search/filter behavior where appropriate.
6. Add or update:
   - `/docs/architecture/record_runtime_loading.md`

## Rules

- do not overbuild full backend search yet
- do not keep deceptive fallback behavior
- preserve the premium shell and component language

## Deliverable

- real record loading boundaries
- proper not-found handling
- stronger list-to-record continuity
