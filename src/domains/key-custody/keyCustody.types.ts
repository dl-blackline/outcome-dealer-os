/**
 * Key Custody domain — types.
 *
 * Tracks physical key check-out and check-in events for inventory units.
 * Each event records who has the keys, when, and for what purpose.
 *
 * Architecture note:
 * - Data is persisted to localStorage via keyCustody.runtime.ts (same pattern as recon)
 * - inventoryUnitId links to the canonical inventory record when available
 * - stockNumber + vehicleTitle provide display data without requiring inventory lookup
 */

export type KeyEventType =
  | 'checked_out' // Keys taken from board for test drive, demo, delivery, etc.
  | 'checked_in'  // Keys returned to board
  | 'transferred' // Keys handed from one person to another without returning to board
  | 'lost'        // Keys reported missing
  | 'found'       // Previously lost keys recovered

export const KEY_EVENT_LABELS: Record<KeyEventType, string> = {
  checked_out: 'Checked Out',
  checked_in: 'Checked In',
  transferred: 'Transferred',
  lost: 'Lost',
  found: 'Found',
}

export const KEY_EVENT_ICONS: Record<KeyEventType, string> = {
  checked_out: 'arrow-up-right',
  checked_in: 'arrow-down-left',
  transferred: 'arrows-left-right',
  lost: 'warning',
  found: 'check-circle',
}

export type KeyCheckoutReason =
  | 'test_drive'
  | 'demo'
  | 'appraisal'
  | 'service'
  | 'recon'
  | 'photo'
  | 'delivery'
  | 'manager_review'
  | 'other'

export const KEY_CHECKOUT_REASON_LABELS: Record<KeyCheckoutReason, string> = {
  test_drive: 'Test Drive',
  demo: 'Demo / Showing',
  appraisal: 'Trade Appraisal',
  service: 'Service',
  recon: 'Recon',
  photo: 'Photography',
  delivery: 'Delivery',
  manager_review: 'Manager Review',
  other: 'Other',
}

/** A single key custody event */
export interface KeyCustodyEvent {
  id: string

  /** Links to the canonical inventory unit record */
  inventoryUnitId?: string

  /** Short display identifier — shown when inventoryUnitId is not linked */
  stockNumber?: string

  /** Display title for the vehicle (e.g. "2023 Ford F-150 XLT") */
  vehicleTitle?: string

  /** What happened */
  eventType: KeyEventType

  /** Who took the keys (for checked_out / transferred events) */
  checkedOutTo?: string

  /** Who returned / found the keys */
  checkedInBy?: string

  /** Reason for checkout */
  checkoutReason?: KeyCheckoutReason

  /** Free-text notes */
  notes?: string

  /** ISO timestamp of the event */
  timestamp: string

  /** ISO timestamp of record creation */
  createdAt: string
}

/** Derived current custody state for a unit */
export interface KeyCustodyStatus {
  inventoryUnitId?: string
  stockNumber?: string
  vehicleTitle?: string

  /** Whether keys are currently checked out */
  isCheckedOut: boolean

  /** Who currently has the keys (from last checkout event) */
  currentHolder?: string

  /** Reason for current checkout */
  currentReason?: KeyCheckoutReason

  /** When keys were last checked out */
  checkedOutAt?: string

  /** Whether keys are flagged as lost */
  isLost: boolean

  /** Total minutes keys have been out in this session */
  minutesOut?: number

  /** All events for this unit, newest first */
  events: KeyCustodyEvent[]
}

// ── Inputs ────────────────────────────────────────────────────────────────────

export interface CheckOutKeysInput {
  inventoryUnitId?: string
  stockNumber?: string
  vehicleTitle?: string
  checkedOutTo: string
  checkoutReason?: KeyCheckoutReason
  notes?: string
}

export interface CheckInKeysInput {
  inventoryUnitId?: string
  stockNumber?: string
  vehicleTitle?: string
  checkedInBy: string
  notes?: string
}

export interface TransferKeysInput {
  inventoryUnitId?: string
  stockNumber?: string
  vehicleTitle?: string
  transferredTo: string
  notes?: string
}

export interface ReportLostInput {
  inventoryUnitId?: string
  stockNumber?: string
  vehicleTitle?: string
  notes?: string
}

export interface ReportFoundInput {
  inventoryUnitId?: string
  stockNumber?: string
  vehicleTitle?: string
  foundBy: string
  notes?: string
}
