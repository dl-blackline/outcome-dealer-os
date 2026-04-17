/**
 * Workstation domain runtime hooks — persisted via workstation.service.ts.
 *
 * Cards are loaded from (and written to) the KV store on every mutation so
 * that moves, creates, and completions survive a page reload.
 */
import { useState, useEffect, useCallback } from 'react'
import { type QueryResult } from '@/hooks/useQueryResult'
import {
  listWorkstationCards,
  moveWorkstationCard,
  createWorkstationCard,
  completeWorkstationCard,
  updateWorkstationCard,
  type WorkstationCard,
  type WorkstationColumnId,
} from '@/domains/workstation'

export function useWorkstationCards(): QueryResult<WorkstationCard[]> {
  const [data, setData] = useState<WorkstationCard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    listWorkstationCards().then((result) => {
      if (!cancelled) {
        setData(result.ok ? result.value : [])
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [])

  return { data, loading, error: null }
}

export interface WorkstationMutations {
  cards: WorkstationCard[]
  loading: boolean
  moveCard: (cardId: string, toCol: WorkstationColumnId) => void
  createCard: (partial: Omit<WorkstationCard, 'id' | 'createdAt' | 'updatedAt'>) => void
  completeCard: (cardId: string) => void
  reopenCard: (cardId: string) => void
}

export function useWorkstationMutations(): WorkstationMutations {
  const [cards, setCards] = useState<WorkstationCard[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const result = await listWorkstationCards()
    setCards(result.ok ? result.value : [])
    setLoading(false)
  }, [])

  useEffect(() => { void refresh() }, [refresh])

  const moveCard = useCallback((cardId: string, toCol: WorkstationColumnId) => {
    // Optimistic update for immediate UI feedback
    setCards(prev => prev.map(c =>
      c.id === cardId ? { ...c, columnId: toCol, updatedAt: new Date().toISOString() } : c
    ))
    void moveWorkstationCard(cardId, toCol)
  }, [])

  const createCard = useCallback((partial: Omit<WorkstationCard, 'id' | 'createdAt' | 'updatedAt'>) => {
    void (async () => {
      const result = await createWorkstationCard(partial)
      if (result.ok) {
        setCards(prev => [result.value, ...prev])
      }
    })()
  }, [])

  const completeCard = useCallback((cardId: string) => {
    setCards(prev => prev.map(c =>
      c.id === cardId ? { ...c, columnId: 'done' as WorkstationColumnId, updatedAt: new Date().toISOString() } : c
    ))
    void completeWorkstationCard(cardId)
  }, [])

  const reopenCard = useCallback((cardId: string) => {
    setCards(prev => prev.map(c =>
      c.id === cardId ? { ...c, columnId: 'inbox' as WorkstationColumnId, updatedAt: new Date().toISOString() } : c
    ))
    void updateWorkstationCard(cardId, { columnId: 'inbox' })
  }, [])

  return { cards, loading, moveCard, createCard, completeCard, reopenCard }
}
