/**
 * inventory.diagnostics.ts
 *
 * Inventory health and hygiene diagnostics.
 *
 * These utilities help staff and admins identify bad inventory data before it
 * causes problems downstream (wrong pricing, missing photos, duplicate records,
 * conflicting publish states, etc.).
 *
 * All checks operate on a snapshot of InventoryRecord[] — callers load the
 * canonical inventory list first (via listRuntimeInventoryRecords or
 * useInventoryCatalog), then pass it here.  No mutations are performed.
 */

import type { InventoryRecord } from './inventory.runtime'

// ── Issue types ───────────────────────────────────────────────────────────────

export type DiagnosticSeverity = 'critical' | 'warning' | 'info'

export type DiagnosticCode =
  | 'MISSING_VIN'
  | 'MISSING_STOCK_NUMBER'
  | 'MISSING_PRICE'
  | 'MISSING_PRIMARY_PHOTO'
  | 'PUBLISHED_NO_PRICE'
  | 'PUBLISHED_NO_PHOTO'
  | 'RETAIL_BELOW_COST'
  | 'WHOLESALE_ABOVE_RETAIL'
  | 'MISSING_ACQUISITION_COST'
  | 'LIKELY_DUPLICATE_VIN'
  | 'LIKELY_DUPLICATE_STOCK'
  | 'INCONSISTENT_PUBLISH_STATE'
  | 'AGED_NO_PRICE_REDUCTION'
  | 'MISSING_DESCRIPTION'
  | 'RECON_STAGE_MISMATCH'

export interface InventoryDiagnosticIssue {
  /** The canonical inventory unit id */
  unitId: string
  /** Human-readable unit label */
  unitLabel: string
  code: DiagnosticCode
  severity: DiagnosticSeverity
  message: string
}

