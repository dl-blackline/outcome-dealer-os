import { useCallback, useEffect, useMemo, useState } from 'react'
import { BUYER_HUB_INVENTORY } from '@/domains/buyer-hub/data/nationalCarMartInventory.generated'
import { getSupabaseBrowserClient, getSupabaseStorageBucket, isSupabaseConfigured } from '@/lib/supabase/client'

export interface InventoryPhotoRecord {
  id: string
  inventoryId: string
  url: string
  storagePath?: string
  alt: string
  sortOrder: number
  isCover: boolean
  source: 'repo' | 'remote' | 'supabase' | 'placeholder'
}

export interface InventoryRecord {
  id: string
  listingId: string
  stockNumber?: string
  vin?: string
  year: number
  make: string
  model: string
  trim: string
  bodyStyle: string
  mileage: number
  price: number
  status: string
  available: boolean
  isPublished: boolean
  isFeatured: boolean
  daysInStock: number
  description: string
  features: string[]
  color?: string
  condition?: string
  drivetrain?: string
  engine?: string
  transmission?: string
  photoArchiveStatus?: string
  detailUrl?: string
  source: 'master_sheet' | 'supabase'
  photos: InventoryPhotoRecord[]
}

export interface InventoryRecordUpdate {
  price?: number
  status?: string
  available?: boolean
  isPublished?: boolean
  isFeatured?: boolean
  description?: string
  features?: string[]
  color?: string
  condition?: string
  drivetrain?: string
  engine?: string
  transmission?: string
}

type LocalInventoryOverride = Partial<InventoryRecordUpdate>

export interface InventoryRecordCreateInput {
  stockNumber?: string
  vin?: string
  year: number
  make: string
  model: string
  trim?: string
  mileage?: number
  bodyStyle?: string
  price?: number
  status?: string
  available?: boolean
  isPublished?: boolean
  isFeatured?: boolean
  description?: string
  features?: string[]
  color?: string
  condition?: string
  drivetrain?: string
  engine?: string
  transmission?: string
}

interface SupabaseInventoryUnitRow {
  id: string
  source_listing_id?: string | null
  vin?: string | null
  stock_number?: string | null
  year?: number | null
  make?: string | null
  model?: string | null
  trim?: string | null
  mileage?: number | null
  body_style?: string | null
  sale_price?: number | null
  list_price?: number | null
  status?: string | null
  aging_days?: number | null
  public_description?: string | null
  features?: string[] | null
  color?: string | null
  vehicle_condition?: string | null
  drivetrain?: string | null
  engine?: string | null
  transmission?: string | null
  is_published?: boolean | null
  is_featured?: boolean | null
  available_publicly?: boolean | null
}

interface SupabaseVehiclePhotoRow {
  id: string
  inventory_unit_id: string
  photo_url?: string | null
  storage_path?: string | null
  alt_text?: string | null
  sort_order?: number | null
  is_cover?: boolean | null
}

const INVENTORY_OVERRIDE_KEY = 'outcome.inventory.overrides'
const INVENTORY_IMPORTED_KEY = 'outcome.inventory.imported-records'
const INVENTORY_UPDATE_EVENT = 'outcome.inventory.updated'
const PLACEHOLDER_IMAGE = '/inventory/national-car-mart/placeholder.jpg'

function emitInventoryUpdate() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(INVENTORY_UPDATE_EVENT))
}

