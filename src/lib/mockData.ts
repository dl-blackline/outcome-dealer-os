import { UUID } from '@/types/common'
import { EventName } from '@/domains/events/event.constants'
import { ApprovalType } from '@/domains/roles/policy'

export interface MockLead {
  id: UUID
  householdId: UUID
  customerName: string
  firstName?: string
  lastName?: string
  email: string
  phone: string
  address?: string
  city?: string
  state?: string
  zip?: string
  source: string
  score: number
  status: 'new' | 'contacted' | 'qualified' | 'converted'
  assignedTo?: string
  notes?: string
  interestedVehicle?: string
  createdAt: string
  updatedAt?: string
}

export interface MockDeal {
  id: UUID
  leadId: UUID
  customerName: string
  coBuyer?: string
  vehicleDescription: string
  stockNumber?: string
  vin?: string
  status: 'structured' | 'quoted' | 'signed' | 'funded'
  amount: number
  saleDate?: string
  salesperson?: string
  fiManager?: string
  downPayment?: number
  tradeAmount?: number
  payoff?: number
  lender?: string
  amountFinanced?: number
  notes?: string
  createdAt: string
  updatedAt?: string
}

export interface MockInventoryUnit {
  id: UUID
  vin: string
  year: number
  make: string
  model: string
  trim: string
  status: 'recon' | 'frontline' | 'aging' | 'wholesale'
  daysInStock: number
  askingPrice: number
}

export interface MockApproval {
  id: UUID
  type: ApprovalType
  requestedBy: string
  description: string
  status: 'pending' | 'granted' | 'denied'
  resolvedBy?: string
  resolvedAt?: string
  resolutionNotes?: string
  createdAt: string
}

export interface MockEvent {
  id: UUID
  eventName: EventName
  entityType: string
  entityId: UUID
  actorType: 'user' | 'agent' | 'system'
  timestamp: string
}

export interface MockTask {
  id: UUID
  title: string
  assignedTo: string
  dueDate: string
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'completed'
}

export interface MockServiceEvent {
  id: UUID
  customerName: string
  vehicleDescription: string
  serviceType: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'declined_work'
  scheduledDate: string
}

export const MOCK_LEADS: MockLead[] = []

export const MOCK_DEALS: MockDeal[] = []

export const MOCK_INVENTORY: MockInventoryUnit[] = []

export const MOCK_APPROVALS: MockApproval[] = []

export const MOCK_EVENTS: MockEvent[] = []

export const MOCK_TASKS: MockTask[] = []

export const MOCK_SERVICE_EVENTS: MockServiceEvent[] = []
