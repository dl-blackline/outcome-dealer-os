import { useMemo, useState } from 'react'
import {
  ArrowClockwise,
  Calendar,
  CheckCircle,
  ClipboardText,
  EnvelopeSimple,
  Funnel,
  HighlighterCircle,
  Plus,
  Printer,
  PushPin,
  WarningCircle,
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
import { StickyTableShell } from '@/components/core/StickyTableShell'
import {
  ACTION_ITEM_STATUSES,
  OPERATING_REVIEW_CATEGORIES,
  OPERATING_REVIEW_DEPARTMENTS,
  OPERATING_REVIEW_SEVERITIES,
  OPERATING_REVIEW_STATUSES,
  OPERATING_REVIEW_URGENCIES,
  type ActionItemStatus,
  type OperatingObservationCreateInput,
  type OperatingObservationRecord,
  type OperatingReviewSeverity,
} from '@/domains/ops-review/operatingReview.types'
import { useOperatingReviewRuntime } from '@/domains/ops-review/operatingReview.runtime'
import { cn } from '@/lib/utils'

type ViewMode = 'dashboard' | 'form' | 'review'
type ReportMode = 'current_filtered' | 'single' | 'meeting_summary' | 'unresolved'
type ReviewFilter = 'all' | 'reviewed' | 'pending'
type SortBy = 'newest' | 'severity' | 'follow_up'
type GroupBy = 'category' | 'severity'

const STATUS_DONE = new Set(['Resolved', 'Closed'])
const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: '2-digit',
})

const severityRank: Record<OperatingReviewSeverity, number> = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1,
}

