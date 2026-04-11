# Prompt 36 — Record Runtime Adapters and Entity Linking

Strengthen record pages so they are backed by runtime adapters and show cleaner canonical linking across the product.

## Goals

- make record pages read through runtime-backed adapters and services
- improve consistency of linked entity display and navigation
- reduce page-specific transform logic

## Tasks

1. Review record list and detail pages for households, leads, deals, and inventory.
2. Refactor them to consume stronger runtime adapters and hooks instead of page-level transforms.
3. Improve linked entity display for:
   - household to leads
   - lead to deal
   - deal to inventory
   - approvals to linked records
   - workstation cards to linked records
4. Standardize not-found, loading, empty-related-section, and linked-navigation behavior.
5. Add or update:
   - `/docs/architecture/record_runtime_adapter_model.md`
   - `/docs/ux/entity_linking_guidelines.md`

## Rules

- do not create duplicate linkage models
- do not let pages become their own data orchestration layer
- prioritize continuity and trustworthiness

## Deliverable

- stronger runtime-backed record pages
- cleaner entity linking across surfaces
- docs for record runtime adapter behavior
