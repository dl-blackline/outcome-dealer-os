import { useMemo, useState } from 'react'
import { usePlaybookRuntime } from '@/domains/playbook'
import type { CreateEntryInput } from '@/domains/playbook'
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
import { CalendarBlank, Plus, MagnifyingGlass, Trash } from '@phosphor-icons/react'
import { EntryStatusBadge, PriorityBadge, formatDate } from './playbook.ui'

export function MeetingsListPage() {
  const rt = usePlaybookRuntime()
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    playbookId: '',
    title: '',
    summary: '',
    body: '',
    discussedWith: '',
    nextStep: '',
    dueDate: '',
  })
  const [saving, setSaving] = useState(false)

  const playbooks = useMemo(() => rt.listPlaybooks(), [rt.version])

  const meetings = useMemo(() => {
    let list = rt.listEntries().filter((e) => e.type === 'meeting_note')
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.summary.toLowerCase().includes(q) ||
          e.discussedWith.some((d) => d.toLowerCase().includes(q)),
      )
    }
    return list
  }, [rt.version, search])

  function openForm() {
    setForm({ playbookId: playbooks[0]?.id ?? '', title: '', summary: '', body: '', discussedWith: '', nextStep: '', dueDate: '' })
    setShowForm(true)
  }

  function handleSave() {
    if (!form.title.trim() || !form.playbookId) return
    setSaving(true)
    rt.createEntry({
      playbookId: form.playbookId,
      title: form.title,
      type: 'meeting_note',
      summary: form.summary,
      body: form.body,
      discussedWith: form.discussedWith ? form.discussedWith.split(',').map((s) => s.trim()).filter(Boolean) : [],
      nextStep: form.nextStep,
      dueDate: form.dueDate,
    })
    setSaving(false)
    setShowForm(false)
  }

  return (
    <div className="space-y-6 pb-8">
      <SectionHeader
        title="Meetings"
        description="Meeting notes, recap summaries, and follow-ups."
        action={
          <Button onClick={openForm} className="gap-2">
            <Plus className="h-4 w-4" /> Log Meeting
          </Button>
        }
      />

      <div className="relative max-w-sm">
        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search meetings…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {meetings.length === 0 ? (
        <EmptyState
          icon={<CalendarBlank size={40} />}
          title="No meeting notes yet"
          description="Log your first meeting to keep track of who you talked to and what was discussed."
          action={<Button onClick={openForm} className="gap-2"><Plus className="h-4 w-4" /> Log Meeting</Button>}
        />
      ) : (
        <div className="space-y-3">
          {meetings.map((m) => {
            const pb = playbooks.find((p) => p.id === m.playbookId)
            return (
              <Card key={m.id}>
                <CardContent className="pt-4 pb-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <EntryStatusBadge status={m.status} />
                        <PriorityBadge priority={m.priority} />
                      </div>
                      <h3 className="font-semibold text-sm">{m.title}</h3>
                      {m.summary && <p className="text-xs text-muted-foreground mt-0.5">{m.summary}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-muted-foreground">{formatDate(m.createdAt)}</span>
                      <button
                        type="button"
                        onClick={() => rt.deleteEntry(m.id)}
                        className="text-muted-foreground/50 hover:text-destructive transition-colors"
                        aria-label="Delete meeting"
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  {m.discussedWith.length > 0 && (
                    <p className="text-xs text-muted-foreground">With: {m.discussedWith.join(', ')}</p>
                  )}
                  {m.body && (
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4">{m.body}</p>
                  )}
                  {m.nextStep && (
                    <p className="text-xs font-medium text-primary">Next: {m.nextStep}</p>
                  )}
                  {pb && (
                    <p className="text-xs text-muted-foreground border-t pt-1 mt-1">Playbook: {pb.title}</p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Log Meeting</DialogTitle>
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
              <Input placeholder="e.g. Weekly Sales Manager Sync" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Attendees (comma separated)</Label>
              <Input placeholder="e.g. John, Sarah, GM" value={form.discussedWith} onChange={(e) => setForm((f) => ({ ...f, discussedWith: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Summary</Label>
              <Input placeholder="One line summary" value={form.summary} onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Notes / Body</Label>
              <Textarea placeholder="What was discussed? Key points, decisions, context…" rows={5} value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Next Step</Label>
              <Input placeholder="What happens next?" value={form.nextStep} onChange={(e) => setForm((f) => ({ ...f, nextStep: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Follow-up Date</Label>
              <Input type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.title.trim() || !form.playbookId}>
              {saving ? 'Saving…' : 'Save Meeting'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
