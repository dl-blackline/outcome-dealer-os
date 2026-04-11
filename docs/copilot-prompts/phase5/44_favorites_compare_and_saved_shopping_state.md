# Prompt 44 — Favorites, Compare, and Saved Shopping State

Add shopper-side saved state tools that increase return visits and conversion.

## Goals

- let customers save/favorite units
- support compare behavior across multiple units
- persist shopping state in a way that can later connect to identified customers/households

## Tasks

1. Build favorites/saved units behavior.
2. Build a compare surface for multiple units.
3. Define how saved shopping state should work for:
   - anonymous user
   - known customer
   - post-inquiry / post-application state
4. Add or update:
   - `/docs/architecture/customer_saved_state_model.md`
   - `/docs/ux/favorites_and_compare_experience.md`

## Rules

- do not create a separate customer identity model outside the OS
- keep the UX light and premium
- prioritize conversion and return-visit value

## Deliverable

- favorites flow
- compare flow
- docs for saved shopping state and UX model
