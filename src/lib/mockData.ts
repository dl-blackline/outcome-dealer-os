import { UUID } from '@/types/common'
import { EventName } from '@/domains/events/event.constants'
import { ApprovalType } from '@/domains/roles/policy'

export interface MockLead {
  id: UUID
  householdId: UUID
  customerName: string
  email: string
  phone: string
  source: string
  score: number
  status: 'new' | 'contacted' | 'qualified' | 'converted'
  createdAt: string
}

export interface MockDeal {
  id: UUID
  leadId: UUID
  customerName: string
  vehicleDescription: string
  status: 'structured' | 'quoted' | 'signed' | 'funded'
  amount: number
  createdAt: string
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

export const MOCK_LEADS: MockLead[] = [
  {
    id: 'lead-001',
    householdId: 'hh-001',
    customerName: 'Sarah Mitchell',
    email: 'sarah.mitchell@email.com',
    phone: '(555) 123-4567',
    source: 'Website Form',
    score: 85,
    status: 'qualified',
    createdAt: '2025-01-15T10:30:00Z',
  },
  {
    id: 'lead-002',
    householdId: 'hh-002',
    customerName: 'Marcus Johnson',
    email: 'marcus.j@email.com',
    phone: '(555) 234-5678',
    source: 'Phone Call',
    score: 92,
    status: 'converted',
    createdAt: '2025-01-14T14:20:00Z',
  },
  {
    id: 'lead-003',
    householdId: 'hh-003',
    customerName: 'Elena Rodriguez',
    email: 'elena.rodriguez@email.com',
    phone: '(555) 345-6789',
    source: 'Trade-In Appraisal',
    score: 78,
    status: 'contacted',
    createdAt: '2025-01-16T09:15:00Z',
  },
]

export const MOCK_DEALS: MockDeal[] = [
  {
    id: 'deal-001',
    leadId: 'lead-002',
    customerName: 'Marcus Johnson',
    vehicleDescription: '2024 Ford F-150 XLT',
    status: 'funded',
    amount: 52500,
    createdAt: '2025-01-14T16:00:00Z',
  },
  {
    id: 'deal-002',
    leadId: 'lead-001',
    customerName: 'Sarah Mitchell',
    vehicleDescription: '2024 Honda CR-V EX-L',
    status: 'quoted',
    amount: 38900,
    createdAt: '2025-01-15T11:45:00Z',
  },
]

export const MOCK_INVENTORY: MockInventoryUnit[] = [
  {
    id: 'inv-001',
    vin: '1HGCM82633A123456',
    year: 2023,
    make: 'Honda',
    model: 'Accord',
    trim: 'Sport',
    status: 'frontline',
    daysInStock: 12,
    askingPrice: 29995,
  },
  {
    id: 'inv-002',
    vin: '1FTFW1ET5EKD12345',
    year: 2024,
    make: 'Ford',
    model: 'F-150',
    trim: 'XLT',
    status: 'frontline',
    daysInStock: 8,
    askingPrice: 54990,
  },
  {
    id: 'inv-003',
    vin: '5YJSA1E26HF123456',
    year: 2020,
    make: 'Tesla',
    model: 'Model S',
    trim: 'Long Range',
    status: 'aging',
    daysInStock: 78,
    askingPrice: 62500,
  },
]

export const MOCK_APPROVALS: MockApproval[] = [
  {
    id: 'app-001',
    type: 'trade_value_change',
    requestedBy: 'John Smith (Sales Rep)',
    description: 'Trade value override for 2019 Toyota Camry - $14,500 → $15,200',
    status: 'pending',
    createdAt: '2025-01-16T13:22:00Z',
  },
  {
    id: 'app-002',
    type: 'financial_output_change',
    requestedBy: 'Lisa Chen (F&I Manager)',
    description: 'Rate adjustment for deal-002 - 5.9% → 5.4%',
    status: 'granted',
    createdAt: '2025-01-15T16:10:00Z',
  },
]

export const MOCK_EVENTS: MockEvent[] = [
  {
    id: 'evt-001',
    eventName: 'lead_created',
    entityType: 'lead',
    entityId: 'lead-003',
    actorType: 'system',
    timestamp: '2025-01-16T09:15:00Z',
  },
  {
    id: 'evt-002',
    eventName: 'lead_scored',
    entityType: 'lead',
    entityId: 'lead-003',
    actorType: 'agent',
    timestamp: '2025-01-16T09:15:30Z',
  },
  {
    id: 'evt-003',
    eventName: 'desk_scenario_created',
    entityType: 'deal',
    entityId: 'deal-002',
    actorType: 'user',
    timestamp: '2025-01-15T11:50:00Z',
  },
  {
    id: 'evt-004',
    eventName: 'quote_sent',
    entityType: 'deal',
    entityId: 'deal-002',
    actorType: 'user',
    timestamp: '2025-01-15T12:10:00Z',
  },
  {
    id: 'evt-005',
    eventName: 'deal_signed',
    entityType: 'deal',
    entityId: 'deal-001',
    actorType: 'user',
    timestamp: '2025-01-14T17:30:00Z',
  },
  {
    id: 'evt-006',
    eventName: 'deal_funded',
    entityType: 'deal',
    entityId: 'deal-001',
    actorType: 'system',
    timestamp: '2025-01-14T18:45:00Z',
  },
  {
    id: 'evt-007',
    eventName: 'unit_hit_aging_threshold',
    entityType: 'inventory',
    entityId: 'inv-003',
    actorType: 'system',
    timestamp: '2025-01-10T00:00:00Z',
  },
  {
    id: 'evt-008',
    eventName: 'approval_requested',
    entityType: 'approval',
    entityId: 'app-001',
    actorType: 'user',
    timestamp: '2025-01-16T13:22:00Z',
  },
]

export const MOCK_TASKS: MockTask[] = [
  {
    id: 'task-001',
    title: 'Follow up with Sarah Mitchell on quote',
    assignedTo: 'John Smith',
    dueDate: '2025-01-17',
    priority: 'high',
    status: 'pending',
  },
  {
    id: 'task-002',
    title: 'Complete F&I menu for deal-002',
    assignedTo: 'Lisa Chen',
    dueDate: '2025-01-17',
    priority: 'high',
    status: 'pending',
  },
  {
    id: 'task-003',
    title: 'Schedule recon for inv-003',
    assignedTo: 'Mike Torres',
    dueDate: '2025-01-18',
    priority: 'medium',
    status: 'pending',
  },
  {
    id: 'task-004',
    title: 'Contact Elena Rodriguez - lead follow-up',
    assignedTo: 'John Smith',
    dueDate: '2025-01-17',
    priority: 'medium',
    status: 'completed',
  },
]

export const MOCK_SERVICE_EVENTS: MockServiceEvent[] = [
  {
    id: 'svc-001',
    customerName: 'David Thompson',
    vehicleDescription: '2021 Honda Civic',
    serviceType: 'Oil Change & Inspection',
    status: 'completed',
    scheduledDate: '2025-01-15',
  },
  {
    id: 'svc-002',
    customerName: 'Jennifer Lee',
    vehicleDescription: '2019 Ford Explorer',
    serviceType: 'Brake Service',
    status: 'declined_work',
    scheduledDate: '2025-01-16',
  },
]
