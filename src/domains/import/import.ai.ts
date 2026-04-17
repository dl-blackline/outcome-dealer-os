/**
 * import.ai.ts
 *
 * Heuristic AI extraction layer.
 *
 * For each RawRow:
 *  1. Classifies the record type (CUSTOMER_ONLY | CUSTOMER_WITH_DEAL | DEAL_ONLY | UNKNOWN)
 *  2. Extracts structured customer + deal data
 *  3. Normalises phone numbers to E.164 format
 *  4. Computes profitLoss when purchase and sale prices are available
 *
 * No fields are hallucinated — null is returned for any field that cannot
 * be confidently extracted from the source data.
 */
import { UUID } from '@/types/common'
import {
  RawRow,
  ExtractionResult,
  ExtractedCustomer,
  ExtractedDeal,
  RecordType,
} from './import.types'

// ─── Phone normalisation ──────────────────────────────────────────────────────

/**
 * Attempt to normalise a phone string to E.164 (+1XXXXXXXXXX for US numbers).
 * Returns null when the input cannot be reliably normalised.
 */
export function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw) return null
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  // International numbers with a leading + sign
  if (raw.trimStart().startsWith('+') && digits.length >= 7 && digits.length <= 15) {
    return `+${digits}`
  }
  return null
}

// ─── Column alias maps ────────────────────────────────────────────────────────

const FIELD_ALIASES: Record<string, string[]> = {
  firstName: [
    'first_name', 'firstname', 'first', 'fname', 'given_name', 'given name',
  ],
  lastName: [
    'last_name', 'lastname', 'last', 'lname', 'surname', 'family_name', 'family name',
  ],
  fullName: [
    'full_name', 'fullname', 'name', 'customer_name', 'customer name', 'contact_name',
    'contact name', 'buyer', 'buyer_name',
  ],
  phone: [
    'phone', 'phone_number', 'phonenumber', 'mobile', 'cell', 'cell_phone',
    'telephone', 'tel', 'contact_phone', 'primary_phone',
  ],
  email: [
    'email', 'email_address', 'emailaddress', 'e_mail', 'e-mail', 'contact_email',
  ],
  address: [
    'address', 'street', 'street_address', 'addr', 'mailing_address',
  ],
  city: ['city', 'town'],
  state: ['state', 'province', 'st'],
  zip: ['zip', 'zip_code', 'zipcode', 'postal', 'postal_code'],
  vehicleYear: [
    'year', 'vehicle_year', 'model_year', 'yr',
  ],
  vehicleMake: [
    'make', 'vehicle_make', 'manufacturer', 'brand',
  ],
  vehicleModel: [
    'model', 'vehicle_model',
  ],
  vin: ['vin', 'vin_number', 'vehicle_id'],
  purchasePrice: [
    'purchase_price', 'purchaseprice', 'cost', 'acquisition_cost', 'dealer_cost',
    'invoice', 'buy_price', 'floor',
  ],
  salePrice: [
    'sale_price', 'saleprice', 'selling_price', 'sold_price', 'retail_price',
    'list_price', 'msrp', 'price', 'sold_for', 'amount',
  ],
  dealDate: [
    'deal_date', 'dealdate', 'sold_date', 'close_date', 'purchase_date',
    'transaction_date', 'date',
  ],
  salesperson: [
    'salesperson', 'sales_person', 'sales_rep', 'rep', 'salesman', 'agent',
    'assigned_to', 'consultant',
  ],
  notes: ['notes', 'note', 'comments', 'comment', 'remarks', 'description'],
}

/** Build a reverse lookup: normalised column key → canonical field name */
function buildReverseLookup(): Map<string, string> {
  const map = new Map<string, string>()
  for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
    for (const alias of aliases) {
      map.set(alias.replace(/[^a-z0-9]/g, '_'), field)
    }
  }
  return map
}

const REVERSE_LOOKUP = buildReverseLookup()

function resolveField(columns: Record<string, string>, fieldName: string): string | null {
  const aliases = FIELD_ALIASES[fieldName] ?? []
  for (const alias of aliases) {
    const key = alias.replace(/[^a-z0-9]/g, '_')
    if (columns[key] !== undefined && columns[key] !== '') return columns[key]
  }
  // Also check direct key match
  if (columns[fieldName] !== undefined && columns[fieldName] !== '') return columns[fieldName]
  return null
}

// ─── Regex patterns ───────────────────────────────────────────────────────────

