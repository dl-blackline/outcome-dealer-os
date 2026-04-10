import { UUID } from './common'
import { EventName } from '@/domains/events/event.constants'
import { ApprovalType } from '@/domains/roles/policy'

export interface Household {
  id: UUID
  name: string
  primaryCustomerId?: UUID
  lifetimeValue: number
  loyaltyScore: number
  communicationPreferences: {
    preferredMethod: 'phone' | 'email' | 'sms'
    doNotContact: boolean
  }
  createdAt: string
  updatedAt: string
}

export interface Customer {
  id: UUID
  householdId: UUID
  firstName: string
  lastName: string
  email?: string
  phone?: string
  preferences: Record<string, unknown>
  creditProfileStub?: {
    tier: 'prime' | 'near-prime' | 'subprime'
    estimatedScore?: number
  }
  createdAt: string
  updatedAt: string
}

export interface Lead {
  id: UUID
  householdId: UUID
  customerId: UUID
  source: string
  sourceDetails?: Record<string, unknown>
  score: number
  status: 'new' | 'validated' | 'contacted' | 'qualified' | 'converted' | 'archived'
  assignedToUserId?: UUID
  contactAttempts: number
  lastContactedAt?: string
  conversionOutcome?: 'deal_created' | 'lost' | 'disqualified'
  createdAt: string
  updatedAt: string
}

export interface CommunicationEvent {
  id: UUID
  householdId?: UUID
  customerId?: UUID
  leadId?: UUID
  dealId?: UUID
  direction: 'inbound' | 'outbound'
  channel: 'phone' | 'sms' | 'email' | 'chat'
  content: string
  sentimentScore?: number
  intentClassification?: string
  aiSummary?: string
  createdByUserId?: UUID
  createdAt: string
}

