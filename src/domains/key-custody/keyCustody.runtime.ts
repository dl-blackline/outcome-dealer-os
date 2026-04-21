/**
 * Key Custody runtime — localStorage-backed hook.
 *
 * Follows the same pattern as recon.runtime.ts:
 * - All state persisted in localStorage
 * - CRUD functions exposed through a single React hook
 * - No external dependencies beyond React and local types
 *
 * Usage:
 *   const { events, statuses, checkOut, checkIn, transfer, reportLost, reportFound } = useKeyCustodyRuntime()
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import type {
  KeyCustodyEvent,
  KeyCustodyStatus,
  CheckOutKeysInput,
  CheckInKeysInput,
  TransferKeysInput,
  ReportLostInput,
  ReportFoundInput,
} from './keyCustody.types'

const STORAGE_KEY = 'outcome.key-custody.events'

function now(): string {
  return new Date().toISOString()
}

function uuid(): string {
  return crypto.randomUUID()
}

function readEvents(): KeyCustodyEvent[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as KeyCustodyEvent[]) : []
  } catch {
    return []
  }
}

function writeEvents(events: KeyCustodyEvent[]): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
}

/**
 * Derive current custody status for each unit from the event history.
 * Groups events by inventoryUnitId (preferred) or stockNumber, then
 * determines custody state from the most recent event.
 */
function deriveStatuses(events: KeyCustodyEvent[]): KeyCustodyStatus[] {
  // Group by unit key
  const byUnit = new Map<string, KeyCustodyEvent[]>()

  for (const e of events) {
    const key = e.inventoryUnitId ?? e.stockNumber ?? e.id
    if (!byUnit.has(key)) byUnit.set(key, [])
    byUnit.get(key)!.push(e)
  }

  const statuses: KeyCustodyStatus[] = []

  for (const [, unitEvents] of byUnit) {
    const sorted = unitEvents.slice().sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    const latest = sorted[0]

    const isCheckedOut =
      latest.eventType === 'checked_out' || latest.eventType === 'transferred'
    const isLost = latest.eventType === 'lost'

    // Trace back to the original checked_out event that started the current out-session.
    // A transfer keeps keys out of the board, so we must not reset the timer on transfer.
    // Scan backward (oldest-first) from the latest event; the current out-session began
    // at the most recent checked_out event that was not subsequently followed by a
    // checked_in or found event.
    let checkedOutAt: string | undefined
    if (isCheckedOut) {
      // Walk events oldest→newest to find the checked_out that opened this session
      const chronological = sorted.slice().reverse()
      let sessionStart: string | undefined
      for (const e of chronological) {
        if (e.eventType === 'checked_in' || e.eventType === 'found') {
          // Keys returned to board — reset session start
          sessionStart = undefined
        } else if (e.eventType === 'checked_out') {
          // Mark/update session start at each checkout
          sessionStart = e.timestamp
        }
        // transferred keeps sessionStart unchanged (keys still out)
      }
      checkedOutAt = sessionStart ?? latest.timestamp
    }

    let minutesOut: number | undefined
    if (isCheckedOut && checkedOutAt) {
      minutesOut = Math.round(
        (Date.now() - new Date(checkedOutAt).getTime()) / 60_000
      )
    }

    statuses.push({
      inventoryUnitId: latest.inventoryUnitId,
      stockNumber: latest.stockNumber,
      vehicleTitle: latest.vehicleTitle,
      isCheckedOut,
      currentHolder: isCheckedOut ? latest.checkedOutTo ?? latest.checkedInBy : undefined,
      currentReason: isCheckedOut ? latest.checkoutReason : undefined,
      checkedOutAt,
      isLost,
      minutesOut,
      events: sorted,
    })
  }

  // Sort: lost first, then checked-out (by time out descending), then checked-in
  return statuses.sort((a, b) => {
    if (a.isLost !== b.isLost) return a.isLost ? -1 : 1
    if (a.isCheckedOut !== b.isCheckedOut) return a.isCheckedOut ? -1 : 1
    return (b.minutesOut ?? 0) - (a.minutesOut ?? 0)
  })
}

export function useKeyCustodyRuntime() {
  const [events, setEvents] = useState<KeyCustodyEvent[]>(readEvents)

  useEffect(() => {
    writeEvents(events)
  }, [events])

  const statuses = useMemo(() => deriveStatuses(events), [events])

  const checkOut = useCallback((input: CheckOutKeysInput): KeyCustodyEvent => {
    const event: KeyCustodyEvent = {
      id: uuid(),
      inventoryUnitId: input.inventoryUnitId,
      stockNumber: input.stockNumber,
      vehicleTitle: input.vehicleTitle,
      eventType: 'checked_out',
      checkedOutTo: input.checkedOutTo,
      checkoutReason: input.checkoutReason,
      notes: input.notes,
      timestamp: now(),
      createdAt: now(),
    }
    setEvents(prev => [...prev, event])
    return event
  }, [])

  const checkIn = useCallback((input: CheckInKeysInput): KeyCustodyEvent => {
    const event: KeyCustodyEvent = {
      id: uuid(),
      inventoryUnitId: input.inventoryUnitId,
      stockNumber: input.stockNumber,
      vehicleTitle: input.vehicleTitle,
      eventType: 'checked_in',
      checkedInBy: input.checkedInBy,
      notes: input.notes,
      timestamp: now(),
      createdAt: now(),
    }
    setEvents(prev => [...prev, event])
    return event
  }, [])

  const transfer = useCallback((input: TransferKeysInput): KeyCustodyEvent => {
    const event: KeyCustodyEvent = {
      id: uuid(),
      inventoryUnitId: input.inventoryUnitId,
      stockNumber: input.stockNumber,
      vehicleTitle: input.vehicleTitle,
      eventType: 'transferred',
      checkedOutTo: input.transferredTo,
      notes: input.notes,
      timestamp: now(),
      createdAt: now(),
    }
    setEvents(prev => [...prev, event])
    return event
  }, [])

  const reportLost = useCallback((input: ReportLostInput): KeyCustodyEvent => {
    const event: KeyCustodyEvent = {
      id: uuid(),
      inventoryUnitId: input.inventoryUnitId,
      stockNumber: input.stockNumber,
      vehicleTitle: input.vehicleTitle,
      eventType: 'lost',
      notes: input.notes,
      timestamp: now(),
      createdAt: now(),
    }
    setEvents(prev => [...prev, event])
    return event
  }, [])

  const reportFound = useCallback((input: ReportFoundInput): KeyCustodyEvent => {
    const event: KeyCustodyEvent = {
      id: uuid(),
      inventoryUnitId: input.inventoryUnitId,
      stockNumber: input.stockNumber,
      vehicleTitle: input.vehicleTitle,
      eventType: 'found',
      checkedInBy: input.foundBy,
      notes: input.notes,
      timestamp: now(),
      createdAt: now(),
    }
    setEvents(prev => [...prev, event])
    return event
  }, [])

  /** Delete all events for a unit (admin reset) */
  const removeUnit = useCallback((unitKey: string) => {
    setEvents(prev =>
      prev.filter(
        e => e.inventoryUnitId !== unitKey && e.stockNumber !== unitKey
      )
    )
  }, [])

  /** Get event history for a specific unit */
  const getUnitEvents = useCallback(
    (unitKey: string): KeyCustodyEvent[] =>
      events
        .filter(e => e.inventoryUnitId === unitKey || e.stockNumber === unitKey)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [events]
  )

  return {
    events,
    statuses,
    checkOut,
    checkIn,
    transfer,
    reportLost,
    reportFound,
    removeUnit,
    getUnitEvents,
  }
}
