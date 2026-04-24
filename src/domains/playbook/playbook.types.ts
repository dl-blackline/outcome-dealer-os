// ─── Playbook & Execution Center — Domain Types ─────────────────────────────

export type PlaybookStatus = 'active' | 'draft' | 'archived' | 'paused'
export type PlaybookVisibility = 'public' | 'private' | 'restricted'
export type PlaybookPriority = 'low' | 'medium' | 'high' | 'critical'
export type PlaybookCategory =
  | 'sales'
  | 'finance'
  | 'service'
  | 'marketing'
  | 'operations'
  | 'hr'
  | 'strategy'
  | 'compliance'
  | 'other'

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
export type ProjectPriority = 'low' | 'medium' | 'high' | 'critical'

export type EntryType =
  | 'idea'
  | 'issue'
  | 'meeting_note'
  | 'strategy_note'
  | 'decision'
  | 'follow_up'
  | 'update'
  | 'blocker'
  | 'observation'

export type EntryStatus = 'open' | 'in_progress' | 'resolved' | 'archived' | 'converted'
export type EntryPriority = 'low' | 'medium' | 'high' | 'urgent'

export type DecisionStatus = 'proposed' | 'decided' | 'implemented' | 'reversed'

export type ActionItemStatus = 'open' | 'in_progress' | 'completed' | 'cancelled' | 'blocked'
export type ActionItemPriority = 'low' | 'medium' | 'high' | 'urgent'

export type CollaboratorRole = 'owner' | 'editor' | 'contributor' | 'viewer'

// ─── Playbook ────────────────────────────────────────────────────────────────

export interface Playbook {
  id: string
  title: string
  description: string
  category: PlaybookCategory
  owner: string
  visibility: PlaybookVisibility
  status: PlaybookStatus
  priority: PlaybookPriority
  tags: string[]
  collaborators: PlaybookCollaborator[]
  createdAt: string
  updatedAt: string
}

export interface PlaybookCollaborator {
  userId: string
  displayName: string
  role: CollaboratorRole
}

export interface CreatePlaybookInput {
  title: string
  description?: string
  category?: PlaybookCategory
  owner?: string
  visibility?: PlaybookVisibility
  status?: PlaybookStatus
  priority?: PlaybookPriority
  tags?: string[]
}

export interface UpdatePlaybookInput extends Partial<CreatePlaybookInput> {
  collaborators?: PlaybookCollaborator[]
}

// ─── Project ─────────────────────────────────────────────────────────────────

