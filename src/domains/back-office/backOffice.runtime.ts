import { useCallback, useEffect, useMemo, useState } from 'react'
import type {
  BackOfficeDealRecord,
  BackOfficeException,
  CreateBackOfficeDealInput,
  ExceptionType,
  ExceptionSeverity,
} from './backOffice.types'

const STORAGE_KEY = 'outcome.backOffice.records'

function now(): string {
  return new Date().toISOString()
}

function readLocal(): BackOfficeDealRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? (JSON.parse(raw) as BackOfficeDealRecord[]) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeLocal(records: BackOfficeDealRecord[]): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

export function useBackOfficeRuntime() {
  const [records, setRecords] = useState<BackOfficeDealRecord[]>(() => {
    return readLocal()
  })

  useEffect(() => { writeLocal(records) }, [records])

  const createRecord = useCallback((input: CreateBackOfficeDealInput): BackOfficeDealRecord => {
    const record: BackOfficeDealRecord = {
      id: crypto.randomUUID(),
      dealNumber: input.dealNumber,
      customerName: input.customerName,
      vehicle: input.vehicle,
      salesperson: input.salesperson,
      fiManager: input.fiManager,
      lender: input.lender,
      saleDate: input.saleDate,
      salePrice: input.salePrice,
      fundingStatus: 'pending',
      titleStatus: 'not_started',
      payoffStatus: input.tradeVehicle ? 'requested' : 'not_needed',
      tradeVehicle: input.tradeVehicle,
      registrationStatus: 'pending',
      accountingStatus: 'open',
      missingDocs: input.missingDocs ?? [],
      stips: input.stips ?? [],
      stipsCleared: [],
      isReadyToFinalize: false,
      exceptions: [],
      status: 'active',
      createdAt: now(),
    }
    setRecords((prev) => [record, ...prev])
    return record
  }, [])

  const updateRecord = useCallback((id: string, updates: Partial<BackOfficeDealRecord>) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates, updatedAt: now() } : r))
    )
  }, [])

  const deleteRecord = useCallback((id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const addException = useCallback(
    (
      recordId: string,
      exception: Omit<BackOfficeException, 'id' | 'backOfficeRecordId' | 'createdAt'>
    ) => {
      const exc: BackOfficeException = {
        id: crypto.randomUUID(),
        backOfficeRecordId: recordId,
        ...exception,
        createdAt: now(),
      }
      setRecords((prev) =>
        prev.map((r) =>
          r.id === recordId
            ? { ...r, exceptions: [...r.exceptions, exc], updatedAt: now() }
            : r
        )
      )
    },
    []
  )

  const resolveException = useCallback((recordId: string, exceptionId: string, notes?: string) => {
    setRecords((prev) =>
      prev.map((r) => {
        if (r.id !== recordId) return r
        return {
          ...r,
          exceptions: r.exceptions.map((e) =>
            e.id === exceptionId
              ? { ...e, status: 'resolved' as const, resolvedAt: now(), notes: notes ?? e.notes }
              : e
          ),
          updatedAt: now(),
        }
      })
    )
  }, [])

  const clearDoc = useCallback((recordId: string, doc: string) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === recordId
          ? { ...r, missingDocs: r.missingDocs.filter((d) => d !== doc), updatedAt: now() }
          : r
      )
    )
  }, [])

  const clearStip = useCallback((recordId: string, stip: string) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === recordId
          ? {
              ...r,
              stipsCleared: [...r.stipsCleared, stip],
              stips: r.stips.filter((s) => s !== stip),
              updatedAt: now(),
            }
          : r
      )
    )
  }, [])

  const fundingQueue = useMemo(
    () => records.filter((r) => r.status === 'active' && ['pending', 'submitted', 'approved'].includes(r.fundingStatus)),
    [records]
  )

  const titleQueue = useMemo(
    () =>
      records.filter(
        (r) =>
          r.status === 'active' &&
          !['complete', 'not_started'].includes(r.titleStatus)
      ),
    [records]
  )

  const payoffQueue = useMemo(
    () =>
      records.filter(
        (r) =>
          r.status === 'active' &&
          ['requested', 'confirmed', 'exception'].includes(r.payoffStatus)
      ),
    [records]
  )

  const missingDocsQueue = useMemo(
    () => records.filter((r) => r.status === 'active' && r.missingDocs.length > 0),
    [records]
  )

  const exceptionQueue = useMemo(
    () =>
      records.filter(
        (r) =>
          r.status === 'active' &&
          r.exceptions.some((e) => e.status === 'open')
      ),
    [records]
  )

  const readyToFinalizeQueue = useMemo(
    () => records.filter((r) => r.status === 'active' && r.isReadyToFinalize && !r.finalizedAt),
    [records]
  )

  return {
    records,
    loading: false,
    fundingQueue,
    titleQueue,
    payoffQueue,
    missingDocsQueue,
    exceptionQueue,
    readyToFinalizeQueue,
    createRecord,
    updateRecord,
    deleteRecord,
    addException,
    resolveException,
    clearDoc,
    clearStip,
  }
}

export type { ExceptionType, ExceptionSeverity }
