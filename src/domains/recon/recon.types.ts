export const RECON_STAGES = [
  'intake',
  'mechanical',
  'body',
  'detail',
  'photos',
  'frontline',
  'complete',
  'on_hold',
] as const

export const ISSUE_SEVERITIES = ['critical', 'high', 'medium', 'low'] as const
export const ISSUE_STATUSES = ['open', 'in_progress', 'resolved', 'deferred'] as const
export const COST_CATEGORIES = [
  'mechanical',
  'body',
  'detail',
  'parts',
  'labor',
  'transport',
  'fuel',
  'dealer_pack',
  'inspection',
  'misc',
] as const

export type ReconStage = (typeof RECON_STAGES)[number]
export type IssueSeverity = (typeof ISSUE_SEVERITIES)[number]
export type IssueStatus = (typeof ISSUE_STATUSES)[number]
export type CostCategory = (typeof COST_CATEGORIES)[number]

export const RECON_STAGE_LABELS: Record<ReconStage, string> = {
  intake: 'Intake',
  mechanical: 'Mechanical',
  body: 'Body / Paint',
  detail: 'Detail',
  photos: 'Photos',
  frontline: 'Frontline',
  complete: 'Complete',
  on_hold: 'On Hold',
}

export const RECON_STAGE_ORDER: ReconStage[] = [
  'intake',
  'mechanical',
  'body',
  'detail',
  'photos',
  'frontline',
  'complete',
]

export const ISSUE_SEVERITY_LABELS: Record<IssueSeverity, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

export const ISSUE_STATUS_LABELS: Record<IssueStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  deferred: 'Deferred',
}

export const COST_CATEGORY_LABELS: Record<CostCategory, string> = {
  mechanical: 'Mechanical',
  body: 'Body / Paint',
  detail: 'Detail',
  parts: 'Parts',
  labor: 'Labor',
  transport: 'Transport',
  fuel: 'Fuel',
  dealer_pack: 'Dealer Pack',
  inspection: 'Inspection',
  misc: 'Miscellaneous',
}

export interface ReconUnit {
  id: string
  /**
   * Links this recon unit to the canonical InventoryRecord.
   * All recon consumers MUST treat this as the single-source-of-truth
   * reference to the parent inventory unit.
   */
  inventoryUnitId?: string
  stockNumber?: string
  year: number
  make: string
  model: string
  trim?: string
  color?: string
  vin?: string
  currentStage: ReconStage
  assignedTech?: string
  estimatedCompletion?: string
  actualCompletion?: string
  daysInRecon: number
  targetDays: number
  totalReconCost: number
  floorPlanDailyRate?: number
  floorPlanAccrued?: number
  notes?: string
  isPinned?: boolean
  createdAt: string
  updatedAt?: string
}

export interface ReconIssue {
  id: string
  reconUnitId: string
  title: string
  description?: string
  category: CostCategory
  severity: IssueSeverity
  status: IssueStatus
  estimatedCost?: number
  actualCost?: number
  assignedTo?: string
  resolvedAt?: string
  notes?: string
  createdAt: string
  updatedAt?: string
}

export interface ReconCostEntry {
  id: string
  reconUnitId: string
  category: CostCategory
  description: string
  vendor?: string
  invoiceNumber?: string
  amount: number
  laborHours?: number
  partsAmount?: number
  laborAmount?: number
  enteredBy?: string
  date: string
  createdAt: string
  updatedAt?: string
}

export interface ReconActivity {
  id: string
  reconUnitId: string
  stage: ReconStage
  action: string
  performedBy?: string
  notes?: string
  timestamp: string
  createdAt: string
}

export interface CreateReconUnitInput {
  /**
   * The canonical inventory record id this recon unit belongs to.
   * Strongly recommended — links recon cost/stage data back to the master unit.
   */
  inventoryUnitId?: string
  stockNumber?: string
  year: number
  make: string
  model: string
  trim?: string
  color?: string
  vin?: string
  currentStage?: ReconStage
  assignedTech?: string
  estimatedCompletion?: string
  targetDays?: number
  floorPlanDailyRate?: number
  notes?: string
}

export interface CreateReconIssueInput {
  reconUnitId: string
  title: string
  description?: string
  category: CostCategory
  severity: IssueSeverity
  estimatedCost?: number
  assignedTo?: string
  notes?: string
}

export interface CreateReconCostEntryInput {
  reconUnitId: string
  category: CostCategory
  description: string
  vendor?: string
  invoiceNumber?: string
  amount: number
  laborHours?: number
  partsAmount?: number
  laborAmount?: number
  enteredBy?: string
  date: string
}
