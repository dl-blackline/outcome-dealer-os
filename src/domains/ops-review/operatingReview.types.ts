export const OPERATING_REVIEW_CATEGORIES = [
  'Marketing',
  'Sales',
  'Finance',
  'Service',
  'Lot Presentation',
  'Website',
  'Inventory / Merchandising',
  'Staffing',
  'Process',
  'Customer Experience',
  'Follow-Up',
  'Leadership',
  'Other',
] as const

export const OPERATING_REVIEW_DEPARTMENTS = [
  'Marketing',
  'Sales',
  'Finance',
  'Service',
  'Inventory',
  'Operations',
  'Management',
  'Other',
] as const

export const OPERATING_REVIEW_SEVERITIES = ['Low', 'Medium', 'High', 'Critical'] as const

export const OPERATING_REVIEW_URGENCIES = ['Routine', 'Soon', 'Urgent', 'Immediate'] as const

export const OPERATING_REVIEW_STATUSES = [
  'New',
  'Under Review',
  'Discussed with Owner',
  'Assigned',
  'In Progress',
  'Resolved',
  'Closed',
] as const

export const ACTION_ITEM_STATUSES = ['New', 'In Progress', 'Blocked', 'Done'] as const

export type OperatingReviewCategory = (typeof OPERATING_REVIEW_CATEGORIES)[number]
export type OperatingReviewDepartment = (typeof OPERATING_REVIEW_DEPARTMENTS)[number]
export type OperatingReviewSeverity = (typeof OPERATING_REVIEW_SEVERITIES)[number]
export type OperatingReviewUrgency = (typeof OPERATING_REVIEW_URGENCIES)[number]
export type OperatingReviewStatus = (typeof OPERATING_REVIEW_STATUSES)[number]
export type ActionItemStatus = (typeof ACTION_ITEM_STATUSES)[number]

export interface ObservationActionItem {
  id: string
  title: string
  owner: string
  dueDate?: string
  status: ActionItemStatus
  notes?: string
}

export interface OperatingObservationRecord {
  id: string
  title: string
  category: OperatingReviewCategory
  department: OperatingReviewDepartment
  locationArea?: string
  dateObserved: string
  observedBy: string
  severity: OperatingReviewSeverity
  urgency: OperatingReviewUrgency
  status: OperatingReviewStatus
  ownerAccountable?: string
  shortSummary: string
  fullNotes?: string
  recommendation?: string
  impact?: string
  followUpNeeded?: string
  followUpDate?: string
  reviewedWithOwner: boolean
  reviewMeetingDate?: string
  discussNextMeeting: boolean
  tags: string[]
  evidenceLinks: string[]
  actionItems: ObservationActionItem[]
  pinned: boolean
  createdAt: string
  updatedAt: string
}

export interface OperatingObservationCreateInput {
  title: string
  category: OperatingReviewCategory
  department: OperatingReviewDepartment
  locationArea?: string
  dateObserved: string
  observedBy: string
  severity: OperatingReviewSeverity
  urgency: OperatingReviewUrgency
  status: OperatingReviewStatus
  ownerAccountable?: string
  shortSummary: string
  fullNotes?: string
  recommendation?: string
  impact?: string
  followUpNeeded?: string
  followUpDate?: string
  reviewedWithOwner?: boolean
  reviewMeetingDate?: string
  discussNextMeeting?: boolean
  tags?: string[]
  evidenceLinks?: string[]
  actionItems?: ObservationActionItem[]
  pinned?: boolean
}

export interface OperatingObservationUpdateInput extends Partial<OperatingObservationCreateInput> {}
