import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type {
  PlaybookStatus,
  ProjectStatus,
  EntryStatus,
  ActionItemStatus,
  EntryPriority,
  PlaybookPriority,
  ActionItemPriority,
  DecisionStatus,
} from '@/domains/playbook/playbook.types'

// ─── Status badge colors ──────────────────────────────────────────────────────

export function PlaybookStatusBadge({ status }: { status: PlaybookStatus }) {
  const variants: Record<PlaybookStatus, string> = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    archived: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    paused: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  }
  const labels: Record<PlaybookStatus, string> = {
    active: 'Active',
    draft: 'Draft',
    archived: 'Archived',
    paused: 'Paused',
  }
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', variants[status])}>
      {labels[status]}
    </span>
  )
}

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const variants: Record<ProjectStatus, string> = {
    planning: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    on_hold: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    completed: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  }
  const labels: Record<ProjectStatus, string> = {
    planning: 'Planning',
    active: 'Active',
    on_hold: 'On Hold',
    completed: 'Completed',
    cancelled: 'Cancelled',
  }
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', variants[status])}>
      {labels[status]}
    </span>
  )
}

export function EntryStatusBadge({ status }: { status: EntryStatus }) {
  const variants: Record<EntryStatus, string> = {
    open: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    resolved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    archived: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    converted: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  }
  const labels: Record<EntryStatus, string> = {
    open: 'Open',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    archived: 'Archived',
    converted: 'Converted',
  }
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', variants[status])}>
      {labels[status]}
    </span>
  )
}

export function ActionItemStatusBadge({ status }: { status: ActionItemStatus }) {
  const variants: Record<ActionItemStatus, string> = {
    open: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    cancelled: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    blocked: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  }
  const labels: Record<ActionItemStatus, string> = {
    open: 'Open',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    blocked: 'Blocked',
  }
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', variants[status])}>
      {labels[status]}
    </span>
  )
}

export function DecisionStatusBadge({ status }: { status: DecisionStatus }) {
  const variants: Record<DecisionStatus, string> = {
    proposed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    decided: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    implemented: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    reversed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  }
  const labels: Record<DecisionStatus, string> = {
    proposed: 'Proposed',
    decided: 'Decided',
    implemented: 'Implemented',
    reversed: 'Reversed',
  }
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', variants[status])}>
      {labels[status]}
    </span>
  )
}

export function PriorityBadge({ priority }: { priority: string }) {
  const variants: Record<string, string> = {
    low: 'bg-slate-100 text-slate-600',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
    urgent: 'bg-red-100 text-red-800',
  }
  const labels: Record<string, string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    critical: 'Critical',
    urgent: 'Urgent',
  }
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', variants[priority] ?? 'bg-gray-100 text-gray-600')}>
      {labels[priority] ?? priority}
    </span>
  )
}

export function EntryTypeBadge({ type }: { type: string }) {
  const labels: Record<string, string> = {
    idea: 'Idea',
    issue: 'Issue',
    meeting_note: 'Meeting Note',
    strategy_note: 'Strategy Note',
    decision: 'Decision',
    follow_up: 'Follow-Up',
    update: 'Update',
    blocker: 'Blocker',
    observation: 'Observation',
  }
  return (
    <Badge variant="outline" className="text-xs">
      {labels[type] ?? type}
    </Badge>
  )
}

// ─── Date formatting ──────────────────────────────────────────────────────────

export function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export function formatRelative(iso: string): string {
  try {
    const now = Date.now()
    const then = new Date(iso).getTime()
    const diff = now - then
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    if (days < 7) return `${days}d ago`
    return formatDate(iso)
  } catch {
    return iso
  }
}
