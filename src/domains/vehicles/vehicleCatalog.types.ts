import { UUID } from '@/types/common'
import { DbRow } from '@/lib/db/supabase'

export interface VehicleCatalogItemRow extends DbRow {
  year?: number
  make?: string
  model?: string
  trim?: string
  package_data: Record<string, unknown>
  powertrain?: string
  body_style?: string
  segment?: string
  competitive_set: string[]
  ownership_notes?: string
}

export interface VehicleCatalogItem {
  id: UUID
  year?: number
  make?: string
  model?: string
  trim?: string
  packageData: Record<string, unknown>
  powertrain?: string
  bodyStyle?: string
  segment?: string
  competitiveSet: string[]
  ownershipNotes?: string
  createdAt: string
  updatedAt?: string
}

export interface CreateVehicleCatalogItemInput {
  year?: number
  make?: string
  model?: string
  trim?: string
  packageData?: Record<string, unknown>
  powertrain?: string
  bodyStyle?: string
  segment?: string
  competitiveSet?: string[]
  ownershipNotes?: string
}

export interface UpdateVehicleCatalogItemInput {
  year?: number
  make?: string
  model?: string
  trim?: string
  packageData?: Record<string, unknown>
  powertrain?: string
  bodyStyle?: string
  segment?: string
  competitiveSet?: string[]
  ownershipNotes?: string
}

export function mapVehicleCatalogItemRowToDomain(row: VehicleCatalogItemRow): VehicleCatalogItem {
  return {
    id: row.id,
    year: row.year,
    make: row.make,
    model: row.model,
    trim: row.trim,
    packageData: row.package_data || {},
    powertrain: row.powertrain,
    bodyStyle: row.body_style,
    segment: row.segment,
    competitiveSet: Array.isArray(row.competitive_set) ? row.competitive_set : [],
    ownershipNotes: row.ownership_notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
