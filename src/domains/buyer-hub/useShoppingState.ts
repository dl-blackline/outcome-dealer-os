import { useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'outcome-dealer-shopping-state'

interface ShoppingState {
  savedUnitIds: string[]
  compareUnitIds: string[]
}

function loadState(): ShoppingState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return { savedUnitIds: [], compareUnitIds: [] }
}

function saveState(state: ShoppingState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch { /* ignore */ }
}

export function useShoppingState() {
  const [state, setState] = useState<ShoppingState>(loadState)

  useEffect(() => {
    saveState(state)
  }, [state])

  const toggleSaved = useCallback((unitId: string) => {
    setState(prev => {
      const exists = prev.savedUnitIds.includes(unitId)
      return {
        ...prev,
        savedUnitIds: exists
          ? prev.savedUnitIds.filter(id => id !== unitId)
          : [...prev.savedUnitIds, unitId],
      }
    })
  }, [])

  const toggleCompare = useCallback((unitId: string) => {
    setState(prev => {
      const exists = prev.compareUnitIds.includes(unitId)
      // Max 4 for compare
      if (!exists && prev.compareUnitIds.length >= 4) return prev
      return {
        ...prev,
        compareUnitIds: exists
          ? prev.compareUnitIds.filter(id => id !== unitId)
          : [...prev.compareUnitIds, unitId],
      }
    })
  }, [])

  const isSaved = useCallback((unitId: string) => state.savedUnitIds.includes(unitId), [state.savedUnitIds])
  const isComparing = useCallback((unitId: string) => state.compareUnitIds.includes(unitId), [state.compareUnitIds])
  const clearCompare = useCallback(() => setState(prev => ({ ...prev, compareUnitIds: [] })), [])
  const clearSaved = useCallback(() => setState(prev => ({ ...prev, savedUnitIds: [] })), [])

  return {
    savedUnitIds: state.savedUnitIds,
    compareUnitIds: state.compareUnitIds,
    toggleSaved,
    toggleCompare,
    isSaved,
    isComparing,
    clearCompare,
    clearSaved,
    savedCount: state.savedUnitIds.length,
    compareCount: state.compareUnitIds.length,
  }
}
