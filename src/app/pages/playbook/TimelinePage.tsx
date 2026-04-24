import { useMemo, useState, ReactNode } from 'react'
import { usePlaybookRuntime } from '@/domains/playbook'
import type { TimelineEventType } from '@/domains/playbook'
import { SectionHeader } from '@/components/core/SectionHeader'
import { EmptyState } from '@/components/core/EmptyState'
import {
  BookOpen,
  FolderOpen,
  Note,
  Gavel,
  CheckSquare,
  ArrowRight,
  UserPlus,
  PaperclipHorizontal,
  ClockCounterClockwise,
} from '@phosphor-icons/react'
import { formatRelative } from './playbook.ui'

function EventIcon({ type }: { type: TimelineEventType }) {
  const icons: Record<TimelineEventType, ReactNode> = {
    playbook_created: <BookOpen className="h-4 w-4" />,
    project_created: <FolderOpen className="h-4 w-4" />,
    project_updated: <FolderOpen className="h-4 w-4" />,
    entry_created: <Note className="h-4 w-4" />,
    decision_created: <Gavel className="h-4 w-4" />,
    action_item_created: <CheckSquare className="h-4 w-4" />,
    action_item_completed: <CheckSquare className="h-4 w-4" />,
    status_changed: <ArrowRight className="h-4 w-4" />,
    collaborator_added: <UserPlus className="h-4 w-4" />,
    file_attached: <PaperclipHorizontal className="h-4 w-4" />,
  }
  return <>{icons[type] ?? <ClockCounterClockwise className="h-4 w-4" />}</>
}

function eventLabel(type: TimelineEventType, entityTitle: string, detail?: string): string {
  const labels: Record<TimelineEventType, string> = {
    playbook_created: `Created playbook "${entityTitle}"`,
    project_created: `Created project "${entityTitle}"`,
    project_updated: `Updated project "${entityTitle}"`,
    entry_created: `Added ${detail ?? 'entry'}: "${entityTitle}"`,
    decision_created: `Recorded decision: "${entityTitle}"`,
    action_item_created: `Added action item: "${entityTitle}"`,
    action_item_completed: `Completed action item: "${entityTitle}"`,
    status_changed: `Status changed on "${entityTitle}"`,
    collaborator_added: `Added collaborator to "${entityTitle}"`,
    file_attached: `Attached file to "${entityTitle}"`,
  }
  return labels[type] ?? `Event on "${entityTitle}"`
}

export function TimelinePage() {
  const rt = usePlaybookRuntime()
  const playbooks = useMemo(() => rt.listPlaybooks(), [rt.version])

  const events = useMemo(() => rt.listTimeline(), [rt.version])

  const pbMap = Object.fromEntries(playbooks.map((p) => [p.id, p.title]))

  return (
    <div className="space-y-6 pb-8">
      <SectionHeader
        title="Timeline"
        description="Full activity history across all playbooks, projects, and entries."
      />

      {events.length === 0 ? (
        <EmptyState
          icon={<ClockCounterClockwise size={40} />}
          title="No activity yet"
          description="Activity will appear here as you create playbooks, projects, entries, and decisions."
        />
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[1.1rem] top-0 bottom-0 w-px bg-border" />
          <div className="space-y-4 pl-10">
            {events.map((event) => (
              <div key={event.id} className="relative">
                {/* Dot */}
                <div className="absolute -left-[2.4rem] flex h-8 w-8 items-center justify-center rounded-full border bg-background text-muted-foreground">
                  <EventIcon type={event.eventType} />
                </div>
                <div className="rounded-lg border bg-card p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm">
                      {eventLabel(event.eventType, event.entityTitle, event.detail)}
                    </p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                      {formatRelative(event.createdAt)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                    {event.actor && <span>By {event.actor}</span>}
                    {event.playbookId && pbMap[event.playbookId] && (
                      <span>· {pbMap[event.playbookId]}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
