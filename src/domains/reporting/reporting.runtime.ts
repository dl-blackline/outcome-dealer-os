import { useCallback, useEffect, useState } from 'react'
import type {
  DeliveryRecord,
  SavedReport,
  ScheduledReport,
} from './reporting.types'

const SAVED_REPORTS_KEY = 'outcome.reporting.savedReports'
const SCHEDULES_KEY = 'outcome.reporting.schedules'
const DELIVERY_HISTORY_KEY = 'outcome.reporting.deliveryHistory'
const UPDATE_EVENT = 'outcome.reporting.updated'

function nowIso(): string {
  return new Date().toISOString()
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
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

function writeLocal<T>(key: string, data: T[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, JSON.stringify(data))
  emitUpdate()
}

export function useReportingRuntime() {
  const [savedReports, setSavedReports] = useState<SavedReport[]>(() =>
    readLocal<SavedReport>(SAVED_REPORTS_KEY)
  )
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>(() =>
    readLocal<ScheduledReport>(SCHEDULES_KEY)
  )
  const [deliveryHistory, setDeliveryHistory] = useState<DeliveryRecord[]>(() =>
    readLocal<DeliveryRecord>(DELIVERY_HISTORY_KEY)
  )

  useEffect(() => {
    function onUpdate() {
      setSavedReports(readLocal<SavedReport>(SAVED_REPORTS_KEY))
      setScheduledReports(readLocal<ScheduledReport>(SCHEDULES_KEY))
      setDeliveryHistory(readLocal<DeliveryRecord>(DELIVERY_HISTORY_KEY))
    }
    window.addEventListener(UPDATE_EVENT, onUpdate)
    return () => window.removeEventListener(UPDATE_EVENT, onUpdate)
  }, [])

  // ── Saved Reports ──────────────────────────────────────────────────────────

  const saveSavedReport = useCallback(
    (report: Omit<SavedReport, 'id' | 'createdAt' | 'updatedAt'>): SavedReport => {
      const now = nowIso()
      const newReport: SavedReport = {
        ...report,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      }
      const updated = [...readLocal<SavedReport>(SAVED_REPORTS_KEY), newReport]
      writeLocal(SAVED_REPORTS_KEY, updated)
      setSavedReports(updated)
      return newReport
    },
    []
  )

  const updateSavedReport = useCallback(
    (id: string, updates: Partial<SavedReport>) => {
      const current = readLocal<SavedReport>(SAVED_REPORTS_KEY)
      const updated = current.map((r) =>
        r.id === id ? { ...r, ...updates, updatedAt: nowIso() } : r
      )
      writeLocal(SAVED_REPORTS_KEY, updated)
      setSavedReports(updated)
    },
    []
  )

  const deleteSavedReport = useCallback((id: string) => {
    const current = readLocal<SavedReport>(SAVED_REPORTS_KEY)
    const updated = current.filter((r) => r.id !== id)
    writeLocal(SAVED_REPORTS_KEY, updated)
    setSavedReports(updated)
  }, [])

  const duplicateSavedReport = useCallback((id: string): SavedReport => {
    const current = readLocal<SavedReport>(SAVED_REPORTS_KEY)
    const original = current.find((r) => r.id === id)
    if (!original) throw new Error(`SavedReport ${id} not found`)
    const now = nowIso()
    const copy: SavedReport = {
      ...original,
      id: generateId(),
      name: `${original.name} (Copy)`,
      isPinned: false,
      createdAt: now,
      updatedAt: now,
    }
    const updated = [...current, copy]
    writeLocal(SAVED_REPORTS_KEY, updated)
    setSavedReports(updated)
    return copy
  }, [])

  // ── Scheduled Reports ──────────────────────────────────────────────────────

  const saveScheduledReport = useCallback(
    (
      schedule: Omit<ScheduledReport, 'id' | 'createdAt' | 'updatedAt'>
    ): ScheduledReport => {
      const now = nowIso()
      const newSchedule: ScheduledReport = {
        ...schedule,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      }
      const updated = [...readLocal<ScheduledReport>(SCHEDULES_KEY), newSchedule]
      writeLocal(SCHEDULES_KEY, updated)
      setScheduledReports(updated)
      return newSchedule
    },
    []
  )

  const updateScheduledReport = useCallback(
    (id: string, updates: Partial<ScheduledReport>) => {
      const current = readLocal<ScheduledReport>(SCHEDULES_KEY)
      const updated = current.map((s) =>
        s.id === id ? { ...s, ...updates, updatedAt: nowIso() } : s
      )
      writeLocal(SCHEDULES_KEY, updated)
      setScheduledReports(updated)
    },
    []
  )

  const deleteScheduledReport = useCallback((id: string) => {
    const current = readLocal<ScheduledReport>(SCHEDULES_KEY)
    const updated = current.filter((s) => s.id !== id)
    writeLocal(SCHEDULES_KEY, updated)
    setScheduledReports(updated)
  }, [])

  // ── Delivery History ───────────────────────────────────────────────────────

  const addDeliveryRecord = useCallback(
    (record: Omit<DeliveryRecord, 'id' | 'createdAt'>): DeliveryRecord => {
      const newRecord: DeliveryRecord = {
        ...record,
        id: generateId(),
        createdAt: nowIso(),
      }
      const current = readLocal<DeliveryRecord>(DELIVERY_HISTORY_KEY)
      const updated = [newRecord, ...current]
      writeLocal(DELIVERY_HISTORY_KEY, updated)
      setDeliveryHistory(updated)
      return newRecord
    },
    []
  )

  return {
    savedReports,
    scheduledReports,
    deliveryHistory,
    saveSavedReport,
    updateSavedReport,
    deleteSavedReport,
    duplicateSavedReport,
    saveScheduledReport,
    updateScheduledReport,
    deleteScheduledReport,
    addDeliveryRecord,
  }
}
