/**
 * Selected Vehicle Context Helper
 * Provides utilities for tracking and sharing selected vehicle context
 * across the buyer hub customer journey
 */

import type { InventoryRecord } from '@/domains/inventory/inventory.runtime'
import { pickBestInventoryPhoto } from '@/domains/inventory/inventory.runtime'
import { getPremiumPlaceholderByBodyStyle } from '@/domains/inventory-photo/inventoryPhoto.placeholder'

const SELECTED_UNIT_STORAGE_KEY = 'outcome.buyer-hub.selected-unit-id'
const SELECTED_UNIT_JOURNEY_KEY = 'outcome.buyer-hub.selected-unit-journey'

const VALID_ENTRY_POINTS = [
  'shop',
  'home',
  'compare',
  'favorites',
  'finance',
  'trade',
  'schedule',
  'inquiry',
] as const

type SelectedVehicleEntryPoint = (typeof VALID_ENTRY_POINTS)[number]

export interface SelectedVehicleJourney {
  unitId: string
  entryPoint: SelectedVehicleEntryPoint
  timestamp: number
}

function isValidEntryPoint(value: unknown): value is SelectedVehicleEntryPoint {
  return typeof value === 'string' && VALID_ENTRY_POINTS.includes(value as SelectedVehicleEntryPoint)
}

/**
 * Store the currently selected unit across buyer hub pages
 */
export function setSelectedUnit(unitId: string, entryPoint?: string) {
  if (typeof window === 'undefined') return

  const trimmedUnitId = unitId.trim()
  if (!trimmedUnitId) return

  try {
    window.localStorage.setItem(SELECTED_UNIT_STORAGE_KEY, trimmedUnitId)

    if (entryPoint && isValidEntryPoint(entryPoint)) {
      const journey: SelectedVehicleJourney = {
        unitId: trimmedUnitId,
        entryPoint,
        timestamp: Date.now(),
      }
      window.localStorage.setItem(SELECTED_UNIT_JOURNEY_KEY, JSON.stringify(journey))
    }
  } catch {
    // Ignore storage errors in private browsing or restricted contexts.
  }
}

/**
 * Get the currently selected unit ID
 */
export function getSelectedUnitId(): string | null {
  if (typeof window === 'undefined') return null

  try {
    const value = window.localStorage.getItem(SELECTED_UNIT_STORAGE_KEY)
    if (!value) return null
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
  } catch {
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
    if (!raw) return null

    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null

    const journey = parsed as Partial<SelectedVehicleJourney>
    if (
      typeof journey.unitId !== 'string' ||
      !journey.unitId.trim() ||
      !isValidEntryPoint(journey.entryPoint) ||
      typeof journey.timestamp !== 'number' ||
      !Number.isFinite(journey.timestamp)
    ) {
      return null
    }

    const maxAgeMs = 1000 * 60 * 60 * 24 * 14
    if (Date.now() - journey.timestamp > maxAgeMs) return null

    return {
      unitId: journey.unitId.trim(),
      entryPoint: journey.entryPoint,
      timestamp: journey.timestamp,
    }
  } catch {
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
  if (!unit) return getPremiumPlaceholderByBodyStyle()
  return pickBestInventoryPhoto(unit)?.url || getPremiumPlaceholderByBodyStyle(unit.bodyStyle)
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
