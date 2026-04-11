/**
 * Shared query result type and simulated query helper.
 *
 * Every domain hook returns QueryResult<T>. The useSimulatedQuery helper
 * resolves mock data with a tiny delay — it will be replaced by a real
 * data-fetching layer in a later prompt.
 */
import { useState, useEffect, useMemo } from 'react'

export interface QueryResult<T> {
  data: T
  loading: boolean
  error: string | null
}

export function useSimulatedQuery<T>(resolver: () => T): QueryResult<T> {
  const [loading, setLoading] = useState(true)
  const data = useMemo(resolver, [])
  useEffect(() => { const t = setTimeout(() => setLoading(false), 80); return () => clearTimeout(t) }, [])
  return { data, loading, error: null }
}
