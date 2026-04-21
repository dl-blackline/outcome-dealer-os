/**
 * Shared inventory status display utilities used by deal-linking components.
 */

export const INVENTORY_STATUS_LABELS: Record<string, string> = {
  available: 'Available',
  frontline: 'Frontline Ready',
  frontline_ready: 'Frontline Ready',
  recon: 'In Recon',
  hold: 'Hold',
  sold: 'Sold',
  delivered: 'Delivered',
  wholesale: 'Wholesale',
  archived: 'Archived',
  inventory: 'In Inventory',
}

export type InventoryStatusPillVariant = 'success' | 'info' | 'warning' | 'danger' | 'neutral'

export function inventoryStatusVariant(status: string): InventoryStatusPillVariant {
  const s = status.toLowerCase()
  if (s === 'available' || s === 'frontline' || s === 'frontline_ready') return 'success'
  if (s === 'recon') return 'info'
  if (s === 'hold' || s === 'wholesale') return 'warning'
  if (s === 'sold' || s === 'delivered' || s === 'archived') return 'danger'
  return 'neutral'
}

export function inventoryStatusLabel(status: string): string {
  return INVENTORY_STATUS_LABELS[status.toLowerCase()] ?? status
}

/** Statuses appropriate for retail deal attachment without any warning */
export const RETAIL_SAFE_STATUSES = new Set(['available', 'frontline', 'frontline_ready', 'inventory'])

/** Statuses that require a confirmation prompt before attaching */
export const WARN_STATUSES = new Set(['hold', 'recon'])

/** Statuses that block selection and require an explicit override */
export const BLOCK_STATUSES = new Set(['sold', 'delivered', 'wholesale', 'archived'])
