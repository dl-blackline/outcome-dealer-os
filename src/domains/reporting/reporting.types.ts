import type { UUID } from '@/types/common'

export type ReportCategory =
  | 'executive'
  | 'inventory'
  | 'sales'
  | 'back_office'
  | 'fixed_ops'
  | 'leads_crm'
  | 'digital_marketing'

export type ReportDataSource =
  | 'inventory'
  | 'deals'
  | 'credit_applications'
  | 'back_office'
  | 'fixed_ops'
  | 'leads'
  | 'tasks'

export type FilterOperator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'contains'
  | 'in'
  | 'between'
  | 'is_null'
  | 'is_not_null'

export interface ReportFilter {
  field: string
  operator: FilterOperator
  value: unknown
}

export interface ReportColumn {
  field: string
  label: string
  width?: number
  format?: 'currency' | 'date' | 'number' | 'text' | 'badge'
}

export type DateRangePreset =
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'last_week'
  | 'this_month'
  | 'last_month'
  | 'this_quarter'
  | 'ytd'
  | 'custom'

export interface DateRange {
  preset: DateRangePreset
  from?: string
  to?: string
}

export type OutputFormat = 'table' | 'csv' | 'pdf'
export type SortDirection = 'asc' | 'desc'
export type ReportFrequency = 'daily' | 'weekdays' | 'weekly' | 'monthly'
export type DeliveryStatus = 'sent' | 'failed' | 'pending'

export interface ReportTemplate {
  id: string
  name: string
  description: string
  category: ReportCategory
  tags: string[]
  icon: string
  dataSource: ReportDataSource
  defaultColumns: ReportColumn[]
  defaultFilters: ReportFilter[]
  defaultGroupBy?: string
  defaultSortBy?: string
}

export interface SavedReport {
  id: UUID
  name: string
  description: string
  source: ReportDataSource
  filters: ReportFilter[]
  columns: ReportColumn[]
  groupBy?: string
  sortBy?: string
  sortDir: SortDirection
  dateRange: DateRange
  outputFormat: OutputFormat
  isPinned: boolean
  isArchived: boolean
  createdAt: string
  updatedAt: string
}

export interface ScheduledReport {
  id: UUID
  savedReportId: UUID
  name: string
  recipients: string[]
  subject: string
  introNote: string
  frequency: ReportFrequency
  timeOfDay: string
  timezone: string
  isEnabled: boolean
  nextRunAt?: string
  lastRunAt?: string
  createdAt: string
  updatedAt: string
}

export interface DeliveryRecord {
  id: UUID
  scheduledReportId: UUID
  reportName: string
  recipients: string[]
  subject: string
  status: DeliveryStatus
  failureReason?: string
  sentAt?: string
  createdAt: string
}

export interface ReportRunResult {
  id: string
  reportId: string
  reportName: string
  rows: Record<string, unknown>[]
  columns: ReportColumn[]
  filters: ReportFilter[]
  groupBy?: string
  generatedAt: string
  totalCount: number
}
