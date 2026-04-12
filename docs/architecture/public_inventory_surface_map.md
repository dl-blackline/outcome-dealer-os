# Public Inventory Surface Map

## Purpose

Describes how the public-facing inventory browse page reads and presents canonical inventory objects to buyers.

## Data Flow

```
┌──────────────────────┐
│  Canonical Inventory  │  (MOCK_INVENTORY in lib/mockData)
│  InventoryUnit[]      │
└──────────┬───────────┘
           │ spread + buyer-specific fields
           ▼
┌──────────────────────┐
│  PublicInventoryUnit  │  (buyerHub.mock.ts)
│  + bodyStyle          │
│  + highlights[]       │
│  + available          │
│  + imageUrl?          │
└──────────┬───────────┘
           │ imported by
           ▼
┌──────────────────────┐
│ ShopInventoryPage     │  /shop route
│ Client-side filter,   │
│ search, sort, display │
└──────────────────────┘
```

## PublicInventoryUnit

The buyer-hub domain defines `PublicInventoryUnit` which extends canonical `InventoryUnit` fields with buyer-facing additions:

| Field | Source | Description |
|-------|--------|-------------|
| id, vin, year, make, model, trim, askingPrice, status, daysInStock | Canonical `InventoryUnit` | Spread from `MOCK_INVENTORY` |
| bodyStyle | Buyer-hub enrichment | Vehicle body classification (Sedan, Truck, SUV) |
| mileage | Buyer-hub enrichment | Odometer reading |
| highlights | Buyer-hub enrichment | Marketing-friendly feature tags |
| available | Buyer-hub enrichment | Whether the unit is shown publicly |
| imageUrl | Buyer-hub enrichment | Optional hero image URL |

## Client-Side Filtering

All filtering, search, and sort operations run in the browser against the in-memory `BUYER_HUB_INVENTORY` array. No server round-trips are required during the mock/prototype phase.

| Operation | Strategy |
|-----------|----------|
| Keyword search | Multi-token AND match against `year make model trim` |
| Body style | Exact match on `bodyStyle` field |
| Price range | Numeric range comparison on `askingPrice` |
| Sort | Array sort by year, price, or mileage |

## Navigation

Each vehicle card links to `/shop/:unitId` via the hash-based router. The `VehicleDetailPage` receives the unit ID as a route parameter.

## Future Considerations

- Replace mock data with API calls to a real inventory service.
- Server-side search/filter for large inventories.
- Image CDN integration for `imageUrl`.
- Favorites persisted to `localStorage` or user account.
