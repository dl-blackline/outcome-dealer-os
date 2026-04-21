/**
 * Sold records — React hooks
 */
import { useState, useEffect, useCallback } from 'react'
import { type QueryResult } from '@/hooks/useQueryResult'
import { type SoldRecord } from './sold.types'
import {
  getSoldRecord,
  getSoldRecordByDealId,
  listSoldRecords,
  listSoldRecordsByCustomer,
  markDealSold,
  finalizeDealDelivery,
  type MarkDealSoldResult,
} from './sold.service'
import { type MarkDealSoldInput } from './sold.types'
import { UUID } from '@/types/common'

export function useSoldRecord(id: string): QueryResult<SoldRecord | null> & { refresh: () => void } {
  const [data, setData] = useState<SoldRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [version, setVersion] = useState(0)

  const refresh = useCallback(() => setVersion(v => v + 1), [])

  useEffect(() => {
    if (!id) { setLoading(false); return }
    let cancelled = false
    setLoading(true)
    getSoldRecord(id).then((result) => {
      if (!cancelled) {
        setData(result.ok ? result.value : null)
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [id, version])

  return { data, loading, error: null, refresh }
}

export function useSoldRecordByDeal(dealId: string): QueryResult<SoldRecord | null> & { refresh: () => void } {
  const [data, setData] = useState<SoldRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [version, setVersion] = useState(0)

  const refresh = useCallback(() => setVersion(v => v + 1), [])

  useEffect(() => {
    if (!dealId) { setLoading(false); return }
    let cancelled = false
    setLoading(true)
    getSoldRecordByDealId(dealId).then((result) => {
      if (!cancelled) {
        setData(result.ok ? result.value : null)
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [dealId, version])

  return { data, loading, error: null, refresh }
}

export function useSoldRecords(): QueryResult<SoldRecord[]> & { refresh: () => void } {
  const [data, setData] = useState<SoldRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [version, setVersion] = useState(0)

  const refresh = useCallback(() => setVersion(v => v + 1), [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    listSoldRecords().then((result) => {
      if (!cancelled) {
        setData(result.ok ? result.value : [])
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [version])

  return { data, loading, error: null, refresh }
}

export function useSoldRecordsByCustomer(customerId: UUID): QueryResult<SoldRecord[]> & { refresh: () => void } {
  const [data, setData] = useState<SoldRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [version, setVersion] = useState(0)

  const refresh = useCallback(() => setVersion(v => v + 1), [])

  useEffect(() => {
    if (!customerId) { setLoading(false); return }
    let cancelled = false
    setLoading(true)
    listSoldRecordsByCustomer(customerId).then((result) => {
      if (!cancelled) {
        setData(result.ok ? result.value : [])
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [customerId, version])

  return { data, loading, error: null, refresh }
}

export interface SoldMutations {
  markSold: (input: MarkDealSoldInput) => Promise<MarkDealSoldResult | null>
  finalizeDelivery: (dealId: UUID, deliveryDate?: string) => Promise<SoldRecord | null>
}

export function useSoldMutations(): SoldMutations {
  const markSold = useCallback(async (input: MarkDealSoldInput): Promise<MarkDealSoldResult | null> => {
    const result = await markDealSold(input)
    return result.ok ? result.value : null
  }, [])

  const finalizeDelivery = useCallback(async (dealId: UUID, deliveryDate?: string): Promise<SoldRecord | null> => {
    const result = await finalizeDealDelivery(dealId, deliveryDate)
    return result.ok ? result.value : null
  }, [])

  return { markSold, finalizeDelivery }
}
