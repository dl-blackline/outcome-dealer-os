/**
 * useCustomerProgress
 *
 * localStorage-backed hook that tracks what the current browser session
 * has submitted through the buyer hub (inquiries, applications, trades,
 * appointments). Used by NextStepsPage to show customers their history
 * and actionable next steps without requiring an account.
 */
import { useState, useCallback, useEffect } from 'react'
import type { CustomerProgressItem, CustomerVisibleStatus } from './buyerHub.types'

const STORAGE_KEY = 'outcome-dealer-customer-progress'

function loadProgress(): CustomerProgressItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as CustomerProgressItem[]
  } catch { /* ignore */ }
  return []
}

function saveProgress(items: CustomerProgressItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch { /* ignore */ }
}

export function useCustomerProgress() {
  const [items, setItems] = useState<CustomerProgressItem[]>(loadProgress)

  useEffect(() => {
    saveProgress(items)
  }, [items])

  const addItem = useCallback(
    (
      item: Omit<CustomerProgressItem, 'id' | 'createdAt' | 'updatedAt'>
    ) => {
      const now = new Date().toISOString()
      const newItem: CustomerProgressItem = {
        ...item,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      }
      setItems((prev) => [newItem, ...prev])
      return newItem
    },
    []
  )

  const updateItemStatus = useCallback(
    (id: string, status: CustomerVisibleStatus) => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, status, updatedAt: new Date().toISOString() }
            : item
        )
      )
    },
    []
  )

  const clearAll = useCallback(() => setItems([]), [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  return { items, addItem, updateItemStatus, removeItem, clearAll }
}
