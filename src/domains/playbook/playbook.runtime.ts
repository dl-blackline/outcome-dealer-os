import { useCallback, useEffect, useState } from 'react'
import type {
  Playbook,
  Project,
  Entry,
  Decision,
  ActionItem,
  TimelineEvent,
  CreatePlaybookInput,
  UpdatePlaybookInput,
  CreateProjectInput,
  UpdateProjectInput,
  CreateEntryInput,
  UpdateEntryInput,
  CreateDecisionInput,
  UpdateDecisionInput,
  CreateActionItemInput,
  UpdateActionItemInput,
} from './playbook.types'

// ─── Storage Keys ─────────────────────────────────────────────────────────────

const KEYS = {
  playbooks: 'outcome.playbook.playbooks',
  projects: 'outcome.playbook.projects',
  entries: 'outcome.playbook.entries',
  decisions: 'outcome.playbook.decisions',
  actionItems: 'outcome.playbook.actionItems',
  timeline: 'outcome.playbook.timeline',
} as const

const UPDATE_EVENT = 'outcome.playbook.updated'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function nowIso(): string {
  return new Date().toISOString()
}

function uid(): string {
  return crypto.randomUUID()
}

function emitUpdate() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT))
}

function readLocal<T>(key: string): T[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(key)
    const parsed = raw ? (JSON.parse(raw) as T[]) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeLocal<T>(key: string, records: T[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, JSON.stringify(records))
  emitUpdate()
}

function appendTimeline(event: Omit<TimelineEvent, 'id' | 'createdAt'>) {
  const events = readLocal<TimelineEvent>(KEYS.timeline)
  const next: TimelineEvent = { ...event, id: uid(), createdAt: nowIso() }
  writeLocal<TimelineEvent>(KEYS.timeline, [next, ...events].slice(0, 500))
}

// ─── Playbooks ────────────────────────────────────────────────────────────────

export function listPlaybooks(): Playbook[] {
  return readLocal<Playbook>(KEYS.playbooks).sort(
    (a, b) => b.updatedAt.localeCompare(a.updatedAt),
  )
}

export function getPlaybook(id: string): Playbook | undefined {
  return readLocal<Playbook>(KEYS.playbooks).find((p) => p.id === id)
}

export function createPlaybook(input: CreatePlaybookInput, actor = 'user'): Playbook {
  const now = nowIso()
  const record: Playbook = {
    id: uid(),
    title: input.title,
    description: input.description ?? '',
    category: input.category ?? 'operations',
    owner: input.owner ?? actor,
    visibility: input.visibility ?? 'private',
    status: input.status ?? 'active',
    priority: input.priority ?? 'medium',
    tags: input.tags ?? [],
    collaborators: [],
    createdAt: now,
    updatedAt: now,
  }
  const existing = readLocal<Playbook>(KEYS.playbooks)
  writeLocal<Playbook>(KEYS.playbooks, [record, ...existing])
  appendTimeline({
    playbookId: record.id,
    entityType: 'playbook',
    entityId: record.id,
    entityTitle: record.title,
    eventType: 'playbook_created',
    actor,
  })
  return record
}

export function updatePlaybook(id: string, updates: UpdatePlaybookInput, actor = 'user'): Playbook | null {
  const records = readLocal<Playbook>(KEYS.playbooks)
  const idx = records.findIndex((r) => r.id === id)
  if (idx < 0) return null
  const next: Playbook = { ...records[idx], ...updates, updatedAt: nowIso() }
  records[idx] = next
  writeLocal<Playbook>(KEYS.playbooks, records)
  appendTimeline({
    playbookId: id,
    entityType: 'playbook',
    entityId: id,
    entityTitle: next.title,
    eventType: 'status_changed',
    actor,
    detail: `Updated playbook`,
  })
  return next
}

export function deletePlaybook(id: string): boolean {
  const records = readLocal<Playbook>(KEYS.playbooks)
  const next = records.filter((r) => r.id !== id)
  writeLocal<Playbook>(KEYS.playbooks, next)
  return next.length !== records.length
}

// ─── Projects ─────────────────────────────────────────────────────────────────

export function listProjects(playbookId?: string): Project[] {
  const all = readLocal<Project>(KEYS.projects)
  const filtered = playbookId ? all.filter((p) => p.playbookId === playbookId) : all
  return filtered.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export function getProject(id: string): Project | undefined {
  return readLocal<Project>(KEYS.projects).find((p) => p.id === id)
}

export function createProject(input: CreateProjectInput, actor = 'user'): Project {
  const now = nowIso()
  const record: Project = {
    id: uid(),
    playbookId: input.playbookId,
    title: input.title,
    description: input.description ?? '',
    objective: input.objective ?? '',
    owner: input.owner ?? actor,
    collaborators: [],
    status: input.status ?? 'planning',
    priority: input.priority ?? 'medium',
    startDate: input.startDate,
    targetDate: input.targetDate,
    nextMilestone: input.nextMilestone,
    blockers: input.blockers,
    tags: input.tags ?? [],
    createdAt: now,
    updatedAt: now,
  }
  const existing = readLocal<Project>(KEYS.projects)
  writeLocal<Project>(KEYS.projects, [record, ...existing])
  appendTimeline({
    playbookId: input.playbookId,
    projectId: record.id,
    entityType: 'project',
    entityId: record.id,
    entityTitle: record.title,
    eventType: 'project_created',
    actor,
  })
  return record
}

export function updateProject(id: string, updates: UpdateProjectInput, actor = 'user'): Project | null {
  const records = readLocal<Project>(KEYS.projects)
  const idx = records.findIndex((r) => r.id === id)
  if (idx < 0) return null
  const next: Project = { ...records[idx], ...updates, updatedAt: nowIso() }
  records[idx] = next
  writeLocal<Project>(KEYS.projects, records)
  appendTimeline({
    playbookId: next.playbookId,
    projectId: id,
    entityType: 'project',
    entityId: id,
    entityTitle: next.title,
    eventType: 'project_updated',
    actor,
    detail: `Updated project`,
  })
  return next
}

export function deleteProject(id: string): boolean {
  const records = readLocal<Project>(KEYS.projects)
  const next = records.filter((r) => r.id !== id)
  writeLocal<Project>(KEYS.projects, next)
  return next.length !== records.length
}

// ─── Entries ──────────────────────────────────────────────────────────────────

export function listEntries(opts?: { playbookId?: string; projectId?: string }): Entry[] {
  const all = readLocal<Entry>(KEYS.entries)
  let filtered = all
  if (opts?.playbookId) filtered = filtered.filter((e) => e.playbookId === opts.playbookId)
  if (opts?.projectId) filtered = filtered.filter((e) => e.projectId === opts.projectId)
  return filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function getEntry(id: string): Entry | undefined {
  return readLocal<Entry>(KEYS.entries).find((e) => e.id === id)
}

export function createEntry(input: CreateEntryInput, actor = 'user'): Entry {
  const now = nowIso()
  const record: Entry = {
    id: uid(),
    playbookId: input.playbookId,
    projectId: input.projectId,
    title: input.title,
    type: input.type,
    summary: input.summary ?? '',
    body: input.body,
    discussedWith: input.discussedWith ?? [],
    peopleMentioned: input.peopleMentioned ?? [],
    department: input.department,
    tags: input.tags ?? [],
    priority: input.priority ?? 'medium',
    status: input.status ?? 'open',
    nextStep: input.nextStep,
    dueDate: input.dueDate,
    linkedRecords: input.linkedRecords ?? [],
    attachments: [],
    createdBy: input.createdBy ?? actor,
    createdAt: now,
    updatedAt: now,
  }
  const existing = readLocal<Entry>(KEYS.entries)
  writeLocal<Entry>(KEYS.entries, [record, ...existing])
  appendTimeline({
    playbookId: input.playbookId,
    projectId: input.projectId,
    entityType: 'entry',
    entityId: record.id,
    entityTitle: record.title,
    eventType: 'entry_created',
    actor: record.createdBy,
    detail: record.type,
  })
  return record
}

export function updateEntry(id: string, updates: UpdateEntryInput): Entry | null {
  const records = readLocal<Entry>(KEYS.entries)
  const idx = records.findIndex((r) => r.id === id)
  if (idx < 0) return null
  const next: Entry = {
    ...records[idx],
    ...updates,
    attachments: updates.attachments ?? records[idx].attachments,
    linkedRecords: updates.linkedRecords ?? records[idx].linkedRecords,
    updatedAt: nowIso(),
  }
  records[idx] = next
  writeLocal<Entry>(KEYS.entries, records)
  return next
}

export function deleteEntry(id: string): boolean {
  const records = readLocal<Entry>(KEYS.entries)
  const next = records.filter((r) => r.id !== id)
  writeLocal<Entry>(KEYS.entries, next)
  return next.length !== records.length
}

// ─── Decisions ────────────────────────────────────────────────────────────────

export function listDecisions(opts?: { playbookId?: string; projectId?: string }): Decision[] {
  const all = readLocal<Decision>(KEYS.decisions)
  let filtered = all
  if (opts?.playbookId) filtered = filtered.filter((d) => d.playbookId === opts.playbookId)
  if (opts?.projectId) filtered = filtered.filter((d) => d.projectId === opts.projectId)
  return filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function getDecision(id: string): Decision | undefined {
  return readLocal<Decision>(KEYS.decisions).find((d) => d.id === id)
}

export function createDecision(input: CreateDecisionInput, actor = 'user'): Decision {
  const now = nowIso()
  const record: Decision = {
    id: uid(),
    playbookId: input.playbookId,
    projectId: input.projectId,
    title: input.title,
    summary: input.summary,
    rationale: input.rationale,
    decidedBy: input.decidedBy ?? actor,
    dateDecided: input.dateDecided ?? now.slice(0, 10),
    status: input.status ?? 'decided',
    impacts: input.impacts ?? [],
    linkedEntryIds: input.linkedEntryIds ?? [],
    tags: input.tags ?? [],
    createdAt: now,
    updatedAt: now,
  }
  const existing = readLocal<Decision>(KEYS.decisions)
  writeLocal<Decision>(KEYS.decisions, [record, ...existing])
  appendTimeline({
    playbookId: input.playbookId,
    projectId: input.projectId,
    entityType: 'decision',
    entityId: record.id,
    entityTitle: record.title,
    eventType: 'decision_created',
    actor: record.decidedBy,
  })
  return record
}

export function updateDecision(id: string, updates: UpdateDecisionInput): Decision | null {
  const records = readLocal<Decision>(KEYS.decisions)
  const idx = records.findIndex((r) => r.id === id)
  if (idx < 0) return null
  const next: Decision = { ...records[idx], ...updates, updatedAt: nowIso() }
  records[idx] = next
  writeLocal<Decision>(KEYS.decisions, records)
  return next
}

export function deleteDecision(id: string): boolean {
  const records = readLocal<Decision>(KEYS.decisions)
  const next = records.filter((r) => r.id !== id)
  writeLocal<Decision>(KEYS.decisions, next)
  return next.length !== records.length
}

// ─── Action Items ─────────────────────────────────────────────────────────────

export function listActionItems(opts?: { playbookId?: string; projectId?: string; status?: string }): ActionItem[] {
  const all = readLocal<ActionItem>(KEYS.actionItems)
  let filtered = all
  if (opts?.playbookId) filtered = filtered.filter((a) => a.playbookId === opts.playbookId)
  if (opts?.projectId) filtered = filtered.filter((a) => a.projectId === opts.projectId)
  if (opts?.status) filtered = filtered.filter((a) => a.status === opts.status)
  return filtered.sort((a, b) => {
    if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate)
    if (a.dueDate) return -1
    if (b.dueDate) return 1
    return b.createdAt.localeCompare(a.createdAt)
  })
}

export function getActionItem(id: string): ActionItem | undefined {
  return readLocal<ActionItem>(KEYS.actionItems).find((a) => a.id === id)
}

export function createActionItem(input: CreateActionItemInput, actor = 'user'): ActionItem {
  const now = nowIso()
  const record: ActionItem = {
    id: uid(),
    playbookId: input.playbookId,
    projectId: input.projectId,
    sourceEntryId: input.sourceEntryId,
    title: input.title,
    description: input.description,
    owner: input.owner ?? actor,
    dueDate: input.dueDate,
    priority: input.priority ?? 'medium',
    status: input.status ?? 'open',
    createdBy: input.createdBy ?? actor,
    createdAt: now,
    updatedAt: now,
  }
  const existing = readLocal<ActionItem>(KEYS.actionItems)
  writeLocal<ActionItem>(KEYS.actionItems, [record, ...existing])
  appendTimeline({
    playbookId: input.playbookId,
    projectId: input.projectId,
    entityType: 'action_item',
    entityId: record.id,
    entityTitle: record.title,
    eventType: 'action_item_created',
    actor: record.createdBy,
  })
  return record
}

export function updateActionItem(id: string, updates: UpdateActionItemInput): ActionItem | null {
  const records = readLocal<ActionItem>(KEYS.actionItems)
  const idx = records.findIndex((r) => r.id === id)
  if (idx < 0) return null
  const wasCompleted = records[idx].status !== 'completed' && updates.status === 'completed'
  const next: ActionItem = { ...records[idx], ...updates, updatedAt: nowIso() }
  records[idx] = next
  writeLocal<ActionItem>(KEYS.actionItems, records)
  if (wasCompleted) {
    appendTimeline({
      playbookId: next.playbookId,
      projectId: next.projectId,
      entityType: 'action_item',
      entityId: id,
      entityTitle: next.title,
      eventType: 'action_item_completed',
      actor: next.owner,
    })
  }
  return next
}

export function deleteActionItem(id: string): boolean {
  const records = readLocal<ActionItem>(KEYS.actionItems)
  const next = records.filter((r) => r.id !== id)
  writeLocal<ActionItem>(KEYS.actionItems, next)
  return next.length !== records.length
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

export function listTimeline(opts?: { playbookId?: string; projectId?: string }): TimelineEvent[] {
  const all = readLocal<TimelineEvent>(KEYS.timeline)
  let filtered = all
  if (opts?.playbookId) filtered = filtered.filter((e) => e.playbookId === opts.playbookId)
  if (opts?.projectId) filtered = filtered.filter((e) => e.projectId === opts.projectId)
  return filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

// ─── React Hook ───────────────────────────────────────────────────────────────

export function usePlaybookRuntime() {
  const [version, setVersion] = useState(0)

  const refresh = useCallback(() => setVersion((v) => v + 1), [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const handle = () => refresh()
    window.addEventListener(UPDATE_EVENT, handle)
    window.addEventListener('storage', handle)
    return () => {
      window.removeEventListener(UPDATE_EVENT, handle)
      window.removeEventListener('storage', handle)
    }
  }, [refresh])

  return {
    version,
    refresh,
    // playbooks
    listPlaybooks,
    getPlaybook,
    createPlaybook,
    updatePlaybook,
    deletePlaybook,
    // projects
    listProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
    // entries
    listEntries,
    getEntry,
    createEntry,
    updateEntry,
    deleteEntry,
    // decisions
    listDecisions,
    getDecision,
    createDecision,
    updateDecision,
    deleteDecision,
    // action items
    listActionItems,
    getActionItem,
    createActionItem,
    updateActionItem,
    deleteActionItem,
    // timeline
    listTimeline,
  }
}