interface ObservationDraft extends Omit<OperatingObservationCreateInput, 'actionItems'> {
  actionItems: {
    id: string
    title: string
    owner: string
    dueDate: string
    status: ActionItemStatus
    notes: string
  }[]
  tagsText: string
  evidenceText: string
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function makeDraft(): ObservationDraft {
  return {
    title: '',
    category: 'Other',
    department: 'Operations',
    locationArea: '',
    dateObserved: today(),
    observedBy: 'DL',
    severity: 'Medium',
    urgency: 'Soon',
    status: 'New',
    ownerAccountable: '',
    shortSummary: '',
    fullNotes: '',
    recommendation: '',
    impact: '',
    followUpNeeded: '',
    followUpDate: '',
    reviewedWithOwner: false,
    reviewMeetingDate: '',
    discussNextMeeting: false,
    tags: [],
    evidenceLinks: [],
    tagsText: '',
    evidenceText: '',
    pinned: false,
    actionItems: [],
  }
}

function formatDate(value?: string): string {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return DATE_FORMATTER.format(d)
}

function badgeTone(value: string): 'default' | 'destructive' | 'outline' | 'secondary' {
  if (value === 'Critical' || value === 'High') return 'destructive'
  if (value === 'Resolved' || value === 'Closed') return 'secondary'
  if (value === 'Discussed with Owner') return 'default'
  return 'outline'
}

function toDraft(record: OperatingObservationRecord): ObservationDraft {
  return {
    title: record.title,
    category: record.category,
    department: record.department,
    locationArea: record.locationArea || '',
    dateObserved: record.dateObserved,
    observedBy: record.observedBy,
    severity: record.severity,
    urgency: record.urgency,
    status: record.status,
    ownerAccountable: record.ownerAccountable || '',
    shortSummary: record.shortSummary,
    fullNotes: record.fullNotes || '',
    recommendation: record.recommendation || '',
    impact: record.impact || '',
    followUpNeeded: record.followUpNeeded || '',
    followUpDate: record.followUpDate || '',
    reviewedWithOwner: record.reviewedWithOwner,
    reviewMeetingDate: record.reviewMeetingDate || '',
    discussNextMeeting: record.discussNextMeeting,
    tags: record.tags,
    evidenceLinks: record.evidenceLinks,
    tagsText: record.tags.join(', '),
    evidenceText: record.evidenceLinks.join('\n'),
    pinned: record.pinned,
    actionItems: record.actionItems.map((item) => ({
      id: item.id,
      title: item.title,
      owner: item.owner,
      dueDate: item.dueDate || '',
      status: item.status,
      notes: item.notes || '',
    })),
  }
}

function parseTags(text: string): string[] {
  return text
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
}

function parseLines(text: string): string[] {
  return text
    .split('\n')
    .map((v) => v.trim())
    .filter(Boolean)
}

function summarizeFilters(params: {
  category: string
  severity: string
  status: string
  review: ReviewFilter
  from: string
  to: string
}): string {
  const parts: string[] = []
  if (params.category !== 'all') parts.push(`Category: ${params.category}`)
  if (params.severity !== 'all') parts.push(`Severity: ${params.severity}`)
  if (params.status !== 'all') parts.push(`Status: ${params.status}`)
  if (params.review !== 'all') parts.push(`Reviewed: ${params.review}`)
  if (params.from) parts.push(`From: ${params.from}`)
  if (params.to) parts.push(`To: ${params.to}`)
  return parts.length > 0 ? parts.join(' | ') : 'No filters applied'
}

function buildEmailSummary(title: string, filters: string, items: OperatingObservationRecord[]): string {
  const grouped = new Map<string, OperatingObservationRecord[]>()
  for (const item of items) {
    if (!grouped.has(item.category)) grouped.set(item.category, [])
    grouped.get(item.category)!.push(item)
  }

  const lines: string[] = []
  lines.push(`${title}`)
  lines.push(`Generated: ${new Date().toLocaleString()}`)
  lines.push(`Filters: ${filters}`)
  lines.push('')
  lines.push(`Total Findings: ${items.length}`)
  lines.push(`Critical: ${items.filter((i) => i.severity === 'Critical').length}`)
  lines.push(`Unresolved: ${items.filter((i) => !STATUS_DONE.has(i.status)).length}`)
  lines.push('')

  for (const [category, records] of grouped.entries()) {
    lines.push(`${category.toUpperCase()} (${records.length})`)
    for (const record of records) {
      lines.push(`- ${record.title}`)
      lines.push(`  Severity: ${record.severity} | Status: ${record.status}`)
      lines.push(`  Summary: ${record.shortSummary}`)
      if (record.ownerAccountable) lines.push(`  Owner: ${record.ownerAccountable}`)
      if (record.followUpDate) lines.push(`  Follow-up Date: ${record.followUpDate}`)
      if (record.followUpNeeded) lines.push(`  Follow-up: ${record.followUpNeeded}`)
      if (record.actionItems.length > 0) {
        lines.push('  Actions:')
        for (const action of record.actionItems) {
          lines.push(`    * ${action.title} (${action.status}) owner=${action.owner || 'TBD'} due=${action.dueDate || 'TBD'}`)
        }
      }
      lines.push('')
    }
  }

  return lines.join('\n')
}

function printHtml(title: string, filters: string, items: OperatingObservationRecord[]): string {
  const grouped = new Map<string, OperatingObservationRecord[]>()
  for (const item of items) {
    if (!grouped.has(item.category)) grouped.set(item.category, [])
    grouped.get(item.category)!.push(item)
  }

  const sections = Array.from(grouped.entries())
    .map(([category, records]) => {
      const cards = records
        .map((r) => {
          const actions =
            r.actionItems.length > 0
              ? `<ul>${r.actionItems
                  .map((a) => `<li>${a.title} (${a.status}) - Owner: ${a.owner || 'TBD'}${a.dueDate ? ` - Due: ${a.dueDate}` : ''}</li>`)
                  .join('')}</ul>`
              : '<p>No action items recorded.</p>'

          return `<article class="obs">
            <h4>${r.title}</h4>
            <p><strong>Severity:</strong> ${r.severity} | <strong>Status:</strong> ${r.status} | <strong>Date Observed:</strong> ${r.dateObserved}</p>
            <p><strong>Summary:</strong> ${r.shortSummary}</p>
            ${r.impact ? `<p><strong>Impact:</strong> ${r.impact}</p>` : ''}
            ${r.recommendation ? `<p><strong>Recommendation:</strong> ${r.recommendation}</p>` : ''}
            ${r.followUpNeeded ? `<p><strong>Follow-up:</strong> ${r.followUpNeeded}</p>` : ''}
            ${r.ownerAccountable ? `<p><strong>Owner:</strong> ${r.ownerAccountable}</p>` : ''}
            ${r.followUpDate ? `<p><strong>Follow-up Date:</strong> ${r.followUpDate}</p>` : ''}
            <div class="actions"><strong>Action Items</strong>${actions}</div>
          </article>`
        })
        .join('')

      return `<section><h3>${category}</h3>${cards}</section>`
    })
    .join('')

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 24px; color: #111; }
    h1 { margin: 0 0 6px; }
    h2 { margin: 0 0 16px; font-size: 14px; color: #555; font-weight: normal; }
    h3 { margin-top: 24px; border-bottom: 1px solid #ddd; padding-bottom: 6px; }
    .meta { margin: 0 0 16px; color: #555; font-size: 12px; }
    .obs { border: 1px solid #ddd; border-radius: 8px; padding: 12px; margin: 10px 0; break-inside: avoid; }
    .obs h4 { margin: 0 0 8px; }
    .obs p { margin: 6px 0; font-size: 13px; }
    .actions { margin-top: 8px; font-size: 13px; }
    ul { margin: 6px 0 0 18px; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <h2>Generated ${new Date().toLocaleString()}</h2>
  <p class="meta"><strong>Filters:</strong> ${filters}</p>
  ${sections}
</body>
</html>`
}

export function OperatingReviewPage() {
  const {
    records,
    loading,
    refresh,
    createObservation,
    updateObservation,
    deleteObservation,
    markReviewed,
    isSupabaseBacked,
  } = useOperatingReviewRuntime()

  const [viewMode, setViewMode] = useState<ViewMode>('dashboard')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<ObservationDraft>(makeDraft)
  const [saving, setSaving] = useState(false)

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('newest')

  const [reportMode, setReportMode] = useState<ReportMode>('current_filtered')
  const [singlePrintId, setSinglePrintId] = useState<string>('')
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const [emailTo, setEmailTo] = useState('')

  const [reviewMeetingDate, setReviewMeetingDate] = useState(today())
  const [reviewGroupBy, setReviewGroupBy] = useState<GroupBy>('category')
  const [reviewHighPriorityOnly, setReviewHighPriorityOnly] = useState(true)

  const filtersText = summarizeFilters({
    category: categoryFilter,
    severity: severityFilter,
    status: statusFilter,
    review: reviewFilter,
    from: dateFrom,
    to: dateTo,
  })

  const filteredRecords = useMemo(() => {
    const q = search.trim().toLowerCase()

    const next = records.filter((item) => {
      if (q) {
        const bucket = [
          item.title,
          item.category,
          item.department,
          item.shortSummary,
          item.ownerAccountable || '',
          item.tags.join(' '),
        ]
          .join(' ')
          .toLowerCase()
        if (!bucket.includes(q)) return false
      }

      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false
      if (severityFilter !== 'all' && item.severity !== severityFilter) return false
      if (statusFilter !== 'all' && item.status !== statusFilter) return false
      if (reviewFilter === 'reviewed' && !item.reviewedWithOwner) return false
      if (reviewFilter === 'pending' && item.reviewedWithOwner) return false
      if (dateFrom && item.dateObserved < dateFrom) return false
      if (dateTo && item.dateObserved > dateTo) return false
      return true
    })

    next.sort((a, b) => {
      if (sortBy === 'severity') return severityRank[b.severity] - severityRank[a.severity]
      if (sortBy === 'follow_up') return (a.followUpDate || '9999-12-31').localeCompare(b.followUpDate || '9999-12-31')
      return b.dateObserved.localeCompare(a.dateObserved)
    })

    return next
  }, [records, search, categoryFilter, severityFilter, statusFilter, reviewFilter, dateFrom, dateTo, sortBy])

  const executiveStats = useMemo(() => {
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - 7)
    const weekEnd = new Date(now)
    weekEnd.setDate(now.getDate() + 7)

    const unresolved = filteredRecords.filter((r) => !STATUS_DONE.has(r.status))
    const dueThisWeek = unresolved.filter((r) => {
      if (!r.followUpDate) return false
      const d = new Date(r.followUpDate)
      return d >= now && d <= weekEnd
    }).length
    const discussedThisWeek = filteredRecords.filter((r) => {
      if (!r.reviewMeetingDate) return false
      const d = new Date(r.reviewMeetingDate)
      return d >= weekStart && d <= now
    }).length

    return {
      total: filteredRecords.length,
      critical: filteredRecords.filter((r) => r.severity === 'Critical').length,
      unresolved: unresolved.length,
      dueThisWeek,
      discussedThisWeek,
    }
  }, [filteredRecords])

  const reviewItems = useMemo(() => {
    let items = filteredRecords.filter((item) => !STATUS_DONE.has(item.status))
    if (reviewHighPriorityOnly) {
      items = items.filter((item) => severityRank[item.severity] >= severityRank.High || item.discussNextMeeting)
    }
    return items
  }, [filteredRecords, reviewHighPriorityOnly])

  const groupedReviewItems = useMemo(() => {
    const map = new Map<string, OperatingObservationRecord[]>()
    for (const item of reviewItems) {
      const key = reviewGroupBy === 'category' ? item.category : item.severity
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(item)
    }
    return map
  }, [reviewItems, reviewGroupBy])

  const printItems = useMemo(() => {
    if (reportMode === 'current_filtered') return filteredRecords
    if (reportMode === 'single') return filteredRecords.filter((r) => r.id === singlePrintId)
    if (reportMode === 'meeting_summary') return reviewItems
    return filteredRecords.filter((r) => !STATUS_DONE.has(r.status))
  }, [reportMode, filteredRecords, singlePrintId, reviewItems])

  const reportTitle = useMemo(() => {
    if (reportMode === 'single') return 'Executive Observation - Single Item'
    if (reportMode === 'meeting_summary') return 'Executive Observation - Meeting Summary'
    if (reportMode === 'unresolved') return 'Executive Observation - Unresolved Findings'
    return 'Executive Observation - Current Filtered Set'
  }, [reportMode])

  const emailBody = useMemo(
    () => buildEmailSummary(reportTitle, filtersText, printItems),
    [reportTitle, filtersText, printItems],
  )

  const emailSubject = useMemo(() => {
    return `Outcome Dealer OS - ${reportTitle} (${new Date().toLocaleDateString()})`
  }, [reportTitle])

  function resetForm() {
    setDraft(makeDraft())
    setEditingId(null)
  }

  function openNew() {
    resetForm()
    setViewMode('form')
  }

  function openEdit(record: OperatingObservationRecord) {
    setDraft(toDraft(record))
    setEditingId(record.id)
    setViewMode('form')
  }

  async function saveDraft() {
    if (!draft.title.trim() || !draft.shortSummary.trim() || !draft.observedBy.trim()) return

    const payload: OperatingObservationCreateInput = {
      title: draft.title.trim(),
      category: draft.category,
      department: draft.department,
      locationArea: draft.locationArea || undefined,
      dateObserved: draft.dateObserved,
      observedBy: draft.observedBy.trim(),
      severity: draft.severity,
      urgency: draft.urgency,
      status: draft.status,
      ownerAccountable: draft.ownerAccountable || undefined,
      shortSummary: draft.shortSummary.trim(),
      fullNotes: draft.fullNotes || undefined,
      recommendation: draft.recommendation || undefined,
      impact: draft.impact || undefined,
      followUpNeeded: draft.followUpNeeded || undefined,
      followUpDate: draft.followUpDate || undefined,
      reviewedWithOwner: draft.reviewedWithOwner,
      reviewMeetingDate: draft.reviewMeetingDate || undefined,
      discussNextMeeting: draft.discussNextMeeting,
      tags: parseTags(draft.tagsText),
      evidenceLinks: parseLines(draft.evidenceText),
      pinned: draft.pinned,
      actionItems: draft.actionItems.map((item) => ({
        id: item.id,
        title: item.title,
        owner: item.owner,
        dueDate: item.dueDate || undefined,
        status: item.status,
        notes: item.notes || undefined,
      })),
    }

    setSaving(true)
    if (editingId) {
      await updateObservation(editingId, payload)
    } else {
      await createObservation(payload)
    }
    setSaving(false)

    resetForm()
    setViewMode('dashboard')
    await refresh()
  }

  async function removeEditing() {
    if (!editingId) return
    await deleteObservation(editingId)
    resetForm()
    setViewMode('dashboard')
    await refresh()
  }

  function openPrint() {
    const html = printHtml(reportTitle, filtersText, printItems)
    const w = window.open('', '_blank', 'width=1200,height=900')
    if (!w) return
    w.document.open()
    w.document.write(html)
    w.document.close()
    w.focus()
    w.print()
  }

  async function copyEmailSummary() {
    try {
      await navigator.clipboard.writeText(`Subject: ${emailSubject}\n\n${emailBody}`)
    } catch {
      // no-op
    }
  }

  function openMailto() {
    const href = `mailto:${encodeURIComponent(emailTo)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`
    window.location.href = href
  }

  async function quickMarkReviewed(item: OperatingObservationRecord) {
    await markReviewed(item.id, reviewMeetingDate)
    await refresh()
  }

  async function quickUpdate(item: OperatingObservationRecord, patch: Partial<OperatingObservationRecord>) {
    await updateObservation(item.id, {
      status: patch.status,
      ownerAccountable: patch.ownerAccountable,
      followUpNeeded: patch.followUpNeeded,
      followUpDate: patch.followUpDate,
      discussNextMeeting: patch.discussNextMeeting,
      reviewedWithOwner: patch.reviewedWithOwner,
      reviewMeetingDate: patch.reviewMeetingDate,
    })
    await refresh()
  }

  return (
    <div className="space-y-6 print:space-y-3">
      <header className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Executive Observation & Operating Review</h1>
          <p className="text-sm text-muted-foreground">
            Structured operating weakness tracking for recurring owner review meetings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant={viewMode === 'dashboard' ? 'default' : 'outline'} onClick={() => setViewMode('dashboard')}>
            Dashboard
          </Button>
          <Button variant={viewMode === 'review' ? 'default' : 'outline'} onClick={() => setViewMode('review')}>
            Review Mode
          </Button>
          <Button onClick={openNew} className="gap-2">
            <Plus size={16} />
            Add Observation
          </Button>
        </div>
      </header>

      <div className="grid gap-3 md:grid-cols-5 print:grid-cols-5">
        <Card><CardContent className="pt-5"><p className="text-xs text-muted-foreground">Total Findings</p><p className="text-2xl font-semibold">{executiveStats.total}</p></CardContent></Card>
        <Card><CardContent className="pt-5"><p className="text-xs text-muted-foreground">Critical Findings</p><p className="text-2xl font-semibold text-destructive">{executiveStats.critical}</p></CardContent></Card>
        <Card><CardContent className="pt-5"><p className="text-xs text-muted-foreground">Unresolved</p><p className="text-2xl font-semibold">{executiveStats.unresolved}</p></CardContent></Card>
        <Card><CardContent className="pt-5"><p className="text-xs text-muted-foreground">Due This Week</p><p className="text-2xl font-semibold">{executiveStats.dueThisWeek}</p></CardContent></Card>
        <Card><CardContent className="pt-5"><p className="text-xs text-muted-foreground">Discussed This Week</p><p className="text-2xl font-semibold">{executiveStats.discussedThisWeek}</p></CardContent></Card>
      </div>

      <Card className="print:hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Funnel size={16} />
            Filters, Reporting, and Export
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-7">
            <Input placeholder="Search title, summary, owner, tags..." value={search} onChange={(e) => setSearch(e.target.value)} className="md:col-span-2" />

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {OPERATING_REVIEW_CATEGORIES.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger><SelectValue placeholder="Severity" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                {OPERATING_REVIEW_SEVERITIES.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {OPERATING_REVIEW_STATUSES.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={reviewFilter} onValueChange={(v) => setReviewFilter(v as ReviewFilter)}>
              <SelectTrigger><SelectValue placeholder="Review" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Review States</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="pending">Pending Review</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
              <SelectTrigger><SelectValue placeholder="Sort" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="severity">Severity</SelectItem>
                <SelectItem value="follow_up">Follow-up Date</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <div className="space-y-1"><Label>Date From</Label><Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} /></div>
            <div className="space-y-1"><Label>Date To</Label><Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} /></div>
            <div className="space-y-1">
              <Label>Report Mode</Label>
              <Select value={reportMode} onValueChange={(v) => setReportMode(v as ReportMode)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="current_filtered">Current Filtered Set</SelectItem>
                  <SelectItem value="single">Single Observation</SelectItem>
                  <SelectItem value="meeting_summary">Meeting Summary</SelectItem>
                  <SelectItem value="unresolved">Unresolved Issues</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Single Observation</Label>
              <Select value={singlePrintId} onValueChange={setSinglePrintId}>
                <SelectTrigger><SelectValue placeholder="Select one" /></SelectTrigger>
                <SelectContent>
                  {filteredRecords.map((item) => <SelectItem key={item.id} value={item.id}>{item.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{filtersText}</Badge>
            <Badge variant={isSupabaseBacked ? 'default' : 'outline'}>
              Persistence: {isSupabaseBacked ? 'Supabase + Fallback' : 'Local Runtime'}
            </Badge>
            <Button variant="outline" className="ml-auto gap-2" onClick={() => void refresh()}>
              <ArrowClockwise size={16} /> Refresh
            </Button>
            <Button className="gap-2" onClick={openPrint}>
              <Printer size={16} /> Print Report
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => setEmailDialogOpen(true)}>
              <EnvelopeSimple size={16} /> Prepare Email Summary
            </Button>
          </div>
        </CardContent>
      </Card>

      {viewMode !== 'form' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Observation Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading observations...</div>
            ) : filteredRecords.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                No observations match these filters. Add one from the top-right button.
              </div>
            ) : (
              <StickyTableShell scrollOffset="26rem">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Follow-up</TableHead>
                      <TableHead>Reviewed</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map((item) => (
                      <TableRow key={item.id} className={cn(item.pinned && 'bg-primary/5')}>
                        <TableCell>{formatDate(item.dateObserved)}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            {item.pinned && <PushPin size={14} className="text-amber-500" />}
                            <span className="font-medium">{item.title}</span>
                          </div>
                        </TableCell>
                        <TableCell><Badge variant={badgeTone(item.severity)}>{item.severity}</Badge></TableCell>
                        <TableCell><Badge variant={badgeTone(item.status)}>{item.status}</Badge></TableCell>
                        <TableCell>{item.ownerAccountable || '-'}</TableCell>
                        <TableCell>{item.followUpDate ? formatDate(item.followUpDate) : '-'}</TableCell>
                        <TableCell>{item.reviewedWithOwner ? <CheckCircle size={18} className="text-emerald-500" /> : '-'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => openEdit(item)}>Edit</Button>
                            {viewMode === 'review' && !item.reviewedWithOwner && (
                              <Button size="sm" onClick={() => void quickMarkReviewed(item)}>Mark Reviewed</Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </StickyTableShell>
            )}
          </CardContent>
        </Card>
      )}

      {viewMode === 'review' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar size={16} />
              Owner Review Meeting Workspace
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-4">
              <div className="space-y-1"><Label>Meeting Date</Label><Input type="date" value={reviewMeetingDate} onChange={(e) => setReviewMeetingDate(e.target.value)} /></div>
              <div className="space-y-1">
                <Label>Group By</Label>
                <Select value={reviewGroupBy} onValueChange={(v) => setReviewGroupBy(v as GroupBy)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="category">Category</SelectItem>
                    <SelectItem value="severity">Severity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <label className="md:col-span-2 inline-flex items-center gap-2 mt-7 text-sm">
                <input type="checkbox" checked={reviewHighPriorityOnly} onChange={(e) => setReviewHighPriorityOnly(e.target.checked)} />
                Focus on unresolved high-priority findings or items flagged "discuss next meeting"
              </label>
            </div>

            {Array.from(groupedReviewItems.entries()).map(([group, items]) => (
              <div key={group} className="space-y-2 rounded-lg border p-3">
                <div className="font-medium">{group} ({items.length})</div>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="rounded-md border p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-medium">{item.title}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant={badgeTone(item.severity)}>{item.severity}</Badge>
                          <Badge variant={badgeTone(item.status)}>{item.status}</Badge>
                        </div>
                      </div>

                      <p className="mt-1 text-sm text-muted-foreground">{item.shortSummary}</p>

                      <div className="mt-3 grid gap-2 md:grid-cols-5">
                        <Input
                          defaultValue={item.ownerAccountable || ''}
                          placeholder="Owner"
                          onBlur={(e) => {
                            if (e.target.value !== (item.ownerAccountable || '')) {
                              void quickUpdate(item, { ownerAccountable: e.target.value })
                            }
                          }}
                        />
                        <Input
                          defaultValue={item.followUpDate || ''}
                          type="date"
                          onBlur={(e) => {
                            if (e.target.value !== (item.followUpDate || '')) {
                              void quickUpdate(item, { followUpDate: e.target.value })
                            }
                          }}
                        />
                        <Input
                          defaultValue={item.followUpNeeded || ''}
                          placeholder="Follow-up action"
                          onBlur={(e) => {
                            if (e.target.value !== (item.followUpNeeded || '')) {
                              void quickUpdate(item, { followUpNeeded: e.target.value })
                            }
                          }}
                        />
                        <Select
                          defaultValue={item.status}
                          onValueChange={(value) => {
                            if (value !== item.status) {
                              void quickUpdate(item, { status: value as OperatingObservationRecord['status'] })
                            }
                          }}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {OPERATING_REVIEW_STATUSES.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <Button variant="outline" onClick={() => void quickMarkReviewed(item)}>
                          Mark Reviewed
                        </Button>
                      </div>

                      <label className="mt-2 inline-flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          defaultChecked={item.discussNextMeeting}
                          onChange={(e) => void quickUpdate(item, { discussNextMeeting: e.target.checked })}
                        />
                        Discuss next meeting
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {viewMode === 'form' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{editingId ? 'Edit Observation' : 'New Observation'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-4">
              <div className="md:col-span-2 space-y-1"><Label>Title</Label><Input value={draft.title} onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Date Observed</Label><Input type="date" value={draft.dateObserved} onChange={(e) => setDraft((p) => ({ ...p, dateObserved: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Observed By</Label><Input value={draft.observedBy} onChange={(e) => setDraft((p) => ({ ...p, observedBy: e.target.value }))} /></div>
            </div>

            <div className="grid gap-3 md:grid-cols-4">
              <div className="space-y-1"><Label>Category</Label><Select value={draft.category} onValueChange={(v) => setDraft((p) => ({ ...p, category: v as ObservationDraft['category'] }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{OPERATING_REVIEW_CATEGORIES.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-1"><Label>Department</Label><Select value={draft.department} onValueChange={(v) => setDraft((p) => ({ ...p, department: v as ObservationDraft['department'] }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{OPERATING_REVIEW_DEPARTMENTS.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-1"><Label>Severity</Label><Select value={draft.severity} onValueChange={(v) => setDraft((p) => ({ ...p, severity: v as ObservationDraft['severity'] }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{OPERATING_REVIEW_SEVERITIES.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-1"><Label>Urgency</Label><Select value={draft.urgency} onValueChange={(v) => setDraft((p) => ({ ...p, urgency: v as ObservationDraft['urgency'] }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{OPERATING_REVIEW_URGENCIES.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></div>
            </div>

            <div className="grid gap-3 md:grid-cols-4">
              <div className="space-y-1"><Label>Status</Label><Select value={draft.status} onValueChange={(v) => setDraft((p) => ({ ...p, status: v as ObservationDraft['status'] }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{OPERATING_REVIEW_STATUSES.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-1"><Label>Location / Area</Label><Input value={draft.locationArea} onChange={(e) => setDraft((p) => ({ ...p, locationArea: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Owner / Accountable</Label><Input value={draft.ownerAccountable} onChange={(e) => setDraft((p) => ({ ...p, ownerAccountable: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Follow-up Date</Label><Input type="date" value={draft.followUpDate} onChange={(e) => setDraft((p) => ({ ...p, followUpDate: e.target.value }))} /></div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1"><Label>Short Summary</Label><Textarea rows={3} value={draft.shortSummary} onChange={(e) => setDraft((p) => ({ ...p, shortSummary: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Impact</Label><Textarea rows={3} value={draft.impact} onChange={(e) => setDraft((p) => ({ ...p, impact: e.target.value }))} /></div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1"><Label>Recommendation</Label><Textarea rows={3} value={draft.recommendation} onChange={(e) => setDraft((p) => ({ ...p, recommendation: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Follow-up Needed</Label><Textarea rows={3} value={draft.followUpNeeded} onChange={(e) => setDraft((p) => ({ ...p, followUpNeeded: e.target.value }))} /></div>
            </div>

            <div className="space-y-1"><Label>Full Notes</Label><Textarea rows={6} value={draft.fullNotes} onChange={(e) => setDraft((p) => ({ ...p, fullNotes: e.target.value }))} /></div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1"><Label>Tags (comma separated)</Label><Input value={draft.tagsText} onChange={(e) => setDraft((p) => ({ ...p, tagsText: e.target.value }))} placeholder="marketing, website, urgency" /></div>
              <div className="space-y-1"><Label>Evidence Links (one per line)</Label><Textarea rows={3} value={draft.evidenceText} onChange={(e) => setDraft((p) => ({ ...p, evidenceText: e.target.value }))} placeholder="https://example.com/screenshot1" /></div>
            </div>

            <div className="rounded-lg border p-3 space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-medium">Action Tracking</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setDraft((p) => ({
                      ...p,
                      actionItems: [
                        ...p.actionItems,
                        { id: crypto.randomUUID(), title: '', owner: '', dueDate: '', status: 'New', notes: '' },
                      ],
                    }))
                  }
                >
                  <Plus size={14} className="mr-1" /> Add Action
                </Button>
              </div>

              {draft.actionItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">No action items yet.</p>
              ) : (
                <div className="space-y-2">
                  {draft.actionItems.map((item, idx) => (
                    <div key={item.id} className="grid gap-2 md:grid-cols-6 rounded-md border p-2">
                      <Input className="md:col-span-2" placeholder="What needs to change" value={item.title} onChange={(e) => setDraft((p) => ({ ...p, actionItems: p.actionItems.map((a, i) => i === idx ? { ...a, title: e.target.value } : a) }))} />
                      <Input placeholder="Owner" value={item.owner} onChange={(e) => setDraft((p) => ({ ...p, actionItems: p.actionItems.map((a, i) => i === idx ? { ...a, owner: e.target.value } : a) }))} />
                      <Input type="date" value={item.dueDate} onChange={(e) => setDraft((p) => ({ ...p, actionItems: p.actionItems.map((a, i) => i === idx ? { ...a, dueDate: e.target.value } : a) }))} />
                      <Select value={item.status} onValueChange={(v) => setDraft((p) => ({ ...p, actionItems: p.actionItems.map((a, i) => i === idx ? { ...a, status: v as ActionItemStatus } : a) }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{ACTION_ITEM_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                      <Button variant="ghost" onClick={() => setDraft((p) => ({ ...p, actionItems: p.actionItems.filter((_, i) => i !== idx) }))}>Remove</Button>
                      <Textarea className="md:col-span-6" rows={2} placeholder="Follow-up notes" value={item.notes} onChange={(e) => setDraft((p) => ({ ...p, actionItems: p.actionItems.map((a, i) => i === idx ? { ...a, notes: e.target.value } : a) }))} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm">
              <label className="inline-flex items-center gap-2"><input type="checkbox" checked={draft.reviewedWithOwner} onChange={(e) => setDraft((p) => ({ ...p, reviewedWithOwner: e.target.checked }))} /> Reviewed with owner</label>
              <label className="inline-flex items-center gap-2"><input type="checkbox" checked={draft.pinned} onChange={(e) => setDraft((p) => ({ ...p, pinned: e.target.checked }))} /> Pin critical item</label>
              <label className="inline-flex items-center gap-2"><input type="checkbox" checked={draft.discussNextMeeting} onChange={(e) => setDraft((p) => ({ ...p, discussNextMeeting: e.target.checked }))} /> Discuss next meeting</label>
              <div className="inline-flex items-center gap-2"><span>Meeting Date</span><Input type="date" className="w-44" value={draft.reviewMeetingDate} onChange={(e) => setDraft((p) => ({ ...p, reviewMeetingDate: e.target.value }))} /></div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={() => void saveDraft()} disabled={saving || !draft.title.trim() || !draft.shortSummary.trim()}>
                {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Observation'}
              </Button>
              <Button variant="outline" onClick={() => setViewMode('dashboard')}>Cancel</Button>
              {editingId && <Button variant="destructive" onClick={() => void removeEditing()}>Delete</Button>}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><EnvelopeSimple size={18} /> Email-Ready Summary</DialogTitle>
            <DialogDescription>
              Generate owner-ready summary from the selected report mode. You can copy or open a mail draft.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1"><Label>Destination</Label><Input value={emailTo} onChange={(e) => setEmailTo(e.target.value)} placeholder="owner@dealership.com" /></div>
              <div className="space-y-1"><Label>Subject</Label><Input value={emailSubject} readOnly /></div>
            </div>
            <div className="space-y-1"><Label>Body</Label><Textarea rows={18} value={emailBody} readOnly className="font-mono text-xs" /></div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => void copyEmailSummary()} className="gap-2"><ClipboardText size={16} /> Copy to Clipboard</Button>
            <Button onClick={openMailto} disabled={!emailTo.trim()} className="gap-2"><EnvelopeSimple size={16} /> Open Mail Draft</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="hidden print:block">
        <h2 className="text-xl font-semibold">{reportTitle}</h2>
        <p className="text-xs text-muted-foreground">Generated {new Date().toLocaleString()}</p>
        <p className="mt-1 text-xs">Filters: {filtersText}</p>
        <div className="mt-4 space-y-2">
          {printItems.map((item) => (
            <div key={item.id} className="break-inside-avoid rounded border p-2">
              <div className="flex items-center gap-2">
                {item.severity === 'Critical' ? <WarningCircle size={15} className="text-destructive" /> : <HighlighterCircle size={15} />}
                <p className="font-medium">{item.title}</p>
              </div>
              <p className="text-xs">{item.category} | {item.severity} | {item.status} | Observed {formatDate(item.dateObserved)}</p>
              <p className="text-sm mt-1">{item.shortSummary}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
