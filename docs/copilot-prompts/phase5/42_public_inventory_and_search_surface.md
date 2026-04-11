# Prompt 42 — Public Inventory and Search Surface

Build the public-facing inventory browse/search experience for the buyer hub.

## Goals

- create a premium shopper-facing inventory surface
- let customers browse, filter, and sort units cleanly
- connect public inventory views to the same canonical inventory objects used by the internal OS

## Tasks

1. Design and build the public inventory landing/search page.
2. Support at minimum:
   - search by make/model/keyword
   - filter by price, year, mileage, body style, status/availability, payment range where feasible
   - sort by newest, price, mileage, relevance
3. Make the page feel premium, fast, and trustworthy.
4. Add or update:
   - `/docs/ux/public_inventory_search_experience.md`
   - `/docs/architecture/public_inventory_surface_map.md`
5. Ensure routing and component structure are ready for public access, separate from internal staff routes where appropriate.

## Rules

- do not create a disconnected inventory data model
- do not build a generic dealer website theme
- prioritize conversion and clarity over clutter

## Deliverable

- public inventory browse/search page
- route structure for public inventory
- docs for inventory search experience and architecture
