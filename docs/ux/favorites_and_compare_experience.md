# Favorites & Compare Experience

## Overview

The favorites and compare flows enable customers to curate a shortlist of vehicles and compare them side by side. Both features use shared client-side state (via `useShoppingState`) that persists across page navigations and browser sessions.

## Favorites Flow

### Entry Points

- **Heart icon** on any inventory card (shop grid, search results)
- **Favorites page** accessible via `/favorites` in the navigation

### Favorites Page (`/favorites`)

- **Header:** "Saved Vehicles" with a count badge
- **Vehicle grid:** Responsive grid (1 → 2 → 3 columns) showing favorited vehicles
- **Card contents:** Year/make/model/trim, body style badge, mileage, price, highlight badges
- **Card actions:**
  - **View Details** — navigates to `/shop/:unitId`
  - **Compare** toggle — adds/removes from compare list
  - **Remove** (trash icon) — removes from favorites
  - **Heart-break icon** — top-right quick remove

### Empty State

When no vehicles are saved:

- Centered illustration (heart icon, thin weight)
- "No saved vehicles yet"
- "Browse our inventory to save vehicles you love. Tap the heart icon on any vehicle to add it here."
- CTA button: "Browse Inventory" → `/shop`

### Floating Compare Button

When one or more vehicles are in the compare list:

- Fixed-position button at bottom-center of viewport
- "Compare Selected (X)" with arrow icon
- Navigates to `/compare`

## Compare Flow

### Entry Points

- **Floating compare button** on Favorites page
- **Direct navigation** to `/compare`
- **Compare toggle** on inventory cards or favorites cards

### Compare Page (`/compare`)

- **Header:** "Compare Vehicles" with count badge and "Clear All" button
- **Layout:** Responsive comparison table with horizontal scroll on narrow screens
- **Column headers:** Vehicle thumbnail placeholder, year/make/model, trim

### Comparison Rows

| Row | Content |
|---|---|
| Price | Formatted currency, bold |
| Mileage | Formatted with "mi" suffix |
| Body Style | Badge component |
| Year | Plain text |
| Highlights | Wrapped badges for each feature |
| Actions | "View Details" + "Remove" buttons |

### Empty State

When no vehicles are in the compare list:

- Centered illustration (scales icon, thin weight)
- "No vehicles to compare"
- "Save some vehicles first, then add them to compare. You can compare up to 4 vehicles side by side."
- CTA button: "Browse Inventory" → `/shop`

### Constraints

- Maximum of **4 vehicles** in the compare list at once
- Attempting to add a 5th vehicle is silently ignored (the toggle does nothing)
- Removing all vehicles shows the empty state

## Interaction Patterns

### Toggle Behavior

Both save and compare use toggle semantics:
- First tap/click adds the item
- Second tap/click removes it
- Visual state updates immediately (optimistic)

### Persistence

- State saved to `localStorage` on every change
- Restored on page load
- Survives browser restarts within the same origin

### Cross-Page Consistency

Because `useShoppingState` reads from `localStorage` on mount, any page using the hook will reflect the latest state. Each page instance maintains its own React state copy, so changes made on one page won't live-update another open tab (future enhancement).

## Accessibility

- Heart and compare buttons include `aria-label` attributes
- Interactive elements are keyboard-accessible via standard button semantics
- Color is not the sole indicator of state (icon weight changes from "regular" to "fill")
