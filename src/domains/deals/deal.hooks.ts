/**
 * Deal domain runtime hooks — backed by deal.service.ts (KV store).
 *
 * Newly created deals (e.g. converted from leads) persist across page reloads.
 */
import { useState, useEffect, useCallback } from 'react'
import { type QueryResult } from '@/hooks/useQueryResult'
import { type MockDeal } from '@/lib/mockData'
import { listDeals, getDeal, createDeal, updateDeal, deleteDeal } from './deal.service'

export function useDeals(): QueryResult<MockDeal[]> & { refresh: () => void } {
  const [data, setData] = useState<MockDeal[]>([])
  const [loading, setLoading] = useState(true)
  const [version, setVersion] = useState(0)

  const refresh = useCallback(() => setVersion(v => v + 1), [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    listDeals().then((result) => {
      if (!cancelled) {
        setData(result.ok ? result.value : [])
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [version])

  return { data, loading, error: null, refresh }
}

export function useDeal(id: string): QueryResult<MockDeal | null> & { refresh: () => void } {
  const [data, setData] = useState<MockDeal | null>(null)
  const [loading, setLoading] = useState(true)
  const [version, setVersion] = useState(0)

  const refresh = useCallback(() => setVersion(v => v + 1), [])

  useEffect(() => {
    if (!id) { setLoading(false); return }
    let cancelled = false
    setLoading(true)
    getDeal(id).then((result) => {
      if (!cancelled) {
        setData(result.ok ? result.value : null)
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [id, version])

  return { data, loading, error: null, refresh }
}

export interface DealMutations {
  deals: MockDeal[]
  loading: boolean
  refresh: () => void
  convertLeadToDeal: (
    input: Omit<MockDeal, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<MockDeal | null>
  createDeal: (
    input: Omit<MockDeal, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<MockDeal | null>
  updateDeal: (id: string, input: Partial<Omit<MockDeal, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<MockDeal | null>
  deleteDeal: (id: string) => Promise<boolean>
}

export function useDealMutations(): DealMutations {
  const [deals, setDeals] = useState<MockDeal[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const result = await listDeals()
    setDeals(result.ok ? result.value : [])
    setLoading(false)
  }, [])

  useEffect(() => { void refresh() }, [refresh])

  const handleCreate = useCallback(
    async (input: Omit<MockDeal, 'id' | 'createdAt' | 'updatedAt'>): Promise<MockDeal | null> => {
      const result = await createDeal(input)
      if (result.ok) {
        setDeals(prev => [result.value, ...prev])
        return result.value
      }
      return null
    },
    []
  )

  const handleUpdate = useCallback(
    async (id: string, input: Partial<Omit<MockDeal, 'id' | 'createdAt' | 'updatedAt'>>): Promise<MockDeal | null> => {
      const result = await updateDeal(id, input)
      if (result.ok) {
        setDeals(prev => prev.map(d => d.id === id ? result.value : d))
        return result.value
      }
      return null
    },
    []
  )

  const handleDelete = useCallback(async (id: string): Promise<boolean> => {
    const result = await deleteDeal(id)
    if (result.ok) {
      setDeals(prev => prev.filter(d => d.id !== id))
      return true
    }
    return false
  }, [])

  return {
    deals,
    loading,
    refresh,
    convertLeadToDeal: handleCreate,
    createDeal: handleCreate,
    updateDeal: handleUpdate,
    deleteDeal: handleDelete,
  }
}
