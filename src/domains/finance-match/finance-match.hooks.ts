import { useState, useEffect, useCallback } from 'react'
import {
  Lender,
  LenderProgram,
  LenderMatchRun,
  LenderMatchResult,
  DealStructureInput,
  UploadedProgramJob,
} from './finance-match.types'
import {
  listLenders,
  listLenderPrograms,
  getMatchRunHistory,
  runFinanceMatch,
  listProcessingJobs,
} from './finance-match.service'

// ─── useLenders ───────────────────────────────────────────────────────────────

export function useLenders() {
  const [lenders, setLenders] = useState<Lender[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await listLenders()
      if (result.ok) setLenders(result.value)
      else setError(result.error.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { lenders, loading, error, refresh }
}

// ─── useLenderPrograms ────────────────────────────────────────────────────────

export function useLenderPrograms(lenderId?: string) {
  const [programs, setPrograms] = useState<LenderProgram[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await listLenderPrograms(lenderId)
      if (result.ok) setPrograms(result.value)
      else setError(result.error.message)
    } finally {
      setLoading(false)
    }
  }, [lenderId])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { programs, loading, error, refresh }
}

// ─── useMatchRunHistory ───────────────────────────────────────────────────────

export function useMatchRunHistory(dealId?: string) {
  const [runs, setRuns] = useState<LenderMatchRun[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getMatchRunHistory(dealId)
      if (result.ok) setRuns(result.value)
      else setError(result.error.message)
    } finally {
      setLoading(false)
    }
  }, [dealId])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { runs, loading, error, refresh }
}

// ─── useRunFinanceMatch ───────────────────────────────────────────────────────

export function useRunFinanceMatch() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{
    run: LenderMatchRun
    results: LenderMatchResult[]
  } | null>(null)

  const execute = useCallback(async (input: DealStructureInput, userId?: string) => {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await runFinanceMatch(input, userId)
      if (res.ok) {
        setResult(res.value)
        return res.value
      } else {
        setError(res.error.message)
        return null
      }
    } finally {
      setLoading(false)
    }
  }, [])

  return { execute, loading, error, result }
}

// ─── useProcessingJobs ────────────────────────────────────────────────────────

export function useProcessingJobs() {
  const [jobs, setJobs] = useState<UploadedProgramJob[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await listProcessingJobs()
      if (result.ok) setJobs(result.value)
      else setError(result.error.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { jobs, loading, error, refresh }
}
