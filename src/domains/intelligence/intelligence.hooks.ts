import { useState, useEffect, useCallback } from 'react'
import { CustomerIntelligence, RepPerformance, CloseProbability, VinEnrichment, IngestionEvent, IngestionJobState } from './intelligence.types'
import { listCustomerIntelligence } from './clv.service'
import {
  listRepPerformances,
} from './rep-attribution.service'
import {
  listCloseProbabilities,
} from './close-probability.service'
import {
  listVinEnrichments,
} from './vin-enrichment.service'
import {
  onIngestionEvent,
  onJobStateChange,
  getCurrentJobState,
} from './ingestion-stream.service'

// ─── CLV hook ─────────────────────────────────────────────────────────────────

export function useCustomerIntelligence() {
  const [data, setData] = useState<CustomerIntelligence[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    listCustomerIntelligence().then((result) => {
      if (!cancelled) {
        setData(result.ok ? result.value : [])
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [])

  return { data, loading }
}

// ─── Rep Performance hook ─────────────────────────────────────────────────────

export function useRepPerformances() {
  const [data, setData] = useState<RepPerformance[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const result = await listRepPerformances()
    setData(result.ok ? result.value : [])
    setLoading(false)
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { data, loading, refresh }
}

// ─── Close Probability hook ────────────────────────────────────────────────────

export function useCloseProbabilities() {
  const [data, setData] = useState<CloseProbability[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const result = await listCloseProbabilities()
    setData(result.ok ? result.value : [])
    setLoading(false)
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { data, loading, refresh }
}

// ─── VIN Enrichment hook ───────────────────────────────────────────────────────

export function useVinEnrichments() {
  const [data, setData] = useState<VinEnrichment[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const result = await listVinEnrichments()
    setData(result.ok ? result.value : [])
    setLoading(false)
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { data, loading, refresh }
}

// ─── Ingestion Stream hook ─────────────────────────────────────────────────────

const MAX_FEED_EVENTS = 100

export function useIngestionStream() {
  const [events, setEvents] = useState<IngestionEvent[]>([])
  const [jobState, setJobState] = useState<IngestionJobState>(getCurrentJobState)

  useEffect(() => {
    const unsubEvent = onIngestionEvent((event) => {
      setEvents((prev) => [event, ...prev].slice(0, MAX_FEED_EVENTS))
    })
    const unsubState = onJobStateChange((state) => {
      setJobState({ ...state })
    })
    return () => {
      unsubEvent()
      unsubState()
    }
  }, [])

  return { events, jobState }
}
