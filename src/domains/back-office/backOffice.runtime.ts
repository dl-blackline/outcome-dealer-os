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

const SEED_RECORDS: BackOfficeDealRecord[] = [
  {
    id: 'bo-seed-1',
    dealNumber: 'D-10842',
    customerName: 'James & Patricia Whitfield',
    vehicle: '2022 Ford F-150 XLT — #A1042',
    salesperson: 'Tony R.',
    fiManager: 'Dana L.',
    lender: 'Capital One Auto',
    saleDate: new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10),
    salePrice: 42500,
    fundingStatus: 'submitted',
    fundingAmount: 38200,
    titleStatus: 'in_process',
    payoffStatus: 'requested',
    payoffAmount: 14200,
    payoffDueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    tradeVehicle: '2019 Toyota Tacoma',
    registrationStatus: 'pending',
    accountingStatus: 'open',
    missingDocs: ['Insurance Card', 'Proof of Income'],
    stips: ['Proof of Income', 'Recent Pay Stub'],
    stipsCleared: [],
    isReadyToFinalize: false,
    exceptions: [],
    status: 'active',
    createdAt: now(),
  },
  {
    id: 'bo-seed-2',
    dealNumber: 'D-10835',
    customerName: 'Marcus Johnson',
    vehicle: '2021 Chevrolet Silverado LT — #A1039',
    salesperson: 'Kelly M.',
    fiManager: 'Dana L.',
    lender: 'Ally Financial',
    saleDate: new Date(Date.now() - 8 * 86400000).toISOString().slice(0, 10),
    salePrice: 38900,
    fundingStatus: 'funded',
    fundingDate: new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10),
    fundingAmount: 35100,
    titleStatus: 'pending_payoff',
    payoffStatus: 'confirmed',
    payoffAmount: 18500,
    payoffDueDate: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
    registrationStatus: 'submitted',
    accountingStatus: 'posted',
    missingDocs: [],
    stips: [],
    stipsCleared: ['Proof of Income', 'Insurance Card'],
    isReadyToFinalize: false,
    exceptions: [
      {
        id: 'exc-seed-1',
        backOfficeRecordId: 'bo-seed-2',
        type: 'title',
        description: 'Trade title not yet received from lienholder',
        severity: 'high',
        status: 'open',
        assignedTo: 'Office Manager',
        createdAt: now(),
      },
    ],
    status: 'active',
    createdAt: now(),
  },
  {
    id: 'bo-seed-3',
    dealNumber: 'D-10821',
    customerName: 'Rebecca Nguyen',
    vehicle: '2023 Toyota Camry SE — #A1051',
    salesperson: 'Tony R.',
    fiManager: 'Sam K.',
    lender: 'Toyota Financial',
    saleDate: new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10),
    salePrice: 27800,
    fundingStatus: 'funded',
    fundingDate: new Date(Date.now() - 9 * 86400000).toISOString().slice(0, 10),
    fundingAmount: 25200,
    titleStatus: 'received',
    titleReceivedDate: new Date(Date.now() - 4 * 86400000).toISOString().slice(0, 10),
    payoffStatus: 'not_needed',
    registrationStatus: 'in_process',
    accountingStatus: 'posted',
    missingDocs: [],
    stips: [],
    stipsCleared: ['Insurance Card', "Driver's License (Front)", "Driver's License (Back)"],
    isReadyToFinalize: true,
    exceptions: [],
    status: 'active',
    createdAt: now(),
  },
  {
    id: 'bo-seed-4',
    dealNumber: 'D-10808',
    customerName: 'David & Maria Castillo',
    vehicle: '2020 Honda CR-V EX — #A1033',
    salesperson: 'Marco B.',
    fiManager: 'Dana L.',
    lender: 'Honda Financial Services',
    saleDate: new Date(Date.now() - 21 * 86400000).toISOString().slice(0, 10),
    salePrice: 31200,
    fundingStatus: 'approved',
    fundingAmount: 28000,
    titleStatus: 'in_process',
    payoffStatus: 'requested',
    payoffAmount: 12800,
    payoffDueDate: new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10),
    tradeVehicle: '2017 Honda Accord',
    registrationStatus: 'pending',
    accountingStatus: 'open',
    missingDocs: ['Trade Title', 'Trade Payoff Authorization'],
    stips: ['Trade Title'],
    stipsCleared: ['Insurance Card'],
    isReadyToFinalize: false,
    exceptions: [
      {
        id: 'exc-seed-2',
        backOfficeRecordId: 'bo-seed-4',
        type: 'payoff',
        description: 'Trade payoff past due — lienholder not responsive',
        severity: 'critical',
        status: 'open',
        assignedTo: 'GM',
        createdAt: now(),
      },
    ],
    status: 'active',
    createdAt: now(),
  },
  {
    id: 'bo-seed-5',
    dealNumber: 'D-10791',
    customerName: 'Sandra Okafor',
    vehicle: '2022 Toyota RAV4 XLE — #A1028',
    salesperson: 'Kelly M.',
    fiManager: 'Sam K.',
    lender: 'Credit Union (SECU)',
    saleDate: new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10),
    salePrice: 34500,
    fundingStatus: 'funded',
    fundingDate: new Date(Date.now() - 25 * 86400000).toISOString().slice(0, 10),
    fundingAmount: 31000,
    titleStatus: 'sent_to_dmv',
    titleSentDate: new Date(Date.now() - 10 * 86400000).toISOString().slice(0, 10),
    payoffStatus: 'not_needed',
    registrationStatus: 'in_process',
    accountingStatus: 'reconciled',
    missingDocs: [],
    stips: [],
    stipsCleared: ['Insurance Card', 'Proof of Residence', "Driver's License (Front)"],
    isReadyToFinalize: false,
    finalizedAt: undefined,
    exceptions: [],
    status: 'active',
    createdAt: now(),
  },
]

export function useBackOfficeRuntime() {
  const [records, setRecords] = useState<BackOfficeDealRecord[]>(() => {
    const stored = readLocal()
    if (stored.length > 0) return stored
    writeLocal(SEED_RECORDS)
    return SEED_RECORDS
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
