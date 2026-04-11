# Prompt 40 — Phase 4 Test Matrix, Seed Bootstrap, and Release Prep

Perform the final hardening pass for this phase of Outcome Dealer OS.

## Goals

- strengthen tests around the new runtime-backed behaviors
- formalize seed and bootstrap behavior for demo/runtime environments
- improve release readiness and review readiness

## Tasks

1. Review current build, lint, and test health.
2. Add or strengthen tests around:
   - route enforcement
   - auth/runtime role sourcing
   - workstation card lifecycle and drag/drop behavior
   - approval resolution flow
   - record not-found behavior
   - runtime hook behavior for core surfaced entities
   - command palette navigation and search
3. Formalize seed/bootstrap behavior for runtime-backed demo data.
4. Add or update:
   - `/docs/architecture/seed_bootstrap_model.md`
   - `/docs/architecture/phase4_completion_status.md`
   - `/docs/architecture/reviewer_focus_areas.md`
   - `/docs/architecture/open_risks_and_gaps.md`
   - `/docs/product/repo_review_brief.md`
5. Summarize:
   - what is now runtime-trustworthy
   - what remains seeded or mock-backed
   - what still blocks production readiness

## Rules

- do not add major new product features in this pass
- optimize for trust, stability, and readiness for the next review
- preserve the Outcome Dealer OS direction

## Deliverable

- stronger tests
- clearer seed/bootstrap model
- updated release and review docs
