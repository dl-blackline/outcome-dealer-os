import { useCallback, useEffect, useMemo, useState } from 'react'
import type {
  ReconUnit,
  ReconIssue,
  ReconCostEntry,
  ReconActivity,
  CreateReconUnitInput,
  CreateReconIssueInput,
  CreateReconCostEntryInput,
  ReconStage,
} from './recon.types'

const KEYS = {
  units: 'outcome.recon.units',
  issues: 'outcome.recon.issues',
  costs: 'outcome.recon.costs',
  activity: 'outcome.recon.activity',
}

function now(): string {
  return new Date().toISOString()
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as T
    return Array.isArray(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

function writeJson<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, JSON.stringify(value))
}

export function useReconRuntime() {
  const [units, setUnits] = useState<ReconUnit[]>(() => {
    return readJson<ReconUnit[]>(KEYS.units, [])
  })

  const [issues, setIssues] = useState<ReconIssue[]>(() => {
    return readJson<ReconIssue[]>(KEYS.issues, [])
  })

  const [costEntries, setCostEntries] = useState<ReconCostEntry[]>(() => {
    return readJson<ReconCostEntry[]>(KEYS.costs, [])
  })

  const [activity, setActivity] = useState<ReconActivity[]>(() =>
    readJson<ReconActivity[]>(KEYS.activity, [])
  )

  useEffect(() => { writeJson(KEYS.units, units) }, [units])
  useEffect(() => { writeJson(KEYS.issues, issues) }, [issues])
  useEffect(() => { writeJson(KEYS.costs, costEntries) }, [costEntries])
  useEffect(() => { writeJson(KEYS.activity, activity) }, [activity])

  const createUnit = useCallback((input: CreateReconUnitInput): ReconUnit => {
    const unit: ReconUnit = {
      id: crypto.randomUUID(),
      stockNumber: input.stockNumber,
      year: input.year,
      make: input.make,
      model: input.model,
      trim: input.trim,
      color: input.color,
      vin: input.vin,
      currentStage: input.currentStage ?? 'intake',
      assignedTech: input.assignedTech,
      estimatedCompletion: input.estimatedCompletion,
      targetDays: input.targetDays ?? 7,
      daysInRecon: 0,
      totalReconCost: 0,
      floorPlanDailyRate: input.floorPlanDailyRate,
      floorPlanAccrued: 0,
      notes: input.notes,
      createdAt: now(),
    }
    setUnits((prev) => [unit, ...prev])
    return unit
  }, [])

  const updateUnit = useCallback((id: string, updates: Partial<ReconUnit>) => {
    setUnits((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...updates, updatedAt: now() } : u))
    )
  }, [])

  const deleteUnit = useCallback((id: string) => {
    setUnits((prev) => prev.filter((u) => u.id !== id))
    setIssues((prev) => prev.filter((i) => i.reconUnitId !== id))
    setCostEntries((prev) => prev.filter((c) => c.reconUnitId !== id))
    setActivity((prev) => prev.filter((a) => a.reconUnitId !== id))
  }, [])

  const addIssue = useCallback((input: CreateReconIssueInput): ReconIssue => {
    const issue: ReconIssue = {
      id: crypto.randomUUID(),
      reconUnitId: input.reconUnitId,
      title: input.title,
      description: input.description,
      category: input.category,
      severity: input.severity,
      status: 'open',
      estimatedCost: input.estimatedCost,
      assignedTo: input.assignedTo,
      notes: input.notes,
      createdAt: now(),
    }
    setIssues((prev) => [issue, ...prev])
    return issue
  }, [])

  const updateIssue = useCallback((id: string, updates: Partial<ReconIssue>) => {
    setIssues((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...updates, updatedAt: now() } : i))
    )
  }, [])

  const removeIssue = useCallback((id: string) => {
    setIssues((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const addCostEntry = useCallback((input: CreateReconCostEntryInput): ReconCostEntry => {
    const entry: ReconCostEntry = {
      id: crypto.randomUUID(),
      reconUnitId: input.reconUnitId,
      category: input.category,
      description: input.description,
      vendor: input.vendor,
      invoiceNumber: input.invoiceNumber,
      amount: input.amount,
      laborHours: input.laborHours,
      partsAmount: input.partsAmount,
      laborAmount: input.laborAmount,
      enteredBy: input.enteredBy,
      date: input.date,
      createdAt: now(),
    }
    setCostEntries((prev) => [entry, ...prev])
    // update unit total
    setUnits((prev) =>
      prev.map((u) =>
        u.id === input.reconUnitId
          ? { ...u, totalReconCost: u.totalReconCost + input.amount, updatedAt: now() }
          : u
      )
    )
    return entry
  }, [])

  const updateCostEntry = useCallback((id: string, updates: Partial<ReconCostEntry>) => {
    setCostEntries((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: now() } : c))
    )
  }, [])

  const removeCostEntry = useCallback((id: string) => {
    setCostEntries((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const logActivity = useCallback(
    (unitId: string, stage: ReconStage, action: string, performedBy?: string, notes?: string) => {
      const entry: ReconActivity = {
        id: crypto.randomUUID(),
        reconUnitId: unitId,
        stage,
        action,
        performedBy,
        notes,
        timestamp: now(),
        createdAt: now(),
      }
      setActivity((prev) => [entry, ...prev])
    },
    []
  )

  const getUnitSummary = useCallback(
    (unitId: string) => {
      const unitCosts = costEntries.filter((c) => c.reconUnitId === unitId)
      const unitIssues = issues.filter((i) => i.reconUnitId === unitId)
      const openIssues = unitIssues.filter((i) => i.status === 'open' || i.status === 'in_progress')
      const unit = units.find((u) => u.id === unitId)
      return {
        totalCost: unitCosts.reduce((s, c) => s + c.amount, 0),
        issueCount: unitIssues.length,
        openIssues: openIssues.length,
        daysInRecon: unit?.daysInRecon ?? 0,
      }
    },
    [costEntries, issues, units]
  )

  const stageCountMap = useMemo(() => {
    const map: Partial<Record<ReconStage, number>> = {}
    for (const u of units) {
      map[u.currentStage] = (map[u.currentStage] ?? 0) + 1
    }
    return map
  }, [units])

  return {
    units,
    issues,
    costEntries,
    activity,
    loading: false,
    stageCountMap,
    createUnit,
    updateUnit,
    deleteUnit,
    addIssue,
    updateIssue,
    removeIssue,
    addCostEntry,
    updateCostEntry,
    removeCostEntry,
    logActivity,
    getUnitSummary,
  }
}
