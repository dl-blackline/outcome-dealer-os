import { useMemo, useState } from 'react'
import { usePlaybookRuntime } from '@/domains/playbook'
import type { CreateProjectInput, ProjectStatus } from '@/domains/playbook'
import { PROJECT_STATUSES } from '@/domains/playbook'
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
import { FolderOpen, Plus, MagnifyingGlass, Trash } from '@phosphor-icons/react'
import { ProjectStatusBadge, PriorityBadge, formatDate } from './playbook.ui'

const EMPTY_FORM: Omit<CreateProjectInput, 'playbookId'> & { playbookId: string } = {
  playbookId: '',
  title: '',
  description: '',
  objective: '',
  owner: '',
  status: 'planning',
  priority: 'medium',
  startDate: '',
  targetDate: '',
  nextMilestone: '',
}

export function ProjectsListPage() {
  const rt = usePlaybookRuntime()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const playbooks = useMemo(() => rt.listPlaybooks(), [rt.version])

  const projects = useMemo(() => {
    let list = rt.listProjects()
    if (statusFilter !== 'all') list = list.filter((p) => p.status === statusFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.objective.toLowerCase().includes(q),
      )
    }
    return list
  }, [rt.version, search, statusFilter])

  function openForm() {
    setForm({ ...EMPTY_FORM, playbookId: playbooks[0]?.id ?? '' })
    setShowForm(true)
  }

  function handleSave() {
    if (!form.title.trim() || !form.playbookId) return
    setSaving(true)
    rt.createProject(form)
    setSaving(false)
    setShowForm(false)
  }

  return (
    <div className="space-y-6 pb-8">
      <SectionHeader
        title="Projects"
        description="Active initiatives, campaigns, and operational projects."
        action={
          <Button onClick={openForm} className="gap-2">
            <Plus className="h-4 w-4" /> New Project
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ProjectStatus | 'all')}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {(Object.keys(PROJECT_STATUSES) as ProjectStatus[]).map((s) => (
              <SelectItem key={s} value={s}>{PROJECT_STATUSES[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {projects.length === 0 ? (
        <EmptyState
          icon={<FolderOpen size={40} />}
          title="No projects yet"
          description="Create a project to track initiatives, assign owners, and follow through."
          action={
            playbooks.length === 0 ? (
              <p className="text-sm text-muted-foreground">Create a playbook first, then add projects.</p>
            ) : (
              <Button onClick={openForm} className="gap-2"><Plus className="h-4 w-4" /> New Project</Button>
            )
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((proj) => {
            const pb = playbooks.find((p) => p.id === proj.playbookId)
            return (
              <Card key={proj.id}>
                <CardContent className="pt-5 pb-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-sm leading-snug">{proj.title}</h3>
                    <ProjectStatusBadge status={proj.status} />
                  </div>
                  {proj.objective && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{proj.objective}</p>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    {pb && <span className="text-xs bg-muted rounded px-2 py-0.5">{pb.title}</span>}
                    <PriorityBadge priority={proj.priority} />
                  </div>
                  {proj.targetDate && (
                    <p className="text-xs text-muted-foreground">Target: {proj.targetDate}</p>
                  )}
                  {proj.nextMilestone && (
                    <p className="text-xs text-primary/80 font-medium">Next: {proj.nextMilestone}</p>
                  )}
                  {proj.blockers && (
                    <p className="text-xs text-destructive">⚠ {proj.blockers}</p>
                  )}
                  <div className="flex items-center justify-between pt-1 border-t">
                    <span className="text-xs text-muted-foreground">
                      {proj.owner || 'Unassigned'} · {formatDate(proj.createdAt)}
                    </span>
                    <button
                      type="button"
                      onClick={() => rt.deleteProject(proj.id)}
                      className="text-muted-foreground/50 hover:text-destructive transition-colors"
                      aria-label="Delete project"
                    >
                      <Trash className="h-3.5 w-3.5" />
                    </button>
                  </div>
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
            <DialogTitle>New Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Playbook *</Label>
              <Select
                value={form.playbookId}
                onValueChange={(v) => setForm((f) => ({ ...f, playbookId: v }))}
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
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input
                placeholder="Project name"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Objective</Label>
              <Textarea
                placeholder="What are we trying to achieve?"
                rows={2}
                value={form.objective}
                onChange={(e) => setForm((f) => ({ ...f, objective: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                placeholder="Additional context…"
                rows={2}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm((f) => ({ ...f, status: v as ProjectStatus }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.entries(PROJECT_STATUSES) as [ProjectStatus, string][]).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) => setForm((f) => ({ ...f, priority: v as CreateProjectInput['priority'] }))}
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
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Target Date</Label>
                <Input
                  type="date"
                  value={form.targetDate}
                  onChange={(e) => setForm((f) => ({ ...f, targetDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Owner</Label>
              <Input
                placeholder="Name or role"
                value={form.owner}
                onChange={(e) => setForm((f) => ({ ...f, owner: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Next Milestone</Label>
              <Input
                placeholder="e.g. Kick-off meeting completed"
                value={form.nextMilestone}
                onChange={(e) => setForm((f) => ({ ...f, nextMilestone: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Blockers</Label>
              <Input
                placeholder="Any current blockers?"
                value={form.blockers}
                onChange={(e) => setForm((f) => ({ ...f, blockers: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.title.trim() || !form.playbookId}>
              {saving ? 'Saving…' : 'Create Project'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
