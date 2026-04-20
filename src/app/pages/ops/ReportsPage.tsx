import { useState, useMemo } from 'react'
import {
  ChartBar,
  Lightning,
  Car,
  CurrencyDollar,
  Briefcase,
  Wrench,
  UsersThree,
  Globe,
  Plus,
  Play,
  FloppyDisk,
  Copy,
  Trash,
  PushPin,
  PencilSimple,
  ArrowDown,
  ArrowUp,
  BellRinging,
  CheckCircle,
  WarningCircle,
  ClockCountdown,
  Download,
  CalendarBlank,
  Funnel,
  X,
  EnvelopeSimple,
} from '@phosphor-icons/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useReportingRuntime } from '@/domains/reporting/reporting.runtime'
import { REPORT_TEMPLATES, TEMPLATES_BY_CATEGORY } from '@/domains/reporting/reporting.templates'
import type {
  ReportCategory,
  ReportDataSource,
  ReportFilter,
  ReportColumn,
  SavedReport,
  ScheduledReport,
  DateRange,
  FilterOperator,
  SortDirection,
} from '@/domains/reporting/reporting.types'

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<ReportCategory, string> = {
  executive: 'Executive',
  inventory: 'Inventory',
  sales: 'Sales',
  back_office: 'Back Office',
  fixed_ops: 'Fixed Ops',
  leads_crm: 'Leads / CRM',
  digital_marketing: 'Digital / Marketing',
}

const CATEGORY_ORDER: ReportCategory[] = [
  'executive',
  'inventory',
  'sales',
  'back_office',
  'fixed_ops',
  'leads_crm',
  'digital_marketing',
]

const SOURCE_LABELS: Record<ReportDataSource, string> = {
  inventory: 'Inventory',
  deals: 'Deals',
  credit_applications: 'Credit Applications',
  back_office: 'Back Office',
  fixed_ops: 'Fixed Ops',
  leads: 'Leads',
  tasks: 'Tasks',
}

const DATE_RANGE_LABELS: Record<DateRange['preset'], string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  this_week: 'This Week',
  last_week: 'Last Week',
  this_month: 'This Month',
  last_month: 'Last Month',
  this_quarter: 'This Quarter',
  ytd: 'Year to Date',
  custom: 'Custom Range',
}

const FILTER_OPERATORS: { value: FilterOperator; label: string }[] = [
  { value: 'eq', label: 'Equals' },
  { value: 'neq', label: 'Not Equals' },
  { value: 'gt', label: 'Greater Than' },
  { value: 'gte', label: 'Greater Than or Equal' },
  { value: 'lt', label: 'Less Than' },
  { value: 'lte', label: 'Less Than or Equal' },
  { value: 'contains', label: 'Contains' },
  { value: 'in', label: 'Is One Of' },
  { value: 'between', label: 'Between' },
  { value: 'is_null', label: 'Is Empty' },
  { value: 'is_not_null', label: 'Is Not Empty' },
]

const COLUMNS_BY_SOURCE: Record<ReportDataSource, ReportColumn[]> = {
  inventory: [
    { field: 'stock_number', label: 'Stock #', format: 'text' },
    { field: 'year', label: 'Year', format: 'number' },
    { field: 'make', label: 'Make', format: 'text' },
    { field: 'model', label: 'Model', format: 'text' },
    { field: 'trim', label: 'Trim', format: 'text' },
    { field: 'vin', label: 'VIN', format: 'text' },
    { field: 'status', label: 'Status', format: 'badge' },
    { field: 'days_in_stock', label: 'Days In Stock', format: 'number' },
    { field: 'list_price', label: 'List Price', format: 'currency' },
    { field: 'cost', label: 'Cost', format: 'currency' },
    { field: 'total_invested', label: 'Total Invested', format: 'currency' },
    { field: 'photo_count', label: 'Photo Count', format: 'number' },
    { field: 'mileage', label: 'Mileage', format: 'number' },
    { field: 'color', label: 'Color', format: 'text' },
  ],
  deals: [
    { field: 'deal_number', label: 'Deal #', format: 'text' },
    { field: 'customer_name', label: 'Customer', format: 'text' },
    { field: 'vehicle', label: 'Vehicle', format: 'text' },
    { field: 'salesperson', label: 'Salesperson', format: 'text' },
    { field: 'fi_manager', label: 'F&I Manager', format: 'text' },
    { field: 'sale_date', label: 'Sale Date', format: 'date' },
    { field: 'delivery_date', label: 'Delivery Date', format: 'date' },
    { field: 'status', label: 'Status', format: 'badge' },
    { field: 'front_gross', label: 'Front Gross', format: 'currency' },
    { field: 'back_gross', label: 'Back Gross', format: 'currency' },
    { field: 'total_gross', label: 'Total Gross', format: 'currency' },
    { field: 'lender', label: 'Lender', format: 'text' },
    { field: 'deal_amount', label: 'Deal Amount', format: 'currency' },
  ],
  credit_applications: [
    { field: 'applicant_name', label: 'Applicant', format: 'text' },
    { field: 'co_applicant', label: 'Co-Applicant', format: 'text' },
    { field: 'lender', label: 'Lender', format: 'text' },
    { field: 'status', label: 'Status', format: 'badge' },
    { field: 'submitted_date', label: 'Submitted', format: 'date' },
    { field: 'amount_requested', label: 'Amount', format: 'currency' },
    { field: 'rate', label: 'Rate', format: 'number' },
    { field: 'term', label: 'Term', format: 'number' },
    { field: 'days_pending', label: 'Days Pending', format: 'number' },
  ],
  back_office: [
    { field: 'deal_number', label: 'Deal #', format: 'text' },
    { field: 'customer_name', label: 'Customer', format: 'text' },
    { field: 'title_status', label: 'Title Status', format: 'badge' },
    { field: 'reg_status', label: 'Reg Status', format: 'badge' },
    { field: 'payoff_status', label: 'Payoff Status', format: 'badge' },
    { field: 'days_pending', label: 'Days Pending', format: 'number' },
    { field: 'exception_type', label: 'Exception', format: 'badge' },
    { field: 'assigned_to', label: 'Assigned To', format: 'text' },
  ],
  fixed_ops: [
    { field: 'stock_number', label: 'Stock #', format: 'text' },
    { field: 'year_make_model', label: 'Vehicle', format: 'text' },
    { field: 'recon_stage', label: 'Recon Stage', format: 'badge' },
    { field: 'days_in_recon', label: 'Days In Recon', format: 'number' },
    { field: 'technician', label: 'Technician', format: 'text' },
    { field: 'parts_cost', label: 'Parts', format: 'currency' },
    { field: 'labor_cost', label: 'Labor', format: 'currency' },
    { field: 'total_recon', label: 'Total Recon', format: 'currency' },
  ],
  leads: [
    { field: 'customer_name', label: 'Customer', format: 'text' },
    { field: 'source', label: 'Source', format: 'badge' },
    { field: 'assigned_to', label: 'Assigned To', format: 'text' },
    { field: 'status', label: 'Status', format: 'badge' },
    { field: 'created_date', label: 'Created', format: 'date' },
    { field: 'days_no_activity', label: 'Days Inactive', format: 'number' },
    { field: 'vehicle_interest', label: 'Vehicle Interest', format: 'text' },
  ],
  tasks: [
    { field: 'customer_name', label: 'Customer', format: 'text' },
    { field: 'task_type', label: 'Type', format: 'badge' },
    { field: 'assigned_to', label: 'Assigned To', format: 'text' },
    { field: 'due_date', label: 'Due Date', format: 'date' },
    { field: 'status', label: 'Status', format: 'badge' },
    { field: 'days_overdue', label: 'Days Overdue', format: 'number' },
    { field: 'notes', label: 'Notes', format: 'text' },
  ],
}

