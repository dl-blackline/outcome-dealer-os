# Inventory-to-Deal Linking: Implementation Notes

## Overview

Deals can now be linked to a specific inventory unit. When a user creates or edits a deal, they can click **Attach Inventory Unit** to open a searchable picker and select a vehicle. The deal then stores:

1. A **live link** — `inventoryUnitId` pointing to the inventory record ID
2. A **snapshot** — key vehicle fields captured at the time of attachment (stored as `inventorySnapshot` on the deal record)

---

## Architecture

### Data model — `MockDeal` (`src/lib/mockData.ts`)

Two new fields were added to `MockDeal`:

| Field | Type | Purpose |
|---|---|---|
| `inventoryUnitId` | `string?` | Live foreign key to the `InventoryRecord.id` |
| `inventorySnapshot` | `DealInventorySnapshot?` | Point-in-time copy of vehicle fields at attach time |

`DealInventorySnapshot` captures: year, make, model, trim, bodyStyle, stockNumber, VIN, VIN last 6, exterior/interior color, mileage, asking price, primary image URL, unit status.

### Persistence — `deal.service.ts`

The KV-backed deal service stores `inventory_unit_id` (string) and `inventory_snapshot` (JSON-serialized string) on the `MockDealRow`. These round-trip cleanly through `rowToDeal()`.

Legacy deals (those without `inventoryUnitId`) continue to work normally — `vehicleDescription`, `stockNumber`, and `vin` remain text fields and are still displayed.

---

## Components

### `InventoryUnitSelector` (`src/components/inventory/InventoryUnitSelector.tsx`)

A searchable modal picker built on `<Command>` + `<Dialog>`.

**Features:**
- Typeahead search by year, make, model, trim, stock number, VIN, or VIN last 6
- Thumbnail image for each unit (with placeholder fallback)
- Status badge per unit (Available / Frontline Ready / In Recon / Hold / Sold / Delivered / Wholesale)
- Status-gated selection: available/inventory = direct select; hold/recon = warning confirmation; sold/delivered/wholesale/archived = "Attach Anyway" override dialog
- Shows count of results vs. total inventory
- Keyboard navigable via `cmdk`

**Props:**
```ts
interface InventoryUnitSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (record: InventoryRecord) => void
  selectedId?: string  // highlight already-attached unit
}
```

### `LinkedInventoryUnitCard` (`src/components/inventory/LinkedInventoryUnitCard.tsx`)

Displayed on the deal record page when a unit is attached.

**Shows:**
- Thumbnail (live from inventory record; falls back to snapshot image URL)
- Year make model trim
- Stock # / VIN last 6 / mileage / price
- Live inventory status badge

**Actions:**
- View Inventory Record (navigates to `/app/records/inventory/:id`)
- Change Unit (opens `InventoryUnitSelector`)
- Remove (detaches the unit; preserves `vehicleDescription` text)

---

## Snapshot Behavior

When a unit is attached:
- The live inventory ID is stored (`inventoryUnitId`)
- A snapshot of the key fields is stored (`inventorySnapshot`)

The deal uses the **live record** for display when available (so the thumbnail, status, and price reflect current inventory state). The snapshot acts as a historical safety net — if the inventory record is deleted or its ID changes, the deal still has the vehicle info.

The snapshot is **not automatically refreshed** when inventory changes. This is intentional: deal records represent a point-in-time agreement and should remain historically stable. Future workflows may add an explicit "Refresh snapshot from inventory" action.

---

## Auto-Population

When a user selects a unit in the form (`DealFormPage`), the following fields are auto-populated:

| Deal field | Source |
|---|---|
| `vehicleDescription` | `${year} ${make} ${model} ${trim}` |
| `stockNumber` | `record.stockNumber` |
| `vin` | `record.vin` |
| `amount` (sale price) | `record.price` (if > 0) |

All auto-filled fields remain editable — the user can override them after selection.

---

## Backward Compatibility

Legacy deals (created before this feature) continue to work:
- If `inventoryUnitId` is absent, the deal record page shows the **manual vehicle text** and a dashed "Attach Inventory Unit" prompt
- The attach action is available directly from the deal record page (no need to go through Edit)
- No migration is required; old KV records load without `inventoryUnitId`/`inventorySnapshot` and simply return `undefined` for those fields

---

## Integration Points

| Area | What changed |
|---|---|
| **Create deal flow** (`DealFormPage`) | "Attach Inventory Unit" button in Vehicle section; auto-populates fields on selection |
| **Edit deal flow** (`DealFormPage`) | Pre-loads existing `inventoryUnitId` + snapshot; supports Change/Remove |
| **Deal record page** (`DealRecordPage`) | Shows `LinkedInventoryUnitCard` when linked; shows attach prompt when not |
| **Deal record page** | Replaces fuzzy text-match inventory lookup with real ID-based link |

---

## Future Work

- Wire `inventoryUnitId` into printable form packets so forms auto-fill from the linked unit
- Add explicit "Refresh snapshot" action for sales managers
- When a deal is marked Sold/Delivered, optionally update inventory unit status automatically
- Add a deal counter on the `InventoryUnitPage` showing how many deals reference each unit
