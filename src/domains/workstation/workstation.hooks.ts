/**
 * Workstation domain runtime hooks.
 */
import { useState, useCallback } from 'react'
import { useSimulatedQuery, type QueryResult } from '@/hooks/useQueryResult'
import { MOCK_WORKSTATION_CARDS, type WorkstationCard, type WorkstationColumnId } from '@/domains/workstation'

export function useWorkstationCards(): QueryResult<WorkstationCard[]> { return useSimulatedQuery(() => MOCK_WORKSTATION_CARDS) }

export interface WorkstationMutations {
  cards: WorkstationCard[]
  moveCard: (cardId: string, toCol: WorkstationColumnId) => void
  createCard: (partial: Omit<WorkstationCard, 'id' | 'createdAt' | 'updatedAt'>) => void
  completeCard: (cardId: string) => void
  reopenCard: (cardId: string) => void
}

export function useWorkstationMutations(): WorkstationMutations {
  const [cards, setCards] = useState<WorkstationCard[]>(MOCK_WORKSTATION_CARDS)

  const moveCard = useCallback((cardId: string, toCol: WorkstationColumnId) => {
    setCards(prev => prev.map(c =>
      c.id === cardId
        ? { ...c, columnId: toCol, status: toCol === 'done' ? 'completed' as const : (c as WorkstationCard & { status?: string }).status === 'completed' ? 'reopened' as const : (c as WorkstationCard & { status?: string }).status ?? 'active', updatedAt: new Date().toISOString() }
        : c
    ))
  }, [])

  const createCard = useCallback((partial: Omit<WorkstationCard, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString()
    const card: WorkstationCard = { ...partial, id: `wc-${Date.now()}`, createdAt: now, updatedAt: now }
    setCards(prev => [card, ...prev])
  }, [])

  const completeCard = useCallback((cardId: string) => {
    setCards(prev => prev.map(c =>
      c.id === cardId ? { ...c, columnId: 'done' as WorkstationColumnId, status: 'completed' as const, updatedAt: new Date().toISOString() } : c
    ))
  }, [])

  const reopenCard = useCallback((cardId: string) => {
    setCards(prev => prev.map(c =>
      c.id === cardId ? { ...c, columnId: 'inbox' as WorkstationColumnId, status: 'reopened' as const, updatedAt: new Date().toISOString() } : c
    ))
  }, [])

  return { cards, moveCard, createCard, completeCard, reopenCard }
}