const PHONE_RE = /(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/
const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
const VIN_RE = /\b[A-HJ-NPR-Z0-9]{17}\b/i
const YEAR_RE = /\b(19[5-9]\d|20[0-2]\d)\b/
const PRICE_RE = /\$?\s*([\d,]+(?:\.\d{2})?)/
const ZIP_RE = /\b\d{5}(?:-\d{4})?\b/
const STATE_RE = /\b([A-Z]{2})\b/

const MIN_VEHICLE_YEAR = 1950

const KNOWN_MAKES = [
  'acura', 'audi', 'bmw', 'buick', 'cadillac', 'chevrolet', 'chevy', 'chrysler',
  'dodge', 'ferrari', 'fiat', 'ford', 'genesis', 'gmc', 'honda', 'hyundai',
  'infiniti', 'jaguar', 'jeep', 'kia', 'lamborghini', 'land rover', 'lexus',
  'lincoln', 'maserati', 'mazda', 'mercedes', 'mercedes-benz', 'mini', 'mitsubishi',
  'nissan', 'porsche', 'ram', 'rolls-royce', 'subaru', 'tesla', 'toyota',
  'volkswagen', 'vw', 'volvo',
]

function extractMakeFromText(text: string): string | null {
  const lower = text.toLowerCase()
  for (const make of KNOWN_MAKES) {
    if (lower.includes(make)) return make.replace(/\b\w/g, (c) => c.toUpperCase())
  }
  return null
}

// ─── Numeric helpers ──────────────────────────────────────────────────────────

function parsePrice(raw: string | null): number | null {
  if (!raw) return null
  const cleaned = raw.replace(/[$,\s]/g, '')
  const n = parseFloat(cleaned)
  return isNaN(n) || n < 0 ? null : n
}

function parseYear(raw: string | null): number | null {
  if (!raw) return null
  const n = parseInt(raw.replace(/\D/g, ''), 10)
  const currentYear = new Date().getFullYear()
  return n >= MIN_VEHICLE_YEAR && n <= currentYear + 2 ? n : null
}

function parseDateString(raw: string | null): string | null {
  if (!raw) return null
  // Try to parse as date — return ISO string or null
  const d = new Date(raw)
  return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0]
}

// ─── Column-based extraction ──────────────────────────────────────────────────

function extractFromColumns(
  columns: Record<string, string>
): { customer: ExtractedCustomer; deal: ExtractedDeal } {
  // Try to get first/last name; fall back to splitting fullName
  let firstName = resolveField(columns, 'firstName')
  let lastName = resolveField(columns, 'lastName')
  if (!firstName && !lastName) {
    const full = resolveField(columns, 'fullName')
    if (full) {
      const parts = full.trim().split(/\s+/)
      firstName = parts[0] ?? null
      lastName = parts.slice(1).join(' ') || null
    }
  }

  const rawPhone = resolveField(columns, 'phone')
  const rawPurchase = resolveField(columns, 'purchasePrice')
  const rawSale = resolveField(columns, 'salePrice')
  const purchasePrice = parsePrice(rawPurchase)
  const salePrice = parsePrice(rawSale)

  const customer: ExtractedCustomer = {
    firstName,
    lastName,
    phone: normalizePhone(rawPhone),
    email: resolveField(columns, 'email'),
    address: resolveField(columns, 'address'),
    city: resolveField(columns, 'city'),
    state: resolveField(columns, 'state'),
    zip: resolveField(columns, 'zip'),
  }

  const vehicleYear = parseYear(resolveField(columns, 'vehicleYear'))
  const vehicleMake = resolveField(columns, 'vehicleMake')
  const vehicleModel = resolveField(columns, 'vehicleModel')
  const vin = resolveField(columns, 'vin')

  const hasDeal = vehicleYear || vehicleMake || vehicleModel || vin || purchasePrice || salePrice

  const deal: ExtractedDeal = hasDeal
    ? {
        vehicleYear,
        vehicleMake,
        vehicleModel,
        vin,
        purchasePrice,
        salePrice,
        profitLoss:
          purchasePrice !== null && salePrice !== null ? salePrice - purchasePrice : null,
        dealDate: parseDateString(resolveField(columns, 'dealDate')),
        salesperson: resolveField(columns, 'salesperson'),
        notes: resolveField(columns, 'notes'),
      }
    : {
        vehicleYear: null,
        vehicleMake: null,
        vehicleModel: null,
        vin: null,
        purchasePrice: null,
        salePrice: null,
        profitLoss: null,
        dealDate: null,
        salesperson: null,
        notes: null,
      }

  return { customer, deal: hasDeal ? deal : null as unknown as ExtractedDeal }
}

