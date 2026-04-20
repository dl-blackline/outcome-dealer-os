/**
 * Deal Forms Printing System — core type definitions.
 *
 * Defines the template schema, data context, generated form instances,
 * packet structures, and saved packet records.
 */

// ---------------------------------------------------------------------------
// Field-level types
// ---------------------------------------------------------------------------

export type FormFieldType =
  | 'text'
  | 'date'
  | 'currency'
  | 'number'
  | 'masked'
  | 'checkbox'
  | 'signature'
  | 'textarea'

export type FormFieldWidth = 'full' | 'half' | 'third' | 'two-thirds'

export interface FormFieldDef {
  id: string
  label: string
  /** Key into DealFormContext */
  dataKey: keyof DealFormContext
  type: FormFieldType
  required: boolean
  section: string
  width?: FormFieldWidth
  helpText?: string
}

// ---------------------------------------------------------------------------
// Form template
// ---------------------------------------------------------------------------

export type FormCategory =
  | 'buyer_information'
  | 'deal_documents'
  | 'disclosure'
  | 'trade'
  | 'credit_finance'
  | 'title_registration'
  | 'delivery'
  | 'wholesale'

export type DealType = 'retail_finance' | 'cash' | 'wholesale' | 'lease' | 'any'

export interface DealFormTemplate {
  id: string
  name: string
  shortName: string
  category: FormCategory
  description: string
  sections: string[]
  fields: FormFieldDef[]
  /** Lower number prints first */
  printOrder: number
  /** If set, only show for these deal types; omit or empty = show for all */
  showForDealTypes?: DealType[]
  version: string
}

// ---------------------------------------------------------------------------
// Data context — the mapped values pool from deal/customer/inventory records
// ---------------------------------------------------------------------------

export interface DealFormContext {
  // Dealer info
  dealerName?: string
  dealerAddress?: string
  dealerCity?: string
  dealerState?: string
  dealerZip?: string
  dealerPhone?: string
  dealerLicenseNumber?: string

  // Deal meta
  dealId?: string
  dealNumber?: string
  dealDate?: string
  saleDate?: string
  deliveryDate?: string
  dealStatus?: string
  dealType?: string

  // Buyer (primary)
  buyerFullName?: string
  buyerFirstName?: string
  buyerLastName?: string
  buyerAddress?: string
  buyerCity?: string
  buyerState?: string
  buyerZip?: string
  buyerPhone?: string
  buyerEmail?: string
  buyerDOB?: string
  buyerDLNumber?: string
  buyerDLState?: string
  buyerSSNMasked?: string
  buyerEmployer?: string
  buyerOccupation?: string
  buyerMonthlyIncome?: string
  buyerHousingStatus?: string
  buyerMonthlyHousing?: string

  // Co-buyer / joint buyer
  coBuyerFullName?: string
  coBuyerFirstName?: string
  coBuyerLastName?: string
  coBuyerAddress?: string
  coBuyerCity?: string
  coBuyerState?: string
  coBuyerZip?: string
  coBuyerPhone?: string
  coBuyerEmail?: string
  coBuyerDOB?: string
  coBuyerDLNumber?: string
  coBuyerSSNMasked?: string
  coBuyerEmployer?: string
  coBuyerMonthlyIncome?: string

  // Vehicle (sold unit)
  vehicleYear?: string
  vehicleMake?: string
  vehicleModel?: string
  vehicleTrim?: string
  vehicleVIN?: string
  vehicleStockNumber?: string
  vehicleMileage?: string
  vehicleColor?: string
  vehicleBodyStyle?: string
  vehicleDescription?: string

  // Deal financial
  salePrice?: string
  downPayment?: string
  tradeAllowance?: string
  tradePayoff?: string
  netTradeValue?: string
  taxesAmount?: string
  feesAmount?: string
  totalAmountDue?: string
  amountFinanced?: string
  apr?: string
  termMonths?: string
  monthlyPayment?: string
  reserveAmount?: string

  // Trade vehicle
  tradeYear?: string
  tradeMake?: string
  tradeModel?: string
  tradeTrim?: string
  tradeVIN?: string
  tradeMileage?: string
  tradeACV?: string
  tradeConditionNotes?: string
  tradePayoffLender?: string

  // Lender / finance
  lenderName?: string
  lenderAddress?: string
  dealStructureType?: string
  lenderDecisionStatus?: string
  approvedRate?: string
  approvedTerm?: string

  // F&I products
  vscName?: string
  vscTerm?: string
  vscPrice?: string
  gapPrice?: string
  backendTotal?: string

  // Staff
  salesperson?: string
  fiManager?: string
  salesManager?: string
  dealManager?: string
}

// ---------------------------------------------------------------------------
// Generated form instance (populated at runtime)
// ---------------------------------------------------------------------------

export interface GeneratedFormField {
  def: FormFieldDef
  /** Value mapped from DealFormContext */
  mappedValue: string | undefined
  /** Manual override entered by staff before printing */
  overrideValue?: string
  isMissing: boolean
  isRequired: boolean
  /** The value that will actually appear on the form */
  finalValue: string
}

export interface GeneratedForm {
  template: DealFormTemplate
  fields: GeneratedFormField[]
  missingRequiredFields: FormFieldDef[]
  missingOptionalFields: FormFieldDef[]
  hasWarnings: boolean
  generatedAt: string
}

// ---------------------------------------------------------------------------
// Packet
// ---------------------------------------------------------------------------

export interface DealFormPacket {
  id: string
  dealId: string
  dealLabel: string
  forms: GeneratedForm[]
  /** Field id → override value */
  overrides: Record<string, string>
  createdAt: string
  createdBy?: string
  formIds: string[]
  presetName?: string
}

// ---------------------------------------------------------------------------
// Saved packet record (persisted to KV/DB)
// ---------------------------------------------------------------------------

export interface SavedPacketRecord {
  id: string
  dealId: string
  dealLabel: string
  formIds: string[]
  formsIncluded: string[]
  presetName?: string
  createdAt: string
  createdBy?: string
  version: number
}

// ---------------------------------------------------------------------------
// Packet presets
// ---------------------------------------------------------------------------

export interface PacketPreset {
  id: string
  name: string
  description: string
  formIds: string[]
  dealTypes?: DealType[]
}
