# Runtime Auth And Inventory Map

## Public Surface

- Public homepage: `#/`
- Public inventory browse: `#/shop`
- Public vehicle detail: `#/shop/:unitId`
- Public inquiry, finance, trade, and schedule flows remain outside authentication.
- Shell entry point: `src/app/BuyerHubShell.tsx`

## Private Surface

- Internal OS: `#/app/...`
- Protected by the auth provider in `src/domains/auth/auth.store.tsx`
- Login entry: `#/login`
- Shell entry point: `src/app/AppShell.tsx`

## Inventory Runtime

- Master inventory source: `src/domains/buyer-hub/data/nationalCarMartInventory.seed.csv`
- Generated buyer-hub seed used by the runtime mapper: `src/domains/buyer-hub/data/nationalCarMartInventory.generated.ts`
- Normalization and public/admin shared model: `src/domains/inventory/inventory.runtime.ts`
- Repo-stored photo archive: `public/inventory/national-car-mart`

The runtime layer maps the existing seed sheet and saved photos into a single inventory catalog consumed by both the storefront and internal inventory screens. When Supabase is configured, the same runtime reads from `inventory_units` and `vehicle_photos` instead.

## Auth Runtime

- Supabase client helper: `src/lib/supabase/client.ts`
- Auth service: `src/domains/auth/auth.service.ts`
- Login UI: `src/app/pages/auth/LoginPage.tsx`

Runtime behavior:

- `supabase` mode when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are present.
- `spark` mode when Spark auth is available but Supabase is not configured.
- `demo` mode as the final local fallback.

## Database Runtime

- Hybrid browser data adapter: `src/lib/db/supabase.ts`
- Existing SQL schema: `migrations/0001` through `0014`
- New storefront/auth extension migration: `migrations/0015_supabase_public_inventory_and_auth.sql`

The browser data adapter prefers Supabase, then Spark KV, then localStorage. This keeps existing domain services functional while allowing the app to move onto Supabase-backed auth and SQL storage incrementally.
