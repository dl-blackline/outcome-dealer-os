# National Car Mart buyer-hub inventory integration prompt

Implement the National Car Mart inventory snapshot into the Outcome Dealer OS customer-facing buyer hub.

## Context
A seed CSV and download/generation script are expected at:
- `src/domains/buyer-hub/data/nationalCarMartInventory.seed.csv`
- `scripts/seed-national-car-mart-inventory.mjs`

The goal is to replace the tiny hardcoded buyer-hub inventory mock with the 108-vehicle National Car Mart snapshot and make the front customer-facing site show real unit images.

## Required outcome
1. Ensure the seed CSV exists at `src/domains/buyer-hub/data/nationalCarMartInventory.seed.csv`.
2. Run the script to create:
   - `public/inventory/national-car-mart/*`
   - `src/domains/buyer-hub/data/nationalCarMartInventory.generated.ts`
3. Wire `/shop`, `/shop/:unitId`, `/favorites`, and `/compare` to the generated inventory module instead of the old small mock array.
4. Render real vehicle images everywhere inventory cards or comparison headers currently show icon placeholders.
5. Preserve the existing buyer-hub routing and shopping-state behavior.
6. Keep this implementation lightweight and front-end only. Do not add backend or Supabase dependencies for this step.

## Specific implementation guidance
- Replace imports from `@/domains/buyer-hub/buyerHub.mock` with imports from the generated module.
- If needed, keep a thin compatibility file at `buyerHub.mock.ts` that re-exports from the generated module so the rest of the buyer-hub pages do not break.
- In `ShopInventoryPage.tsx`:
  - derive body-style filter options from the actual inventory data rather than the fixed `Sedan/Truck/SUV` list
  - keep search, price filtering, and sort behavior
  - render `unit.imageUrl` with an `<img>` tag using `object-cover`
  - add a graceful fallback to the shared placeholder image if the image fails to load
- In `VehicleDetailPage.tsx`:
  - replace the hero placeholder with the real image
  - keep the existing CTA stack and payment estimate
  - add stock number and transmission to the spec area if it fits cleanly
- In `FavoritesPage.tsx`:
  - replace the card placeholder with the real image
- In `ComparePage.tsx`:
  - replace the compare header placeholder with the real image thumbnail
- Keep the visual style premium, clean, and consistent with the existing buyer-hub UI.

## Constraints
- Do not rewrite unrelated app-shell, router, or non-buyer-hub areas.
- Do not invent backend inventory sync here.
- Do not remove current favorites/compare state behavior.
- Do not break TypeScript types.

## Acceptance checks
- `/shop` shows the full 108-unit seeded inventory
- `/shop/:unitId` loads detail for seeded units
- favorites and compare still work with seeded units
- cards and detail pages show actual images instead of icon placeholders
- project still builds successfully
