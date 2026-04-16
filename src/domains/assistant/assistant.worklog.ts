import { useState, useEffect, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { AssistantActionId, AssistantReport, AssistantWorklogEntry } from './assistant.types'
import { AssistantWorklogRow } from '@/lib/db/supabase'
import { insert, findMany } from '@/lib/db/helpers'

const STORAGE_KEY = 'outcome-dealer-os.assistant.worklogs'
const MAX_WORKLOGS = 25

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

/* ─── localStorage helpers (fallback) ──────────────────────────────────── */

function readFromLocalStorage(): AssistantWorklogEntry[] {
  if (!isBrowser()) return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as AssistantWorklogEntry[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeToLocalStorage(entries: AssistantWorklogEntry[]): void {
  if (!isBrowser()) return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch {
    // localStorage may be blocked (private mode, full quota)
  }
}

/* ─── DB row ↔ domain mapper ────────────────────────────────────────────── */

function rowToEntry(row: AssistantWorklogRow): AssistantWorklogEntry {
  return {
    id: row.id,
    timestamp: row.created_at,
    actionId: row.action_id as AssistantActionId,
    issueSummary: row.issue_summary,
    symptoms: row.symptoms,
    likelyCause: row.likely_cause,
    filesInspected: row.files_inspected,
    changesProposed: row.changes_proposed,
    validationSteps: row.validation_steps,
    openQuestions: row.open_questions,
  }
}

/* ─── Public API ────────────────────────────────────────────────────────── */

/**
 * Read all saved worklogs.  Tries DB first (async); falls back to localStorage
 * synchronously so callers without async await still get data on first render.
 */
export function getAssistantWorklogs(): AssistantWorklogEntry[] {
  return readFromLocalStorage()
}

/**
 * Persist a new worklog entry.
 * Dual-writes to both the in-memory DB (server-side persistent KV store)
 * and localStorage (fast synchronous read on page reload).
 *
 * Returns the updated list so the caller can set React state immediately.
 */
export async function saveAssistantWorklog(
  actionId: AssistantActionId,
  issueSummary: string,
  report: AssistantReport,
): Promise<AssistantWorklogEntry[]> {
  const entryId = uuidv4()
  const now = new Date().toISOString()

  const entry: AssistantWorklogEntry = {
    id: entryId,
    timestamp: now,
    actionId,
    issueSummary,
    symptoms: report.diagnosis,
    likelyCause: report.rootCause,
    filesInspected: report.impactedFiles,
    changesProposed: report.fixOrImprovementPath,
    validationSteps: report.validationSteps,
    openQuestions: report.risksAndFollowUps,
  }

  // 1. Write to DB (server-side KV)
  try {
    await insert<AssistantWorklogRow>('assistant_worklogs', {
      action_id: actionId,
      issue_summary: issueSummary,
      symptoms: report.diagnosis,
      likely_cause: report.rootCause,
      files_inspected: report.impactedFiles,
      changes_proposed: report.fixOrImprovementPath,
      validation_steps: report.validationSteps,
      open_questions: report.risksAndFollowUps,
      confidence: report.confidence,
      worklog_summary: report.worklogSummary,
    } as Omit<AssistantWorklogRow, 'id' | 'created_at' | 'updated_at'>)
  } catch {
    // DB write failures are non-fatal; localStorage still persists the entry
  }

  // 2. Write to localStorage (fast synchronous read on reload)
  const updated = [entry, ...readFromLocalStorage()].slice(0, MAX_WORKLOGS)
  writeToLocalStorage(updated)

  return updated
}

/* ─── Reactive hook ─────────────────────────────────────────────────────── */

/**
 * Reactive hook for assistant worklogs.
 * Reads from the in-memory DB (populated from DB inserts) and falls back to
 * localStorage. Re-queries whenever `refreshKey` changes.
 */
export function useAssistantWorklogs(refreshKey = 0): {
  worklogs: AssistantWorklogEntry[]
  loading: boolean
  reload: () => void
} {
  const [worklogs, setWorklogs] = useState<AssistantWorklogEntry[]>(() => readFromLocalStorage())
  const [loading, setLoading] = useState(false)
  const [internalKey, setInternalKey] = useState(0)

  const reload = useCallback(() => setInternalKey(k => k + 1), [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    findMany<AssistantWorklogRow>('assistant_worklogs')
      .then(rows => {
        if (!cancelled) {
          if (rows.length > 0) {
            // DB has data — prefer it (most recent first)
            const dbEntries = rows
              .map(rowToEntry)
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .slice(0, MAX_WORKLOGS)
            setWorklogs(dbEntries)
          } else {
            // Fall back to localStorage
            setWorklogs(readFromLocalStorage())
          }
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setWorklogs(readFromLocalStorage())
          setLoading(false)
        }
      })
    return () => { cancelled = true }
  }, [refreshKey, internalKey])

  return { worklogs, loading, reload }
}