export interface InventoryDiagnosticReport {
  generatedAt: string
  totalUnits: number
  issueCount: number
  criticalCount: number
  warningCount: number
  infoCount: number
  issues: InventoryDiagnosticIssue[]
  /** Convenience grouping by code */
  byCode: Partial<Record<DiagnosticCode, InventoryDiagnosticIssue[]>>
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function label(r: InventoryRecord): string {
  return `${r.year} ${r.make} ${r.model}${r.trim ? ` ${r.trim}` : ''}${r.stockNumber ? ` [${r.stockNumber}]` : r.vin ? ` [${r.vin}]` : ''}`
}

function issue(
  r: InventoryRecord,
  code: DiagnosticCode,
  severity: DiagnosticSeverity,
  message: string,
): InventoryDiagnosticIssue {
  return { unitId: r.id, unitLabel: label(r), code, severity, message }
}

// ── Individual checks ─────────────────────────────────────────────────────────

function checkMissingVin(records: InventoryRecord[]): InventoryDiagnosticIssue[] {
  return records
    .filter((r) => !r.vin?.trim())
    .map((r) => issue(r, 'MISSING_VIN', 'warning', 'Unit has no VIN — duplicate detection and title tracking require a VIN.'))
}

function checkMissingStockNumber(records: InventoryRecord[]): InventoryDiagnosticIssue[] {
  return records
    .filter((r) => !r.stockNumber?.trim())
    .map((r) => issue(r, 'MISSING_STOCK_NUMBER', 'info', 'Unit has no stock number — assign one for consistent internal tracking.'))
}

function checkMissingPrice(records: InventoryRecord[]): InventoryDiagnosticIssue[] {
  return records
    .filter((r) => !r.price || r.price <= 0)
    .map((r) => issue(r, 'MISSING_PRICE', 'critical', 'Unit has no retail price set.'))
}

function checkMissingPrimaryPhoto(records: InventoryRecord[]): InventoryDiagnosticIssue[] {
  return records
    .filter((r) => {
      const realPhotos = r.photos.filter((p) => p.source !== 'placeholder' && p.variant !== 'placeholder')
      return realPhotos.length === 0
    })
    .map((r) => issue(r, 'MISSING_PRIMARY_PHOTO', 'warning', 'Unit has no real photos — only a placeholder image is shown.'))
}

function checkPublishedNoPrice(records: InventoryRecord[]): InventoryDiagnosticIssue[] {
  return records
    .filter((r) => r.isPublished && (!r.price || r.price <= 0))
    .map((r) => issue(r, 'PUBLISHED_NO_PRICE', 'critical', 'Unit is published publicly but has no retail price.'))
}

function checkPublishedNoPhoto(records: InventoryRecord[]): InventoryDiagnosticIssue[] {
  return records
    .filter((r) => {
      if (!r.isPublished) return false
      const realPhotos = r.photos.filter((p) => p.source !== 'placeholder' && p.variant !== 'placeholder')
      return realPhotos.length === 0
    })
    .map((r) => issue(r, 'PUBLISHED_NO_PHOTO', 'warning', 'Unit is published publicly but has no real photos — placeholder shown to buyers.'))
}

function checkRetailBelowCost(records: InventoryRecord[]): InventoryDiagnosticIssue[] {
  return records
    .filter((r) => {
      if (!r.totalInvestedCost || r.totalInvestedCost <= 0) return false
      return r.price > 0 && r.price < r.totalInvestedCost
    })
    .map((r) =>
      issue(
        r,
        'RETAIL_BELOW_COST',
        'critical',
        `Retail price ($${r.price.toLocaleString()}) is below total invested cost ($${r.totalInvestedCost!.toLocaleString()}).`,
      )
    )
}

function checkWholesaleAboveRetail(records: InventoryRecord[]): InventoryDiagnosticIssue[] {
  return records
    .filter((r) => r.wholesalePrice && r.price > 0 && r.wholesalePrice > r.price)
    .map((r) =>
      issue(
        r,
        'WHOLESALE_ABOVE_RETAIL',
        'warning',
        `Wholesale price ($${r.wholesalePrice!.toLocaleString()}) is higher than retail price ($${r.price.toLocaleString()}).`,
      )
    )
}

function checkMissingAcquisitionCost(records: InventoryRecord[]): InventoryDiagnosticIssue[] {
  return records
    .filter((r) => r.status !== 'sold' && (!r.acquisitionCost || r.acquisitionCost <= 0))
    .map((r) =>
      issue(r, 'MISSING_ACQUISITION_COST', 'info', 'No acquisition cost recorded — total invested cost cannot be computed accurately.')
    )
}

function checkDuplicateVins(records: InventoryRecord[]): InventoryDiagnosticIssue[] {
  const issues: InventoryDiagnosticIssue[] = []
  const vinMap = new Map<string, InventoryRecord[]>()

  for (const r of records) {
    if (!r.vin?.trim()) continue
    const norm = r.vin.trim().toUpperCase()
    const list = vinMap.get(norm) ?? []
    list.push(r)
    vinMap.set(norm, list)
  }

  for (const [vin, group] of vinMap.entries()) {
    if (group.length > 1) {
      for (const r of group) {
        issues.push(
          issue(
            r,
            'LIKELY_DUPLICATE_VIN',
            'critical',
            `VIN ${vin} appears on ${group.length} units — this is a likely duplicate record.`,
          )
        )
      }
    }
  }

  return issues
}

function checkDuplicateStockNumbers(records: InventoryRecord[]): InventoryDiagnosticIssue[] {
  const issues: InventoryDiagnosticIssue[] = []
  const stockMap = new Map<string, InventoryRecord[]>()

  for (const r of records) {
    if (!r.stockNumber?.trim()) continue
    const norm = r.stockNumber.trim().toLowerCase()
    const list = stockMap.get(norm) ?? []
    list.push(r)
    stockMap.set(norm, list)
  }

  for (const [stock, group] of stockMap.entries()) {
    if (group.length > 1) {
      for (const r of group) {
        issues.push(
          issue(
            r,
            'LIKELY_DUPLICATE_STOCK',
            'critical',
            `Stock number ${stock} appears on ${group.length} units — this is a likely duplicate record.`,
          )
        )
      }
    }
  }

  return issues
}

function checkInconsistentPublishState(records: InventoryRecord[]): InventoryDiagnosticIssue[] {
  return records
    .filter((r) => r.isPublished && !r.available)
    .map((r) =>
      issue(r, 'INCONSISTENT_PUBLISH_STATE', 'warning', 'Unit is marked published but not available — buyers can see it but cannot proceed.')
    )
}

function checkAgedNoPriceReduction(records: InventoryRecord[]): InventoryDiagnosticIssue[] {
  // Flag vehicles over 60 days that haven't had a price reduction from acquisition cost baseline
  return records
    .filter((r) => {
      if (r.daysInStock < 60) return false
      if (r.status === 'sold' || r.status === 'wholesale') return false
      if (!r.acquisitionCost || r.acquisitionCost <= 0) return false
      // If price is > 85% of acquisition cost after 60 days, flag it
      return r.price > r.acquisitionCost * 0.85
    })
    .map((r) =>
      issue(
        r,
        'AGED_NO_PRICE_REDUCTION',
        'warning',
        `Unit has been in stock ${r.daysInStock} days with no significant price reduction below acquisition cost.`,
      )
    )
}

function checkMissingDescription(records: InventoryRecord[]): InventoryDiagnosticIssue[] {
  return records
    .filter((r) => r.isPublished && (!r.description || r.description.trim().length < 20))
    .map((r) => issue(r, 'MISSING_DESCRIPTION', 'info', 'Published unit has a very short or missing public description.'))
}

function checkReconStageMismatch(records: InventoryRecord[]): InventoryDiagnosticIssue[] {
  // Units where status says 'frontline' but reconStage says something incomplete
  return records
    .filter((r) => {
      if (r.status !== 'frontline') return false
      if (!r.reconStage) return false
      return !['complete', 'frontline', 'photos'].includes(r.reconStage)
    })
    .map((r) =>
      issue(
        r,
        'RECON_STAGE_MISMATCH',
        'warning',
        `Unit status is 'frontline' but recon stage is '${r.reconStage}' — recon may not be complete.`,
      )
    )
}

// ── Main entry point ──────────────────────────────────────────────────────────

/**
 * Run all inventory health checks against the provided canonical record list.
 *
 * Returns a full diagnostic report with issues grouped by severity and code.
 */
export function runInventoryDiagnostics(records: InventoryRecord[]): InventoryDiagnosticReport {
  const allIssues: InventoryDiagnosticIssue[] = [
    ...checkMissingVin(records),
    ...checkMissingStockNumber(records),
    ...checkMissingPrice(records),
    ...checkMissingPrimaryPhoto(records),
    ...checkPublishedNoPrice(records),
    ...checkPublishedNoPhoto(records),
    ...checkRetailBelowCost(records),
    ...checkWholesaleAboveRetail(records),
    ...checkMissingAcquisitionCost(records),
    ...checkDuplicateVins(records),
    ...checkDuplicateStockNumbers(records),
    ...checkInconsistentPublishState(records),
    ...checkAgedNoPriceReduction(records),
    ...checkMissingDescription(records),
    ...checkReconStageMismatch(records),
  ]

  const byCode: Partial<Record<DiagnosticCode, InventoryDiagnosticIssue[]>> = {}
  for (const iss of allIssues) {
    const list = byCode[iss.code] ?? []
    list.push(iss)
    byCode[iss.code] = list
  }

  return {
    generatedAt: new Date().toISOString(),
    totalUnits: records.length,
    issueCount: allIssues.length,
    criticalCount: allIssues.filter((i) => i.severity === 'critical').length,
    warningCount: allIssues.filter((i) => i.severity === 'warning').length,
    infoCount: allIssues.filter((i) => i.severity === 'info').length,
    issues: allIssues,
    byCode,
  }
}

/**
 * Quick summary string for display in dashboards or admin toolbars.
 */
export function getInventoryHealthSummary(report: InventoryDiagnosticReport): string {
  if (report.issueCount === 0) {
    return `Inventory hygiene: ✓ No issues found across ${report.totalUnits} units.`
  }
  const parts: string[] = []
  if (report.criticalCount > 0) parts.push(`${report.criticalCount} critical`)
  if (report.warningCount > 0) parts.push(`${report.warningCount} warnings`)
  if (report.infoCount > 0) parts.push(`${report.infoCount} info`)
  return `Inventory hygiene: ${parts.join(', ')} across ${report.totalUnits} units.`
}
