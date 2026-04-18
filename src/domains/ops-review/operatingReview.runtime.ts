import { useCallback, useEffect, useMemo, useState } from 'react'
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client'
import type {
  OperatingObservationCreateInput,
  OperatingObservationRecord,
  OperatingObservationUpdateInput,
  ObservationActionItem,
} from './operatingReview.types'

const OPERATING_REVIEW_KEY = 'outcome.opsReview.observations'
const OPERATING_REVIEW_EVENT = 'outcome.opsReview.updated'

interface SupabaseObservationRow {
  id: string
  title?: string | null
  category?: string | null
  department?: string | null
  location_area?: string | null
  date_observed?: string | null
  observed_by?: string | null
  severity?: string | null
  urgency?: string | null
  status?: string | null
  owner_accountable?: string | null
  short_summary?: string | null
  full_notes?: string | null
  recommendation?: string | null
  impact?: string | null
  follow_up_needed?: string | null
  follow_up_date?: string | null
  reviewed_with_owner?: boolean | null
  review_meeting_date?: string | null
  discuss_next_meeting?: boolean | null
  tags?: string[] | null
  evidence_links?: string[] | null
  action_items?: ObservationActionItem[] | null
  pinned?: boolean | null
  created_at?: string | null
  updated_at?: string | null
}

function nowIso(): string {
  return new Date().toISOString()
}

function emitUpdate() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(OPERATING_REVIEW_EVENT))
}