const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'America/Anchorage',
  'Pacific/Honolulu',
]

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => {
  const h = i % 12 || 12
  const ampm = i < 12 ? 'AM' : 'PM'
  const val = i.toString().padStart(2, '0') + ':00'
  return { value: val, label: `${h}:00 ${ampm}` }
})

// ─── Mock data generators ─────────────────────────────────────────────────────

function generateMockRows(source: ReportDataSource, count = 8): Record<string, unknown>[] {
  const makes = ['Toyota', 'Ford', 'Chevrolet', 'Honda', 'Nissan', 'BMW', 'Mercedes']
  const models = ['Camry', 'F-150', 'Silverado', 'Civic', 'Altima', '3 Series', 'C300']
  const statuses = ['Active', 'In Recon', 'Pending', 'On Hold']
  const names = ['James Miller', 'Sarah Johnson', 'Robert Davis', 'Linda Wilson', 'Mike Thompson']
  const lenders = ['Chase', 'Capital One', 'Ally Financial', 'TD Auto', 'Bank of America']
  const salespersons = ['Alex Turner', 'Jordan Lee', 'Casey Morgan', 'Taylor Brooks']

  return Array.from({ length: count }, (_, i) => {
    const make = makes[i % makes.length]
    const model = models[i % models.length]
    const vehicle = `202${(i % 5) + 1} ${make} ${model}`
    const base: Record<string, unknown> = {
      stock_number: `S${(10000 + i * 137).toString()}`,
      year_make_model: vehicle,
      vehicle,
      make,
      model,
      year: 2021 + (i % 5),
      vin: `1HGCM82633A${(100000 + i * 7).toString()}`,
      status: statuses[i % statuses.length],
      days_in_stock: 15 + i * 7,
      days_in_recon: 3 + i * 2,
      days_pending: 1 + i * 3,
      days_no_activity: i * 2,
      days_overdue: i,
      days_open: i * 4,
      list_price: 18000 + i * 1250,
      cost: 14000 + i * 900,
      total_invested: 15000 + i * 950,
      purchase_price: 13500 + i * 800,
      recon_cost: 800 + i * 150,
      other_costs: 200 + i * 50,
      parts_cost: 400 + i * 80,
      labor_cost: 300 + i * 60,
      sublet_cost: 100 + i * 20,
      total_recon: 800 + i * 160,
      photo_count: i % 4 === 0 ? 2 : 10 + i,
      mileage: 25000 + i * 3500,
      color: ['White', 'Black', 'Silver', 'Blue', 'Red'][i % 5],
      front_gross: 1200 + i * 180,
      back_gross: 800 + i * 120,
      total_gross: 2000 + i * 300,
      deal_number: `D${(20000 + i * 113).toString()}`,
      customer_name: names[i % names.length],
      salesperson: salespersons[i % salespersons.length],
      fi_manager: ['Kim Ross', 'Pat Cruz'][i % 2],
      sale_date: `2024-0${(i % 9) + 1}-${(i + 10).toString().padStart(2, '0')}`,
      delivery_date: `2024-0${(i % 9) + 1}-${(i + 12).toString().padStart(2, '0')}`,
      lender: lenders[i % lenders.length],
      deal_amount: 22000 + i * 1500,
      applicant_name: names[i % names.length],
      submitted_date: `2024-0${(i % 9) + 1}-0${(i % 9) + 1}`,
      amount_requested: 18000 + i * 1200,
      rate: 5.9 + i * 0.3,
      term: [24, 36, 48, 60, 72][i % 5],
      source: ['Website', 'Phone', 'Walk-in', 'Referral', 'AutoTrader'][i % 5],
      assigned_to: salespersons[i % salespersons.length],
      created_date: `2024-0${(i % 9) + 1}-0${(i % 9) + 1}`,
      vehicle_interest: vehicle,
      recon_stage: ['Intake', 'Mechanical', 'Cosmetic', 'Detail', 'Photos'][i % 5],
      technician: ['Jake', 'Maria', 'Sam', 'Chris'][i % 4],
      estimated_complete: `2024-0${(i % 9) + 2}-0${(i + 1) % 28 + 1}`,
      title_status: ['Pending', 'Received', 'Cleared'][i % 3],
      reg_status: ['Pending', 'Submitted', 'Complete'][i % 3],
      payoff_status: ['Pending', 'Confirmed'][i % 2],
      exception_type: ['Reserve Diff', 'Missing Sig', 'Stip Needed'][i % 3],
      amount: 250 + i * 75,
      missing_docs: ['ID', 'Proof of Income', 'Insurance'][i % 3],
      task_type: ['Call', 'Email', 'Appointment', 'Follow-Up'][i % 4],
      due_date: `2024-0${(i % 9) + 1}-${(i + 10).toString().padStart(2, '0')}`,
      notes: 'Follow up on financing options.',
      health_score: 60 + i * 4,
      has_description: i % 3 !== 0,
      is_listed: i % 5 !== 0,
      listing_title: `${2021 + (i % 5)} ${make} ${model} — Low Miles, Clean Title`,
      quality_flags: i % 3 === 0 ? 'Missing Photos' : 'OK',
      floored_amount: 14000 + i * 900,
      accrued_interest: 120 + i * 30,
      total_carrying: 200 + i * 55,
      is_floored: i % 2 === 0,
      margin_pct: 8 + i * 1.5,
      potential_gross: 3000 + i * 300,
      dealer_pack: 500,
      fuel_cost: 45 + i * 5,
      soft_costs: 150 + i * 25,
      total: 695 + i * 30,
      age_bucket: ['0-30', '31-60', '61-90', '90+'][i % 4],
      channel: i % 2 === 0 ? 'Retail' : 'Wholesale',
      is_featured: i % 3 === 0,
      journey_stage: ['New Lead', 'Contacted', 'Visited', 'Test Drive', 'Negotiating'][i % 5],
      days_in_stage: 1 + i * 2,
      next_step: ['Call back', 'Send proposal', 'Schedule visit', 'Present offer'][i % 4],
      last_activity: `2024-0${(i % 9) + 1}-0${(i % 9) + 1}`,
      temp_tag_expiry: `2024-0${(i % 9) + 2}-0${(i + 1) % 28 + 1}`,
      payoff_amount: 8000 + i * 500,
      trade_vehicle: `2019 ${makes[(i + 2) % makes.length]} ${models[(i + 2) % models.length]}`,
      finalize_ready: i % 3 === 0,
      checklist_status: i % 3 === 0 ? 'Complete' : 'Incomplete',
      missing_stips: i % 3 === 0 ? 'Proof of Insurance' : '',
      has_missing_stips: i % 3 === 0,
      has_missing_docs: i % 4 === 0,
      exception_reason: i % 3 === 0 ? 'Below Min Margin' : 'OK',
      recon_status: ['In Progress', 'Completed', 'On Hold'][i % 3],
      issue_type: ['Mechanical', 'Cosmetic', 'Electrical'][i % 3],
      severity: ['Low', 'Medium', 'High', 'Critical'][i % 4],
      issue_status: 'Open',
      assigned_tech: ['Jake', 'Maria', 'Sam'][i % 3],
      date_observed: `2024-0${(i % 9) + 1}-0${(i % 9) + 1}`,
      channel_obs: ['Website', 'Social', 'AutoTrader', 'Email'][i % 4],
      observation: 'Listing missing price on third-party site',
      co_applicant: i % 2 === 0 ? names[(i + 1) % names.length] : '',
    }
    return base
  })
}

