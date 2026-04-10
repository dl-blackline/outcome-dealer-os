import { UUID } from '@/types/common'

export type WorkstationColumnId = 'inbox' | 'today' | 'in_progress' | 'waiting' | 'done'

export type LinkedObjectType =
  | 'lead'
  | 'deal'
  | 'household'
  | 'inventory_unit'
  | 'approval'
  | 'trade_appraisal'
  | 'service_event'
  | 'recon_job'
  | 'funding_exception'
  | 'quote'

export type CardPriority = 'low' | 'medium' | 'high' | 'urgent'

export type QueueType =
  | 'sales'
  | 'finance'
  | 'service'
  | 'recon'
  | 'bdc'
  | 'management'
  | 'general'

export interface WorkstationCard {
  id: UUID
  title: string
  description?: string
  columnId: WorkstationColumnId
  linkedObjectType?: LinkedObjectType
  linkedObjectId?: UUID
  priority: CardPriority
  queueType: QueueType
  dueAt?: string
  assigneeId?: UUID
  assigneeName?: string
  requiresApproval: boolean
  sourceEventName?: string
  tags?: string[]
  createdAt: string
  updatedAt: string
}

export interface WorkstationColumn {
  id: WorkstationColumnId
  label: string
  description: string
}

export interface WorkstationBoard {
  columns: WorkstationColumn[]
  cards: WorkstationCard[]
}

export const DEFAULT_COLUMNS: WorkstationColumn[] = [
  { id: 'inbox', label: 'Inbox', description: 'New items requiring triage' },
  { id: 'today', label: 'Today', description: 'Scheduled for today' },
  { id: 'in_progress', label: 'In Progress', description: 'Currently being worked' },
  { id: 'waiting', label: 'Waiting', description: 'Blocked or awaiting response' },
  { id: 'done', label: 'Done', description: 'Completed items' },
]
