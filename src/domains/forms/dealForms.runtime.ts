/**
 * Deal Forms Printing System — runtime engine.
 *
 * Responsible for:
 *  1. Building a DealFormContext from available MockDeal data
 *  2. Populating a form template with context values
 *  3. Detecting missing/required fields
 *  4. Applying manual overrides
 *  5. Building a complete DealFormPacket
 */
import type { MockDeal } from '@/lib/mockData'
import type {
  DealFormContext,
  DealFormTemplate,
  GeneratedForm,
  GeneratedFormField,
  DealFormPacket,
  FormFieldDef,
} from './dealForms.types'
import { getTemplate } from './dealForms.templates'

// ---------------------------------------------------------------------------
// Dealer defaults — in production these would come from a dealer settings table
// ---------------------------------------------------------------------------

const DEALER_DEFAULTS: Partial<DealFormContext> = {
  dealerName: 'Outcome Dealership',
  dealerAddress: '1000 Auto Drive',
  dealerCity: 'Anytown',
  dealerState: 'TX',
  dealerZip: '75001',
  dealerPhone: '(555) 000-1234',
  dealerLicenseNumber: 'DLR-00000',
}

// ---------------------------------------------------------------------------
// Context builder
// ---------------------------------------------------------------------------

/**
 * Parses a simple "Year Make Model Trim" vehicle description string.
 * e.g. "2023 Toyota Camry XSE" → { year: '2023', make: 'Toyota', model: 'Camry', trim: 'XSE' }
 */
function parseVehicleDescription(desc: string): {
  year?: string
  make?: string
  model?: string
  trim?: string
} {
  if (!desc) return {}
  const parts = desc.trim().split(/\s+/)
  if (parts.length < 1) return {}

  const year = /^\d{4}$/.test(parts[0]) ? parts[0] : undefined
  const rest = year ? parts.slice(1) : parts

  return {
    year,
    make: rest[0],
    model: rest[1],
    trim: rest.slice(2).join(' ') || undefined,
  }
}

/**
 * Splits a full name into first and last (best-effort).
 * "John A. Smith" → { first: 'John', last: 'Smith' }
 */
function splitName(fullName: string): { first: string; last: string } {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) return { first: parts[0], last: '' }
  return {
    first: parts[0],
    last: parts[parts.length - 1],
  }
}

/**
 * Formats a number as a US currency string without the $ sign.
 * e.g. 25000 → "25,000.00"
 */
