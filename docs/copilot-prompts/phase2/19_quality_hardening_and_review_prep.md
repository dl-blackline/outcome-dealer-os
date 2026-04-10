# Prompt 19 — Quality Hardening and Review Prep

Perform the final hardening pass for this phase of Outcome Dealer OS.

## Goals

- improve compile, lint, and test reliability
- remove stale scaffolding and duplicate patterns
- make the repo easier to review and continue building
- align documentation to implemented reality one more time

## Tasks

1. Remove or isolate obvious dead code and conflicting placeholder remnants.
2. Normalize shared component usage and page structure where drift remains.
3. Fix compile, lint, and type issues found during this phase.
4. Add or update:
   - `/docs/product/repo_review_brief.md`
   - `/docs/architecture/reviewer_focus_areas.md`
   - `/docs/architecture/open_risks_and_gaps.md`
   - `/docs/architecture/phase2_completion_status.md`
5. Summarize:
   - what is implemented now
   - what remains mock-driven
   - where the biggest architectural or workflow gaps still are

## Rules

- do not add major new features in this pass
- optimize for clarity, stability, and review-readiness
- preserve the current Outcome Dealer OS direction

## Deliverable

- hardened repo
- updated docs
- clear review package for the next audit
