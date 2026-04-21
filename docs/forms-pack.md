# Forms Pack — Implementation Guide

## Overview

The **Forms Pack** system in Outcome Dealer OS allows dealership staff to:

1. Open a deal record and click **Print Deal Forms**
2. Choose a form pack preset **or** select individual forms
3. Review all auto-mapped field values and fill in any blanks
4. Preview the populated forms
5. Print the full packet or a single form
6. Save the packet record to the deal for later reprinting

---

## Architecture

### File Locations

| File | Purpose |
|------|---------|
| `src/domains/forms/dealForms.types.ts` | All TypeScript types — `DealFormContext`, `DealFormTemplate`, `GeneratedForm`, `DealFormPacket`, `SavedPacketRecord`, `PacketPreset` |
| `src/domains/forms/dealForms.templates.ts` | Template registry and packet preset definitions |
| `src/domains/forms/dealForms.runtime.ts` | Runtime engine — context builder, form population, override application, packet builder |
| `src/domains/forms/dealForms.service.ts` | Persistence — save/load/delete `SavedPacketRecord` rows |
| `src/app/pages/records/DealFormsPage.tsx` | Full 4-step workflow UI (select → review → preview → print/save) |
| `migrations/0020_create_deal_form_packets.sql` | DB migration for the `deal_form_packets` table |

---

## How the System Works

### Data Flow

```
MockDeal (deal record)
    │
    ▼
buildDealFormContext()  ← dealForms.runtime.ts
    │
    ├── DEALER constants (src/lib/dealer.constants.ts)
    └── deal fields (customerName, vin, amount, lender, …)
    │
    ▼
DealFormContext  (pool of ~80+ named values)
    │
    ▼
populateForm(template, context, overrides)
    │
    ▼
GeneratedForm  (each field resolved to finalValue)
    │
    ▼
DealFormPacket  (array of GeneratedForms + metadata)
    │
    ├── Review step (staff edits blanks)
    ├── Preview step (rendered HTML)
    └── Print/Save step (window.print() + savePacketRecord())
```

### DealFormContext Keys

The `DealFormContext` interface in `dealForms.types.ts` is the canonical mapping
pool.  Every `FormFieldDef.dataKey` must be a key of this interface.

Key groups:
- **Dealer info** — `dealerName`, `dealerAddress`, `dealerCity`, `dealerState`, `dealerZip`, `dealerPhone`, `dealerFax`, `dealerLicenseNumber`
- **Deal meta** — `dealId`, `dealNumber`, `dealDate`, `saleDate`, `deliveryDate`, `dealStatus`, `dealType`
- **Buyer** — `buyerFullName`, `buyerFirstName`, `buyerLastName`, `buyerAddress`, `buyerCity`, `buyerState`, `buyerZip`, `buyerPhone`, `buyerEmail`, `buyerDOB`, `buyerDLNumber`, `buyerSSNMasked`, `buyerEmployer`, `buyerOccupation`, `buyerMonthlyIncome`, `buyerHousingStatus`, `buyerMonthlyHousing`
- **Co-buyer** — `coBuyerFullName`, `coBuyerFirstName`, `coBuyerLastName`, …
- **Vehicle** — `vehicleYear`, `vehicleMake`, `vehicleModel`, `vehicleTrim`, `vehicleVIN`, `vehicleVINLast6`, `vehicleStockNumber`, `vehicleMileage`, `vehicleColor`, `vehicleBodyStyle`, `vehicleDescription`
- **Financials** — `salePrice`, `downPayment`, `tradeAllowance`, `tradePayoff`, `netTradeValue`, `taxesAmount`, `feesAmount`, `totalAmountDue`, `amountFinanced`, `apr`, `termMonths`, `monthlyPayment`
- **Trade vehicle** — `tradeYear`, `tradeMake`, `tradeModel`, `tradeVIN`, `tradeMileage`, `tradeACV`, `tradePayoffLender`
- **Lender / finance** — `lenderName`, `lenderAddress`, `approvedRate`, `approvedTerm`
- **Staff** — `salesperson`, `fiManager`, `salesManager`, `dealManager`
- **Down payment receipt** — `downPaymentDate`, `downPaymentMethod`, `downPaymentReceipt`
- **Payment agreement** — `paymentDueDate`, `paymentAmount`, `paymentMethod`
- **Check request** — `checkRequestPayee`, `checkRequestAmount`, `checkRequestReason`, `checkRequestDate`, `checkRequestAuthorizedBy`
- **Lienholder payoff** — `lienholderPayoffAmount`, `lienholderGoodUntil`, `lienholderPerDiem`, `lienholderRepName`, `lienholderAccount`
- **References / Landlord** — `reference1Name`, `reference1Phone`, `reference1Relationship`, `reference1Address`, (same for 2, 3), `landlordName`, `landlordPhone`
- **Vehicle equipment** — `vehicleEquipmentNotes`, `equipAC`, `equipHeat`, `equipRadio`, `equipCDPlayer`, `equipPower`, `equipCruise`, `equipTiltWheel`, `equipSunroof`, `equipLeather`, `equipAlloyWheels`, `equipRearDefrost`, `equipABS`, `equipAirbag`
- **Four Square** — `fourSquareAskPrice`, `fourSquareTradeValue`, `fourSquareDownPayment`, `fourSquareMonthlyPayment`