function formatCurrency(value: number | undefined): string | undefined {
  if (value == null) return undefined
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/**
 * Builds a DealFormContext from a MockDeal record.
 *
 * The MockDeal type is the runtime-accessible deal shape used across the app.
 * Additional context (credit app, lender, trade) would be passed in via
 * `extras` when the caller fetches linked records from the KV store.
 */
export function buildDealFormContext(
  deal: MockDeal,
  extras?: Partial<DealFormContext>
): DealFormContext {
  const { year, make, model, trim } = parseVehicleDescription(deal.vehicleDescription)
  const { first: buyerFirst, last: buyerLast } = splitName(deal.customerName)

  const base: DealFormContext = {
    ...DEALER_DEFAULTS,

    // Deal
    dealId: deal.id,
    dealNumber: deal.id.slice(0, 8).toUpperCase(),
    dealDate: new Date(deal.createdAt).toLocaleDateString('en-US'),
    dealStatus: deal.status,

    // Buyer — derived from MockDeal.customerName
    buyerFullName: deal.customerName,
    buyerFirstName: buyerFirst,
    buyerLastName: buyerLast,

    // Vehicle — parsed from MockDeal.vehicleDescription
    vehicleYear: year,
    vehicleMake: make,
    vehicleModel: model,
    vehicleTrim: trim,
    vehicleDescription: deal.vehicleDescription,

    // Financial — MockDeal.amount is total deal amount
    salePrice: formatCurrency(deal.amount),
    totalAmountDue: formatCurrency(deal.amount),
  }

  // Merge extras on top, allowing callers to supply richer data
  return { ...base, ...(extras ?? {}) }
}

// ---------------------------------------------------------------------------
// Form population
// ---------------------------------------------------------------------------

/** Resolve the display value for a single field given context and overrides */
function resolveFieldValue(
  def: FormFieldDef,
  ctx: DealFormContext,
  overrides: Record<string, string>
): string {
  const override = overrides[def.id]
  const mapped = ctx[def.dataKey] as string | undefined
  return override ?? mapped ?? ''
}

/** Populate a single form template from context + overrides */
export function populateForm(
  template: DealFormTemplate,
  ctx: DealFormContext,
  overrides: Record<string, string> = {}
): GeneratedForm {
  const fields: GeneratedFormField[] = template.fields.map((def) => {
    const mappedValue = ctx[def.dataKey] as string | undefined
    const overrideValue = overrides[def.id]
    const finalValue = overrideValue ?? mappedValue ?? ''
    const isMissing = !finalValue.trim()

    return {
      def,
      mappedValue,
      overrideValue,
      isMissing,
      isRequired: def.required,
      finalValue,
    }
  })

  const missingRequiredFields = fields
    .filter((f) => f.isRequired && f.isMissing)
    .map((f) => f.def)

  const missingOptionalFields = fields
    .filter((f) => !f.isRequired && f.isMissing)
    .map((f) => f.def)

  return {
    template,
    fields,
    missingRequiredFields,
    missingOptionalFields,
    hasWarnings: missingRequiredFields.length > 0,
    generatedAt: new Date().toISOString(),
  }
}

// ---------------------------------------------------------------------------
// Override application
// ---------------------------------------------------------------------------

/**
 * Returns a new GeneratedForm with updated overrides applied.
 * The caller provides a map of field id → new value.
 */
export function applyOverrides(
  form: GeneratedForm,
  overrides: Record<string, string>
): GeneratedForm {
  const newFields: GeneratedFormField[] = form.fields.map((f) => {
    const newOverride = overrides[f.def.id]
    if (newOverride === undefined) return f
    const finalValue = newOverride.trim() || f.mappedValue || ''
    return {
      ...f,
      overrideValue: newOverride.trim() || undefined,
      finalValue,
      isMissing: !finalValue.trim(),
    }
  })

  const missingRequiredFields = newFields
    .filter((f) => f.isRequired && f.isMissing)
    .map((f) => f.def)

  return {
    ...form,
    fields: newFields,
    missingRequiredFields,
    hasWarnings: missingRequiredFields.length > 0,
  }
}

// ---------------------------------------------------------------------------
// Packet builder
// ---------------------------------------------------------------------------

/**
 * Builds a full DealFormPacket from a list of form IDs, a deal context,
 * and any pre-existing overrides.
 */
export function buildPacket(
  deal: MockDeal,
  formIds: string[],
  overrides: Record<string, string> = {},
  extras?: Partial<DealFormContext>,
  options?: { presetName?: string; createdBy?: string }
): DealFormPacket {
  const ctx = buildDealFormContext(deal, extras)
  const forms = formIds
    .map((id) => getTemplate(id))
    .filter((t): t is DealFormTemplate => Boolean(t))
    .sort((a, b) => a.printOrder - b.printOrder)
    .map((t) => populateForm(t, ctx, overrides))

  return {
    id: crypto.randomUUID(),
    dealId: deal.id,
    dealLabel: `${deal.customerName} — ${deal.vehicleDescription}`,
    forms,
    overrides,
    formIds,
    createdAt: new Date().toISOString(),
    createdBy: options?.createdBy,
    presetName: options?.presetName,
  }
}

// ---------------------------------------------------------------------------
// Missing-field summary helpers
// ---------------------------------------------------------------------------

export interface MissingFieldSummary {
  totalRequired: number
  totalMissingRequired: number
  totalMissingOptional: number
  missingRequiredByForm: Array<{ formName: string; fields: FormFieldDef[] }>
  canPrint: boolean
}

export function getMissingFieldSummary(packet: DealFormPacket): MissingFieldSummary {
  let totalRequired = 0
  let totalMissingRequired = 0
  let totalMissingOptional = 0
  const missingRequiredByForm: Array<{ formName: string; fields: FormFieldDef[] }> = []

  for (const form of packet.forms) {
    totalRequired += form.fields.filter((f) => f.isRequired).length
    totalMissingRequired += form.missingRequiredFields.length
    totalMissingOptional += form.missingOptionalFields.length
    if (form.missingRequiredFields.length > 0) {
      missingRequiredByForm.push({
        formName: form.template.name,
        fields: form.missingRequiredFields,
      })
    }
  }

  return {
    totalRequired,
    totalMissingRequired,
    totalMissingOptional,
    missingRequiredByForm,
    canPrint: true, // always allow printing; warnings are advisory only
  }
}
