import { useMemo, useState } from 'react'
import { useRouter } from '@/app/router'
import { usePlaybookRuntime } from '@/domains/playbook'
import { SectionHeader } from '@/components/core/SectionHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  BookOpen,
  FolderOpen,
  Note,
  CalendarBlank,
  Gavel,
  CheckSquare,
  ClockCounterClockwise,
  Files,
  Plus,
  ArrowRight,
  CheckCircle,
  Warning,
  Target,
} from '@phosphor-icons/react'
import { formatRelative } from './playbook.ui'

const SUB_SECTIONS = [
  { label: 'Playbooks', href: '/app/playbook/playbooks', icon: BookOpen, description: 'Strategy and operational playbooks' },
  { label: 'Projects', href: '/app/playbook/projects', icon: FolderOpen, description: 'Active initiatives and projects' },
  { label: 'Notes', href: '/app/playbook/notes', icon: Note, description: 'Capture ideas, issues, and observations' },
  { label: 'Meetings', href: '/app/playbook/meetings', icon: CalendarBlank, description: 'Meeting notes and recaps' },
  { label: 'Decisions', href: '/app/playbook/decisions', icon: Gavel, description: 'Recorded decisions and rationale' },
  { label: 'Action Items', href: '/app/playbook/action-items', icon: CheckSquare, description: 'Open tasks and follow-throughs' },
  { label: 'Timeline', href: '/app/playbook/timeline', icon: ClockCounterClockwise, description: 'Full activity history' },
  { label: 'Files & Library', href: '/app/playbook/files', icon: Files, description: 'Attached documents and files' },
]

export function PlaybookDashboardPage() {
  const { navigate } = useRouter()
  const rt = usePlaybookRuntime()

  const playbooks = useMemo(() => rt.listPlaybooks(), [rt.version])
  const projects = useMemo(() => rt.listProjects(), [rt.version])
  const entries = useMemo(() => rt.listEntries(), [rt.version])
  const decisions = useMemo(() => rt.listDecisions(), [rt.version])
  const actionItems = useMemo(() => rt.listActionItems(), [rt.version])

  const openActions = actionItems.filter((a) => a.status === 'open' || a.status === 'in_progress')
  const overdueActions = actionItems.filter(
    (a) => a.dueDate && a.dueDate < new Date().toISOString().slice(0, 10) && a.status !== 'completed' && a.status !== 'cancelled',
  )
  const activeProjects = projects.filter((p) => p.status === 'active')
  const recentEntries = entries.slice(0, 5)

  return (
    <div className="space-y-8 pb-8">
      <SectionHeader
        title="Playbook"
        description="Strategy, planning, and execution workspace for dealership leadership."
        action={
          <Button onClick={() => navigate('/app/playbook/notes')} className="gap-2">
            <Plus className="h-4 w-4" /> New Entry
          </Button>
        }
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => navigate('/app/playbook/playbooks')}>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-primary/70" />
              <div>
                <div className="text-2xl font-bold">{playbooks.length}</div>
                <div className="text-xs text-muted-foreground">Playbooks</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => navigate('/app/playbook/projects')}>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-blue-500/70" />
              <div>
                <div className="text-2xl font-bold">{activeProjects.length}</div>
                <div className="text-xs text-muted-foreground">Active Projects</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => navigate('/app/playbook/action-items')}>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500/70" />
              <div>
                <div className="text-2xl font-bold">{openActions.length}</div>
                <div className="text-xs text-muted-foreground">Open Actions</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => navigate('/app/playbook/action-items')}>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <Warning className="h-8 w-8 text-red-500/70" />
              <div>
                <div className="text-2xl font-bold">{overdueActions.length}</div>
                <div className="text-xs text-muted-foreground">Overdue</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Capture */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Capture</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => navigate('/app/playbook/notes')} className="gap-1.5">
              <Note className="h-3.5 w-3.5" /> Note
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigate('/app/playbook/meetings')} className="gap-1.5">
              <CalendarBlank className="h-3.5 w-3.5" /> Meeting
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigate('/app/playbook/decisions')} className="gap-1.5">
              <Gavel className="h-3.5 w-3.5" /> Decision
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigate('/app/playbook/projects')} className="gap-1.5">
              <FolderOpen className="h-3.5 w-3.5" /> Project
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigate('/app/playbook/action-items')} className="gap-1.5">
              <CheckSquare className="h-3.5 w-3.5" /> Task
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Entries */}
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Recent Entries</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/app/playbook/notes')} className="gap-1 text-xs">
              View all <ArrowRight className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent>
            {recentEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No entries yet. Capture your first note.</p>
            ) : (
              <div className="divide-y">
                {recentEntries.map((e) => (
                  <div key={e.id} className="py-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{e.title}</p>
                        {e.summary && <p className="text-xs text-muted-foreground truncate mt-0.5">{e.summary}</p>}
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">{formatRelative(e.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Open Action Items */}
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Open Action Items</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/app/playbook/action-items')} className="gap-1 text-xs">
              View all <ArrowRight className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent>
            {openActions.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No open action items. You're all caught up!</p>
            ) : (
              <div className="divide-y">
                {openActions.slice(0, 5).map((a) => (
                  <div key={a.id} className="py-2.5 flex items-start gap-3">
                    <CheckSquare className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{a.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {a.owner} {a.dueDate ? `· Due ${a.dueDate}` : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sub-section navigation */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Sections</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SUB_SECTIONS.map((s) => {
            const Icon = s.icon
            return (
              <button
                key={s.href}
                type="button"
                onClick={() => navigate(s.href)}
                className="flex flex-col items-start gap-1.5 rounded-xl border border-border bg-card p-4 text-left hover:bg-muted/40 transition-colors"
              >
                <Icon className="h-5 w-5 text-primary/70" />
                <span className="text-sm font-medium">{s.label}</span>
                <span className="text-xs text-muted-foreground leading-snug">{s.description}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
