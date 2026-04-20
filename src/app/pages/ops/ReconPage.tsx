import { useState, useMemo } from 'react'
import {
  Wrench,
  Plus,
  Funnel,
  CaretRight,
  ArrowClockwise,
  CheckCircle,
  WarningCircle,
  ClockCountdown,
  CurrencyDollar,
  Trash,
  X,
  ListBullets,
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
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { StickyTableShell } from '@/components/core/StickyTableShell'
import { useReconRuntime } from '@/domains/recon/recon.runtime'
import { useInventoryCatalog } from '@/domains/inventory/inventory.runtime'
import {
  RECON_STAGES,
  RECON_STAGE_LABELS,
  RECON_STAGE_ORDER,
  ISSUE_SEVERITIES,
  ISSUE_SEVERITY_LABELS,
  ISSUE_STATUS_LABELS,
  COST_CATEGORIES,
  COST_CATEGORY_LABELS,
  type ReconUnit,
  type ReconStage,
  type IssueSeverity,
  type CostCategory,
  type IssueStatus,
} from '@/domains/recon/recon.types'

const fmt = {
  currency: (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n),
  date: (s?: string) => (s ? new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'),
}

function SeverityBadge({ severity }: { severity: IssueSeverity }) {
  return (
    <Badge
      className={cn('text-xs font-semibold', {
        'bg-red-500/15 text-red-700 dark:text-red-400': severity === 'critical',
        'bg-orange-500/15 text-orange-700 dark:text-orange-400': severity === 'high',
        'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400': severity === 'medium',
        'bg-slate-500/15 text-slate-600 dark:text-slate-400': severity === 'low',
      })}
      variant="secondary"
    >
      {ISSUE_SEVERITY_LABELS[severity]}
    </Badge>
  )
}

function StageBadge({ stage }: { stage: ReconStage }) {
  return (
    <Badge
      className={cn('text-xs font-medium', {
        'bg-slate-500/15 text-slate-600': stage === 'intake',
        'bg-blue-500/15 text-blue-700 dark:text-blue-400': stage === 'mechanical',
        'bg-orange-500/15 text-orange-700 dark:text-orange-400': stage === 'body',
        'bg-purple-500/15 text-purple-700 dark:text-purple-400': stage === 'detail',
        'bg-cyan-500/15 text-cyan-700 dark:text-cyan-400': stage === 'photos',
        'bg-green-500/15 text-green-700 dark:text-green-400': stage === 'frontline',
        'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400': stage === 'complete',
        'bg-red-500/15 text-red-700 dark:text-red-400': stage === 'on_hold',
      })}
      variant="secondary"
    >
      {RECON_STAGE_LABELS[stage]}
    </Badge>
  )
}

function DaysBadge({ days, target }: { days: number; target: number }) {
  const over = days > target
  const warn = days >= target * 0.8
  return (
    <span
      className={cn('inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold', {
        'bg-green-500/15 text-green-700 dark:text-green-400': !warn && !over,
        'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400': warn && !over,
        'bg-red-500/15 text-red-700 dark:text-red-400': over,
      })}
    >
      {days}d
    </span>
  )
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({
  onSelectUnit,
}: {
  onSelectUnit: (unit: ReconUnit) => void
}) {
  const { units, issues, stageCountMap } = useReconRuntime()
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState<ReconStage | 'all'>('all')

  const criticalIssues = useMemo(() => issues.filter((i) => i.status === 'open' && i.severity === 'critical'), [issues])
  const overTarget = useMemo(() => units.filter((u) => u.daysInRecon > u.targetDays), [units])
  const frontlineReady = useMemo(() => units.filter((u) => u.currentStage === 'frontline' || u.currentStage === 'complete'), [units])
  const totalSpend = useMemo(() => units.reduce((s, u) => s + u.totalReconCost, 0), [units])
  const avgDays = useMemo(
    () => (units.length ? Math.round(units.reduce((s, u) => s + u.daysInRecon, 0) / units.length) : 0),
    [units]
  )

  const filtered = useMemo(() => {
    let list = units
    if (stageFilter !== 'all') list = list.filter((u) => u.currentStage === stageFilter)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (u) =>
          `${u.year} ${u.make} ${u.model} ${u.stockNumber ?? ''} ${u.vin ?? ''}`.toLowerCase().includes(q)
      )
    }
    return list
  }, [units, stageFilter, search])

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-6">
        {[
          { label: 'Total in Recon', value: units.length, icon: Wrench, color: 'text-blue-600' },
          { label: 'Avg Days', value: `${avgDays}d`, icon: ClockCountdown, color: 'text-yellow-600' },
          { label: 'Total Spend', value: fmt.currency(totalSpend), icon: CurrencyDollar, color: 'text-purple-600' },
          { label: 'Over Target', value: overTarget.length, icon: WarningCircle, color: 'text-red-600' },
          { label: 'Critical Issues', value: criticalIssues.length, icon: WarningCircle, color: 'text-red-500' },
          { label: 'Frontline Ready', value: frontlineReady.length, icon: CheckCircle, color: 'text-green-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="@container">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{label}</p>
                <Icon className={cn('h-4 w-4', color)} />
              </div>
              <p className="mt-2 text-2xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pipeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Recon Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2">
            {RECON_STAGE_ORDER.map((stage, idx) => (
              <div key={stage} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStageFilter(stageFilter === stage ? 'all' : stage)}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-all',
                    stageFilter === stage
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-card hover:bg-muted'
                  )}
                >
                  <span>{RECON_STAGE_LABELS[stage]}</span>
                  <span className="rounded-full bg-muted px-1.5 py-0.5 text-[0.65rem] font-bold">
                    {stageCountMap[stage] ?? 0}
                  </span>
                </button>
                {idx < RECON_STAGE_ORDER.length - 1 && (
                  <CaretRight className="h-3 w-3 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-sm">All Recon Units</CardTitle>
            <div className="flex gap-2">
              <Input
                placeholder="Search units…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 w-48 text-xs"
              />
              {stageFilter !== 'all' && (
                <Button variant="ghost" size="sm" onClick={() => setStageFilter('all')} className="h-8 gap-1 text-xs">
                  <X className="h-3.5 w-3.5" /> Clear filter
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <StickyTableShell scrollOffset="30rem" className="border-0 rounded-none bg-transparent">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Stock #</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Tech</TableHead>
                <TableHead>Recon Cost</TableHead>
                <TableHead>Issues</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                    No units found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((unit) => {
                  const unitIssues = unit  // computed per unit via hook closure
                  return (
                    <TableRow
                      key={unit.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => onSelectUnit(unit)}
                    >
                      <TableCell className="font-mono text-xs">{unit.stockNumber ?? '—'}</TableCell>
                      <TableCell className="font-medium">
                        {unit.year} {unit.make} {unit.model}
                        {unit.trim && <span className="ml-1 text-xs text-muted-foreground">{unit.trim}</span>}
                      </TableCell>
                      <TableCell><StageBadge stage={unit.currentStage} /></TableCell>
                      <TableCell><DaysBadge days={unit.daysInRecon} target={unit.targetDays} /></TableCell>
                      <TableCell className="text-sm">{unit.assignedTech ?? '—'}</TableCell>
                      <TableCell className="font-medium">{fmt.currency(unit.totalReconCost)}</TableCell>
                      <TableCell>
                        {unit.id && <IssueCount reconUnitId={unit.id} />}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); onSelectUnit(unit) }}>
                          Detail
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </StickyTableShell>
      </Card>
    </div>
  )
}

function IssueCount({ reconUnitId }: { reconUnitId: string }) {
  const { issues } = useReconRuntime()
  const count = issues.filter((i) => i.reconUnitId === reconUnitId && (i.status === 'open' || i.status === 'in_progress')).length
  if (count === 0) return <span className="text-xs text-muted-foreground">—</span>
  return (
    <span className="inline-flex items-center rounded-full bg-orange-500/15 px-2 py-0.5 text-xs font-semibold text-orange-700 dark:text-orange-400">
      {count} open
    </span>
  )
}

// ─── Unit Detail Tab ───────────────────────────────────────────────────────────

function UnitDetailTab({ unit: initialUnit }: { unit: ReconUnit }) {
  const { units, issues, costEntries, activity, addIssue, updateIssue, addCostEntry, removeCostEntry, updateUnit, logActivity } = useReconRuntime()

  // keep in sync
  const unit = units.find((u) => u.id === initialUnit.id) ?? initialUnit
  const unitIssues = useMemo(() => issues.filter((i) => i.reconUnitId === unit.id), [issues, unit.id])
  const unitCosts = useMemo(() => costEntries.filter((c) => c.reconUnitId === unit.id), [costEntries, unit.id])
  const unitActivity = useMemo(() => activity.filter((a) => a.reconUnitId === unit.id), [activity, unit.id])
  const totalCost = useMemo(() => unitCosts.reduce((s, c) => s + c.amount, 0), [unitCosts])

  const [showIssueForm, setShowIssueForm] = useState(false)
  const [showCostForm, setShowCostForm] = useState(false)

  const [issueForm, setIssueForm] = useState({ title: '', description: '', category: 'mechanical' as CostCategory, severity: 'medium' as IssueSeverity, estimatedCost: '', assignedTo: '' })
  const [costForm, setCostForm] = useState({ category: 'mechanical' as CostCategory, description: '', vendor: '', invoiceNumber: '', amount: '', date: new Date().toISOString().slice(0, 10) })

  const stageIndex = RECON_STAGE_ORDER.indexOf(unit.currentStage)

  function advanceStage() {
    if (stageIndex < RECON_STAGE_ORDER.length - 1) {
      const nextStage = RECON_STAGE_ORDER[stageIndex + 1]
      updateUnit(unit.id, { currentStage: nextStage })
      logActivity(unit.id, nextStage, `Advanced to ${RECON_STAGE_LABELS[nextStage]}`)
    }
  }

  function submitIssue() {
    if (!issueForm.title) return
    addIssue({
      reconUnitId: unit.id,
      title: issueForm.title,
      description: issueForm.description || undefined,
      category: issueForm.category,
      severity: issueForm.severity,
      estimatedCost: issueForm.estimatedCost ? parseFloat(issueForm.estimatedCost) : undefined,
      assignedTo: issueForm.assignedTo || undefined,
    })
    setIssueForm({ title: '', description: '', category: 'mechanical', severity: 'medium', estimatedCost: '', assignedTo: '' })
    setShowIssueForm(false)
  }

  function submitCost() {
    if (!costForm.description || !costForm.amount) return
    addCostEntry({
      reconUnitId: unit.id,
      category: costForm.category,
      description: costForm.description,
      vendor: costForm.vendor || undefined,
      invoiceNumber: costForm.invoiceNumber || undefined,
      amount: parseFloat(costForm.amount),
      date: costForm.date,
    })
    setCostForm({ category: 'mechanical', description: '', vendor: '', invoiceNumber: '', amount: '', date: new Date().toISOString().slice(0, 10) })
    setShowCostForm(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Stock #{unit.stockNumber ?? '—'}</p>
            <h2 className="mt-0.5 text-xl font-bold">
              {unit.year} {unit.make} {unit.model}
              {unit.trim && <span className="ml-1.5 text-sm font-normal text-muted-foreground">{unit.trim}</span>}
            </h2>
            {unit.color && <p className="mt-0.5 text-sm text-muted-foreground">{unit.color}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <StageBadge stage={unit.currentStage} />
            <span className="text-sm text-muted-foreground">
              <DaysBadge days={unit.daysInRecon} target={unit.targetDays} /> of {unit.targetDays}d target
            </span>
            <span className="text-sm font-semibold">{fmt.currency(totalCost)} spent</span>
            {unit.currentStage !== 'complete' && unit.currentStage !== 'on_hold' && stageIndex < RECON_STAGE_ORDER.length - 1 && (
              <Button size="sm" className="gap-1.5" onClick={advanceStage}>
                <ArrowClockwise className="h-3.5 w-3.5" /> Advance Stage
              </Button>
            )}
          </div>
        </div>

        {/* Stage stepper */}
        <div className="mt-5 flex flex-wrap items-center gap-1">
          {RECON_STAGE_ORDER.map((stage, idx) => (
            <div key={stage} className="flex items-center gap-1">
              <div
                className={cn('rounded-md px-2.5 py-1 text-xs font-medium', {
                  'bg-primary text-primary-foreground': stage === unit.currentStage,
                  'bg-primary/20 text-primary': idx < stageIndex,
                  'bg-muted text-muted-foreground': idx > stageIndex,
                })}
              >
                {RECON_STAGE_LABELS[stage]}
              </div>
              {idx < RECON_STAGE_ORDER.length - 1 && <CaretRight className="h-3 w-3 text-muted-foreground" />}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Issues */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Known Issues</CardTitle>
              <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={() => setShowIssueForm(!showIssueForm)}>
                <Plus className="h-3.5 w-3.5" /> Add Issue
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {showIssueForm && (
              <div className="rounded-lg border bg-muted/40 p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 space-y-1">
                    <Label className="text-xs">Issue Title</Label>
                    <Input value={issueForm.title} onChange={(e) => setIssueForm((f) => ({ ...f, title: e.target.value }))} className="h-8 text-xs" placeholder="Describe the issue…" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Category</Label>
                    <Select value={issueForm.category} onValueChange={(v) => setIssueForm((f) => ({ ...f, category: v as CostCategory }))}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{COST_CATEGORIES.map((c) => <SelectItem key={c} value={c} className="text-xs">{COST_CATEGORY_LABELS[c]}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Severity</Label>
                    <Select value={issueForm.severity} onValueChange={(v) => setIssueForm((f) => ({ ...f, severity: v as IssueSeverity }))}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{ISSUE_SEVERITIES.map((s) => <SelectItem key={s} value={s} className="text-xs">{ISSUE_SEVERITY_LABELS[s]}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Est. Cost ($)</Label>
                    <Input value={issueForm.estimatedCost} onChange={(e) => setIssueForm((f) => ({ ...f, estimatedCost: e.target.value }))} className="h-8 text-xs" type="number" placeholder="0" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Assigned To</Label>
                    <Input value={issueForm.assignedTo} onChange={(e) => setIssueForm((f) => ({ ...f, assignedTo: e.target.value }))} className="h-8 text-xs" placeholder="Tech / vendor" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="h-7 text-xs" onClick={submitIssue}>Save Issue</Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowIssueForm(false)}>Cancel</Button>
                </div>
              </div>
            )}
            {unitIssues.length === 0 && !showIssueForm && (
              <p className="py-4 text-center text-xs text-muted-foreground">No issues logged</p>
            )}
            {unitIssues.map((issue) => (
              <div key={issue.id} className="flex items-start justify-between gap-3 rounded-lg border bg-card p-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{issue.title}</p>
                  {issue.description && <p className="text-xs text-muted-foreground">{issue.description}</p>}
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    <SeverityBadge severity={issue.severity} />
                    <Badge variant="outline" className="text-xs">{COST_CATEGORY_LABELS[issue.category]}</Badge>
                    <Badge variant="secondary" className="text-xs">{ISSUE_STATUS_LABELS[issue.status]}</Badge>
                    {issue.estimatedCost && <span className="text-xs text-muted-foreground">Est. {fmt.currency(issue.estimatedCost)}</span>}
                  </div>
                </div>
                <Select
                  value={issue.status}
                  onValueChange={(v) => updateIssue(issue.id, { status: v as IssueStatus, resolvedAt: v === 'resolved' ? new Date().toISOString() : undefined })}
                >
                  <SelectTrigger className="h-7 w-28 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(['open', 'in_progress', 'resolved', 'deferred'] as IssueStatus[]).map((s) => (
                      <SelectItem key={s} value={s} className="text-xs">{ISSUE_STATUS_LABELS[s]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Cost Ledger */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Cost Ledger</CardTitle>
              <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={() => setShowCostForm(!showCostForm)}>
                <Plus className="h-3.5 w-3.5" /> Add Cost
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {showCostForm && (
              <div className="rounded-lg border bg-muted/40 p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Category</Label>
                    <Select value={costForm.category} onValueChange={(v) => setCostForm((f) => ({ ...f, category: v as CostCategory }))}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{COST_CATEGORIES.map((c) => <SelectItem key={c} value={c} className="text-xs">{COST_CATEGORY_LABELS[c]}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Amount ($)</Label>
                    <Input value={costForm.amount} onChange={(e) => setCostForm((f) => ({ ...f, amount: e.target.value }))} type="number" className="h-8 text-xs" placeholder="0.00" />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label className="text-xs">Description</Label>
                    <Input value={costForm.description} onChange={(e) => setCostForm((f) => ({ ...f, description: e.target.value }))} className="h-8 text-xs" placeholder="What was done?" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Vendor</Label>
                    <Input value={costForm.vendor} onChange={(e) => setCostForm((f) => ({ ...f, vendor: e.target.value }))} className="h-8 text-xs" placeholder="Vendor name" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Date</Label>
                    <Input value={costForm.date} onChange={(e) => setCostForm((f) => ({ ...f, date: e.target.value }))} type="date" className="h-8 text-xs" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="h-7 text-xs" onClick={submitCost}>Save Entry</Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowCostForm(false)}>Cancel</Button>
                </div>
              </div>
            )}
            <div className="space-y-2">
              {unitCosts.length === 0 && !showCostForm && (
                <p className="py-4 text-center text-xs text-muted-foreground">No costs logged</p>
              )}
              {unitCosts.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between gap-2 rounded-lg border bg-card px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">{entry.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {COST_CATEGORY_LABELS[entry.category]}{entry.vendor ? ` · ${entry.vendor}` : ''}{entry.invoiceNumber ? ` · ${entry.invoiceNumber}` : ''} · {entry.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{fmt.currency(entry.amount)}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => removeCostEntry(entry.id)}>
                      <Trash className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
              {unitCosts.length > 0 && (
                <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2">
                  <span className="text-sm font-medium">Total Recon Cost</span>
                  <span className="text-base font-bold">{fmt.currency(totalCost)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Unit Notes</CardTitle></CardHeader>
        <CardContent>
          <Textarea
            value={unit.notes ?? ''}
            onChange={(e) => updateUnit(unit.id, { notes: e.target.value })}
            placeholder="Add notes about this unit's recon…"
            className="min-h-[80px] text-sm"
          />
        </CardContent>
      </Card>

      {/* Activity */}
      {unitActivity.length > 0 && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Activity Log</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {unitActivity.map((entry) => (
                <div key={entry.id} className="flex items-start gap-3 text-sm">
                  <div className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                  <div>
                    <span className="font-medium">{entry.action}</span>
                    {entry.performedBy && <span className="ml-1 text-muted-foreground">— {entry.performedBy}</span>}
                    <p className="text-xs text-muted-foreground">{new Date(entry.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ─── Issues Queue Tab ──────────────────────────────────────────────────────────

function IssuesQueueTab() {
  const { units, issues, updateIssue } = useReconRuntime()
  const [severityFilter, setSeverityFilter] = useState<IssueSeverity | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<IssueStatus | 'all'>('open')

  const filtered = useMemo(() => {
    let list = issues
    if (severityFilter !== 'all') list = list.filter((i) => i.severity === severityFilter)
    if (statusFilter !== 'all') list = list.filter((i) => i.status === statusFilter)
    return list
  }, [issues, severityFilter, statusFilter])

  const unitMap = useMemo(() => Object.fromEntries(units.map((u) => [u.id, u])), [units])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Select value={severityFilter} onValueChange={(v) => setSeverityFilter(v as IssueSeverity | 'all')}>
          <SelectTrigger className="h-8 w-36 text-xs"><SelectValue placeholder="Severity" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">All Severities</SelectItem>
            {ISSUE_SEVERITIES.map((s) => <SelectItem key={s} value={s} className="text-xs">{ISSUE_SEVERITY_LABELS[s]}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as IssueStatus | 'all')}>
          <SelectTrigger className="h-8 w-36 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">All Statuses</SelectItem>
            {(['open', 'in_progress', 'resolved', 'deferred'] as IssueStatus[]).map((s) => <SelectItem key={s} value={s} className="text-xs">{ISSUE_STATUS_LABELS[s]}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <StickyTableShell scrollOffset="22rem">
        <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Unit</TableHead>
                <TableHead>Issue</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Est. Cost</TableHead>
                <TableHead>Assigned</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">No issues found</TableCell>
                </TableRow>
              ) : (
                filtered.map((issue) => {
                  const unit = unitMap[issue.reconUnitId]
                  return (
                    <TableRow key={issue.id}>
                      <TableCell className="text-sm">
                        {unit ? `${unit.year} ${unit.make} ${unit.model}` : '—'}
                        {unit?.stockNumber && <div className="font-mono text-xs text-muted-foreground">{unit.stockNumber}</div>}
                      </TableCell>
                      <TableCell className="font-medium text-sm">{issue.title}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{COST_CATEGORY_LABELS[issue.category]}</Badge></TableCell>
                      <TableCell><SeverityBadge severity={issue.severity} /></TableCell>
                      <TableCell><Badge variant="secondary" className="text-xs">{ISSUE_STATUS_LABELS[issue.status]}</Badge></TableCell>
                      <TableCell>{issue.estimatedCost ? fmt.currency(issue.estimatedCost) : '—'}</TableCell>
                      <TableCell className="text-sm">{issue.assignedTo ?? '—'}</TableCell>
                      <TableCell>
                        <Select value={issue.status} onValueChange={(v) => updateIssue(issue.id, { status: v as IssueStatus })}>
                          <SelectTrigger className="h-7 w-28 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {(['open', 'in_progress', 'resolved', 'deferred'] as IssueStatus[]).map((s) => (
                              <SelectItem key={s} value={s} className="text-xs">{ISSUE_STATUS_LABELS[s]}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </StickyTableShell>
    </div>
  )
}

// ─── Cost Summary Tab ──────────────────────────────────────────────────────────

function CostSummaryTab() {
  const { units, costEntries } = useReconRuntime()

  const unitSummaries = useMemo(() => {
    return units.map((unit) => {
      const entries = costEntries.filter((c) => c.reconUnitId === unit.id)
      const totalCost = entries.reduce((s, c) => s + c.amount, 0)
      const byCategory: Partial<Record<CostCategory, number>> = {}
      for (const e of entries) {
        byCategory[e.category] = (byCategory[e.category] ?? 0) + e.amount
      }
      return { unit, totalCost, byCategory, costPerDay: unit.daysInRecon > 0 ? Math.round(totalCost / unit.daysInRecon) : 0 }
    }).sort((a, b) => b.totalCost - a.totalCost)
  }, [units, costEntries])

  const grandTotal = useMemo(() => unitSummaries.reduce((s, u) => s + u.totalCost, 0), [unitSummaries])

  const categoryTotals = useMemo(() => {
    const totals: Partial<Record<CostCategory, number>> = {}
    for (const e of costEntries) {
      totals[e.category] = (totals[e.category] ?? 0) + e.amount
    }
    return Object.entries(totals).sort(([, a], [, b]) => b - a) as [CostCategory, number][]
  }, [costEntries])

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Spend by Category</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {categoryTotals.length === 0 ? (
              <p className="text-sm text-muted-foreground">No cost data yet</p>
            ) : (
              categoryTotals.map(([cat, total]) => {
                const pct = grandTotal > 0 ? Math.round((total / grandTotal) * 100) : 0
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{COST_CATEGORY_LABELS[cat]}</span>
                      <span className="font-medium">{fmt.currency(total)} <span className="text-muted-foreground text-xs">({pct}%)</span></span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col gap-3">
            <div className="text-xs text-muted-foreground">Total Active Recon Spend</div>
            <div className="text-4xl font-bold">{fmt.currency(grandTotal)}</div>
            <Separator />
            <div className="text-xs text-muted-foreground">{units.length} units in recon</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Unit Cost Breakdown</CardTitle></CardHeader>
        <StickyTableShell scrollOffset="28rem" className="border-0 rounded-none bg-transparent">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Stock #</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Total Cost</TableHead>
                <TableHead>Cost/Day</TableHead>
                <TableHead>Floor Plan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unitSummaries.map(({ unit, totalCost, costPerDay }) => (
                <TableRow key={unit.id} className={cn(unit.daysInRecon > unit.targetDays ? 'bg-red-500/5' : '')}>
                  <TableCell className="font-mono text-xs">{unit.stockNumber ?? '—'}</TableCell>
                  <TableCell className="font-medium text-sm">{unit.year} {unit.make} {unit.model}</TableCell>
                  <TableCell><StageBadge stage={unit.currentStage} /></TableCell>
                  <TableCell><DaysBadge days={unit.daysInRecon} target={unit.targetDays} /></TableCell>
                  <TableCell className="font-semibold">{fmt.currency(totalCost)}</TableCell>
                  <TableCell className="text-sm">{unit.daysInRecon > 0 ? fmt.currency(costPerDay) : '—'}</TableCell>
                  <TableCell className="text-sm">{unit.floorPlanAccrued ? fmt.currency(unit.floorPlanAccrued) : '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </StickyTableShell>
      </Card>
    </div>
  )
}

// ─── Add Unit Tab ──────────────────────────────────────────────────────────────

function AddUnitTab({ onAdded }: { onAdded: () => void }) {
  const { createUnit } = useReconRuntime()
  const { records: inventoryRecords } = useInventoryCatalog()
  const [selectedInventoryId, setSelectedInventoryId] = useState('')
  const [form, setForm] = useState({
    stockNumber: '',
    year: String(new Date().getFullYear()),
    make: '',
    model: '',
    trim: '',
    color: '',
    vin: '',
    currentStage: 'intake' as ReconStage,
    assignedTech: '',
    targetDays: '7',
    floorPlanDailyRate: '',
    notes: '',
  })
  const [saved, setSaved] = useState(false)

  // When a canonical inventory unit is selected, pre-fill the form
  function handleInventorySelect(id: string) {
    setSelectedInventoryId(id)
    if (!id) return
    const inv = inventoryRecords.find((r) => r.id === id)
    if (!inv) return
    setForm((f) => ({
      ...f,
      stockNumber: inv.stockNumber || f.stockNumber,
      year: String(inv.year),
      make: inv.make,
      model: inv.model,
      trim: inv.trim || f.trim,
      color: inv.exteriorColor || inv.color || f.color,
      vin: inv.vin || f.vin,
    }))
  }

  function handleSubmit() {
    if (!form.year || !form.make || !form.model) return
    createUnit({
      inventoryUnitId: selectedInventoryId || undefined,
      stockNumber: form.stockNumber || undefined,
      year: parseInt(form.year),
      make: form.make,
      model: form.model,
      trim: form.trim || undefined,
      color: form.color || undefined,
      vin: form.vin || undefined,
      currentStage: form.currentStage,
      assignedTech: form.assignedTech || undefined,
      targetDays: parseInt(form.targetDays) || 7,
      floorPlanDailyRate: form.floorPlanDailyRate ? parseFloat(form.floorPlanDailyRate) : undefined,
      notes: form.notes || undefined,
    })
    setSaved(true)
    setTimeout(() => { setSaved(false); onAdded() }, 1000)
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Add Recon Unit</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {/* Canonical inventory link */}
          <div className="space-y-1">
            <Label className="text-xs">Link to Canonical Inventory Unit (recommended)</Label>
            <Select value={selectedInventoryId} onValueChange={handleInventorySelect}>
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select from inventory (auto-fills fields)" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="" className="text-xs text-muted-foreground">— Enter manually —</SelectItem>
                {inventoryRecords.map((r) => (
                  <SelectItem key={r.id} value={r.id} className="text-xs">
                    {r.year} {r.make} {r.model} {r.trim}{r.stockNumber ? ` [${r.stockNumber}]` : r.vin ? ` [${r.vin}]` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedInventoryId && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">✓ Linked to canonical inventory unit — recon costs will reference the master record.</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Stock Number', key: 'stockNumber', placeholder: 'A1055' },
              { label: 'VIN', key: 'vin', placeholder: 'Optional' },
              { label: 'Year *', key: 'year', placeholder: '2022' },
              { label: 'Make *', key: 'make', placeholder: 'Ford' },
              { label: 'Model *', key: 'model', placeholder: 'F-150' },
              { label: 'Trim', key: 'trim', placeholder: 'XLT' },
              { label: 'Color', key: 'color', placeholder: 'Oxford White' },
              { label: 'Assigned Tech', key: 'assignedTech', placeholder: 'Tech name' },
              { label: 'Target Days', key: 'targetDays', placeholder: '7' },
              { label: 'Floor Plan Daily Rate ($)', key: 'floorPlanDailyRate', placeholder: '12.00' },
            ].map(({ label, key, placeholder }) => (
              <div key={key} className="space-y-1">
                <Label className="text-xs">{label}</Label>
                <Input
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="h-8 text-xs"
                />
              </div>
            ))}
            <div className="space-y-1">
              <Label className="text-xs">Initial Stage</Label>
              <Select value={form.currentStage} onValueChange={(v) => setForm((f) => ({ ...f, currentStage: v as ReconStage }))}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{RECON_STAGES.map((s) => <SelectItem key={s} value={s} className="text-xs">{RECON_STAGE_LABELS[s]}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Notes</Label>
            <Textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Initial notes about this unit…" className="min-h-[80px] text-sm" />
          </div>
          <Button onClick={handleSubmit} className="gap-2" disabled={!form.year || !form.make || !form.model}>
            {saved ? <><CheckCircle className="h-4 w-4" /> Saved!</> : <><Plus className="h-4 w-4" /> Add Unit</>}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export function ReconPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedUnit, setSelectedUnit] = useState<ReconUnit | null>(null)

  function handleSelectUnit(unit: ReconUnit) {
    setSelectedUnit(unit)
    setActiveTab('detail')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fixed Ops / Recon</h1>
          <p className="mt-1 text-sm text-muted-foreground">Unit cost tracking, issue management, and recon stage pipeline</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-9">
          <TabsTrigger value="overview" className="text-xs gap-1.5"><ListBullets className="h-3.5 w-3.5" />Overview</TabsTrigger>
          <TabsTrigger value="detail" className="text-xs gap-1.5" disabled={!selectedUnit}><Wrench className="h-3.5 w-3.5" />Unit Detail</TabsTrigger>
          <TabsTrigger value="issues" className="text-xs gap-1.5"><WarningCircle className="h-3.5 w-3.5" />Issues Queue</TabsTrigger>
          <TabsTrigger value="costs" className="text-xs gap-1.5"><CurrencyDollar className="h-3.5 w-3.5" />Cost Summary</TabsTrigger>
          <TabsTrigger value="add" className="text-xs gap-1.5"><Plus className="h-3.5 w-3.5" />Add Unit</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <OverviewTab onSelectUnit={handleSelectUnit} />
        </TabsContent>

        <TabsContent value="detail" className="mt-6">
          {selectedUnit ? (
            <UnitDetailTab unit={selectedUnit} />
          ) : (
            <div className="py-16 text-center text-sm text-muted-foreground">
              Select a unit from the Overview tab to view its detail
            </div>
          )}
        </TabsContent>

        <TabsContent value="issues" className="mt-6">
          <IssuesQueueTab />
        </TabsContent>

        <TabsContent value="costs" className="mt-6">
          <CostSummaryTab />
        </TabsContent>

        <TabsContent value="add" className="mt-6">
          <AddUnitTab onAdded={() => setActiveTab('overview')} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
