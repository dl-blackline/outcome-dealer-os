# Outcome Dealer OS — Architecture Reference

This document is the authoritative single-page reference for the current state of the system, core record relationships, workflow behavior, and how to extend each domain.

---

## 1. System Overview

Outcome Dealer OS is a React/TypeScript frontend application backed by a KV-store (Spark) service layer. All business data flows through typed domain services that write to and read from this KV store. A SQL migration set (Supabase, `migrations/`) defines the production schema target; the running frontend uses the KV adapter for all mutations.

### Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 19 + TypeScript |
| Build | Vite 7 |
| Routing | Custom hash router (`src/app/router/`) |
| State | React hooks + localStorage for operational domains |
| Data layer | KV-backed adapter (`src/lib/db/supabase.ts`) |
| Styling | Tailwind CSS + shadcn/ui |
| Icons | Phosphor Icons |
| Production DB target | Supabase (PostgreSQL) |

---

## 2. Core Record Domains

Every major business object is defined in `src/domains/` with:
- `*.types.ts` — TypeScript interfaces + DB row mappers
- `*.service.ts` — CRUD + business logic
- `*.hooks.ts` or `*.runtime.ts` — React hooks for UI consumption

### Domain Map

| Domain | Location | Backed By |
|---|---|---|
| Auth / Roles | `domains/auth/`, `domains/roles/` | Spark KV |
| Households | `domains/households/` | Spark KV |
| Leads | `domains/leads/` | Spark KV |
| Customers | `domains/customers/` | Spark KV |
| Inventory Units | `domains/inventory/` | Spark KV |
| Deals | `domains/deals/` | Spark KV |
| Sold Records | `domains/sold/` | Spark KV |
| Deal Forms / Packets | `domains/forms/` | Spark KV |
| Credit Apps | `domains/credit/` | Spark KV |
| Recon | `domains/recon/` | localStorage |
| Key Custody | `domains/key-custody/` | localStorage |
| Communications | `domains/communications/` | Spark KV |
| Events | `domains/events/` | Spark KV |
| Approvals | `domains/approvals/` | Spark KV |
| Audit | `domains/audit/` | Spark KV |
| Workstation | `domains/workstation/` | Spark KV |
| Reporting | `domains/reporting/` | Spark KV |
| Tasks | `domains/tasks/` | Spark KV |
| Intelligence | `domains/intelligence/` | Spark KV |

---

## 3. Core Record Relationships

```
Household (1) ──── (N) Lead
Lead (1) ──────── (N) Deal
Deal (1) ──────── (1) SoldRecord          ← created on markDealSold()
Deal (1) ──────── (0..1) InventoryUnit     ← live FK: inventoryUnitId
Deal (1) ──────── (0..1) InventorySnapshot ← point-in-time copy at attach time
SoldRecord (1) ── (0..1) InventoryUnit     ← live FK preserved for history
SoldRecord stores full vehicle snapshot at time of sale

InventoryUnit (1) ── (0..1) ReconUnit      ← via inventoryUnitId
InventoryUnit (1) ── (N) KeyCustodyEvent   ← via inventoryUnitId
```

### Key Principle: Live Link + Historical Snapshot

Every cross-domain reference that matters historically stores TWO things:
1. **Live foreign key** (e.g. `inventoryUnitId`) — for real-time navigation and current status
2. **Snapshot fields** (e.g. `snapshotYear`, `snapshotMake`, etc.) — point-in-time copy

This means deal records and sold records remain readable even if the inventory unit is deleted or archived.

---

## 4. Inventory-to-Deal Linking

### How it works

1. User creates or edits a deal in `DealFormPage`.
2. Clicks **Attach Inventory Unit** → opens `InventoryUnitSelector` modal.
3. Selector is searchable (year/make/model/trim/stock/VIN) and shows thumbnail, status badge, and price.
4. On selection:
   - `inventoryUnitId` is stored (live FK)
   - `inventorySnapshot` is built from the live record and stored (JSON-serialized on the KV row)
   - Form fields (`vehicleDescription`, `stockNumber`, `vin`, `amount`) are auto-populated but remain editable
5. On the deal record page, `LinkedInventoryUnitCard` shows the live inventory status with a link to the inventory record.

### Backward Compatibility

Legacy deals (no `inventoryUnitId`) continue to work — `vehicleDescription`, `stockNumber`, and `vin` are plain text fields and display as-is.

