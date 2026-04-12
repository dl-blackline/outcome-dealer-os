# Vehicle Detail Page — Conversion Surface UX

## Purpose

The Vehicle Detail Page (VDP) is the **primary conversion surface** in the buyer hub. Every visitor who reaches this page has expressed clear intent by selecting a specific vehicle. The page must convert that intent into action — inquiry, test-drive booking, finance application, or trade-in — while delivering full transparency on pricing and terms.

## Layout

| Viewport | Structure |
|----------|-----------|
| Desktop (lg+) | Two-column: hero/specs (3/5) · payment + CTAs (2/5) |
| Mobile | Single-column stack: hero → specs → highlights → payment → CTAs |

## Key Sections

### 1. Hero
- Large placeholder area with vehicle icon (images TBD).
- Year/make/model/trim as the primary heading.
- Availability badge (green "Available" or neutral "Unavailable").
- Persistent favorite (heart) toggle in the top-right corner.

### 2. Key Specs Grid
Four cards in a horizontal row conveying the most-asked questions at a glance:
- **Price** — formatted currency, emerald accent.
- **Mileage** — formatted number, blue accent.
- **Body Style** — text label, violet accent.
- **Year** — numeric, amber accent.

### 3. Highlights
Vehicle feature badges rendered from the inventory `highlights` array. Secondary badge variant keeps visual weight low.

### 4. Payment Estimate
- Computed via `computePaymentEstimate` with conservative defaults (0 down, 72 mo, 6.9% APR).
- Monthly payment displayed prominently; total cost and line-item breakdown below.
- **Disclaimer is mandatory** — never present estimates as binding terms.
- "Customize Payment" button links to the finance page for deeper exploration.

### 5. Conversion CTAs
Stacked action buttons in priority order:
1. **Inquire** (primary) — opens inquiry flow.
2. **Schedule a Test Drive** — links to `/schedule`.
3. **Get Pre-Qualified** — links to `/finance/apply`.
4. **Value Your Trade** — links to `/trade`.
5. **Save to Favorites** — heart toggle (ghost style).

### 6. VIN Display
Monospace VIN at the bottom of the left column for reference / copy-paste.

## Not-Found State
If the `unitId` param does not match any inventory record, a centered empty-state is shown with a vehicle icon, explanatory text, and a "Back to Inventory" link.

## Design Principles
- **Transparency first** — all financial numbers carry clear disclaimers.
- **Mobile parity** — CTAs are equally accessible on small screens.
- **Minimal friction** — every CTA is one click from the detail page.
- **Premium feel** — generous spacing, muted backgrounds, subtle icon accents.
