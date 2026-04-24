import { useMemo, useState } from 'react'
import { usePlaybookRuntime } from '@/domains/playbook'
import type { CreatePlaybookInput, PlaybookCategory, PlaybookStatus } from '@/domains/playbook'
import { PLAYBOOK_CATEGORIES, PLAYBOOK_STATUSES } from '@/domains/playbook'
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
import { BookOpen, Plus, MagnifyingGlass, Trash } from '@phosphor-icons/react'
import { PlaybookStatusBadge, PriorityBadge, formatDate } from './playbook.ui'

const EMPTY_FORM: CreatePlaybookInput = {
  title: '',
  description: '',
  category: 'operations',
  owner: '',
  visibility: 'private',
  status: 'active',
  priority: 'medium',
  tags: [],
}

export function PlaybooksListPage() {
  const rt = usePlaybookRuntime()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<PlaybookStatus | 'all'>('all')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<CreatePlaybookInput>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const playbooks = useMemo(() => {
    let list = rt.listPlaybooks()
    if (statusFilter !== 'all') list = list.filter((p) => p.status === statusFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q),
      )
    }
    return list
  }, [rt.version, search, statusFilter])

  function openForm() {
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.title.trim()) return
    setSaving(true)
    rt.createPlaybook(form)
    setSaving(false)
    setShowForm(false)
  }

  return (
    <div className="space-y-6 pb-8">
      <SectionHeader
        title="Playbooks"
        description="Strategy and operational playbooks for the dealership."
        action={
          <Button onClick={openForm} className="gap-2">
            <Plus className="h-4 w-4" /> New Playbook
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search playbooks…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as PlaybookStatus | 'all')}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {(Object.keys(PLAYBOOK_STATUSES) as PlaybookStatus[]).map((s) => (
              <SelectItem key={s} value={s}>{PLAYBOOK_STATUSES[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {playbooks.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={40} />}
          title="No playbooks yet"
          description="Create your first playbook to start organizing strategies and projects."
          action={<Button onClick={openForm} className="gap-2"><Plus className="h-4 w-4" /> New Playbook</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {playbooks.map((pb) => (
            <Card key={pb.id} className="flex flex-col">
              <CardContent className="flex flex-col gap-3 pt-5 pb-4 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-sm leading-snug">{pb.title}</h3>
                  <PlaybookStatusBadge status={pb.status} />
                </div>
                {pb.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{pb.description}</p>
                )}
                <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
                  <span className="text-xs bg-muted rounded px-2 py-0.5">{PLAYBOOK_CATEGORIES[pb.category as PlaybookCategory]}</span>
                  <PriorityBadge priority={pb.priority} />
                </div>
                <div className="flex items-center justify-between pt-1 border-t">
                  <span className="text-xs text-muted-foreground">
                    {pb.owner || 'Unassigned'} · {formatDate(pb.createdAt)}
                  </span>
                  <button
                    type="button"
                    onClick={() => rt.deletePlaybook(pb.id)}
                    className="text-muted-foreground/50 hover:text-destructive transition-colors"
                    aria-label="Delete playbook"
                  >
                    <Trash className="h-3.5 w-3.5" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Playbook</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input
                placeholder="e.g. Sales Floor Standard Operating Procedures"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                placeholder="What is this playbook for?"
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm((f) => ({ ...f, category: v as PlaybookCategory }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.entries(PLAYBOOK_CATEGORIES) as [PlaybookCategory, string][]).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) => setForm((f) => ({ ...f, priority: v as CreatePlaybookInput['priority'] }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Owner</Label>
                <Input
                  placeholder="Name or role"
                  value={form.owner}
                  onChange={(e) => setForm((f) => ({ ...f, owner: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Visibility</Label>
                <Select
                  value={form.visibility}
                  onValueChange={(v) => setForm((f) => ({ ...f, visibility: v as CreatePlaybookInput['visibility'] }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="restricted">Restricted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.title.trim()}>
              {saving ? 'Saving…' : 'Create Playbook'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