// ─── Free-text extraction ─────────────────────────────────────────────────────

function extractFromText(
  text: string
): { customer: ExtractedCustomer; deal: ExtractedDeal | null } {
  const phoneMatch = text.match(PHONE_RE)
  const emailMatch = text.match(EMAIL_RE)
  const vinMatch = text.match(VIN_RE)
  const yearMatch = text.match(YEAR_RE)
  const priceMatches = [...text.matchAll(new RegExp(PRICE_RE.source, 'g'))].map((m) =>
    parseFloat(m[1].replace(/,/g, ''))
  )
  const zipMatch = text.match(ZIP_RE)

  const phone = phoneMatch ? normalizePhone(phoneMatch[0]) : null
  const email = emailMatch ? emailMatch[0] : null
  const vin = vinMatch ? vinMatch[0].toUpperCase() : null
  const vehicleYear = yearMatch ? parseYear(yearMatch[0]) : null
  const vehicleMake = extractMakeFromText(text)

  const customer: ExtractedCustomer = {
    firstName: null,
    lastName: null,
    phone,
    email,
    address: null,
    city: null,
    state: zipMatch ? (text.match(STATE_RE)?.[1] ?? null) : null,
    zip: zipMatch ? zipMatch[0] : null,
  }

  const hasDeal = vin || vehicleYear || vehicleMake || priceMatches.length > 0
  if (!hasDeal) return { customer, deal: null }

  const purchasePrice = priceMatches[0] ?? null
  const salePrice = priceMatches[1] ?? null

  return {
    customer,
    deal: {
      vehicleYear,
      vehicleMake,
      vehicleModel: null,
      vin,
      purchasePrice,
      salePrice,
      profitLoss:
        purchasePrice !== null && salePrice !== null ? salePrice - purchasePrice : null,
      dealDate: null,
      salesperson: null,
      notes: null,
    },
  }
}

// ─── Classification ───────────────────────────────────────────────────────────

function classifyRecord(customer: ExtractedCustomer, deal: ExtractedDeal | null): RecordType {
  const hasCustomer = !!(
    customer.firstName ||
    customer.lastName ||
    customer.phone ||
    customer.email
  )
  const hasDeal = !!(
    deal &&
    (deal.vehicleYear || deal.vehicleMake || deal.vin || deal.salePrice)
  )

  if (hasCustomer && hasDeal) return 'CUSTOMER_WITH_DEAL'
  if (hasCustomer) return 'CUSTOMER_ONLY'
  if (hasDeal) return 'DEAL_ONLY'
  return 'UNKNOWN'
}

// ─── Confidence score ─────────────────────────────────────────────────────────

function computeConfidence(
  customer: ExtractedCustomer,
  deal: ExtractedDeal | null,
  sourceHasColumns: boolean
): number {
  let score = sourceHasColumns ? 0.5 : 0.2
  if (customer.phone) score += 0.15
  if (customer.email) score += 0.1
  if (customer.firstName || customer.lastName) score += 0.1
  if (deal) {
    if (deal.vehicleMake) score += 0.05
    if (deal.vehicleYear) score += 0.05
    if (deal.vin) score += 0.05
  }
  return Math.min(0.95, Math.round(score * 100) / 100)
}

// ─── Column remapping via reverse lookup ──────────────────────────────────────

function remapColumns(raw: Record<string, string>): Record<string, string> {
  const remapped: Record<string, string> = { ...raw }
  for (const [key, value] of Object.entries(raw)) {
    const canonical = REVERSE_LOOKUP.get(key)
    if (canonical && !remapped[canonical]) remapped[canonical] = value
  }
  return remapped
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function extractFromRow(row: RawRow, sourceFileId: UUID): ExtractionResult {
  let customer: ExtractedCustomer
  let deal: ExtractedDeal | null

  if (row.rawColumns && Object.keys(row.rawColumns).length > 0) {
    const remapped = remapColumns(row.rawColumns)
    const result = extractFromColumns(remapped)
    customer = result.customer
    deal = result.deal
  } else {
    const result = extractFromText(row.rawText)
    customer = result.customer
    deal = result.deal
  }

  const recordType = classifyRecord(customer, deal)
  const confidenceScore = computeConfidence(customer, deal, !!row.rawColumns)

  return {
    recordType,
    customer,
    deal,
    confidenceScore,
    rowIndex: row.rowIndex,
    sourceFileId,
  }
}
