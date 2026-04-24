import { useMemo, useState } from 'react'
import { usePlaybookRuntime } from '@/domains/playbook'
import type { CreateEntryInput, EntryType, EntryPriority, EntryStatus } from '@/domains/playbook'
import { ENTRY_TYPES, ENTRY_STATUSES, DEPARTMENTS } from '@/domains/playbook'
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
import { Note, Plus, MagnifyingGlass, Trash, Funnel } from '@phosphor-icons/react'
import { EntryTypeBadge, EntryStatusBadge, PriorityBadge, formatRelative } from './playbook.ui'

const EMPTY_FORM: Omit<CreateEntryInput, 'playbookId'> & { playbookId: string } = {
  playbookId: '',
  projectId: '',
  title: '',
  type: 'idea',
  summary: '',
  body: '',
  discussedWith: [],
  peopleMentioned: [],
  department: '',
  tags: [],
  priority: 'medium',
  status: 'open',
  nextStep: '',
  dueDate: '',
  createdBy: '',
}

export function NotesListPage() {
  const rt = usePlaybookRuntime()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<EntryType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<EntryStatus | 'all'>('all')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [discussedWithText, setDiscussedWithText] = useState('')
  const [saving, setSaving] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const playbooks = useMemo(() => rt.listPlaybooks(), [rt.version])
  const projects = useMemo(() => rt.listProjects(), [rt.version])

  const entries = useMemo(() => {
    let list = rt.listEntries()
    if (typeFilter !== 'all') list = list.filter((e) => e.type === typeFilter)
    if (statusFilter !== 'all') list = list.filter((e) => e.status === statusFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.summary.toLowerCase().includes(q) ||
          e.body?.toLowerCase().includes(q) ||
          e.discussedWith.some((d) => d.toLowerCase().includes(q)),
      )
    }
    return list
  }, [rt.version, search, typeFilter, statusFilter])

  function openForm() {
    setForm({ ...EMPTY_FORM, playbookId: playbooks[0]?.id ?? '' })
    setDiscussedWithText('')
    setShowForm(true)
  }

  function handleSave() {
    if (!form.title.trim() || !form.playbookId) return
    setSaving(true)
    rt.createEntry({
      ...form,
      discussedWith: discussedWithText ? discussedWithText.split(',').map((s) => s.trim()).filter(Boolean) : [],
    })
    setSaving(false)
    setShowForm(false)
  }

  function handleConvertToAction(entryId: string, entryTitle: string, playbookId: string) {
    rt.createActionItem({
      playbookId,
      sourceEntryId: entryId,
      title: entryTitle,
    })
    rt.updateEntry(entryId, { status: 'converted' })
  }

  function handleConvertToDecision(entryId: string, entryTitle: string, playbookId: string) {
    rt.createDecision({
      playbookId,
      title: entryTitle,
      summary: '',
    })
    rt.updateEntry(entryId, { status: 'converted' })
  }

  const filteredProjects = useMemo(
    () => projects.filter((p) => p.playbookId === form.playbookId),
    [projects, form.playbookId],
  )

  return (
    <div className="space-y-6 pb-8">
      <SectionHeader
        title="Notes & Entries"
        description="Capture ideas, issues, observations, and meeting notes."
        action={
          <Button onClick={openForm} className="gap-2">
            <Plus className="h-4 w-4" /> New Entry
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search entries…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as EntryType | 'all')}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {(Object.entries(ENTRY_TYPES) as [EntryType, string][]).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as EntryStatus | 'all')}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {(Object.entries(ENTRY_STATUSES) as [EntryStatus, string][]).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {entries.length === 0 ? (
        <EmptyState
          icon={<Note size={40} />}
          title="No entries yet"
          description="Capture your first note, idea, or observation to get started."
          action={<Button onClick={openForm} className="gap-2"><Plus className="h-4 w-4" /> New Entry</Button>}
        />
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => {
            const isExpanded = expandedId === entry.id
            const pb = playbooks.find((p) => p.id === entry.playbookId)
            return (
              <Card key={entry.id} className="overflow-hidden">
                <CardContent className="pt-4 pb-3 space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <EntryTypeBadge type={entry.type} />
                        <EntryStatusBadge status={entry.status} />
                        <PriorityBadge priority={entry.priority} />
                      </div>
                      <h3
                        className="font-semibold text-sm cursor-pointer hover:text-primary transition-colors"
                        onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                      >
                        {entry.title}
                      </h3>
                      {entry.summary && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{entry.summary}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-muted-foreground">{formatRelative(entry.createdAt)}</span>
                      <button
                        type="button"
                        onClick={() => rt.deleteEntry(entry.id)}
                        className="text-muted-foreground/50 hover:text-destructive transition-colors"
                        aria-label="Delete entry"
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="pt-2 border-t space-y-3">
                      {entry.body && (
                        <p className="text-sm whitespace-pre-wrap">{entry.body}</p>
                      )}
                      {entry.discussedWith.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Discussed with: {entry.discussedWith.join(', ')}
                        </p>
                      )}
                      {entry.nextStep && (
                        <p className="text-xs font-medium text-primary">Next step: {entry.nextStep}</p>
                      )}
                      {entry.dueDate && (
                        <p className="text-xs text-muted-foreground">Due: {entry.dueDate}</p>
                      )}
                      {pb && (
                        <p className="text-xs text-muted-foreground">Playbook: {pb.title}</p>
                      )}
                      <div className="flex flex-wrap gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleConvertToAction(entry.id, entry.title, entry.playbookId)}
                          disabled={entry.status === 'converted'}
                        >
                          → Action Item
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleConvertToDecision(entry.id, entry.title, entry.playbookId)}
                          disabled={entry.status === 'converted'}
                        >
                          → Decision
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => rt.updateEntry(entry.id, { status: 'resolved' })}
                          disabled={entry.status === 'resolved'}
                        >
                          Resolve
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Playbook *</Label>
              <Select
                value={form.playbookId}
                onValueChange={(v) => setForm((f) => ({ ...f, playbookId: v, projectId: '' }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a playbook" />
                </SelectTrigger>
                <SelectContent>
                  {playbooks.map((pb) => (
                    <SelectItem key={pb.id} value={pb.id}>{pb.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {filteredProjects.length > 0 && (
              <div className="space-y-1.5">
                <Label>Project (optional)</Label>
                <Select
                  value={form.projectId ?? ''}
                  onValueChange={(v) => setForm((f) => ({ ...f, projectId: v === 'none' ? '' : v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="No project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No project</SelectItem>
                    {filteredProjects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Type *</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm((f) => ({ ...f, type: v as EntryType }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.entries(ENTRY_TYPES) as [EntryType, string][]).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input
                placeholder="What happened / what's the idea?"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Summary</Label>
              <Input
                placeholder="One line summary"
                value={form.summary}
                onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Details / Body</Label>
              <Textarea
                placeholder="Full notes, context, observations…"
                rows={4}
                value={form.body}
                onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Discussed With (comma separated)</Label>
              <Input
                placeholder="e.g. John, Sarah, GM"
                value={discussedWithText}
                onChange={(e) => setDiscussedWithText(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) => setForm((f) => ({ ...f, priority: v as EntryPriority }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Department</Label>
                <Select
                  value={form.department ?? ''}
                  onValueChange={(v) => setForm((f) => ({ ...f, department: v === 'none' ? '' : v }))}
                >
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {DEPARTMENTS.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Next Step</Label>
              <Input
                placeholder="What happens next?"
                value={form.nextStep}
                onChange={(e) => setForm((f) => ({ ...f, nextStep: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Due Date (optional)</Label>
              <Input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.title.trim() || !form.playbookId}>
              {saving ? 'Saving…' : 'Save Entry'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
