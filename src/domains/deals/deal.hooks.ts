/**
 * Deal domain runtime hooks — backed by deal.service.ts (KV store).
 *
 * Seeds MOCK_DEALS into KV on first load, then any newly created deals
 * (e.g. converted from leads) persist across page reloads.
 */
import { useState, useEffect, useCallback } from 'react'
import { type QueryResult } from '@/hooks/useQueryResult'
import { type MockDeal } from '@/lib/mockData'
import { listDeals, getDeal, createDeal } from './deal.service'

export function useDeals(): QueryResult<MockDeal[]> {
  const [data, setData] = useState<MockDeal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    listDeals().then((result) => {
      if (!cancelled) {
        setData(result.ok ? result.value : [])
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [])

  return { data, loading, error: null }
}

export function useDeal(id: string): QueryResult<MockDeal | null> {
  const [data, setData] = useState<MockDeal | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) { setLoading(false); return }
    let cancelled = false
    getDeal(id).then((result) => {
      if (!cancelled) {
        setData(result.ok ? result.value : null)
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [id])

  return { data, loading, error: null }
}

export interface DealMutations {
  deals: MockDeal[]
  loading: boolean
  convertLeadToDeal: (
    input: Omit<MockDeal, 'id' | 'createdAt'>
  ) => Promise<MockDeal | null>
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

  const convertLeadToDeal = useCallback(
    async (input: Omit<MockDeal, 'id' | 'createdAt'>): Promise<MockDeal | null> => {
      const result = await createDeal(input)
      if (result.ok) {
        setDeals(prev => [result.value, ...prev])
        return result.value
      }
      return null
    },
    []
  )

  return { deals, loading, convertLeadToDeal }
}
