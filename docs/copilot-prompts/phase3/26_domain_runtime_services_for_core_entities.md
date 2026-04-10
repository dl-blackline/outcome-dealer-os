# Prompt 26 — Domain Runtime Services for Core Entities

Promote the most visible entity surfaces from mock adapters to real runtime services.

## Goals

- make core entities use clearer service/query boundaries
- reduce the gap between UI and domain/runtime behavior
- make the most important surfaced records operationally trustworthy

## Tasks

1. Prioritize runtime service/query improvement for:
   - leads
   - deals
   - inventory
   - events
   - approvals
   - workstation cards
2. Move pages toward consuming these runtime services instead of local transforms.
3. Standardize loading, error, and empty-state behavior through shared query patterns.
4. Add or update:
   - `/docs/architecture/core_runtime_entity_matrix.md`

## Rules

- do not overbuild all domains at once
- focus on the entities already surfaced most heavily in the UI
- preserve the current shell and page structure

## Deliverable

- stronger runtime services for core surfaced entities
- clearer page-to-domain boundaries
- docs for core runtime entity coverage