export interface Project {
  id: string
  playbookId: string
  title: string
  description: string
  objective: string
  owner: string
  collaborators: PlaybookCollaborator[]
  status: ProjectStatus
  priority: ProjectPriority
  startDate?: string
  targetDate?: string
  nextMilestone?: string
  blockers?: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateProjectInput {
  playbookId: string
  title: string
  description?: string
  objective?: string
  owner?: string
  status?: ProjectStatus
  priority?: ProjectPriority
  startDate?: string
  targetDate?: string
  nextMilestone?: string
  blockers?: string
  tags?: string[]
}

export interface UpdateProjectInput extends Partial<Omit<CreateProjectInput, 'playbookId'>> {
  collaborators?: PlaybookCollaborator[]
}

// ─── Entry / Note ─────────────────────────────────────────────────────────────

export interface Entry {
  id: string
  playbookId: string
  projectId?: string
  title: string
  type: EntryType
  summary: string
  body?: string
  discussedWith: string[]
  peopleMentioned: string[]
  department?: string
  tags: string[]
  priority: EntryPriority
  status: EntryStatus
  nextStep?: string
  dueDate?: string
  linkedRecords: LinkedRecord[]
  attachments: EntryAttachment[]
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface LinkedRecord {
  type: 'observation' | 'task' | 'deal' | 'inventory' | 'lead' | 'customer' | 'vendor' | 'file' | 'decision' | 'action_item'
  id: string
  label: string
}

export interface EntryAttachment {
  id: string
  name: string
  url: string
  mimeType?: string
  sizeBytes?: number
  uploadedAt: string
}

export interface CreateEntryInput {
  playbookId: string
  projectId?: string
  title: string
  type: EntryType
  summary?: string
  body?: string
  discussedWith?: string[]
  peopleMentioned?: string[]
  department?: string
  tags?: string[]
  priority?: EntryPriority
  status?: EntryStatus
  nextStep?: string
  dueDate?: string
  linkedRecords?: LinkedRecord[]
  createdBy?: string
}

export interface UpdateEntryInput extends Partial<Omit<CreateEntryInput, 'playbookId' | 'createdBy'>> {
  attachments?: EntryAttachment[]
}

// ─── Decision ─────────────────────────────────────────────────────────────────

export interface Decision {
  id: string
  playbookId: string
  projectId?: string
  title: string
  summary: string
  rationale?: string
  decidedBy: string
  dateDecided: string
  status: DecisionStatus
  impacts: string[]
  linkedEntryIds: string[]
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateDecisionInput {
  playbookId: string
  projectId?: string
  title: string
  summary: string
  rationale?: string
  decidedBy?: string
  dateDecided?: string
  status?: DecisionStatus
  impacts?: string[]
  linkedEntryIds?: string[]
  tags?: string[]
}

export interface UpdateDecisionInput extends Partial<Omit<CreateDecisionInput, 'playbookId'>> {}

// ─── Action Item ──────────────────────────────────────────────────────────────

export interface ActionItem {
  id: string
  playbookId: string
  projectId?: string
  sourceEntryId?: string
  title: string
  description?: string
  owner: string
  dueDate?: string
  priority: ActionItemPriority
  status: ActionItemStatus
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface CreateActionItemInput {
  playbookId: string
  projectId?: string
  sourceEntryId?: string
  title: string
  description?: string
  owner?: string
  dueDate?: string
  priority?: ActionItemPriority
  status?: ActionItemStatus
  createdBy?: string
}

export interface UpdateActionItemInput extends Partial<Omit<CreateActionItemInput, 'playbookId' | 'createdBy'>> {}

// ─── Timeline Event ───────────────────────────────────────────────────────────

export type TimelineEventType =
  | 'playbook_created'
  | 'project_created'
  | 'project_updated'
  | 'entry_created'
  | 'decision_created'
  | 'action_item_created'
  | 'action_item_completed'
  | 'status_changed'
  | 'collaborator_added'
  | 'file_attached'

export interface TimelineEvent {
  id: string
  playbookId: string
  projectId?: string
  entityType: 'playbook' | 'project' | 'entry' | 'decision' | 'action_item'
  entityId: string
  entityTitle: string
  eventType: TimelineEventType
  actor: string
  detail?: string
  createdAt: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const PLAYBOOK_CATEGORIES: Record<PlaybookCategory, string> = {
  sales: 'Sales',
  finance: 'Finance & F&I',
  service: 'Service',
  marketing: 'Marketing',
  operations: 'Operations',
  hr: 'Human Resources',
  strategy: 'Strategy',
  compliance: 'Compliance',
  other: 'Other',
}

export const PLAYBOOK_STATUSES: Record<PlaybookStatus, string> = {
  active: 'Active',
  draft: 'Draft',
  archived: 'Archived',
  paused: 'Paused',
}

export const PROJECT_STATUSES: Record<ProjectStatus, string> = {
  planning: 'Planning',
  active: 'Active',
  on_hold: 'On Hold',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export const ENTRY_TYPES: Record<EntryType, string> = {
  idea: 'Idea',
  issue: 'Issue',
  meeting_note: 'Meeting Note',
  strategy_note: 'Strategy Note',
  decision: 'Decision',
  follow_up: 'Follow-Up',
  update: 'Update',
  blocker: 'Blocker',
  observation: 'Observation',
}

export const ENTRY_STATUSES: Record<EntryStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  archived: 'Archived',
  converted: 'Converted',
}

export const PLAYBOOK_ACTION_ITEM_STATUSES: Record<ActionItemStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  blocked: 'Blocked',
}

export const PRIORITY_LABELS: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
  urgent: 'Urgent',
}

export const DEPARTMENTS = [
  'Sales',
  'Finance & F&I',
  'Service',
  'Reconditioning',
  'BDC',
  'Marketing',
  'Back Office',
  'HR',
  'Executive',
  'Operations',
  'Other',
] as const

export type Department = typeof DEPARTMENTS[number]
