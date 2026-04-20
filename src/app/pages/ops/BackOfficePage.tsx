import { useState, useMemo } from 'react'
import {
  Buildings,
  CurrencyDollar,
  FileText,
  WarningCircle,
  CheckCircle,
  Plus,
  X,
  Funnel,
  PencilSimple,
  Check,
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { StickyTableShell } from '@/components/core/StickyTableShell'
import { useBackOfficeRuntime } from '@/domains/back-office/backOffice.runtime'
import {
  FUNDING_STATUS_LABELS,
  TITLE_STATUS_LABELS,
  PAYOFF_STATUS_LABELS,
  REGISTRATION_STATUS_LABELS,
  MISSING_DOC_OPTIONS,
  EXCEPTION_TYPES,
  EXCEPTION_SEVERITIES,
  FUNDING_STATUSES,
  TITLE_STATUSES,
  PAYOFF_STATUSES,
  REGISTRATION_STATUSES,
  type BackOfficeDealRecord,
  type FundingStatus,
  type TitleStatus,
  type PayoffStatus,
  type RegistrationStatus,
  type ExceptionType,
  type ExceptionSeverity,
  type CreateBackOfficeDealInput,
} from '@/domains/back-office/backOffice.types'

const fmt = {
  currency: (n?: number) =>
    n != null
      ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
      : '—',
  date: (s?: string) =>
    s ? new Date(s + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—',
  daysAgo: (s: string) => {
    const d = Math.floor((Date.now() - new Date(s + 'T12:00:00').getTime()) / 86400000)
    return d === 0 ? 'Today' : d === 1 ? '1 day ago' : `${d} days ago`
  },
}

function FundingBadge({ status }: { status: FundingStatus }) {
  return (
    <Badge
      variant="secondary"
      className={cn('text-xs font-medium', {
        'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400': status === 'pending',
        'bg-blue-500/15 text-blue-700 dark:text-blue-400': status === 'submitted' || status === 'approved',
        'bg-green-500/15 text-green-700 dark:text-green-400': status === 'funded',
        'bg-red-500/15 text-red-700 dark:text-red-400': status === 'declined' || status === 'unwound',
      })}
    >
      {FUNDING_STATUS_LABELS[status]}
    </Badge>
  )
}

function TitleBadge({ status }: { status: TitleStatus }) {
  return (
    <Badge
      variant="secondary"
      className={cn('text-xs font-medium', {
        'bg-slate-500/15 text-slate-600 dark:text-slate-400': status === 'not_started',
        'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400': status === 'pending_payoff' || status === 'in_process',
        'bg-blue-500/15 text-blue-700 dark:text-blue-400': status === 'received' || status === 'sent_to_dmv',
        'bg-green-500/15 text-green-700 dark:text-green-400': status === 'complete',
        'bg-red-500/15 text-red-700 dark:text-red-400': status === 'exception',
      })}
    >
      {TITLE_STATUS_LABELS[status]}
    </Badge>
  )
}

function PayoffBadge({ status }: { status: PayoffStatus }) {
  return (
    <Badge
      variant="secondary"
      className={cn('text-xs font-medium', {
        'bg-slate-500/15 text-slate-600 dark:text-slate-400': status === 'not_needed',
        'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400': status === 'requested',
        'bg-blue-500/15 text-blue-700 dark:text-blue-400': status === 'confirmed',
        'bg-green-500/15 text-green-700 dark:text-green-400': status === 'paid',
        'bg-red-500/15 text-red-700 dark:text-red-400': status === 'exception',
      })}
    >
      {PAYOFF_STATUS_LABELS[status]}
    </Badge>
  )
}

// ─── Dashboard Tab ─────────────────────────────────────────────────────────────

function DashboardTab({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const {
    records,
    fundingQueue,
    titleQueue,
    payoffQueue,
    missingDocsQueue,
    exceptionQueue,
    readyToFinalizeQueue,
  } = useBackOfficeRuntime()

  const openExceptions = useMemo(
    () => records.reduce((s, r) => s + r.exceptions.filter((e) => e.status === 'open').length, 0),
    [records]
  )

  const stats = [
    { label: 'Active Deals', value: records.filter((r) => r.status === 'active').length, color: 'text-blue-600' },
    { label: 'Pending Funding', value: fundingQueue.length, color: 'text-yellow-600', tab: 'funding' },
    { label: 'Title In Process', value: titleQueue.length, color: 'text-blue-600', tab: 'title' },
    { label: 'Open Payoffs', value: payoffQueue.length, color: 'text-orange-600', tab: 'payoffs' },
    { label: 'Missing Docs', value: missingDocsQueue.length, color: 'text-red-600', tab: 'docs' },
    { label: 'Open Exceptions', value: openExceptions, color: 'text-red-600', tab: 'exceptions' },
    { label: 'Ready to Finalize', value: readyToFinalizeQueue.length, color: 'text-green-600', tab: 'deal' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {stats.map(({ label, value, color, tab }) => (
          <Card
            key={label}
            className={cn('cursor-default', tab && 'cursor-pointer hover:ring-1 hover:ring-primary/50')}
            onClick={() => tab && onNavigate(tab)}
          >
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className={cn('mt-2 text-2xl font-bold', color)}>{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Priority items */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Critical exceptions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <WarningCircle className="h-4 w-4 text-red-500" /> Critical Exceptions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {records.flatMap((r) =>
              r.exceptions
                .filter((e) => e.status === 'open' && (e.severity === 'critical' || e.severity === 'high'))
                .map((e) => (
                  <div key={e.id} className="flex items-start gap-3 rounded-lg border bg-red-500/5 p-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{e.description}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {r.dealNumber} — {r.customerName} · {e.type.replace('_', ' ')}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs bg-red-500/15 text-red-700 dark:text-red-400 shrink-0">
                      {e.severity}
                    </Badge>
                  </div>
                ))
            ).slice(0, 5)}
            {records.flatMap((r) => r.exceptions.filter((e) => e.status === 'open' && (e.severity === 'critical' || e.severity === 'high'))).length === 0 && (
              <p className="py-3 text-center text-xs text-muted-foreground">No critical exceptions</p>
            )}
          </CardContent>
        </Card>

        {/* Overdue payoffs */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <CurrencyDollar className="h-4 w-4 text-orange-500" /> Overdue Payoffs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {payoffQueue
              .filter((r) => r.payoffDueDate && new Date(r.payoffDueDate + 'T12:00:00') < new Date())
              .map((r) => (
                <div key={r.id} className="flex items-start gap-3 rounded-lg border bg-orange-500/5 p-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{r.tradeVehicle ?? 'Trade Vehicle'}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {r.dealNumber} — {r.customerName} · Due {fmt.date(r.payoffDueDate)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold">{fmt.currency(r.payoffAmount)}</span>
                </div>
              ))}
            {payoffQueue.filter((r) => r.payoffDueDate && new Date(r.payoffDueDate + 'T12:00:00') < new Date()).length === 0 && (
              <p className="py-3 text-center text-xs text-muted-foreground">No overdue payoffs</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ready to finalize */}
      {readyToFinalizeQueue.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" /> Ready to Finalize
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {readyToFinalizeQueue.map((r) => (
                <div key={r.id} className="rounded-lg border bg-green-500/5 px-3 py-2 text-sm">
                  <span className="font-medium">{r.dealNumber}</span> — {r.customerName}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ─── Funding Queue Tab ─────────────────────────────────────────────────────────

function FundingQueueTab({ onSelectDeal }: { onSelectDeal: (r: BackOfficeDealRecord) => void }) {
  const { records, updateRecord } = useBackOfficeRuntime()
  const [filter, setFilter] = useState<FundingStatus | 'all'>('all')

  const queue = useMemo(() => {
    let list = records.filter((r) => r.status === 'active')
    if (filter !== 'all') list = list.filter((r) => r.fundingStatus === filter)
    return list
  }, [records, filter])

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Select value={filter} onValueChange={(v) => setFilter(v as FundingStatus | 'all')}>
          <SelectTrigger className="h-8 w-40 text-xs"><SelectValue placeholder="All Statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">All Statuses</SelectItem>
            {FUNDING_STATUSES.map((s) => <SelectItem key={s} value={s} className="text-xs">{FUNDING_STATUS_LABELS[s]}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <StickyTableShell scrollOffset="22rem">
        <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Deal #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Lender</TableHead>
                <TableHead>Sale Date</TableHead>
                <TableHead>Funding Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Update</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {queue.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">No deals in queue</TableCell></TableRow>
              ) : (
                queue.map((r) => (
                  <TableRow key={r.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onSelectDeal(r)}>
                    <TableCell className="font-mono text-xs font-medium">{r.dealNumber ?? '—'}</TableCell>
                    <TableCell className="text-sm font-medium">{r.customerName}</TableCell>
                    <TableCell className="text-sm">{r.vehicle}</TableCell>
                    <TableCell className="text-sm">{r.lender ?? '—'}</TableCell>
                    <TableCell className="text-sm">{fmt.daysAgo(r.saleDate)}</TableCell>
                    <TableCell><FundingBadge status={r.fundingStatus} /></TableCell>
                    <TableCell className="font-medium">{fmt.currency(r.fundingAmount)}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Select value={r.fundingStatus} onValueChange={(v) => updateRecord(r.id, { fundingStatus: v as FundingStatus, fundingDate: v === 'funded' ? new Date().toISOString().slice(0, 10) : r.fundingDate })}>
                        <SelectTrigger className="h-7 w-28 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>{FUNDING_STATUSES.map((s) => <SelectItem key={s} value={s} className="text-xs">{FUNDING_STATUS_LABELS[s]}</SelectItem>)}</SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
      </StickyTableShell>
    </div>
  )
}

// ─── Title & Reg Tab ───────────────────────────────────────────────────────────

function TitleRegistrationTab({ onSelectDeal }: { onSelectDeal: (r: BackOfficeDealRecord) => void }) {
  const { records, updateRecord } = useBackOfficeRuntime()
  const queue = records.filter((r) => r.status === 'active')

  return (
    <StickyTableShell scrollOffset="20rem">
      <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Deal #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Trade</TableHead>
              <TableHead>Title Status</TableHead>
              <TableHead>Title Received</TableHead>
              <TableHead>Sent to DMV</TableHead>
              <TableHead>Registration</TableHead>
              <TableHead>Update Title</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {queue.map((r) => (
              <TableRow key={r.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onSelectDeal(r)}>
                <TableCell className="font-mono text-xs font-medium">{r.dealNumber ?? '—'}</TableCell>
                <TableCell className="text-sm font-medium">{r.customerName}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{r.tradeVehicle ?? '—'}</TableCell>
                <TableCell><TitleBadge status={r.titleStatus} /></TableCell>
                <TableCell className="text-sm">{fmt.date(r.titleReceivedDate)}</TableCell>
                <TableCell className="text-sm">{fmt.date(r.titleSentDate)}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs">{REGISTRATION_STATUS_LABELS[r.registrationStatus]}</Badge>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Select value={r.titleStatus} onValueChange={(v) => updateRecord(r.id, { titleStatus: v as TitleStatus, titleReceivedDate: v === 'received' ? new Date().toISOString().slice(0, 10) : r.titleReceivedDate, titleSentDate: v === 'sent_to_dmv' ? new Date().toISOString().slice(0, 10) : r.titleSentDate })}>
                    <SelectTrigger className="h-7 w-32 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{TITLE_STATUSES.map((s) => <SelectItem key={s} value={s} className="text-xs">{TITLE_STATUS_LABELS[s]}</SelectItem>)}</SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
    </StickyTableShell>
  )
}

// ─── Payoff Queue Tab ──────────────────────────────────────────────────────────

function PayoffQueueTab({ onSelectDeal }: { onSelectDeal: (r: BackOfficeDealRecord) => void }) {
  const { payoffQueue, updateRecord } = useBackOfficeRuntime()

  return (
    <StickyTableShell scrollOffset="20rem">
      <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Deal #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Trade Vehicle</TableHead>
              <TableHead>Payoff Amount</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Paid Date</TableHead>
              <TableHead>Update</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payoffQueue.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">No open payoffs</TableCell></TableRow>
            ) : (
              payoffQueue.map((r) => {
                const overdue = r.payoffDueDate && new Date(r.payoffDueDate + 'T12:00:00') < new Date()
                return (
                  <TableRow key={r.id} className={cn('cursor-pointer hover:bg-muted/50', overdue && 'bg-red-500/5')} onClick={() => onSelectDeal(r)}>
                    <TableCell className="font-mono text-xs font-medium">{r.dealNumber ?? '—'}</TableCell>
                    <TableCell className="text-sm font-medium">{r.customerName}</TableCell>
                    <TableCell className="text-sm">{r.tradeVehicle ?? '—'}</TableCell>
                    <TableCell className="font-semibold">{fmt.currency(r.payoffAmount)}</TableCell>
                    <TableCell className={cn('text-sm', overdue && 'font-bold text-red-600')}>{fmt.date(r.payoffDueDate)}</TableCell>
                    <TableCell><PayoffBadge status={r.payoffStatus} /></TableCell>
                    <TableCell className="text-sm">{fmt.date(r.payoffPaidDate)}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Select value={r.payoffStatus} onValueChange={(v) => updateRecord(r.id, { payoffStatus: v as PayoffStatus, payoffPaidDate: v === 'paid' ? new Date().toISOString().slice(0, 10) : r.payoffPaidDate })}>
                        <SelectTrigger className="h-7 w-28 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>{PAYOFF_STATUSES.map((s) => <SelectItem key={s} value={s} className="text-xs">{PAYOFF_STATUS_LABELS[s]}</SelectItem>)}</SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
    </StickyTableShell>
  )
}

// ─── Missing Docs Tab ──────────────────────────────────────────────────────────

function MissingDocsTab({ onSelectDeal }: { onSelectDeal: (r: BackOfficeDealRecord) => void }) {
  const { missingDocsQueue, clearDoc } = useBackOfficeRuntime()

  return (
    <div className="space-y-4">
      {missingDocsQueue.length === 0 ? (
        <div className="py-16 text-center">
          <CheckCircle className="mx-auto h-10 w-10 text-green-500 mb-3" />
          <p className="text-sm font-medium text-green-700">No missing documents</p>
          <p className="mt-1 text-xs text-muted-foreground">All active deals have complete document packages</p>
        </div>
      ) : (
        missingDocsQueue.map((r) => (
          <Card key={r.id} className="cursor-pointer hover:ring-1 hover:ring-primary/30" onClick={() => onSelectDeal(r)}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold">{r.dealNumber} — {r.customerName}</p>
                  <p className="text-xs text-muted-foreground">{r.vehicle} · {fmt.daysAgo(r.saleDate)}</p>
                </div>
                <Badge variant="secondary" className="bg-red-500/15 text-red-700 dark:text-red-400 text-xs">
                  {r.missingDocs.length + r.stips.length} outstanding
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                {r.missingDocs.map((doc) => (
                  <button
                    key={doc}
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-md border bg-card px-2.5 py-1 text-xs hover:bg-green-500/10 hover:border-green-500/40 transition-colors"
                    onClick={() => clearDoc(r.id, doc)}
                    title="Click to mark as received"
                  >
                    <X className="h-3 w-3 text-red-500" /> {doc}
                  </button>
                ))}
                {r.stips.map((stip) => (
                  <span key={stip} className="inline-flex items-center gap-1.5 rounded-md border bg-yellow-500/10 border-yellow-500/30 px-2.5 py-1 text-xs text-yellow-700 dark:text-yellow-400">
                    <WarningCircle className="h-3 w-3" /> {stip} (stip)
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}

// ─── Exceptions Tab ────────────────────────────────────────────────────────────

function ExceptionsTab({ onSelectDeal }: { onSelectDeal: (r: BackOfficeDealRecord) => void }) {
  const { records, resolveException } = useBackOfficeRuntime()
  const [statusFilter, setStatusFilter] = useState<'open' | 'resolved' | 'all'>('open')

  const allExceptions = useMemo(() => {
    const result: Array<{ record: BackOfficeDealRecord; exception: BackOfficeDealRecord['exceptions'][0] }> = []
    for (const r of records) {
      for (const e of r.exceptions) {
        if (statusFilter === 'all' || e.status === statusFilter) {
          result.push({ record: r, exception: e })
        }
      }
    }
    return result.sort((a, b) => {
      const order = { critical: 4, high: 3, medium: 2, low: 1 }
      return (order[b.exception.severity] ?? 0) - (order[a.exception.severity] ?? 0)
    })
  }, [records, statusFilter])

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
          <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="open" className="text-xs">Open</SelectItem>
            <SelectItem value="resolved" className="text-xs">Resolved</SelectItem>
            <SelectItem value="all" className="text-xs">All</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <StickyTableShell scrollOffset="22rem">
        <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Deal #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allExceptions.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">No exceptions found</TableCell></TableRow>
              ) : (
                allExceptions.map(({ record, exception }) => (
                  <TableRow key={exception.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onSelectDeal(record)}>
                    <TableCell className="font-mono text-xs font-medium">{record.dealNumber ?? '—'}</TableCell>
                    <TableCell className="text-sm font-medium">{record.customerName}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs capitalize">{exception.type.replace('_', ' ')}</Badge></TableCell>
                    <TableCell className="text-sm max-w-xs truncate">{exception.description}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={cn('text-xs', {
                        'bg-red-500/15 text-red-700 dark:text-red-400': exception.severity === 'critical',
                        'bg-orange-500/15 text-orange-700 dark:text-orange-400': exception.severity === 'high',
                        'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400': exception.severity === 'medium',
                        'bg-slate-500/15 text-slate-600': exception.severity === 'low',
                      })}>
                        {exception.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={cn('text-xs', exception.status === 'resolved' ? 'bg-green-500/15 text-green-700 dark:text-green-400' : 'bg-red-500/15 text-red-700 dark:text-red-400')}>
                        {exception.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{exception.assignedTo ?? '—'}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {exception.status === 'open' && (
                        <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={() => resolveException(record.id, exception.id)}>
                          <Check className="h-3 w-3" /> Resolve
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
      </StickyTableShell>
    </div>
  )
}

// ─── Deal Detail Tab ───────────────────────────────────────────────────────────

function DealDetailTab({ record: initialRecord }: { record: BackOfficeDealRecord }) {
  const { records, updateRecord, clearDoc, clearStip, addException, resolveException } = useBackOfficeRuntime()
  const record = records.find((r) => r.id === initialRecord.id) ?? initialRecord

  const [showAddException, setShowAddException] = useState(false)
  const [excForm, setExcForm] = useState({ type: 'other' as ExceptionType, description: '', severity: 'medium' as ExceptionSeverity, assignedTo: '' })

  function handleAddException() {
    if (!excForm.description) return
    addException(record.id, {
      type: excForm.type,
      description: excForm.description,
      severity: excForm.severity,
      status: 'open',
      assignedTo: excForm.assignedTo || undefined,
    })
    setExcForm({ type: 'other', description: '', severity: 'medium', assignedTo: '' })
    setShowAddException(false)
  }

  const openExceptions = record.exceptions.filter((e) => e.status === 'open')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground">{record.dealNumber}</p>
            <h2 className="mt-0.5 text-xl font-bold">{record.customerName}</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">{record.vehicle}</p>
            <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
              {record.salesperson && <span>Salesperson: <strong>{record.salesperson}</strong></span>}
              {record.fiManager && <span>F&I: <strong>{record.fiManager}</strong></span>}
              {record.lender && <span>Lender: <strong>{record.lender}</strong></span>}
              <span>Sale date: <strong>{fmt.date(record.saleDate)}</strong></span>
              {record.salePrice && <span>Sale price: <strong>{fmt.currency(record.salePrice)}</strong></span>}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {openExceptions.length > 0 && (
              <Badge variant="secondary" className="bg-red-500/15 text-red-700 dark:text-red-400">
                {openExceptions.length} open exception{openExceptions.length > 1 ? 's' : ''}
              </Badge>
            )}
            {record.isReadyToFinalize && !record.finalizedAt && (
              <Badge variant="secondary" className="bg-green-500/15 text-green-700 dark:text-green-400">Ready to Finalize</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Status panels */}
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Funding</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <FundingBadge status={record.fundingStatus} />
            <Select value={record.fundingStatus} onValueChange={(v) => updateRecord(record.id, { fundingStatus: v as FundingStatus })}>
              <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{FUNDING_STATUSES.map((s) => <SelectItem key={s} value={s} className="text-xs">{FUNDING_STATUS_LABELS[s]}</SelectItem>)}</SelectContent>
            </Select>
            {record.fundingAmount && <p className="text-xs text-muted-foreground">Amount: {fmt.currency(record.fundingAmount)}</p>}
            {record.fundingDate && <p className="text-xs text-muted-foreground">Funded: {fmt.date(record.fundingDate)}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Title</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <TitleBadge status={record.titleStatus} />
            <Select value={record.titleStatus} onValueChange={(v) => updateRecord(record.id, { titleStatus: v as TitleStatus })}>
              <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{TITLE_STATUSES.map((s) => <SelectItem key={s} value={s} className="text-xs">{TITLE_STATUS_LABELS[s]}</SelectItem>)}</SelectContent>
            </Select>
            {record.titleReceivedDate && <p className="text-xs text-muted-foreground">Received: {fmt.date(record.titleReceivedDate)}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Payoff</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <PayoffBadge status={record.payoffStatus} />
            <Select value={record.payoffStatus} onValueChange={(v) => updateRecord(record.id, { payoffStatus: v as PayoffStatus })}>
              <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{PAYOFF_STATUSES.map((s) => <SelectItem key={s} value={s} className="text-xs">{PAYOFF_STATUS_LABELS[s]}</SelectItem>)}</SelectContent>
            </Select>
            {record.payoffAmount && <p className="text-xs text-muted-foreground">Amount: {fmt.currency(record.payoffAmount)}</p>}
            {record.payoffDueDate && <p className="text-xs text-muted-foreground">Due: {fmt.date(record.payoffDueDate)}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Registration</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Badge variant="secondary" className="text-xs">{REGISTRATION_STATUS_LABELS[record.registrationStatus]}</Badge>
            <Select value={record.registrationStatus} onValueChange={(v) => updateRecord(record.id, { registrationStatus: v as RegistrationStatus })}>
              <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{REGISTRATION_STATUSES.map((s) => <SelectItem key={s} value={s} className="text-xs">{REGISTRATION_STATUS_LABELS[s]}</SelectItem>)}</SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Missing docs */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Missing Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {record.missingDocs.length === 0 ? (
              <p className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400"><CheckCircle className="h-4 w-4" /> All documents received</p>
            ) : (
              record.missingDocs.map((doc) => (
                <div key={doc} className="flex items-center justify-between rounded-lg border bg-red-500/5 px-3 py-2">
                  <span className="text-sm">{doc}</span>
                  <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs text-green-700 dark:text-green-400 hover:text-green-600" onClick={() => clearDoc(record.id, doc)}>
                    <Check className="h-3 w-3" /> Received
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Stips */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Stipulations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {record.stips.length === 0 && record.stipsCleared.length === 0 && (
              <p className="text-sm text-muted-foreground">No stips on this deal</p>
            )}
            {record.stips.map((stip) => (
              <div key={stip} className="flex items-center justify-between rounded-lg border bg-yellow-500/5 px-3 py-2">
                <span className="text-sm">{stip}</span>
                <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs text-green-700 dark:text-green-400" onClick={() => clearStip(record.id, stip)}>
                  <Check className="h-3 w-3" /> Cleared
                </Button>
              </div>
            ))}
            {record.stipsCleared.map((stip) => (
              <div key={stip} className="flex items-center justify-between rounded-lg border bg-green-500/5 px-3 py-2 opacity-60">
                <span className="text-sm line-through">{stip}</span>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Exceptions */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Exceptions</CardTitle>
            <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={() => setShowAddException(!showAddException)}>
              <Plus className="h-3.5 w-3.5" /> Add Exception
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {showAddException && (
            <div className="rounded-lg border bg-muted/40 p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs">Description</Label>
                  <Input value={excForm.description} onChange={(e) => setExcForm((f) => ({ ...f, description: e.target.value }))} className="h-8 text-xs" placeholder="Describe the exception…" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Type</Label>
                  <Select value={excForm.type} onValueChange={(v) => setExcForm((f) => ({ ...f, type: v as ExceptionType }))}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{EXCEPTION_TYPES.map((t) => <SelectItem key={t} value={t} className="text-xs capitalize">{t.replace('_', ' ')}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Severity</Label>
                  <Select value={excForm.severity} onValueChange={(v) => setExcForm((f) => ({ ...f, severity: v as ExceptionSeverity }))}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{EXCEPTION_SEVERITIES.map((s) => <SelectItem key={s} value={s} className="text-xs capitalize">{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Assigned To</Label>
                  <Input value={excForm.assignedTo} onChange={(e) => setExcForm((f) => ({ ...f, assignedTo: e.target.value }))} className="h-8 text-xs" placeholder="Staff member" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="h-7 text-xs" onClick={handleAddException}>Add Exception</Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowAddException(false)}>Cancel</Button>
              </div>
            </div>
          )}
          {record.exceptions.length === 0 && !showAddException && (
            <p className="py-2 text-sm text-muted-foreground">No exceptions</p>
          )}
          {record.exceptions.map((exc) => (
            <div key={exc.id} className={cn('rounded-lg border p-3', exc.status === 'open' ? 'bg-red-500/5' : 'bg-green-500/5 opacity-70')}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{exc.description}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground capitalize">{exc.type.replace('_', ' ')} · {exc.assignedTo ?? 'Unassigned'}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="secondary" className={cn('text-xs', { 'bg-red-500/15 text-red-700 dark:text-red-400': exc.severity === 'critical', 'bg-orange-500/15 text-orange-700 dark:text-orange-400': exc.severity === 'high', 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400': exc.severity === 'medium' })}>
                    {exc.severity}
                  </Badge>
                  {exc.status === 'open' && (
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => resolveException(record.id, exc.id)}>
                      <Check className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Notes + actions */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Office Review Notes</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={record.officeReviewNotes ?? ''}
            onChange={(e) => updateRecord(record.id, { officeReviewNotes: e.target.value })}
            placeholder="Internal office notes for this deal…"
            className="min-h-[80px] text-sm"
          />
          <div className="flex gap-3">
            {!record.isReadyToFinalize && (
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => updateRecord(record.id, { isReadyToFinalize: true })}
                disabled={record.missingDocs.length > 0 || openExceptions.length > 0}
              >
                <CheckCircle className="h-4 w-4" /> Mark Ready to Finalize
              </Button>
            )}
            {record.isReadyToFinalize && !record.finalizedAt && (
              <Button
                className="gap-2 bg-green-600 hover:bg-green-700"
                onClick={() => updateRecord(record.id, { finalizedAt: new Date().toISOString(), finalizedBy: 'Current User', status: 'complete' })}
              >
                <CheckCircle className="h-4 w-4" /> Finalize Deal
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Add Deal Tab ──────────────────────────────────────────────────────────────

function AddDealTab({ onAdded }: { onAdded: () => void }) {
  const { createRecord } = useBackOfficeRuntime()
  const [form, setForm] = useState<Partial<CreateBackOfficeDealInput>>({
    saleDate: new Date().toISOString().slice(0, 10),
    missingDocs: [],
    stips: [],
  })
  const [saved, setSaved] = useState(false)

  function handleSubmit() {
    if (!form.customerName || !form.vehicle || !form.saleDate) return
    createRecord({
      customerName: form.customerName,
      vehicle: form.vehicle,
      saleDate: form.saleDate,
      dealNumber: form.dealNumber,
      salesperson: form.salesperson,
      fiManager: form.fiManager,
      lender: form.lender,
      salePrice: form.salePrice,
      tradeVehicle: form.tradeVehicle,
      missingDocs: form.missingDocs ?? [],
      stips: form.stips ?? [],
    })
    setSaved(true)
    setTimeout(() => { setSaved(false); onAdded() }, 1200)
  }

  return (
    <div className="max-w-2xl">
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Add Back Office Record</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Deal Number', key: 'dealNumber', placeholder: 'D-10900' },
              { label: 'Customer Name *', key: 'customerName', placeholder: 'John Smith' },
              { label: 'Vehicle *', key: 'vehicle', placeholder: '2022 Ford F-150 XLT — #A1055' },
              { label: 'Salesperson', key: 'salesperson', placeholder: 'Tony R.' },
              { label: 'F&I Manager', key: 'fiManager', placeholder: 'Dana L.' },
              { label: 'Lender', key: 'lender', placeholder: 'Capital One Auto' },
              { label: 'Sale Price ($)', key: 'salePrice', placeholder: '38500' },
              { label: 'Trade Vehicle', key: 'tradeVehicle', placeholder: '2019 Honda Civic' },
              { label: 'Sale Date *', key: 'saleDate', placeholder: '', type: 'date' },
            ].map(({ label, key, placeholder, type }) => (
              <div key={key} className="space-y-1">
                <Label className="text-xs">{label}</Label>
                <Input
                  type={type ?? 'text'}
                  value={(form as Record<string, string | undefined>)[key] ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="h-8 text-xs"
                />
              </div>
            ))}
          </div>
          <Button onClick={handleSubmit} className="gap-2" disabled={!form.customerName || !form.vehicle || !form.saleDate}>
            {saved ? <><CheckCircle className="h-4 w-4" /> Saved!</> : <><Plus className="h-4 w-4" /> Add Record</>}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export function BackOfficePage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedDeal, setSelectedDeal] = useState<BackOfficeDealRecord | null>(null)

  function handleSelectDeal(record: BackOfficeDealRecord) {
    setSelectedDeal(record)
    setActiveTab('deal')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Back Office</h1>
          <p className="mt-1 text-sm text-muted-foreground">Funding, title, payoff, documents, and deal finalization</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="dashboard" className="text-xs">Dashboard</TabsTrigger>
          <TabsTrigger value="funding" className="text-xs">Funding Queue</TabsTrigger>
          <TabsTrigger value="title" className="text-xs">Title & Reg</TabsTrigger>
          <TabsTrigger value="payoffs" className="text-xs">Payoffs</TabsTrigger>
          <TabsTrigger value="docs" className="text-xs">Missing Docs</TabsTrigger>
          <TabsTrigger value="exceptions" className="text-xs">Exceptions</TabsTrigger>
          <TabsTrigger value="deal" className="text-xs" disabled={!selectedDeal}>Deal Detail</TabsTrigger>
          <TabsTrigger value="add" className="text-xs">Add Deal</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <DashboardTab onNavigate={setActiveTab} />
        </TabsContent>
        <TabsContent value="funding" className="mt-6">
          <FundingQueueTab onSelectDeal={handleSelectDeal} />
        </TabsContent>
        <TabsContent value="title" className="mt-6">
          <TitleRegistrationTab onSelectDeal={handleSelectDeal} />
        </TabsContent>
        <TabsContent value="payoffs" className="mt-6">
          <PayoffQueueTab onSelectDeal={handleSelectDeal} />
        </TabsContent>
        <TabsContent value="docs" className="mt-6">
          <MissingDocsTab onSelectDeal={handleSelectDeal} />
        </TabsContent>
        <TabsContent value="exceptions" className="mt-6">
          <ExceptionsTab onSelectDeal={handleSelectDeal} />
        </TabsContent>
        <TabsContent value="deal" className="mt-6">
          {selectedDeal ? (
            <DealDetailTab record={selectedDeal} />
          ) : (
            <div className="py-16 text-center text-sm text-muted-foreground">
              Select a deal from any queue to view its detail
            </div>
          )}
        </TabsContent>
        <TabsContent value="add" className="mt-6">
          <AddDealTab onAdded={() => setActiveTab('funding')} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