---

## Supported Forms

| ID | Name | Category | Pack(s) |
|----|------|----------|---------|
| `buyers-order` | Buyer's Order | deal_documents | Standard Retail, Finance |
| `retail-purchase-agreement` | Retail Purchase Agreement | deal_documents | Standard Retail, Finance |
| `deal-recap` | Deal Recap | deal_documents | Standard Retail, Finance |
| `buyer-information-sheet` | Buyer Information Sheet | buyer_information | Standard Retail, Finance |
| `cobuyer-information-sheet` | Co-Buyer Information Sheet | buyer_information | — |
| `credit-application-printout` | Credit Application Printout | credit_finance | Finance |
| `funding-lender-cover-sheet` | Funding / Lender Cover Sheet | credit_finance | Finance |
| `trade-appraisal-worksheet` | Trade Appraisal Worksheet | trade | Trade Packet |
| `privacy-notice` | Privacy Notice | disclosure | Standard Retail, Finance |
| `odometer-statement` | Odometer Disclosure Statement | disclosure | Standard Retail, Finance |
| `arbitration-acknowledgment` | Arbitration / Delivery Acknowledgment | delivery | Delivery |
| `we-owe` | We Owe / Due Bill | delivery | Delivery |
| `insurance-verification` | Insurance Verification Form | delivery | Delivery |
| `title-registration-worksheet` | Title / Registration Worksheet | title_registration | Title |
| `vehicle-equipment-condition` | Vehicle Equipment / Condition Form | delivery | Trade/Payoff Pack |
| `check-request` | Check Request Form | deal_documents | Internal Ops Pack |
| `payment-agreement` | Payment Agreement Form | deal_documents | Retail Basic, Retail Finance |
| `four-square-worksheet` | Four Square Worksheet | deal_documents | Retail Basic, Retail Finance |
| `down-payment-receipt` | Down Payment Receipt / Acknowledgment | deal_documents | Retail Basic, Retail Finance |
| `lienholder-payoff-title` | Lienholder Payoff / Title Request Form | title_registration | Trade/Payoff Pack |
| `references-landlord` | References and Landlord Information Form | buyer_information | Retail Finance Pack |

---

## Supported Packet Presets

| ID | Name | Forms Included |
|----|------|---------------|
| `standard-retail` | Standard Retail Packet | Buyer's Order, Retail Agreement, Deal Recap, Buyer Info, Privacy Notice, Odometer |
| `finance-packet` | Finance Deal Packet | + Credit App, Lender Cover Sheet |
| `cash-deal` | Cash Deal Packet | Buyer's Order, Retail Agreement, Buyer Info, Privacy Notice, Odometer |
| `delivery-packet` | Delivery Packet | Arbitration Ack, We Owe, Insurance, Odometer |
| `title-packet` | Title Packet | Title Worksheet, Odometer |
| `trade-packet` | Trade Packet | Trade Worksheet, Buyer's Order |
| `retail-basic-pack` | Retail Basic Pack | Four Square, Down Pmt Receipt, Payment Agreement |
| `retail-finance-pack` | Retail Finance Pack | Four Square, Down Pmt Receipt, References/Landlord, Payment Agreement |
| `trade-payoff-pack` | Trade / Payoff Pack | Lienholder Payoff/Title Request, Vehicle Equipment/Condition |
| `internal-ops-pack` | Internal Ops Pack | Check Request |

---

## How to Add a New Form

### Step 1 — Add context fields (if needed)

