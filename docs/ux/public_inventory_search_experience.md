# Public Inventory Search Experience

## Overview

The public inventory browse page (`/shop`) is the primary entry point for buyers exploring available vehicles. It prioritizes fast scanning, intuitive filtering, and clear calls-to-action to drive engagement with individual vehicle listings.

## Search

- Full-width keyword search bar at the top of the page.
- Matches against year, make, model, and trim as a combined string.
- Multi-token queries are AND-matched (every token must appear).
- Filtering is instant — no submit button required.

## Filter Controls

Filters are revealed via a **Filters** toggle button so the grid stays prominent by default.

| Filter | Implementation | Options |
|--------|---------------|---------|
| Body Style | Toggle chips (pill buttons) | All, Sedan, Truck, SUV |
| Price Range | Toggle chips | All, Under $30k, $30k–$50k, Over $50k |

Active chip is visually highlighted with the primary colour.

## Sort

A native `<select>` dropdown next to the filter button. Options:

- **Newest** — year descending, then days-in-stock ascending
- **Price Low-High / Price High-Low** — askingPrice sort
- **Mileage** — ascending mileage

## Inventory Grid

- Responsive: 1 column on mobile, 2 on medium, 3 on large screens.
- Each card shows: title (year make model trim), body style badge, mileage, highlight tags, prominent price, and a **View Details** CTA.
- Heart/favourite button on each card for future save-to-favourites functionality.
- Hover shadow transition on cards for tactile feel.

## Empty State

When no vehicles match the active filters, the page displays a centred empty state with an icon, explanatory copy, and a **Clear all filters** button.

## Results Count

A "Showing X vehicles" label above the grid keeps the user oriented.

## Accessibility

- Filter chips and favourite buttons have descriptive `aria-label` attributes.
- Native `<select>` for sort ensures keyboard and screen-reader compatibility.
- Semantic heading hierarchy (h1 page title, h2 empty state, h3 card titles).
