# Prompt 08 — Final Stabilization and Review Readiness

Perform the final stabilization pass for Outcome Dealer OS before repo review.

## Goals

- make the repo coherent
- reduce placeholder drift
- improve compile, lint, and build reliability
- align docs with implemented reality
- make the repo easy to review seriously

## Tasks

1. Remove obvious dead code or conflicting scaffolding leftovers.
2. Normalize page structure, shell structure, and shared component usage.
3. Fix lingering compile, lint, and type issues.
4. Create:
   - `/docs/product/repo_review_brief.md`
   - `/docs/architecture/implemented_vs_planned.md`
   - `/docs/architecture/reviewer_focus_areas.md`
   - `/docs/architecture/open_risks_and_gaps.md`
5. Summarize:
   - what is production-leaning
   - what is still mock
   - what the next highest-leverage build areas are

## Rules

- do not add major new features in this pass
- optimize for clarity, trust, and review-readiness

## Deliverable

- stabilized repo
- aligned docs
- clean review package
