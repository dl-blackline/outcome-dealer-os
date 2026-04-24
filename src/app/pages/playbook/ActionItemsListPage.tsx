import { useMemo, useState } from 'react'
import { usePlaybookRuntime } from '@/domains/playbook'
import type { CreateActionItemInput, ActionItemStatus, ActionItemPriority } from '@/domains/playbook'
import { PLAYBOOK_ACTION_ITEM_STATUSES } from '@/domains/playbook'
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
import { CheckSquare, Plus, MagnifyingGlass, Trash, CheckCircle } from '@phosphor-icons/react'
import { ActionItemStatusBadge, PriorityBadge, formatDate } from './playbook.ui'
import { cn } from '@/lib/utils'

export function ActionItemsListPage() {
  const rt = usePlaybookRuntime()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ActionItemStatus | 'all'>('open')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    playbookId: '',
    title: '',
    description: '',
    owner: '',
    dueDate: '',
    priority: 'medium' as ActionItemPriority,
    status: 'open' as ActionItemStatus,
  })
  const [saving, setSaving] = useState(false)

  const playbooks = useMemo(() => rt.listPlaybooks(), [rt.version])
  const today = new Date().toISOString().slice(0, 10)

  const items = useMemo(() => {
    let list = rt.listActionItems()
    if (statusFilter !== 'all') list = list.filter((a) => a.status === statusFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.owner.toLowerCase().includes(q) ||
          a.description?.toLowerCase().includes(q),
      )
    }
    return list
  }, [rt.version, search, statusFilter])

  const openCount = useMemo(
    () => rt.listActionItems().filter((a) => a.status === 'open' || a.status === 'in_progress').length,
    [rt.version],
  )

  function openForm() {
    setForm({ playbookId: playbooks[0]?.id ?? '', title: '', description: '', owner: '', dueDate: '', priority: 'medium', status: 'open' })
    setShowForm(true)
  }

  function handleSave() {
    if (!form.title.trim() || !form.playbookId) return
    setSaving(true)
    rt.createActionItem(form)
    setSaving(false)
    setShowForm(false)
  }

  return (
    <div className="space-y-6 pb-8">
      <SectionHeader
        title="Action Items"
        description={`${openCount} open action item${openCount !== 1 ? 's' : ''} across all playbooks.`}
        action={
          <Button onClick={openForm} className="gap-2">
            <Plus className="h-4 w-4" /> New Action Item
          </Button>
        }
      />

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search action items…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ActionItemStatus | 'all')}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {(Object.keys(PLAYBOOK_ACTION_ITEM_STATUSES) as ActionItemStatus[]).map((s) => (
              <SelectItem key={s} value={s}>{PLAYBOOK_ACTION_ITEM_STATUSES[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={<CheckSquare size={40} />}
          title={statusFilter === 'open' ? 'No open action items' : 'No action items'}
          description="Create action items to track follow-through across playbooks and projects."
          action={<Button onClick={openForm} className="gap-2"><Plus className="h-4 w-4" /> New Action Item</Button>}
        />
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const pb = playbooks.find((p) => p.id === item.playbookId)
            const isOverdue = item.dueDate && item.dueDate < today && item.status !== 'completed' && item.status !== 'cancelled'
            return (
              <Card key={item.id} className={cn(isOverdue && 'border-destructive/40')}>
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => rt.updateActionItem(item.id, { status: item.status === 'completed' ? 'open' : 'completed' })}
                      className="mt-0.5 text-muted-foreground hover:text-green-600 transition-colors shrink-0"
                      aria-label="Toggle completion"
                    >
                      <CheckCircle
                        className={cn('h-5 w-5', item.status === 'completed' && 'text-green-600 fill-green-100')}
                        weight={item.status === 'completed' ? 'fill' : 'regular'}
                      />
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className={cn('text-sm font-medium', item.status === 'completed' && 'line-through text-muted-foreground')}>
                          {item.title}
                        </span>
                        <ActionItemStatusBadge status={item.status} />
                        <PriorityBadge priority={item.priority} />
                      </div>
                      {item.description && (
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      )}
                      <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                        {item.owner && <span>Owner: {item.owner}</span>}
                        {item.dueDate && (
                          <span className={cn(isOverdue && 'text-destructive font-medium')}>
                            Due: {item.dueDate}{isOverdue ? ' ⚠ Overdue' : ''}
                          </span>
                        )}
                        {pb && <span>Playbook: {pb.title}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {item.status === 'open' && (
                        <Button size="sm" variant="ghost" onClick={() => rt.updateActionItem(item.id, { status: 'in_progress' })} className="h-7 text-xs">
                          Start
                        </Button>
                      )}
                      <button
                        type="button"
                        onClick={() => rt.deleteActionItem(item.id)}
                        className="text-muted-foreground/50 hover:text-destructive transition-colors"
                        aria-label="Delete action item"
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Action Item</DialogTitle>
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
              <Input placeholder="What needs to be done?" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea placeholder="Additional context or details…" rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Owner</Label>
                <Input placeholder="Who's responsible?" value={form.owner} onChange={(e) => setForm((f) => ({ ...f, owner: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Due Date</Label>
                <Input type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={(v) => setForm((f) => ({ ...f, priority: v as ActionItemPriority }))}>
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
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as ActionItemStatus }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.entries(PLAYBOOK_ACTION_ITEM_STATUSES) as [ActionItemStatus, string][]).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.title.trim() || !form.playbookId}>
              {saving ? 'Saving…' : 'Create Action Item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