### Relevant Files

| File | Purpose |
|---|---|
| `src/components/inventory/InventoryUnitSelector.tsx` | Searchable modal picker |
| `src/components/inventory/LinkedInventoryUnitCard.tsx` | Summary card on deal record |
| `src/app/pages/records/DealFormPage.tsx` | Create/edit deal with attachment UI |
| `src/app/pages/records/DealRecordPage.tsx` | Deal record with attached unit display |
| `src/domains/deals/deal.service.ts` | KV persistence including inventory FK + snapshot |
| `src/lib/mockData.ts` | `DealInventorySnapshot` type definition |

---

## 5. Sold Transition Workflow

### Business Rules

- A deal can only be marked sold once (guard against double-sold).
- Marking sold: creates a `SoldRecord`, transitions inventory status to `"sold"`, updates deal status to `"sold_pending_delivery"`.
- Finalizing delivery: transitions sold record and inventory to `"delivered"`, updates deal status to `"delivered"`.

### Steps (implemented in `sold.service.ts → markDealSold`)

1. Load deal from KV store.
2. Guard: reject if already sold/delivered.
3. Resolve inventory unit (from deal's `inventoryUnitId` or override in input).
4. Build vehicle snapshot from live inventory (falls back to deal's existing snapshot).
5. Insert `sold_records` row with all snapshot fields + personnel + financials.
6. Update `inventory_units.status → "sold"`.
7. Update `deals.status → "sold_pending_delivery"`.

### Sold Status States

| Status | Description |
|---|---|
| `sold_pending_delivery` | Deal marked sold; vehicle not yet delivered |
| `delivered` | Vehicle handed over; deal finalized |

### Customer Purchase History

The `HouseholdRecordPage` shows a **Purchase History** section that queries:
```
household → leads (via lead.householdId)
         → deals (via deal.leadId)
         → sold_records (via soldRecord.dealId)
```
This chain allows all sold vehicles to appear on the household record without requiring a direct customer ID on the deal (since the KV deal model uses `customerName` text, not a customer UUID).

### Relevant Files

| File | Purpose |
|---|---|
| `src/domains/sold/sold.service.ts` | `markDealSold`, `finalizeDealDelivery` |
| `src/domains/sold/sold.types.ts` | `SoldRecord`, `SoldRecordRow`, mappers |
| `src/domains/sold/sold.hooks.ts` | `useSoldRecordByDeal`, `useSoldRecords`, `useSoldRecordsByCustomer` |
| `src/app/pages/records/SoldRecordPage.tsx` | Sold record detail page |
| `src/app/pages/records/DealRecordPage.tsx` | Mark Sold button + dialog |
| `src/app/pages/records/HouseholdRecordPage.tsx` | Purchase history section |

---

## 6. Forms Pack Engine

### Architecture

The forms engine has three layers:

1. **Templates** (`dealForms.templates.ts`) — static definitions of each form, its fields, and which data keys they map to.
2. **Runtime** (`dealForms.runtime.ts`) — `buildPacket()` pulls from a `DealFormContext` object, matches field `dataKey` values, and produces a `GeneratedForm` with `mappedValue`, `overrideValue`, and `finalValue` per field.
3. **Service** (`dealForms.service.ts`) — persists `SavedPacketRecord` entries to the KV store.

### Data Context (`DealFormContext`)

The full context type is in `dealForms.types.ts`. Key data sources:
- Dealer info (from settings)
- Deal fields (amount, dates, lender, etc.)
- Buyer / co-buyer (from deal's `customerName`)
- Vehicle (from linked inventory snapshot or manual entry)
- Trade vehicle
- F&I products
- Staff names

### Workflow (4 steps in `DealFormsPage`)

1. **Select Forms** — choose individual forms or a preset packet (Retail Basic, Retail Finance, Trade/Payoff, Internal Ops).
2. **Review Fields** — see all mapped values; apply manual overrides for missing or incorrect data.
3. **Preview** — render all forms with final values in a print-ready layout.
4. **Print & Save** — browser `window.print()` + saves a `SavedPacketRecord` to KV store.

Saved packets can be reopened from the deal record page at any time.

### How to Add a New Form

1. In `dealForms.templates.ts`, add a new `DealFormTemplate` object to `DEAL_FORM_TEMPLATES`:
   ```ts
   {
     id: 'my_new_form',
     name: 'My New Form',
     shortName: 'New Form',
     category: 'deal_documents', // see FormCategory type
     description: 'Description here',
     sections: ['Section 1', 'Section 2'],
     fields: [
       { id: 'buyerFullName', label: 'Buyer Name', dataKey: 'buyerFullName', type: 'text', required: true, section: 'Section 1', width: 'half' },
       // ...
     ],
     printOrder: 50,
     version: '1.0',
   }
   ```
2. All `dataKey` values must reference existing keys in `DealFormContext` (`dealForms.types.ts`). Add new context keys there if needed.
3. Add corresponding mapping logic in `dealForms.runtime.ts → buildContext()` if the new keys need special derivation.
4. The form will automatically appear in the selector on `DealFormsPage`.

### How to Add a New Packet Preset

In `dealForms.templates.ts`, add to `PACKET_PRESETS`:
```ts
{
  id: 'my_preset',
  name: 'My Preset',
  description: 'Description',
  formIds: ['four_square', 'down_payment_receipt', 'my_new_form'],
  dealTypes: ['retail_finance'], // optional filter
}
```

---

## 7. Communication Model

### Current State

The communication domain has types and service defined but no dedicated UI page.

### Data Model (`communication.types.ts`)

```ts
interface CommunicationEvent {
  id: UUID
  leadId?: UUID       // optional link to lead
  customerId: UUID    // required — owner of the communication
  channel: 'phone' | 'email' | 'sms' | 'chat' | 'in_person'
  direction: 'inbound' | 'outbound'
  subject?: string
  body?: string
  transcript?: string
  summary?: string
  aiGenerated: boolean
  sentByUserId?: UUID
  createdAt: string
}
```

### Architecture Hook Points

The service (`communication.service.ts`) is ready for:
- Logging manual communications from the deal or lead record
- Receiving inbound call/SMS webhooks from telephony providers (Twilio, etc.)
- Storing AI-generated summaries alongside transcripts

### Integration Path

When adding a telephony provider:
1. Add provider credentials to `env.example` and settings
2. Add an inbound webhook endpoint (server-side) that calls `communication.service.ts → createCommunicationEvent()`
3. Add a UI component on `LeadRecordPage` / `HouseholdRecordPage` to show the communication thread

---

## 8. Recon / Status Workflow

### Recon Stages (in order)

`intake → mechanical → body → detail → photos → frontline → complete`

Plus `on_hold` which can occur at any stage.

### Data Model

```
ReconUnit         — linked to InventoryUnit via inventoryUnitId
  └── ReconIssue  — individual problems found
  └── ReconCostEntry — line items (parts, labor, etc.)
  └── ReconActivity  — stage change events
```

All recon data is persisted to **localStorage** via `recon.runtime.ts`. This is suitable for single-device/single-store usage; migrating to Spark KV follows the same pattern as `deal.service.ts`.

### Pages

- `/app/ops/recon` — full recon board with stage management, issue tracking, cost entry

---

## 9. Key Custody Workflow

### Purpose

Track the physical location of vehicle keys. Prevents keys from going missing and provides management visibility into where vehicles are during the sales process.

### Data Model (`key-custody/keyCustody.types.ts`)

```
KeyCustodyEvent
  - inventoryUnitId?  — links to inventory record
  - stockNumber?      — display fallback
  - vehicleTitle?     — display fallback
  - eventType: 'checked_out' | 'checked_in' | 'transferred' | 'lost' | 'found'
  - checkedOutTo?     — person who has keys
  - checkedInBy?      — person returning/finding keys
  - checkoutReason?   — test_drive / demo / service / etc.
  - timestamp
```

### Derived State

`deriveStatuses()` in `keyCustody.runtime.ts` groups events by unit and derives:
- `isCheckedOut` — keys are currently out
- `isLost` — keys flagged missing
- `minutesOut` — how long keys have been checked out
- `currentHolder` — who has them now

### Alert Thresholds

- **Overdue**: keys out > 60 minutes → yellow border + badge
- **Lost**: red border + badge, prominent in board sort

### Pages

- `/app/ops/key-control` — Key Control board (check out/in, transfer, report lost/found, event log)

### Persistence

Currently localStorage-backed. To migrate to Spark KV, implement `key-custody/keyCustody.service.ts` following the `sold.service.ts` pattern, then swap the runtime hook to call the service.

---

## 10. Inventory Merchandising / VDP

The inventory record (`InventoryRecord` in `inventory.runtime.ts`) is the single source of truth for:
- Vehicle identity (year/make/model/trim/VIN/stock#)
- Status (inventory → recon → frontline → sold → delivered)
- Photos (`photos[]` array with URL and ordering)
- Pricing (`price`, `listPrice`)
- Visibility (`isPublic`, `isFeatured`)

Publish readiness is status-driven:
- `frontline` or `inventory` status → visible in public/shop views
- `sold`, `delivered`, `wholesale` → excluded from active retail
- `recon` → excluded from active retail; in recon workflow

The customer-facing shop pages (`src/app/pages/shop/`) already consume this same record structure.

---

## 11. Reporting

The reporting domain (`domains/reporting/`) provides:
- Report templates with filter/grouping definitions
- A runtime that queries deals, inventory, and sold records
- A save/restore mechanism for custom reports

Key built-in categories: inventory aging, deal volume, sold history, recon bottlenecks.

Route: `/app/ops/reports`

---

## 12. Auth / Roles

13 roles are defined in `domains/roles/roles.ts`:
`owner`, `gm`, `sales_manager`, `fi_manager`, `salesperson`, `bdc`, `admin`, `service_advisor`, `tech`, `parts`, `controller`, `marketing`, `viewer`

28 permissions are defined in `domains/roles/permissions.ts`.

Route guards are enforced in `AppShell.tsx` via `checkPermissionGuard()` and `checkExecutiveGuard()`.

---

## 13. Migration Path to Production Database

The `migrations/` directory contains 21 SQL files defining the full Supabase schema. When ready to connect to a live database:

1. Apply migrations `0001` through `0021` in order.
2. Run `supabase gen types typescript` to generate `src/types/database.generated.ts`.
3. Update each domain service to use the real Supabase client instead of the KV adapter.
4. The KV adapter (`src/lib/db/supabase.ts`) wraps Spark KV — swap it out per-service as needed.

See `migrations/TYPE_GENERATION_TODO.md` for the generation command.

---

## 14. Known Limitations / Next Recommended Steps

| Gap | Priority | Notes |
|---|---|---|
| Communications UI | High | `communication.service.ts` exists; need a comms thread component on lead/household pages |
| Telephony integration | High | Add Twilio/similar webhook → `createCommunicationEvent()` |
| Real database connection | High | All data currently in KV/localStorage; ready to swap to Supabase |
| Customer UUID on deals | Medium | Deals use `customerName` string; adding `customerId` FK would enable cleaner customer→purchase history queries |
| Recon/key custody → Spark KV | Medium | Currently localStorage; migration is mechanical |
| Route-level code splitting | Low | Bundle is ~500KB; `React.lazy()` each page file |
| Electronic key system integration | Low | Architecture ready for Keyper-style API integration via `keyCustody.service.ts` |
| AI agent integration | Low | Event system supports `actorType: 'agent'`; no AI calls wired yet |

---

## 15. File Map — Key Files by Workflow

### Deal Workflows
- Create deal: `pages/records/DealFormPage.tsx`
- View deal: `pages/records/DealRecordPage.tsx`
- Mark sold: `domains/sold/sold.service.ts → markDealSold()`
- Sold record: `pages/records/SoldRecordPage.tsx`
- Print forms: `pages/records/DealFormsPage.tsx`

### Inventory
- List: `pages/records/InventoryListPage.tsx`
- Detail: `pages/records/InventoryUnitPage.tsx`
- Selector: `components/inventory/InventoryUnitSelector.tsx`

### Recon / Ops
- Recon board: `pages/ops/ReconPage.tsx`
- Key control: `pages/ops/KeyControlPage.tsx`
- Reports: `pages/ops/ReportsPage.tsx`

### Customer Records
- Household record with purchase history: `pages/records/HouseholdRecordPage.tsx`
- Lead record: `pages/records/LeadRecordPage.tsx`

### Domain Services
- Deals: `domains/deals/deal.service.ts`
- Sold: `domains/sold/sold.service.ts`
- Inventory: `domains/inventory/inventory.service.ts`
- Forms: `domains/forms/dealForms.service.ts`
- Communications: `domains/communications/communication.service.ts`
- Key custody: `domains/key-custody/keyCustody.runtime.ts`
- Recon: `domains/recon/recon.runtime.ts`
