import { useMemo, useState } from 'react'
import { usePlaybookRuntime } from '@/domains/playbook'
import type { CreateDecisionInput, DecisionStatus } from '@/domains/playbook'
import { SectionHeader } from '@/components/core/SectionHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { EmptyState } from '@/components/core/EmptyState'
import { Gavel, Plus, MagnifyingGlass, Trash } from '@phosphor-icons/react'
import { DecisionStatusBadge, formatDate } from './playbook.ui'

const DECISION_STATUS_LABELS: Record<DecisionStatus, string> = {
  proposed: 'Proposed',
  decided: 'Decided',
  implemented: 'Implemented',
  reversed: 'Reversed',
}

export function DecisionsListPage() {
  const rt = usePlaybookRuntime()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<DecisionStatus | 'all'>('all')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    playbookId: '',
    title: '',
    summary: '',
    rationale: '',
    decidedBy: '',
    dateDecided: new Date().toISOString().slice(0, 10),
    status: 'decided' as DecisionStatus,
    impacts: '',
  })
  const [saving, setSaving] = useState(false)

  const playbooks = useMemo(() => rt.listPlaybooks(), [rt.version])

  const decisions = useMemo(() => {
    let list = rt.listDecisions()
    if (statusFilter !== 'all') list = list.filter((d) => d.status === statusFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.summary.toLowerCase().includes(q) ||
          d.decidedBy.toLowerCase().includes(q),
      )
    }
    return list
  }, [rt.version, search, statusFilter])

  function openForm() {
    setForm({
      playbookId: playbooks[0]?.id ?? '',
      title: '',
      summary: '',
      rationale: '',
      decidedBy: '',
      dateDecided: new Date().toISOString().slice(0, 10),
      status: 'decided',
      impacts: '',
    })
    setShowForm(true)
  }

  function handleSave() {
    if (!form.title.trim() || !form.playbookId) return
    setSaving(true)
    rt.createDecision({
      playbookId: form.playbookId,
      title: form.title,
      summary: form.summary,
      rationale: form.rationale,
      decidedBy: form.decidedBy,
      dateDecided: form.dateDecided,
      status: form.status,
      impacts: form.impacts ? form.impacts.split(',').map((s) => s.trim()).filter(Boolean) : [],
    })
    setSaving(false)
    setShowForm(false)
  }

  return (
    <div className="space-y-6 pb-8">
      <SectionHeader
        title="Decisions"
        description="Recorded decisions, rationale, and affected areas."
        action={
          <Button onClick={openForm} className="gap-2">
            <Plus className="h-4 w-4" /> Record Decision
          </Button>
        }
      />

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search decisions…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as DecisionStatus | 'all')}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {(Object.keys(DECISION_STATUS_LABELS) as DecisionStatus[]).map((s) => (
              <SelectItem key={s} value={s}>{DECISION_STATUS_LABELS[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {decisions.length === 0 ? (
        <EmptyState
          icon={<Gavel size={40} />}
          title="No decisions recorded"
          description="Record key decisions to maintain a clear decision log with rationale."
          action={<Button onClick={openForm} className="gap-2"><Plus className="h-4 w-4" /> Record Decision</Button>}
        />
      ) : (
        <div className="space-y-3">
          {decisions.map((d) => {
            const pb = playbooks.find((p) => p.id === d.playbookId)
            return (
              <Card key={d.id}>
                <CardContent className="pt-4 pb-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <DecisionStatusBadge status={d.status} />
                        <span className="text-xs text-muted-foreground">{d.dateDecided}</span>
                      </div>
                      <h3 className="font-semibold text-sm">{d.title}</h3>
                      {d.summary && <p className="text-xs text-muted-foreground mt-0.5">{d.summary}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => rt.deleteDecision(d.id)}
                        className="text-muted-foreground/50 hover:text-destructive transition-colors"
                        aria-label="Delete decision"
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  {d.rationale && (
                    <p className="text-xs text-muted-foreground">Rationale: {d.rationale}</p>
                  )}
                  {d.decidedBy && (
                    <p className="text-xs text-muted-foreground">Decided by: {d.decidedBy}</p>
                  )}
                  {d.impacts.length > 0 && (
                    <p className="text-xs text-muted-foreground">Impacts: {d.impacts.join(', ')}</p>
                  )}
                  {pb && (
                    <p className="text-xs text-muted-foreground border-t pt-1 mt-1">Playbook: {pb.title}</p>
                  )}
                  <div className="flex gap-2 pt-1">
                    {d.status !== 'implemented' && (
                      <Button size="sm" variant="outline" onClick={() => rt.updateDecision(d.id, { status: 'implemented' })}>
                        Mark Implemented
                      </Button>
                    )}
                    {d.status !== 'reversed' && (
                      <Button size="sm" variant="outline" onClick={() => rt.updateDecision(d.id, { status: 'reversed' })}>
                        Mark Reversed
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Record a Decision</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Playbook *</Label>
              <Select value={form.playbookId} onValueChange={(v) => setForm((f) => ({ ...f, playbookId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select a playbook" /></SelectTrigger>
                <SelectContent>
                  {playbooks.map((pb) => (
                    <SelectItem key={pb.id} value={pb.id}>{pb.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input placeholder="What was decided?" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Decision Summary *</Label>
              <Textarea placeholder="Describe the decision clearly…" rows={3} value={form.summary} onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Rationale</Label>
              <Textarea placeholder="Why was this decision made?" rows={2} value={form.rationale} onChange={(e) => setForm((f) => ({ ...f, rationale: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Decided By</Label>
                <Input placeholder="Name or role" value={form.decidedBy} onChange={(e) => setForm((f) => ({ ...f, decidedBy: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Date Decided</Label>
                <Input type="date" value={form.dateDecided} onChange={(e) => setForm((f) => ({ ...f, dateDecided: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as DecisionStatus }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.entries(DECISION_STATUS_LABELS) as [DecisionStatus, string][]).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Impacts / Affected Areas (comma separated)</Label>
              <Input placeholder="e.g. Sales, Finance, Customer Experience" value={form.impacts} onChange={(e) => setForm((f) => ({ ...f, impacts: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.title.trim() || !form.playbookId}>
              {saving ? 'Saving…' : 'Save Decision'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
