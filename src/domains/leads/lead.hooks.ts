/**
 * Lead domain runtime hooks — backed by lead.runtime.ts (KV store).
 *
 * Newly created/updated leads persist across page reloads.
 */
import { useState, useEffect, useCallback } from 'react'
import { type QueryResult } from '@/hooks/useQueryResult'
import { type MockLead } from '@/lib/mockData'
import {
  listLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  type CreateLeadInput,
  type UpdateLeadInput,
} from './lead.runtime'

export function useLeads(): QueryResult<MockLead[]> & { refresh: () => void } {
  const [data, setData] = useState<MockLead[]>([])
  const [loading, setLoading] = useState(true)
  const [version, setVersion] = useState(0)

  const refresh = useCallback(() => setVersion(v => v + 1), [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    listLeads().then((result) => {
      if (!cancelled) {
        setData(result.ok ? result.value : [])
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [version])

  return { data, loading, error: null, refresh }
}

export function useLead(id: string): QueryResult<MockLead | null> & { refresh: () => void } {
  const [data, setData] = useState<MockLead | null>(null)
  const [loading, setLoading] = useState(true)
  const [version, setVersion] = useState(0)

  const refresh = useCallback(() => setVersion(v => v + 1), [])

  useEffect(() => {
    if (!id) { setLoading(false); return }
    let cancelled = false
    setLoading(true)
    getLead(id).then((result) => {
      if (!cancelled) {
        setData(result.ok ? result.value : null)
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [id, version])

  return { data, loading, error: null, refresh }
}

export interface LeadMutations {
  leads: MockLead[]
  loading: boolean
  refresh: () => void
  createLead: (input: CreateLeadInput) => Promise<MockLead | null>
  updateLead: (id: string, input: UpdateLeadInput) => Promise<MockLead | null>
  deleteLead: (id: string) => Promise<boolean>
}

export function useLeadMutations(): LeadMutations {
  const [leads, setLeads] = useState<MockLead[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const result = await listLeads()
    setLeads(result.ok ? result.value : [])
    setLoading(false)
  }, [])

  useEffect(() => { void refresh() }, [refresh])

  const handleCreate = useCallback(async (input: CreateLeadInput): Promise<MockLead | null> => {
    const result = await createLead(input)
    if (result.ok) {
      setLeads(prev => [result.value, ...prev])
      return result.value
    }
    return null
  }, [])

  const handleUpdate = useCallback(async (id: string, input: UpdateLeadInput): Promise<MockLead | null> => {
    const result = await updateLead(id, input)
    if (result.ok) {
      setLeads(prev => prev.map(l => l.id === id ? result.value : l))
      return result.value
    }
    return null
  }, [])

  const handleDelete = useCallback(async (id: string): Promise<boolean> => {
    const result = await deleteLead(id)
    if (result.ok) {
      setLeads(prev => prev.filter(l => l.id !== id))
      return true
    }
    return false
  }, [])

  return {
    leads,
    loading,
    refresh,
    createLead: handleCreate,
    updateLead: handleUpdate,
    deleteLead: handleDelete,
  }
}