Open `src/domains/forms/dealForms.types.ts`.

If your form needs data that isn't already in `DealFormContext`, add new optional
fields to the interface:

```ts
export interface DealFormContext {
  // ... existing fields ...
  myNewField?: string
}
```

### Step 2 — Wire up auto-population (if needed)

Open `src/domains/forms/dealForms.runtime.ts` and add mapping logic inside
`buildDealFormContext()`.  Map from `MockDeal` or other source data:

```ts
myNewField: deal.someSourceField ?? undefined,
```

For fields that can't be auto-mapped from deal data, staff will fill them in
manually during the Review Fields step.

### Step 3 — Define the template

Open `src/domains/forms/dealForms.templates.ts`.

Add a new `DealFormTemplate` constant using the `field()` helper:

```ts
const myNewForm: DealFormTemplate = {
  id: 'my-new-form',              // kebab-case, unique
  name: 'My New Form Title',
  shortName: 'Short Name',        // shown on tabs/badges
  category: 'deal_documents',     // see FormCategory union
  description: 'Brief description for staff.',
  version: '1.0',
  printOrder: 99,                 // lower = prints first in packets
  sections: ['Section A', 'Section B'],
  fields: [
    field('mnf-field-1', 'Field Label', 'contextKey', 'Section A', {
      required: true,
      width: 'half',
      type: 'text',              // text | date | currency | number | masked | checkbox | signature | textarea
    }),
    // ...
  ],
}
```

### Step 4 — Register the template

Add it to `DEAL_FORM_TEMPLATES`:

```ts
export const DEAL_FORM_TEMPLATES: DealFormTemplate[] = [
  // ... existing ...
  myNewForm,
]
```

The form immediately appears in the "Individual Forms" list on the Deal Forms page.

### Step 5 — Optionally add or update a packet preset

Add or update an entry in `PACKET_PRESETS`:

```ts
{
  id: 'my-pack',
  name: 'My Pack Name',
  description: 'Description for staff.',
  formIds: ['my-new-form', 'another-form-id'],
  dealTypes: ['retail_finance'],   // optional filter
}
```

---

## How to Add a New Packet Preset (Admin)

Packet presets live in `src/domains/forms/dealForms.templates.ts` in the
`PACKET_PRESETS` array.

Each preset is a plain object — no code knowledge required beyond adding an
entry to the array:

```ts
{
  id: 'unique-preset-id',
  name: 'Display Name',
  description: 'Shown on the preset selection card.',
  formIds: ['form-id-1', 'form-id-2'],   // ordered list of template IDs
  dealTypes: ['retail_finance', 'cash'], // optional; omit to show for all deal types
}
```

---

## Dealership Identity

Dealer identity (name, address, phone, fax) is sourced from
`src/lib/dealer.constants.ts`.  Update `DEALER` there to change the mailing
block that prints on every form.

For multi-store deployments, replace `DEALER_DEFAULTS` in `dealForms.runtime.ts`
with a per-store lookup based on the authenticated user's store assignment.

---

## Persistence

Saved packet records are stored in the `deal_form_packets` table (Supabase) or
`localStorage` (KV fallback for the browser-only environment).

Each record stores:
- `deal_id` — link back to the deal
- `form_ids` — array of template IDs
- `forms_included` — human-readable form names
- `preset_name` — preset label if applicable
- `created_by` — staff identifier
- `version` — monotonic counter for regenerated packets
- `created_at` — timestamp

Retrieve past packets via `listPacketsForDeal(dealId)` from `dealForms.service.ts`.

---

## Known Limitations

- **Checkbox rendering**: Checkbox-type fields display as `"Yes"` / blank in the
  current HTML preview renderer. A future improvement can render actual checkbox
  symbols or tick marks.
- **Signature lines**: Currently rendered as blank horizontal rules.  True
  electronic-signature capture is a future enhancement.
- **PDF export**: Packet generation currently uses `window.print()` (browser print
  dialog → Save as PDF).  A server-side PDF pipeline (e.g. `pdf-lib`) could
  produce a direct PDF download without the browser print dialog.
- **Rich context**: Fields beyond what's in `MockDeal` (e.g. credit app data,
  lender decisions, F&I products) must be passed in via `extras` in
  `buildPacket()`.  Wiring these up from their respective domain services is a
  future task as those domains mature.
- **Admin UI for presets**: Presets are currently code-configured.  An admin
  interface for managing presets without code changes is a stretch goal.
