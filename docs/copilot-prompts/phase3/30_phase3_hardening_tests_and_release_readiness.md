# Prompt 30 — Phase 3 Hardening, Tests, and Release Readiness

Perform the final hardening pass for this phase of Outcome Dealer OS.

## Goals

- improve build reliability
- strengthen tests around the most important runtime behaviors
- reduce architectural drift before the next review
- prepare the repo for a serious product-quality audit

## Tasks

1. Review compile, lint, and test health across the repo.
2. Add or strengthen tests around:
   - route enforcement
   - workstation card lifecycle
   - approval resolution flow
   - record not-found behavior
   - command palette search and navigation
3. Remove stale or conflicting code paths where safe.
4. Add or update:
   - `/docs/product/repo_review_brief.md`
   - `/docs/architecture/phase3_completion_status.md`
   - `/docs/architecture/reviewer_focus_areas.md`
   - `/docs/architecture/open_risks_and_gaps.md`
5. Summarize:
   - what is now operationally trustworthy
   - what remains mock-backed
   - what still blocks production readiness

## Rules

- do not add major new features in this pass
- optimize for trust, stability, and review-readiness
- preserve the Outcome Dealer OS direction

## Deliverable

- hardened repo
- stronger tests
- aligned docs
- clear review package for the next audit