function readOverrides(): Record<string, LocalInventoryOverride> {
  if (typeof window === 'undefined') return {}

  try {
    const raw = window.localStorage.getItem(INVENTORY_OVERRIDE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeOverrides(overrides: Record<string, LocalInventoryOverride>) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(INVENTORY_OVERRIDE_KEY, JSON.stringify(overrides))
  emitInventoryUpdate()
}

function readImportedRecords(): InventoryRecord[] {
  if (typeof window === 'undefined') return []

  try {
    const raw = window.localStorage.getItem(INVENTORY_IMPORTED_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeImportedRecords(records: InventoryRecord[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(INVENTORY_IMPORTED_KEY, JSON.stringify(records))
  emitInventoryUpdate()
}

function inferDrivetrain(highlights: string[]): string | undefined {
  return highlights.find((item) => /AWD|FWD|RWD|4WD/i.test(item))
}

function buildPhotos(unit: (typeof BUYER_HUB_INVENTORY)[number]): InventoryPhotoRecord[] {
  const photos: InventoryPhotoRecord[] = []
  const alt = `${unit.year} ${unit.make} ${unit.model} ${unit.trim}`

  if (unit.imageUrl) {
    photos.push({
      id: `${unit.id}-repo-cover`,
      inventoryId: unit.id,
      url: unit.imageUrl,
      storagePath: unit.imagePath,
      alt,
      sortOrder: 0,
      isCover: true,
      source: 'repo',
    })
  }

  if (unit.imageSourceUrl && unit.imageSourceUrl !== unit.imageUrl) {
    photos.push({
      id: `${unit.id}-remote-alt`,
      inventoryId: unit.id,
      url: unit.imageSourceUrl,
      alt,
      sortOrder: photos.length,
      isCover: photos.length === 0,
      source: 'remote',
    })
  }

  if (photos.length === 0) {
    photos.push({
      id: `${unit.id}-placeholder`,
      inventoryId: unit.id,
      url: PLACEHOLDER_IMAGE,
      alt,
      sortOrder: 0,
      isCover: true,
      source: 'placeholder',
    })
  }

  return photos
}

function buildSeedDescription(unit: (typeof BUYER_HUB_INVENTORY)[number]): string {
  const drivetrain = inferDrivetrain(unit.highlights)
  const parts = [
    `${unit.year} ${unit.make} ${unit.model} ${unit.trim}`,
    `${unit.mileage.toLocaleString()} miles`,
    unit.transmission,
    drivetrain,
  ].filter(Boolean)

  return `${parts.join(' · ')}. Ready for your next test drive.`
}

function mapSeedInventoryToRecord(unit: (typeof BUYER_HUB_INVENTORY)[number]): InventoryRecord {
  return {
    id: unit.id,
    listingId: unit.listingId,
    stockNumber: unit.stockNumber,
    vin: unit.vin,
    year: unit.year,
    make: unit.make,
    model: unit.model,
    trim: unit.trim,
    bodyStyle: unit.bodyStyle,
    mileage: unit.mileage,
    price: unit.askingPrice,
    status: unit.status,
    available: unit.available,
    isPublished: unit.available,
    isFeatured: unit.daysInStock <= 12,
    daysInStock: unit.daysInStock,
    description: buildSeedDescription(unit),
    features: unit.highlights,
    drivetrain: inferDrivetrain(unit.highlights),
    transmission: unit.transmission,
    photoArchiveStatus: unit.photoArchiveStatus,
    detailUrl: unit.detailUrl,
    source: 'master_sheet',
    photos: buildPhotos(unit),
  }
}

function applyOverride(record: InventoryRecord, override?: LocalInventoryOverride): InventoryRecord {
  if (!override) return record

  return {
    ...record,
    ...override,
    features: override.features ?? record.features,
  }
}

export function getMasterInventorySource() {
  return {
    label: 'National Car Mart master inventory entry sheet',
    type: 'csv',
    sourcePath: 'src/domains/buyer-hub/data/nationalCarMartInventory.seed.csv',
    generatedPath: 'src/domains/buyer-hub/data/nationalCarMartInventory.generated.ts',
    photoDirectory: 'public/inventory/national-car-mart',
    storageBucket: getSupabaseStorageBucket(),
  }
}

export function getSeedInventoryRecords(): InventoryRecord[] {
  const overrides = readOverrides()

  return BUYER_HUB_INVENTORY
    .map(mapSeedInventoryToRecord)
    .map((record) => applyOverride(record, overrides[record.id]))
}

function mergeLocalRuntimeRecords(seedRecords: InventoryRecord[]): InventoryRecord[] {
  const importedRecords = readImportedRecords()
  if (importedRecords.length === 0) return seedRecords

  const existingIds = new Set(seedRecords.map((record) => record.id))
  const importedOnly = importedRecords.filter((record) => !existingIds.has(record.id))

  return [...seedRecords, ...importedOnly]
}

function mapSupabasePhoto(row: SupabaseVehiclePhotoRow, fallbackAlt: string): InventoryPhotoRecord {
  const url = row.photo_url || row.storage_path || PLACEHOLDER_IMAGE

  return {
    id: row.id,
    inventoryId: row.inventory_unit_id,
    url,
    storagePath: row.storage_path || undefined,
    alt: row.alt_text || fallbackAlt,
    sortOrder: row.sort_order ?? 0,
    isCover: Boolean(row.is_cover),
    source: row.storage_path ? 'supabase' : url === PLACEHOLDER_IMAGE ? 'placeholder' : 'remote',
  }
}

async function loadSupabaseInventoryRecords(): Promise<InventoryRecord[] | null> {
  const client = getSupabaseBrowserClient()
  if (!client) return null

  const [{ data: unitRows, error: unitError }, { data: photoRows, error: photoError }] = await Promise.all([
    client.from('inventory_units').select('*').order('year', { ascending: false }),
    client.from('vehicle_photos').select('*').order('sort_order', { ascending: true }),
  ])

  if (unitError || photoError || !unitRows) return null

  const photosByUnit = new Map<string, InventoryPhotoRecord[]>()

  for (const row of (photoRows || []) as SupabaseVehiclePhotoRow[]) {
    const list = photosByUnit.get(row.inventory_unit_id) || []
    list.push(mapSupabasePhoto(row, 'Vehicle photo'))
    photosByUnit.set(row.inventory_unit_id, list)
  }

  return (unitRows as SupabaseInventoryUnitRow[]).map((row) => {
    const title = [row.year, row.make, row.model, row.trim].filter(Boolean).join(' ')
    const photos = photosByUnit.get(row.id) || [
      {
        id: `${row.id}-placeholder`,
        inventoryId: row.id,
        url: PLACEHOLDER_IMAGE,
        alt: title || 'Vehicle photo',
        sortOrder: 0,
        isCover: true,
        source: 'placeholder',
      },
    ]

    return {
      id: row.id,
      listingId: row.source_listing_id || row.id,
      stockNumber: row.stock_number || undefined,
      vin: row.vin || undefined,
      year: row.year || 0,
      make: row.make || 'Unknown',
      model: row.model || 'Vehicle',
      trim: row.trim || '',
      bodyStyle: row.body_style || 'Vehicle',
      mileage: row.mileage || 0,
      price: row.sale_price || row.list_price || 0,
      status: row.status || 'inventory',
      available: row.available_publicly ?? true,
      isPublished: row.is_published ?? true,
      isFeatured: row.is_featured ?? false,
      daysInStock: row.aging_days || 0,
      description: row.public_description || `${title} ready for your next appointment.`,
      features: Array.isArray(row.features) ? row.features : [],
      color: row.color || undefined,
      condition: row.vehicle_condition || undefined,
      drivetrain: row.drivetrain || undefined,
      engine: row.engine || undefined,
      transmission: row.transmission || undefined,
      source: 'supabase',
      photos,
    }
  })
}

export async function listRuntimeInventoryRecords(): Promise<InventoryRecord[]> {
  if (isSupabaseConfigured()) {
    const supabaseRecords = await loadSupabaseInventoryRecords()
    if (supabaseRecords && supabaseRecords.length > 0) return supabaseRecords
  }

  return mergeLocalRuntimeRecords(getSeedInventoryRecords())
}

function createLocalRuntimeRecord(input: InventoryRecordCreateInput): InventoryRecord {
  const id = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const title = `${input.year} ${input.make} ${input.model} ${input.trim || ''}`.trim()

  return {
    id,
    listingId: id,
    stockNumber: input.stockNumber,
    vin: input.vin,
    year: input.year,
    make: input.make,
    model: input.model,
    trim: input.trim || '',
    bodyStyle: input.bodyStyle || 'Vehicle',
    mileage: input.mileage || 0,
    price: input.price || 0,
    status: input.status || 'inventory',
    available: input.available ?? true,
    isPublished: input.isPublished ?? false,
    isFeatured: input.isFeatured ?? false,
    daysInStock: 0,
    description: input.description || `${title} ready for showroom and digital listing workflows.`,
    features: input.features || [],
    color: input.color,
    condition: input.condition,
    drivetrain: input.drivetrain,
    engine: input.engine,
    transmission: input.transmission,
    source: 'master_sheet',
    photos: [
      {
        id: `${id}-placeholder`,
        inventoryId: id,
        url: PLACEHOLDER_IMAGE,
        alt: title,
        sortOrder: 0,
        isCover: true,
        source: 'placeholder',
      },
    ],
  }
}

export async function createRuntimeInventoryRecord(
  input: InventoryRecordCreateInput,
): Promise<InventoryRecord | null> {
  const client = getSupabaseBrowserClient()

  if (client) {
    const payload = {
      source_listing_id: input.stockNumber || input.vin || null,
      stock_number: input.stockNumber,
      vin: input.vin,
      year: input.year,
      make: input.make,
      model: input.model,
      trim: input.trim || null,
      mileage: input.mileage ?? 0,
      body_style: input.bodyStyle || null,
      sale_price: input.price ?? 0,
      status: input.status || 'inventory',
      available_publicly: input.available ?? true,
      is_published: input.isPublished ?? false,
      is_featured: input.isFeatured ?? false,
      public_description: input.description || null,
      features: input.features || [],
      color: input.color || null,
      vehicle_condition: input.condition || null,
      drivetrain: input.drivetrain || null,
      engine: input.engine || null,
      transmission: input.transmission || null,
    }

    const { data, error } = await client
      .from('inventory_units')
      .insert(payload)
      .select('id')
      .single()

    if (!error && data?.id) {
      emitInventoryUpdate()
      const records = await listRuntimeInventoryRecords()
      return records.find((record) => record.id === data.id) || null
    }
  }

  const localRecord = createLocalRuntimeRecord(input)
  const importedRecords = readImportedRecords()
  writeImportedRecords([...importedRecords, localRecord])
  return localRecord
}

export async function updateRuntimeInventoryRecord(
  id: string,
  updates: InventoryRecordUpdate,
): Promise<InventoryRecord | null> {
  const client = getSupabaseBrowserClient()

  if (client) {
    const payload = {
      sale_price: updates.price,
      status: updates.status,
      available_publicly: updates.available,
      is_published: updates.isPublished,
      is_featured: updates.isFeatured,
      public_description: updates.description,
      features: updates.features,
      color: updates.color,
      vehicle_condition: updates.condition,
      drivetrain: updates.drivetrain,
      engine: updates.engine,
      transmission: updates.transmission,
    }

    const { error } = await client.from('inventory_units').update(payload).eq('id', id)
    if (!error) {
      emitInventoryUpdate()
      const records = await listRuntimeInventoryRecords()
      return records.find((record) => record.id === id) || null
    }
  }

  const overrides = readOverrides()
  const importedRecords = readImportedRecords()
  const importedIndex = importedRecords.findIndex((record) => record.id === id)

  if (importedIndex >= 0) {
    importedRecords[importedIndex] = applyOverride(importedRecords[importedIndex], updates)
    writeImportedRecords(importedRecords)
  } else {
    overrides[id] = {
      ...overrides[id],
      ...updates,
    }
    writeOverrides(overrides)
  }

  const records = await listRuntimeInventoryRecords()
  return records.find((record) => record.id === id) || null
}

export function useInventoryCatalog() {
  const [records, setRecords] = useState<InventoryRecord[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    const nextRecords = await listRuntimeInventoryRecords()
    setRecords(nextRecords)
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const handleRefresh = () => {
      void refresh()
    }

    window.addEventListener(INVENTORY_UPDATE_EVENT, handleRefresh)
    window.addEventListener('storage', handleRefresh)

    return () => {
      window.removeEventListener(INVENTORY_UPDATE_EVENT, handleRefresh)
      window.removeEventListener('storage', handleRefresh)
    }
  }, [refresh])

  const publicRecords = useMemo(
    () => records.filter((record) => record.isPublished && record.available),
    [records],
  )

  const featuredRecords = useMemo(
    () => publicRecords.filter((record) => record.isFeatured).slice(0, 6),
    [publicRecords],
  )

  return {
    records,
    publicRecords,
    featuredRecords,
    loading,
    refresh,
    updateRecord: updateRuntimeInventoryRecord,
    masterSource: getMasterInventorySource(),
    isSupabaseBacked: isSupabaseConfigured(),
  }
}

export function useInventoryRecord(id?: string) {
  const catalog = useInventoryCatalog()

  const record = useMemo(
    () => catalog.records.find((item) => item.id === id) || null,
    [catalog.records, id],
  )

  return {
    ...catalog,
    record,
  }
}