function readLocal(): OperatingObservationRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(OPERATING_REVIEW_KEY)
    const parsed = raw ? (JSON.parse(raw) as OperatingObservationRecord[]) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeLocal(records: OperatingObservationRecord[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(OPERATING_REVIEW_KEY, JSON.stringify(records))
  emitUpdate()
}

function mapSupabaseRow(row: SupabaseObservationRow): OperatingObservationRecord {
  const createdAt = row.created_at || nowIso()
  const updatedAt = row.updated_at || createdAt
  return {
    id: row.id,
    title: row.title || 'Untitled Observation',
    category: (row.category || 'Other') as OperatingObservationRecord['category'],
    department: (row.department || 'Operations') as OperatingObservationRecord['department'],
    locationArea: row.location_area || undefined,
    dateObserved: row.date_observed || createdAt.slice(0, 10),
    observedBy: row.observed_by || 'Staff',
    severity: (row.severity || 'Medium') as OperatingObservationRecord['severity'],
    urgency: (row.urgency || 'Soon') as OperatingObservationRecord['urgency'],
    status: (row.status || 'New') as OperatingObservationRecord['status'],
    ownerAccountable: row.owner_accountable || undefined,
    shortSummary: row.short_summary || '',
    fullNotes: row.full_notes || undefined,
    recommendation: row.recommendation || undefined,
    impact: row.impact || undefined,
    followUpNeeded: row.follow_up_needed || undefined,
    followUpDate: row.follow_up_date || undefined,
    reviewedWithOwner: Boolean(row.reviewed_with_owner),
    reviewMeetingDate: row.review_meeting_date || undefined,
    discussNextMeeting: Boolean(row.discuss_next_meeting),
    tags: row.tags || [],
    evidenceLinks: row.evidence_links || [],
    actionItems: row.action_items || [],
    pinned: Boolean(row.pinned),
    createdAt,
    updatedAt,
  }
}

function toSupabasePayload(input: OperatingObservationCreateInput | OperatingObservationUpdateInput) {
  return {
    title: input.title,
    category: input.category,
    department: input.department,
    location_area: input.locationArea,
    date_observed: input.dateObserved,
    observed_by: input.observedBy,
    severity: input.severity,
    urgency: input.urgency,
    status: input.status,
    owner_accountable: input.ownerAccountable,
    short_summary: input.shortSummary,
    full_notes: input.fullNotes,
    recommendation: input.recommendation,
    impact: input.impact,
    follow_up_needed: input.followUpNeeded,
    follow_up_date: input.followUpDate,
    reviewed_with_owner: input.reviewedWithOwner,
    review_meeting_date: input.reviewMeetingDate,
    discuss_next_meeting: input.discussNextMeeting,
    tags: input.tags,
    evidence_links: input.evidenceLinks,
    action_items: input.actionItems,
    pinned: input.pinned,
  }
}

export async function listOperatingObservations(): Promise<OperatingObservationRecord[]> {
  const client = getSupabaseBrowserClient()
  if (client && isSupabaseConfigured()) {
    const { data, error } = await client
      .from('operating_observations')
      .select('*')
      .order('date_observed', { ascending: false })
      .order('created_at', { ascending: false })

    if (!error && Array.isArray(data)) {
      return data.map((row) => mapSupabaseRow(row as SupabaseObservationRow))
    }
  }

  return readLocal().sort((a, b) => {
    const p = Number(b.pinned) - Number(a.pinned)
    if (p !== 0) return p
    return b.dateObserved.localeCompare(a.dateObserved)
  })
}

export async function createOperatingObservation(
  input: OperatingObservationCreateInput,
): Promise<OperatingObservationRecord> {
  const createdAt = nowIso()
  const record: OperatingObservationRecord = {
    id: crypto.randomUUID(),
    title: input.title,
    category: input.category,
    department: input.department,
    locationArea: input.locationArea,
    dateObserved: input.dateObserved,
    observedBy: input.observedBy,
    severity: input.severity,
    urgency: input.urgency,
    status: input.status,
    ownerAccountable: input.ownerAccountable,
    shortSummary: input.shortSummary,
    fullNotes: input.fullNotes,
    recommendation: input.recommendation,
    impact: input.impact,
    followUpNeeded: input.followUpNeeded,
    followUpDate: input.followUpDate,
    reviewedWithOwner: Boolean(input.reviewedWithOwner),
    reviewMeetingDate: input.reviewMeetingDate,
    discussNextMeeting: Boolean(input.discussNextMeeting),
    tags: input.tags || [],
    evidenceLinks: input.evidenceLinks || [],
    actionItems: input.actionItems || [],
    pinned: Boolean(input.pinned),
    createdAt,
    updatedAt: createdAt,
  }

  const client = getSupabaseBrowserClient()
  if (client && isSupabaseConfigured()) {
    const { data, error } = await client
      .from('operating_observations')
      .insert(toSupabasePayload(record))
      .select('*')
      .single()

    if (!error && data) {
      emitUpdate()
      return mapSupabaseRow(data as SupabaseObservationRow)
    }
  }

  const local = readLocal()
  writeLocal([record, ...local])
  return record
}

export async function updateOperatingObservation(
  id: string,
  updates: OperatingObservationUpdateInput,
): Promise<OperatingObservationRecord | null> {
  const client = getSupabaseBrowserClient()
  if (client && isSupabaseConfigured()) {
    const { data, error } = await client
      .from('operating_observations')
      .update({ ...toSupabasePayload(updates), updated_at: nowIso() })
      .eq('id', id)
      .select('*')
      .single()

    if (!error && data) {
      emitUpdate()
      return mapSupabaseRow(data as SupabaseObservationRow)
    }
  }

  const local = readLocal()
  const idx = local.findIndex((r) => r.id === id)
  if (idx < 0) return null

  const next: OperatingObservationRecord = {
    ...local[idx],
    ...updates,
    updatedAt: nowIso(),
    tags: updates.tags ?? local[idx].tags,
    evidenceLinks: updates.evidenceLinks ?? local[idx].evidenceLinks,
    actionItems: updates.actionItems ?? local[idx].actionItems,
  }
  local[idx] = next
  writeLocal(local)
  return next
}

export async function deleteOperatingObservation(id: string): Promise<boolean> {
  const client = getSupabaseBrowserClient()
  if (client && isSupabaseConfigured()) {
    const { error } = await client.from('operating_observations').delete().eq('id', id)
    if (!error) {
      emitUpdate()
      return true
    }
  }

  const local = readLocal()
  const next = local.filter((item) => item.id !== id)
  writeLocal(next)
  return next.length !== local.length
}

export async function markObservationReviewed(
  id: string,
  meetingDate: string,
): Promise<OperatingObservationRecord | null> {
  return updateOperatingObservation(id, {
    reviewedWithOwner: true,
    reviewMeetingDate: meetingDate,
    status: 'Discussed with Owner',
  })
}

export function useOperatingReviewRuntime() {
  const [records, setRecords] = useState<OperatingObservationRecord[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    const next = await listOperatingObservations()
    setRecords(next)
    setLoading(false)
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const handle = () => {
      void refresh()
    }

    window.addEventListener(OPERATING_REVIEW_EVENT, handle)
    window.addEventListener('storage', handle)
    return () => {
      window.removeEventListener(OPERATING_REVIEW_EVENT, handle)
      window.removeEventListener('storage', handle)
    }
  }, [refresh])

  const unresolvedCount = useMemo(
    () => records.filter((r) => r.status !== 'Resolved' && r.status !== 'Closed').length,
    [records],
  )

  return {
    records,
    loading,
    refresh,
    unresolvedCount,
    createObservation: createOperatingObservation,
    updateObservation: updateOperatingObservation,
    deleteObservation: deleteOperatingObservation,
    markReviewed: markObservationReviewed,
    isSupabaseBacked: isSupabaseConfigured(),
  }
}