export interface Appointment {
  id: UUID
  householdId: UUID
  customerId: UUID
  leadId?: UUID
  type: 'sales' | 'service' | 'delivery'
  scheduledAt: string
  status: 'scheduled' | 'confirmed' | 'rescheduled' | 'no_show' | 'completed' | 'cancelled'
  confirmationStatus?: 'pending' | 'confirmed'
  rescheduleHistory: Array<{ from: string; to: string; reason?: string }>
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface ShowroomVisit {
  id: UUID
  householdId: UUID
  customerId: UUID
  appointmentId?: UUID
  checkInAt: string
  checkOutAt?: string
  visitType: 'appointment' | 'walk_in'
  assignedToUserId?: UUID
  notes?: string
  createdAt: string
}

export interface VehicleCatalogItem {
  id: UUID
  year: number
  make: string
  model: string
  trim: string
  features: string[]
  msrp: number
  specifications: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface InventoryUnit {
  id: UUID
  vin: string
  catalogItemId?: UUID
  year: number
  make: string
  model: string
  trim: string
  cost: number
  askingPrice: number
  location: string
  status: 'acquired' | 'recon' | 'frontline' | 'sold' | 'wholesaled'
  frontlineReadyAt?: string
  agingStatus: 'fresh' | 'aging' | 'aged'
  daysInStock: number
  acquisitionDate: string
  soldDate?: string
  createdAt: string
  updatedAt: string
}

export interface TradeAppraisal {
  id: UUID
  dealId?: UUID
  leadId?: UUID
  householdId: UUID
  customerId: UUID
  vin?: string
  year: number
  make: string
  model: string
  trim?: string
  mileage: number
  condition: 'excellent' | 'good' | 'fair' | 'poor'
  bookValueClean?: number
  bookValueRough?: number
  proposedValue: number
  approvedValue?: number
  managerApprovalStatus: 'pending' | 'approved' | 'revised'
  approvedByUserId?: UUID
  approvedAt?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface DeskScenario {
  id: UUID
  dealId: UUID
  vehicleId: UUID
  tradeAppraisalId?: UUID
  vehiclePrice: number
  tradeAllowance: number
  downPayment: number
  termMonths: number
  interestRate: number
  monthlyPayment: number
  presentedAt?: string
  acceptedAt?: string
  status: 'draft' | 'presented' | 'accepted' | 'rejected'
  createdByUserId: UUID
  createdAt: string
  updatedAt: string
}

export interface Quote {
  id: UUID
  dealId: UUID
  deskScenarioId: UUID
  quoteNumber: string
  vehicleDetails: Record<string, unknown>
  pricingBreakdown: Record<string, number>
  fiProductsIncluded: string[]
  disclaimers: string[]
  expiresAt: string
  sentAt?: string
  sentToCustomerId: UUID
  acceptedAt?: string
  createdAt: string
}

export interface QuickApp {
  id: UUID
  customerId: UUID
  dealId?: UUID
  firstName: string
  lastName: string
  ssn: string
  dateOfBirth: string
  annualIncome: number
  employerName?: string
  submittedAt: string
  resultReceivedAt?: string
  approvalRange?: { min: number; max: number }
  status: 'pending' | 'approved' | 'declined'
  createdAt: string
}

export interface CreditApp {
  id: UUID
  customerId: UUID
  dealId: UUID
  quickAppId?: UUID
  personalInfo: Record<string, unknown>
  employmentInfo: Record<string, unknown>
  residenceInfo: Record<string, unknown>
  submittedAt: string
  status: 'draft' | 'submitted' | 'approved' | 'declined'
  createdAt: string
  updatedAt: string
}

export interface LenderDecision {
  id: UUID
  creditAppId: UUID
  lenderName: string
  decision: 'approved' | 'countered' | 'declined' | 'stipulations_required'
  approvedAmount?: number
  interestRate?: number
  termMonths?: number
  advancePercentage?: number
  backendCap?: number
  stipulations: string[]
  receivedAt: string
  expiresAt?: string
  createdAt: string
}

export interface FAndIMenu {
  id: UUID
  dealId: UUID
  products: Array<{
    productType: 'warranty' | 'gap' | 'service_contract' | 'theft_protection' | 'other'
    provider: string
    cost: number
    selected: boolean
  }>
  presentedAt?: string
  presentedByUserId?: UUID
  acceptedAt?: string
  totalProductValue: number
  commission: number
  createdAt: string
  updatedAt: string
}

export interface Deal {
  id: UUID
  householdId: UUID
  customerId: UUID
  leadId?: UUID
  inventoryUnitId: UUID
  tradeAppraisalId?: UUID
  deskScenarioId?: UUID
  creditAppId?: UUID
  lenderDecisionId?: UUID
  fiMenuId?: UUID
  status: 'structured' | 'quoted' | 'signed' | 'funded' | 'delivered'
  totalAmount: number
  signedAt?: string
  fundedAt?: string
  deliveredAt?: string
  createdByUserId: UUID
  createdAt: string
  updatedAt: string
}

export interface DealDocumentPackage {
  id: UUID
  dealId: UUID
  documents: Array<{
    documentType: string
    url: string
    signedAt?: string
  }>
  complianceChecklist: Record<string, boolean>
  archivedAt?: string
  createdAt: string
  updatedAt: string
}

export interface FundingException {
  id: UUID
  dealId: UUID
  exceptionType: 'missing_stip' | 'incorrect_disclosure' | 'title_delay' | 'other'
  description: string
  status: 'open' | 'in_progress' | 'resolved' | 'escalated'
  resolvedAt?: string
  resolvedByUserId?: UUID
  resolutionNotes?: string
  createdAt: string
  updatedAt: string
}

export interface ServiceEvent {
  id: UUID
  householdId: UUID
  customerId: UUID
  vehicleId?: UUID
  repairOrderNumber: string
  serviceAdvisorUserId: UUID
  recommendedWork: string[]
  acceptedWork: string[]
  declinedWork: string[]
  totalCost: number
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  completedAt?: string
  createdAt: string
  updatedAt: string
}

export interface DeclinedWorkEvent {
  id: UUID
  serviceEventId: UUID
  workDescription: string
  estimatedCost: number
  declinedAt: string
  declineReason?: string
  followUpScheduled: boolean
  createdAt: string
}

export interface ReconJob {
  id: UUID
  inventoryUnitId: UUID
  workRequired: string[]
  estimatedCost: number
  actualCost?: number
  vendor?: string
  status: 'pending' | 'in_progress' | 'completed' | 'delayed'
  estimatedCompletionDate: string
  actualCompletionDate?: string
  delayReasons?: string[]
  createdAt: string
  updatedAt: string
}

export interface Campaign {
  id: UUID
  name: string
  type: 'email' | 'sms' | 'direct_mail' | 'digital_ad'
  targetAudience: Record<string, unknown>
  message: string
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'paused'
  scheduledAt?: string
  launchedAt?: string
  completedAt?: string
  responseTracking: {
    sent: number
    delivered: number
    opened: number
    clicked: number
    converted: number
  }
  createdByUserId: UUID
  createdAt: string
  updatedAt: string
}

export interface AttributionTouch {
  id: UUID
  leadId?: UUID
  dealId?: UUID
  campaignId?: UUID
  source: string
  medium: string
  campaign?: string
  touchedAt: string
  attributionWeight: number
  createdAt: string
}

export interface Task {
  id: UUID
  title: string
  description?: string
  assignedToUserId: UUID
  assignedByUserId?: UUID
  linkedEntityType?: string
  linkedEntityId?: UUID
  dueDate: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  completedAt?: string
  createdAt: string
  updatedAt: string
}

export interface Approval {
  id: UUID
  type: ApprovalType
  requestedByUserId: UUID
  requestedByRole: string
  linkedEntityType: string
  linkedEntityId: UUID
  description: string
  status: 'pending' | 'granted' | 'denied'
  approvedByUserId?: UUID
  approvedByRole?: string
  resolvedAt?: string
  resolutionNotes?: string
  createdAt: string
  updatedAt: string
}

export interface AuditLog {
  id: UUID
  userId?: UUID
  userRole?: string
  entityType: string
  entityId: UUID
  action: string
  beforeState?: Record<string, unknown>
  afterState?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
  source?: string
  timestamp: string
  createdAt: string
}

export interface IntegrationSyncState {
  id: UUID
  systemIdentifier: string
  systemType: 'dms' | 'credit_bureau' | 'lender_portal' | 'marketing' | 'other'
  lastSuccessfulSyncAt?: string
  lastAttemptAt?: string
  errorCount: number
  lastErrorMessage?: string
  retryBackoffSeconds: number
  status: 'healthy' | 'degraded' | 'failed' | 'recovering'
  createdAt: string
  updatedAt: string
}

export interface Event {
  id: UUID
  eventName: EventName
  eventId: UUID
  timestamp: string
  actorType: 'user' | 'agent' | 'system'
  actorId?: UUID
  entityType?: string
  entityId?: UUID
  payload: Record<string, unknown>
  traceId?: UUID
  createdAt: string
}
