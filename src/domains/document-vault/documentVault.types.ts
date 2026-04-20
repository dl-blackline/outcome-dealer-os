export const DOC_CATEGORIES = [
  'deal',
  'inventory',
  'customer',
  'credit_application',
  'back_office',
  'title_payoff',
  'recon',
  'compliance',
  'other',
] as const

export const DOC_FILE_TYPES = ['pdf', 'image', 'spreadsheet', 'other'] as const
export const DOC_STATUSES = ['active', 'archived', 'pending_review'] as const

export type DocCategory = (typeof DOC_CATEGORIES)[number]
export type DocFileType = (typeof DOC_FILE_TYPES)[number]
export type DocStatus = (typeof DOC_STATUSES)[number]

export const DOC_CATEGORY_LABELS: Record<DocCategory, string> = {
  deal: 'Deal',
  inventory: 'Inventory',
  customer: 'Customer',
  credit_application: 'Credit Application',
  back_office: 'Back Office',
  title_payoff: 'Title / Payoff',
  recon: 'Recon / Fixed Ops',
  compliance: 'Compliance',
  other: 'Other',
}

export const DOC_FILE_TYPE_LABELS: Record<DocFileType, string> = {
  pdf: 'PDF',
  image: 'Image',
  spreadsheet: 'Spreadsheet',
  other: 'Other',
}

export interface VaultDocument {
  id: string
  name: string
  description?: string
  category: DocCategory
  fileType: DocFileType
  fileSize?: number
  mimeType?: string
  status: DocStatus
  /** Entity this doc belongs to: dealId, inventoryId, customerId, etc. */
  entityType?: string
  entityId?: string
  entityLabel?: string
  tags?: string[]
  uploadedBy?: string
  storagePath?: string
  previewUrl?: string
  downloadUrl?: string
  pageCount?: number
  uploadedAt: string
  updatedAt?: string
}

export interface UploadDocumentInput {
  name: string
  description?: string
  category: DocCategory
  fileType: DocFileType
  fileSize?: number
  mimeType?: string
  entityType?: string
  entityId?: string
  entityLabel?: string
  tags?: string[]
  uploadedBy?: string
  storagePath?: string
  previewUrl?: string
  downloadUrl?: string
  pageCount?: number
}