// ─── Utility helpers ──────────────────────────────────────────────────────────

function formatCell(value: unknown, format?: ReportColumn['format']): string {
  if (value === null || value === undefined) return '—'
  if (format === 'currency') {
    const num = typeof value === 'number' ? value : parseFloat(String(value))
    return isNaN(num) ? '—' : `$${num.toLocaleString('en-US', { minimumFractionDigits: 0 })}`
  }
  if (format === 'number') {
    const num = typeof value === 'number' ? value : parseFloat(String(value))
    return isNaN(num) ? '—' : num.toLocaleString('en-US', { maximumFractionDigits: 1 })
  }
  if (format === 'date') {
    const s = String(value)
    if (!s || s === 'today' || s === 'week_start' || s === 'month_start') return s
    try {
      return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    } catch {
      return s
    }
  }
  return String(value)
}

function exportToCsv(rows: Record<string, unknown>[], columns: ReportColumn[], name: string) {
  const header = columns.map((c) => c.label).join(',')
  const body = rows
    .map((row) =>
      columns
        .map((c) => {
          const v = row[c.field]
          const s = formatCell(v, c.format)
          return `"${s.replace(/"/g, '""')}"`
        })
        .join(',')
    )
    .join('\n')
  const csv = `${header}\n${body}`
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${name.replace(/\s+/g, '_')}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface MetricCardProps {
  label: string
  value: string | number
  sub?: string
  variant?: 'default' | 'warning' | 'danger' | 'success'
  icon: React.ReactNode
  onClick?: () => void
}

function MetricCard({ label, value, sub, variant = 'default', icon, onClick }: MetricCardProps) {
  const variantClass = {
    default: 'border-border',
    warning: 'border-yellow-500/40 bg-yellow-500/5',
    danger: 'border-red-500/40 bg-red-500/5',
    success: 'border-green-500/40 bg-green-500/5',
  }[variant]

  return (
    <Card
      className={cn('border transition-all', variantClass, onClick && 'cursor-pointer hover:shadow-md')}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-muted-foreground truncate">{label}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
            {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
          </div>
          <div className="shrink-0 text-muted-foreground/60">{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}

interface ReportResultDialogProps {
  open: boolean
  onClose: () => void
  reportName: string
  source: ReportDataSource
  columns: ReportColumn[]
}

function ReportResultDialog({ open, onClose, reportName, source, columns }: ReportResultDialogProps) {
  const rows = useMemo(() => generateMockRows(source), [source])
  const displayColumns = columns.slice(0, 7)

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-5xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            {reportName}
          </DialogTitle>
          <DialogDescription>
            {rows.length} records returned · Generated {new Date().toLocaleString()}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {displayColumns.map((col) => (
                  <TableHead key={col.field} className="whitespace-nowrap text-xs">
                    {col.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, ri) => (
                <TableRow key={ri}>
                  {displayColumns.map((col) => {
                    const val = row[col.field]
                    const formatted = formatCell(val, col.format)
                    return (
                      <TableCell key={col.field} className="text-xs whitespace-nowrap">
                        {col.format === 'badge' ? (
                          <Badge variant="secondary" className="text-xs">{formatted}</Badge>
                        ) : (
                          formatted
                        )}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => exportToCsv(rows, displayColumns, reportName)}>
            <Download className="h-4 w-4 mr-1.5" />
            Export CSV
          </Button>
          <Button size="sm" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Dashboard Tab ────────────────────────────────────────────────────────────

function DashboardTab({ onRunTemplate }: { onRunTemplate: (templateId: string) => void }) {
  const metrics: MetricCardProps[] = [
    { label: 'Total Active Inventory', value: 142, sub: '12 added this week', variant: 'default', icon: <Car className="h-6 w-6" /> },
    { label: 'Aged Inventory (30+ days)', value: 38, sub: '26.8% of total', variant: 'warning', icon: <ClockCountdown className="h-6 w-6" /> },
    { label: 'Units In Recon', value: 17, sub: 'Avg 5.2 days', variant: 'default', icon: <Wrench className="h-6 w-6" /> },
    { label: 'Open Title Exceptions', value: 9, sub: '3 over 30 days', variant: 'danger', icon: <WarningCircle className="h-6 w-6" /> },
    { label: "Today's Sold Deals", value: 6, sub: '$18,400 total gross', variant: 'success', icon: <CheckCircle className="h-6 w-6" /> },
    { label: 'Unfunded Deals', value: 14, sub: '2 over 14 days', variant: 'warning', icon: <CurrencyDollar className="h-6 w-6" /> },
    { label: 'Missing Docs', value: 7, sub: 'Across 7 deals', variant: 'danger', icon: <WarningCircle className="h-6 w-6" /> },
    { label: 'Recon Spend This Week', value: '$11,340', sub: '+8% vs last week', variant: 'default', icon: <Wrench className="h-6 w-6" /> },
    { label: 'Floor Plan Exposure', value: '$2.1M', sub: '142 units floored', variant: 'default', icon: <CurrencyDollar className="h-6 w-6" /> },
    { label: 'Red Flag Items', value: 5, sub: 'Requires attention', variant: 'danger', icon: <WarningCircle className="h-6 w-6" /> },
  ]

  const quickLinks = [
    { id: 'inv-aging', label: 'Aging Inventory' },
    { id: 'sales-unfunded-aging', label: 'Unfunded Deals' },
    { id: 'bo-missing-docs', label: 'Missing Docs' },
    { id: 'bo-title-pending', label: 'Title Pending' },
    { id: 'fops-stuck-recon', label: 'Stuck In Recon' },
    { id: 'sales-today', label: 'Deals Sold Today' },
    { id: 'crm-follow-up-due', label: 'Follow-Up Due' },
    { id: 'dig-missing-desc-images', label: 'Missing Photos/Desc' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">Executive Pulse</h2>
        <p className="text-sm text-muted-foreground">Key metrics across all operational areas · Live data preview</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {metrics.map((m) => (
          <MetricCard key={m.label} {...m} />
        ))}
      </div>
      <Separator />
      <div>
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Quick Report Links</h3>
        <div className="flex flex-wrap gap-2">
          {quickLinks.map((ql) => (
            <Button
              key={ql.id}
              variant="outline"
              size="sm"
              onClick={() => onRunTemplate(ql.id)}
              className="text-xs"
            >
              <Play className="h-3 w-3 mr-1.5" />
              {ql.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Templates Tab ────────────────────────────────────────────────────────────

function TemplatesTab({ onRunTemplate }: { onRunTemplate: (templateId: string) => void }) {
  const [activeCat, setActiveCat] = useState<ReportCategory | 'all'>('all')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const allTemplates = activeCat === 'all' ? REPORT_TEMPLATES : (TEMPLATES_BY_CATEGORY[activeCat] ?? [])
    if (!search.trim()) return allTemplates
    const q = search.toLowerCase()
    return allTemplates.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.includes(q))
    )
  }, [activeCat, search])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Report Templates</h2>
          <p className="text-sm text-muted-foreground">{REPORT_TEMPLATES.length} pre-built templates across all departments</p>
        </div>
        <Input
          placeholder="Search templates…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:w-64"
        />
      </div>

      <Tabs value={activeCat} onValueChange={(v) => setActiveCat(v as ReportCategory | 'all')}>
        <ScrollArea className="w-full">
          <TabsList className="mb-4 flex w-max gap-1">
            <TabsTrigger value="all">All</TabsTrigger>
            {CATEGORY_ORDER.map((cat) => (
              <TabsTrigger key={cat} value={cat}>{CATEGORY_LABELS[cat]}</TabsTrigger>
            ))}
          </TabsList>
        </ScrollArea>

        <TabsContent value={activeCat} className="mt-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
              <Funnel className="h-10 w-10 mb-3 opacity-30" />
              <p className="font-medium">No templates match your search</p>
              <p className="text-sm">Try a different keyword or category</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((template) => (
                <Card key={template.id} className="group flex flex-col hover:shadow-md transition-shadow">
                  <CardContent className="flex flex-col gap-3 p-4 flex-1">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <ChartBar className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm leading-tight">{template.name}</p>
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {CATEGORY_LABELS[template.category]}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed flex-1">
                      {template.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {template.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Button
                      size="sm"
                      className="w-full mt-auto"
                      onClick={() => onRunTemplate(template.id)}
                    >
                      <Play className="h-3.5 w-3.5 mr-1.5" />
                      Run Report
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ─── Builder Tab ──────────────────────────────────────────────────────────────

interface FilterRow {
  id: string
  field: string
  operator: FilterOperator
  value: string
}

function BuilderTab({ onSaveReport }: { onSaveReport: (report: Omit<SavedReport, 'id' | 'createdAt' | 'updatedAt'>) => void }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [source, setSource] = useState<ReportDataSource>('inventory')
  const [datePreset, setDatePreset] = useState<DateRange['preset']>('this_month')
  const [selectedColumns, setSelectedColumns] = useState<string[]>(['stock_number', 'year_make_model', 'status', 'days_in_stock'])
  const [filters, setFilters] = useState<FilterRow[]>([])
  const [groupBy, setGroupBy] = useState('')
  const [sortBy, setSortBy] = useState('')
  const [sortDir, setSortDir] = useState<SortDirection>('asc')
  const [resultOpen, setResultOpen] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  const availableCols = COLUMNS_BY_SOURCE[source] ?? []

  function addFilter() {
    setFilters((prev) => [
      ...prev,
      { id: `f-${Date.now()}`, field: availableCols[0]?.field ?? '', operator: 'eq', value: '' },
    ])
  }

  function removeFilter(id: string) {
    setFilters((prev) => prev.filter((f) => f.id !== id))
  }

  function updateFilter(id: string, key: keyof FilterRow, val: string) {
    setFilters((prev) => prev.map((f) => (f.id === id ? { ...f, [key]: val } : f)))
  }

  function toggleColumn(field: string) {
    setSelectedColumns((prev) =>
      prev.includes(field) ? prev.filter((c) => c !== field) : [...prev, field]
    )
  }

  function buildReport(): Omit<SavedReport, 'id' | 'createdAt' | 'updatedAt'> {
    const cols: ReportColumn[] = selectedColumns
      .map((f) => availableCols.find((c) => c.field === f))
      .filter((c): c is ReportColumn => Boolean(c))
    const builtFilters: ReportFilter[] = filters.map((f) => ({
      field: f.field,
      operator: f.operator,
      value: f.value,
    }))
    return {
      name: name || 'Untitled Report',
      description,
      source,
      filters: builtFilters,
      columns: cols,
      groupBy: groupBy || undefined,
      sortBy: sortBy || undefined,
      sortDir,
      dateRange: { preset: datePreset },
      outputFormat: 'table',
      isPinned: false,
      isArchived: false,
    }
  }

  function handleSave() {
    onSaveReport(buildReport())
    setSaveMsg('Report saved!')
    setTimeout(() => setSaveMsg(''), 2500)
  }

  const resultColumns: ReportColumn[] = selectedColumns
    .map((f) => availableCols.find((c) => c.field === f))
    .filter((c): c is ReportColumn => Boolean(c))

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-lg font-semibold mb-1">Custom Report Builder</h2>
        <p className="text-sm text-muted-foreground">Configure your own report from any data source</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Report Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Weekly Aging Summary" />
        </div>
        <div className="space-y-2">
          <Label>Data Source</Label>
          <Select value={source} onValueChange={(v) => { setSource(v as ReportDataSource); setSelectedColumns([]) }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {(Object.keys(SOURCE_LABELS) as ReportDataSource[]).map((s) => (
                <SelectItem key={s} value={s}>{SOURCE_LABELS[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Description</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what this report shows…" rows={2} />
        </div>
        <div className="space-y-2">
          <Label>Date Range</Label>
          <Select value={datePreset} onValueChange={(v) => setDatePreset(v as DateRange['preset'])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {(Object.keys(DATE_RANGE_LABELS) as DateRange['preset'][]).map((p) => (
                <SelectItem key={p} value={p}>{DATE_RANGE_LABELS[p]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Sort Direction</Label>
          <Select value={sortDir} onValueChange={(v) => setSortDir(v as SortDirection)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Group By</Label>
          <Select value={groupBy} onValueChange={setGroupBy}>
            <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {availableCols.map((c) => (
                <SelectItem key={c.field} value={c.field}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Sort By</Label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {availableCols.map((c) => (
                <SelectItem key={c.field} value={c.field}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <Label className="text-sm font-semibold">Columns</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {availableCols.map((col) => (
            <label key={col.field} className="flex items-center gap-2 cursor-pointer text-sm">
              <Checkbox
                checked={selectedColumns.includes(col.field)}
                onCheckedChange={() => toggleColumn(col.field)}
              />
              {col.label}
            </label>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">Filters</Label>
          <Button variant="outline" size="sm" onClick={addFilter}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Filter
          </Button>
        </div>
        {filters.length === 0 && (
          <p className="text-sm text-muted-foreground">No filters applied. All records will be returned.</p>
        )}
        <div className="space-y-2">
          {filters.map((f) => (
            <div key={f.id} className="flex items-center gap-2 flex-wrap">
              <Select value={f.field} onValueChange={(v) => updateFilter(f.id, 'field', v)}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {availableCols.map((c) => (
                    <SelectItem key={c.field} value={c.field}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={f.operator} onValueChange={(v) => updateFilter(f.id, 'operator', v)}>
                <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FILTER_OPERATORS.map((op) => (
                    <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {f.operator !== 'is_null' && f.operator !== 'is_not_null' && (
                <Input
                  className="w-36"
                  placeholder="Value"
                  value={f.value}
                  onChange={(e) => updateFilter(f.id, 'value', e.target.value)}
                />
              )}
              <Button variant="ghost" size="icon" onClick={() => removeFilter(f.id)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <Button onClick={handleSave}>
          <FloppyDisk className="h-4 w-4 mr-1.5" />
          Save Report
        </Button>
        <Button variant="secondary" onClick={() => setResultOpen(true)}>
          <Play className="h-4 w-4 mr-1.5" />
          Run Now
        </Button>
        <Button
          variant="outline"
          onClick={() => exportToCsv(generateMockRows(source), resultColumns, name || 'Report')}
        >
          <Download className="h-4 w-4 mr-1.5" />
          Export CSV
        </Button>
        {saveMsg && <span className="text-sm text-green-600 font-medium">{saveMsg}</span>}
      </div>

      <ReportResultDialog
        open={resultOpen}
        onClose={() => setResultOpen(false)}
        reportName={name || 'Custom Report'}
        source={source}
        columns={resultColumns}
      />
    </div>
  )
}

// ─── Saved Reports Tab ────────────────────────────────────────────────────────

function SavedTab({
  savedReports,
  onPin,
  onDuplicate,
  onDelete,
  onRun,
}: {
  savedReports: SavedReport[]
  onPin: (id: string, pinned: boolean) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
  onRun: (report: SavedReport) => void
}) {
  const sorted = useMemo(
    () => [...savedReports].sort((a, b) => Number(b.isPinned) - Number(a.isPinned)),
    [savedReports]
  )
  const [runningReport, setRunningReport] = useState<SavedReport | null>(null)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Saved Reports</h2>
          <p className="text-sm text-muted-foreground">{savedReports.length} saved reports</p>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FloppyDisk className="h-12 w-12 mb-4 text-muted-foreground/30" />
          <p className="font-semibold text-muted-foreground">No saved reports yet</p>
          <p className="text-sm text-muted-foreground mt-1">Build and save a custom report to see it here</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((report) => (
            <Card key={report.id} className={cn('flex flex-col', report.isPinned && 'ring-1 ring-primary/30')}>
              <CardContent className="p-4 flex flex-col gap-3 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      {report.isPinned && <PushPin className="h-3.5 w-3.5 text-primary shrink-0" weight="fill" />}
                      <p className="font-semibold text-sm truncate">{report.name}</p>
                    </div>
                    <Badge variant="secondary" className="mt-1 text-xs">{SOURCE_LABELS[report.source]}</Badge>
                  </div>
                </div>
                {report.description && (
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{report.description}</p>
                )}
                <div className="text-xs text-muted-foreground">
                  {DATE_RANGE_LABELS[report.dateRange.preset]} · {report.columns.length} columns
                </div>
                <div className="flex items-center gap-1.5 flex-wrap mt-auto">
                  <Button size="sm" variant="default" className="flex-1" onClick={() => { setRunningReport(report); onRun(report) }}>
                    <Play className="h-3.5 w-3.5 mr-1" />
                    Run
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onPin(report.id, !report.isPinned)} title={report.isPinned ? 'Unpin' : 'Pin'}>
                    <PushPin className="h-4 w-4" weight={report.isPinned ? 'fill' : 'regular'} />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onDuplicate(report.id)} title="Duplicate">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => onDelete(report.id)} title="Delete">
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {runningReport && (
        <ReportResultDialog
          open={Boolean(runningReport)}
          onClose={() => setRunningReport(null)}
          reportName={runningReport.name}
          source={runningReport.source}
          columns={runningReport.columns}
        />
      )}
    </div>
  )
}

// ─── Schedules Tab ────────────────────────────────────────────────────────────

interface ScheduleFormState {
  savedReportId: string
  name: string
  recipients: string
  subject: string
  introNote: string
  frequency: ScheduledReport['frequency']
  timeOfDay: string
  timezone: string
  isEnabled: boolean
}

function SchedulesTab({
  savedReports,
  scheduledReports,
  onSave,
  onUpdate,
  onDelete,
}: {
  savedReports: SavedReport[]
  scheduledReports: ScheduledReport[]
  onSave: (s: Omit<ScheduledReport, 'id' | 'createdAt' | 'updatedAt'>) => void
  onUpdate: (id: string, updates: Partial<ScheduledReport>) => void
  onDelete: (id: string) => void
}) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<ScheduleFormState>({
    savedReportId: '',
    name: '',
    recipients: '',
    subject: '',
    introNote: '',
    frequency: 'weekly',
    timeOfDay: '07:00',
    timezone: 'America/New_York',
    isEnabled: true,
  })

  function resetForm() {
    setForm({
      savedReportId: '',
      name: '',
      recipients: '',
      subject: '',
      introNote: '',
      frequency: 'weekly',
      timeOfDay: '07:00',
      timezone: 'America/New_York',
      isEnabled: true,
    })
  }

  function handleSave() {
    if (!form.savedReportId || !form.name.trim()) return
    const recipients = form.recipients.split(',').map((r) => r.trim()).filter(Boolean)
    onSave({
      savedReportId: form.savedReportId,
      name: form.name,
      recipients,
      subject: form.subject || `${form.name} — Scheduled Report`,
      introNote: form.introNote,
      frequency: form.frequency,
      timeOfDay: form.timeOfDay,
      timezone: form.timezone,
      isEnabled: form.isEnabled,
    })
    setDialogOpen(false)
    resetForm()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Scheduled Reports</h2>
          <p className="text-sm text-muted-foreground">Automate report delivery to your team</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          Add Schedule
        </Button>
      </div>

      {scheduledReports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BellRinging className="h-12 w-12 mb-4 text-muted-foreground/30" />
          <p className="font-semibold text-muted-foreground">No schedules configured</p>
          <p className="text-sm text-muted-foreground mt-1">Create a schedule to automatically deliver reports</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Report</TableHead>
              <TableHead>Recipients</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Timezone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scheduledReports.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium text-sm">{s.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-[180px] truncate">
                  {s.recipients.join(', ')}
                </TableCell>
                <TableCell className="text-sm capitalize">{s.frequency}</TableCell>
                <TableCell className="text-sm">{s.timeOfDay}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{s.timezone}</TableCell>
                <TableCell>
                  <Switch
                    checked={s.isEnabled}
                    onCheckedChange={(v) => onUpdate(s.id, { isEnabled: v })}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => onDelete(s.id)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Scheduled Report</DialogTitle>
            <DialogDescription>Configure automated report delivery</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Report</Label>
              {savedReports.length === 0 ? (
                <p className="text-sm text-muted-foreground">Save a report first before scheduling.</p>
              ) : (
                <Select value={form.savedReportId} onValueChange={(v) => setForm((f) => ({ ...f, savedReportId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select a saved report…" /></SelectTrigger>
                  <SelectContent>
                    {savedReports.map((r) => (
                      <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-2">
              <Label>Schedule Name</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Daily Gross Summary" />
            </div>
            <div className="space-y-2">
              <Label>Recipients (comma-separated emails)</Label>
              <Input value={form.recipients} onChange={(e) => setForm((f) => ({ ...f, recipients: e.target.value }))} placeholder="gm@dealership.com, owner@dealership.com" />
            </div>
            <div className="space-y-2">
              <Label>Email Subject</Label>
              <Input value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} placeholder="Daily Gross Summary — {date}" />
            </div>
            <div className="space-y-2">
              <Label>Intro Note</Label>
              <Textarea value={form.introNote} onChange={(e) => setForm((f) => ({ ...f, introNote: e.target.value }))} placeholder="Optional message to include at the top of the email…" rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select value={form.frequency} onValueChange={(v) => setForm((f) => ({ ...f, frequency: v as ScheduledReport['frequency'] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekdays">Weekdays</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Time of Day</Label>
                <Select value={form.timeOfDay} onValueChange={(v) => setForm((f) => ({ ...f, timeOfDay: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {HOUR_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select value={form.timezone} onValueChange={(v) => setForm((f) => ({ ...f, timezone: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.isEnabled} onCheckedChange={(v) => setForm((f) => ({ ...f, isEnabled: v }))} />
              <Label>Enable immediately</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.savedReportId || !form.name.trim()}>
              Save Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Delivery History Tab ─────────────────────────────────────────────────────

function DeliveryHistoryTab({
  deliveryHistory,
  onSendTest,
}: {
  deliveryHistory: import('@/domains/reporting/reporting.types').DeliveryRecord[]
  onSendTest: () => void
}) {
  const statusVariant = (status: string) => {
    if (status === 'sent') return 'success'
    if (status === 'failed') return 'destructive'
    return 'secondary'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Delivery History</h2>
          <p className="text-sm text-muted-foreground">{deliveryHistory.length} delivery records</p>
        </div>
        <Button variant="outline" onClick={onSendTest}>
          <EnvelopeSimple className="h-4 w-4 mr-1.5" />
          Send Test
        </Button>
      </div>

      {deliveryHistory.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <EnvelopeSimple className="h-12 w-12 mb-4 text-muted-foreground/30" />
          <p className="font-semibold text-muted-foreground">No delivery history</p>
          <p className="text-sm text-muted-foreground mt-1">Click "Send Test" to generate a test record</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Report</TableHead>
              <TableHead>Recipients</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sent At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deliveryHistory.map((rec) => (
              <TableRow key={rec.id}>
                <TableCell className="font-medium text-sm">{rec.reportName}</TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-[180px] truncate">
                  {rec.recipients.join(', ')}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                  {rec.subject}
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant(rec.status) as 'secondary' | 'destructive' | 'default'} className="capitalize text-xs">
                    {rec.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                  {rec.sentAt ? new Date(rec.sentAt).toLocaleString() : '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function ReportsPage() {
  const {
    savedReports,
    scheduledReports,
    deliveryHistory,
    saveSavedReport,
    updateSavedReport,
    deleteSavedReport,
    duplicateSavedReport,
    saveScheduledReport,
    updateScheduledReport,
    deleteScheduledReport,
    addDeliveryRecord,
  } = useReportingRuntime()

  const [activeTab, setActiveTab] = useState('dashboard')
  const [runTemplateId, setRunTemplateId] = useState<string | null>(null)
  const [runSavedReport, setRunSavedReport] = useState<SavedReport | null>(null)

  const runTemplate = REPORT_TEMPLATES.find((t) => t.id === runTemplateId)

  function handleRunTemplate(templateId: string) {
    setRunTemplateId(templateId)
  }

  function handleSendTest() {
    addDeliveryRecord({
      scheduledReportId: 'test',
      reportName: 'Test Report',
      recipients: ['test@dealership.com'],
      subject: 'Test Delivery — Executive Summary',
      status: 'sent',
      sentAt: new Date().toISOString(),
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Page header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border print:hidden">
        <div className="flex items-center gap-3">
          <ChartBar className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-xl font-bold">Reports</h1>
            <p className="text-sm text-muted-foreground">Executive Reporting Suite</p>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 min-h-0">
        <div className="px-6 pt-3 border-b border-border print:hidden shrink-0">
          <TabsList className="gap-1">
            <TabsTrigger value="dashboard">
              <Lightning className="h-4 w-4 mr-1.5" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="templates">
              <ChartBar className="h-4 w-4 mr-1.5" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="builder">
              <PencilSimple className="h-4 w-4 mr-1.5" />
              Builder
            </TabsTrigger>
            <TabsTrigger value="saved">
              <FloppyDisk className="h-4 w-4 mr-1.5" />
              Saved
              {savedReports.length > 0 && (
                <Badge variant="secondary" className="ml-1.5 text-xs">{savedReports.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="schedules">
              <CalendarBlank className="h-4 w-4 mr-1.5" />
              Schedules
            </TabsTrigger>
            <TabsTrigger value="history">
              <EnvelopeSimple className="h-4 w-4 mr-1.5" />
              Delivery History
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6">
            <TabsContent value="dashboard" className="mt-0">
              <DashboardTab onRunTemplate={(id) => { handleRunTemplate(id); setActiveTab('templates') }} />
            </TabsContent>

            <TabsContent value="templates" className="mt-0">
              <TemplatesTab onRunTemplate={handleRunTemplate} />
            </TabsContent>

            <TabsContent value="builder" className="mt-0">
              <BuilderTab onSaveReport={saveSavedReport} />
            </TabsContent>

            <TabsContent value="saved" className="mt-0">
              <SavedTab
                savedReports={savedReports}
                onPin={(id, pinned) => updateSavedReport(id, { isPinned: pinned })}
                onDuplicate={duplicateSavedReport}
                onDelete={deleteSavedReport}
                onRun={(r) => setRunSavedReport(r)}
              />
            </TabsContent>

            <TabsContent value="schedules" className="mt-0">
              <SchedulesTab
                savedReports={savedReports}
                scheduledReports={scheduledReports}
                onSave={saveScheduledReport}
                onUpdate={updateScheduledReport}
                onDelete={deleteScheduledReport}
              />
            </TabsContent>

            <TabsContent value="history" className="mt-0">
              <DeliveryHistoryTab
                deliveryHistory={deliveryHistory}
                onSendTest={handleSendTest}
              />
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>

      {/* Template run dialog */}
      {runTemplate && (
        <ReportResultDialog
          open={Boolean(runTemplate)}
          onClose={() => setRunTemplateId(null)}
          reportName={runTemplate.name}
          source={runTemplate.dataSource}
          columns={runTemplate.defaultColumns}
        />
      )}

      {/* Saved report run dialog */}
      {runSavedReport && (
        <ReportResultDialog
          open={Boolean(runSavedReport)}
          onClose={() => setRunSavedReport(null)}
          reportName={runSavedReport.name}
          source={runSavedReport.source}
          columns={runSavedReport.columns}
        />
      )}
    </div>
  )
}
