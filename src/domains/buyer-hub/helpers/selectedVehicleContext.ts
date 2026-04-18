/**
 * Selected Vehicle Context Helper
 * Provides utilities for tracking and sharing selected vehicle context
 * across the buyer hub customer journey
 */

import type { InventoryRecord } from '@/domains/inventory/inventory.runtime'

const SELECTED_UNIT_STORAGE_KEY = 'outcome.buyer-hub.selected-unit-id'
const SELECTED_UNIT_JOURNEY_KEY = 'outcome.buyer-hub.selected-unit-journey'

export interface SelectedVehicleJourney {
  unitId: string
  entryPoint: 'shop' | 'home' | 'compare' | 'favorites' | 'finance' | 'trade' | 'schedule' | 'inquiry'
  timestamp: number
}

/**
 * Store the currently selected unit across buyer hub pages
 */
export function setSelectedUnit(unitId: string, entryPoint?: string) {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(SELECTED_UNIT_STORAGE_KEY, unitId)

    if (entryPoint) {
      const journey: SelectedVehicleJourney = {
        unitId,
        entryPoint: entryPoint as any,
        timestamp: Date.now(),
      }
      window.localStorage.setItem(SELECTED_UNIT_JOURNEY_KEY, JSON.stringify(journey))
    }
  } catch (err) {
    console.error('Failed to set selected unit:', err)
  }
}

/**
 * Get the currently selected unit ID
 */
export function getSelectedUnitId(): string | null {
  if (typeof window === 'undefined') return null

  try {
    return window.localStorage.getItem(SELECTED_UNIT_STORAGE_KEY)
  } catch (err) {
    console.error('Failed to get selected unit:', err)
    return null
  }
}

/**
 * Get the journey data for the selected unit
 */
export function getSelectedUnitJourney(): SelectedVehicleJourney | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem(SELECTED_UNIT_JOURNEY_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (err) {
    console.error('Failed to get selected unit journey:', err)
    return null
  }
}

/**
 * Clear the selected unit context
 */
export function clearSelectedUnit() {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.removeItem(SELECTED_UNIT_STORAGE_KEY)
    window.localStorage.removeItem(SELECTED_UNIT_JOURNEY_KEY)
  } catch (err) {
    console.error('Failed to clear selected unit:', err)
  }
}

/**
 * Format vehicle title for display
 */
export function formatVehicleTitle(unit: InventoryRecord): string {
  const parts = [unit.year, unit.make, unit.model]
  if (unit.trim) parts.push(unit.trim)
  return parts.join(' ')
}

/**
 * Format price for display
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price)
}

/**
 * Format mileage for display
 */
export function formatMileage(mileage: number): string {
  return new Intl.NumberFormat('en-US').format(mileage)
}

/**
 * Get image URL with fallback for vehicle
 */
export function getVehicleImageUrl(unit: InventoryRecord | null): string {
  if (!unit) return '/inventory/national-car-mart/placeholder.jpg'

  // Check for photos from inventory runtime
  if (unit.photos && unit.photos.length > 0 && unit.photos[0].url) {
    return unit.photos[0].url
  }

  // Fallback
  return '/inventory/national-car-mart/placeholder.jpg'
}

/**
 * Build vehicle summary card context for cross-page display
 */
export function buildVehicleSummary(unit: InventoryRecord) {
  return {
    title: formatVehicleTitle(unit),
    price: formatPrice(unit.price),
    mileage: formatMileage(unit.mileage),
    image: getVehicleImageUrl(unit),
    vin: unit.vin,
    stockNumber: unit.stockNumber,
    year: unit.year,
    make: unit.make,
    model: unit.model,
    id: unit.id,
  }
}
