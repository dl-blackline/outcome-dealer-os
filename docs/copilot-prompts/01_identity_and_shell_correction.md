# Prompt 01 — Identity and Shell Correction

Review the current Outcome Dealer OS repo and complete a product-identity correction pass.

## Goals

- remove remaining Spark-template product identity from visible repo and app surfaces
- keep Outcome Dealer OS as the clear product name everywhere user-facing
- preserve existing shell components and role structure
- do not break current UI

## Tasks

1. Replace Spark-template naming in repo-level docs and visible metadata where appropriate.
2. Rewrite `README.md` so it describes Outcome Dealer OS, current status, architecture direction, and setup.
3. Audit package and app metadata and clean up naming where safe.
4. Keep the existing north-star doc as the source-of-truth product vision.
5. Add or update:
   - `/docs/product/current_product_identity.md`
   - `/docs/product/current_implementation_status.md`
6. Summarize:
   - what was legacy scaffold
   - what is now Outcome Dealer OS
   - what still remains placeholder

## Rules

- do not do risky refactors yet
- do not invent new architecture in this pass
- preserve the current UI shell
- prioritize clarity and repo trustworthiness

## Deliverable

- cleaned identity surfaces
- real README
- doc updates
- summary of placeholder vs implemented reality
