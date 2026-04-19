import { useCallback, useEffect, useMemo, useState } from 'react'
import { BUYER_HUB_INVENTORY } from '@/domains/buyer-hub/data/nationalCarMartInventory.generated'
import { getSupabaseBrowserClient, getSupabaseStorageBucket, isSupabaseConfigured } from '@/lib/supabase/client'
import { enhanceInventoryPhotoAsset } from '@/domains/inventory-photo/inventoryPhotoEnhancer'
import {
  getPremiumPlaceholderByBodyStyle,
  isPlaceholderUrl,
} from '@/domains/inventory-photo/inventoryPhoto.placeholder'
import type {
  InventoryEnhancementStatus,
  InventoryPhotoVariant,
} from '@/domains/inventory-photo/inventoryPhoto.types'

export interface InventoryPhotoRecord {
  id: string
  inventoryId: string
  url: string
  storagePath?: string
  alt: string
  sortOrder: number
  isCover: boolean
  source: 'repo' | 'remote' | 'supabase' | 'placeholder'
  variant?: InventoryPhotoVariant
  originalPhotoId?: string
  enhancementStatus?: InventoryEnhancementStatus
  isActivePublic?: boolean
  enhancedUrl?: string
  enhancedStoragePath?: string
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
  wholesalePrice?: number
  isWholesaleVisible?: boolean
  wholesaleStatus?: string
  wholesaleNotes?: string
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
  wholesalePrice?: number
  isWholesaleVisible?: boolean
  wholesaleStatus?: string
  wholesaleNotes?: string
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

type LocalInventoryOverride = Partial<InventoryRecordFullUpdate>

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
  wholesalePrice?: number
  isWholesaleVisible?: boolean
  wholesaleStatus?: string
  wholesaleNotes?: string
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
  wholesale_price?: number | null
  wholesale_visible?: boolean | null
  wholesale_status?: string | null
  wholesale_notes?: string | null
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
const INVENTORY_PHOTOS_KEY = 'outcome.inventory.photos'
const INVENTORY_UPDATE_EVENT = 'outcome.inventory.updated'
const PLACEHOLDER_IMAGE = getPremiumPlaceholderByBodyStyle()
const PHOTO_META_PREFIX = '__ovmeta:'

// ---- Extended update type covering all editable fields ----
export interface InventoryRecordFullUpdate {
  stockNumber?: string
  vin?: string
  year?: number
  make?: string
  model?: string
  trim?: string
  mileage?: number
  bodyStyle?: string
  price?: number
  wholesalePrice?: number
  isWholesaleVisible?: boolean
  wholesaleStatus?: string
  wholesaleNotes?: string
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

// ---- Photo override persistence (local fallback) ----

function readPhotoOverrides(): Record<string, InventoryPhotoRecord[]> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(INVENTORY_PHOTOS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writePhotoOverrides(data: Record<string, InventoryPhotoRecord[]>) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(INVENTORY_PHOTOS_KEY, JSON.stringify(data))
  emitInventoryUpdate()
}

function parseStoredPhotoAlt(rawAlt: string): { alt: string; meta: Partial<InventoryPhotoRecord> } {
  if (!rawAlt.startsWith(PHOTO_META_PREFIX)) return { alt: rawAlt, meta: {} }
  const splitAt = rawAlt.indexOf('::')
  if (splitAt <= PHOTO_META_PREFIX.length) return { alt: rawAlt, meta: {} }

  const encoded = rawAlt.slice(PHOTO_META_PREFIX.length, splitAt)
  const alt = rawAlt.slice(splitAt + 2)

  try {
    const json = atob(encoded)
    const meta = JSON.parse(json) as Partial<InventoryPhotoRecord>
    return { alt, meta }
  } catch {
    return { alt, meta: {} }
  }
}

function encodeStoredPhotoAlt(alt: string, photo: Partial<InventoryPhotoRecord>): string {
  const meta: Partial<InventoryPhotoRecord> = {
    variant: photo.variant,
    originalPhotoId: photo.originalPhotoId,
    enhancementStatus: photo.enhancementStatus,
    isActivePublic: photo.isActivePublic,
    enhancedUrl: photo.enhancedUrl,
    enhancedStoragePath: photo.enhancedStoragePath,
  }

  const hasMeta = Object.values(meta).some((v) => v !== undefined)
  if (!hasMeta) return alt

  try {
    const encoded = btoa(JSON.stringify(meta))
    return `${PHOTO_META_PREFIX}${encoded}::${alt}`
  } catch {
    return alt
  }
}

function normalizePhotoRecord(photo: InventoryPhotoRecord, bodyStyle?: string): InventoryPhotoRecord {
  const placeholder = isPlaceholderUrl(photo.url)
  const variant = photo.variant || (placeholder || photo.source === 'placeholder' ? 'placeholder' : 'original')
  const enhancementStatus =
    photo.enhancementStatus || (variant === 'enhanced' ? 'enhanced' : variant === 'placeholder' ? 'placeholder' : 'original')

  return {
    ...photo,
    url: variant === 'placeholder' ? getPremiumPlaceholderByBodyStyle(bodyStyle) : photo.url,
    source: variant === 'placeholder' ? 'placeholder' : photo.source,
    variant,
    enhancementStatus,
    isActivePublic: photo.isActivePublic ?? photo.isCover,
  }
}

function normalizeRecordPhotos(record: InventoryRecord): InventoryRecord {
  const photos = [...record.photos]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((photo) => normalizePhotoRecord(photo, record.bodyStyle))

  if (photos.length === 0) {
    photos.push({
      id: `${record.id}-placeholder`,
      inventoryId: record.id,
      url: getPremiumPlaceholderByBodyStyle(record.bodyStyle),
      alt: `${record.year} ${record.make} ${record.model}`.trim(),
      sortOrder: 0,
      isCover: true,
      source: 'placeholder',
      variant: 'placeholder',
      enhancementStatus: 'placeholder',
      isActivePublic: true,
    })
  }

  return { ...record, photos }
}

export function pickBestInventoryPhoto(record: InventoryRecord): InventoryPhotoRecord {
  const photos = normalizeRecordPhotos(record).photos

  const enhancedCover = photos.find((p) => p.isCover && p.variant === 'enhanced' && p.enhancementStatus !== 'failed')
  if (enhancedCover) return enhancedCover

  const originalCover = photos.find((p) => p.isCover && p.variant !== 'enhanced')
  if (originalCover) return originalCover

  const firstEnhanced = photos.find((p) => p.variant === 'enhanced' && p.enhancementStatus !== 'failed')
  if (firstEnhanced) return firstEnhanced

  const firstOriginal = photos.find((p) => p.variant !== 'placeholder')
  if (firstOriginal) return firstOriginal

  return photos[0]
}

function applyPhotoOverrides(records: InventoryRecord[]): InventoryRecord[] {
  const overrides = readPhotoOverrides()
  if (Object.keys(overrides).length === 0) return records.map(normalizeRecordPhotos)
  return records.map((record) => {
    const photos = overrides[record.id]
    if (!photos || photos.length === 0) return normalizeRecordPhotos(record)
    return normalizeRecordPhotos({ ...record, photos })
  })
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
      variant: 'original',
      enhancementStatus: 'original',
      isActivePublic: true,
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
      variant: 'original',
      enhancementStatus: 'original',
      isActivePublic: photos.length === 0,
    })
  }

  if (photos.length === 0) {
    photos.push({
      id: `${unit.id}-placeholder`,
      inventoryId: unit.id,
      url: getPremiumPlaceholderByBodyStyle(unit.bodyStyle),
      alt,
      sortOrder: 0,
      isCover: true,
      source: 'placeholder',
      variant: 'placeholder',
      enhancementStatus: 'placeholder',
      isActivePublic: true,
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
  return normalizeRecordPhotos({
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
    wholesalePrice: undefined,
    isWholesaleVisible: false,
    wholesaleStatus: unit.status === 'wholesale' ? 'ready' : undefined,
    wholesaleNotes: undefined,
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
  })
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
  const parsed = parseStoredPhotoAlt(row.alt_text || fallbackAlt)
  const inferredVariant: InventoryPhotoVariant =
    parsed.meta.variant || (isPlaceholderUrl(url) ? 'placeholder' : 'original')

  return {
    id: row.id,
    inventoryId: row.inventory_unit_id,
    url,
    storagePath: row.storage_path || undefined,
    alt: parsed.alt,
    sortOrder: row.sort_order ?? 0,
    isCover: Boolean(row.is_cover),
    source: row.storage_path ? 'supabase' : isPlaceholderUrl(url) ? 'placeholder' : 'remote',
    variant: inferredVariant,
    originalPhotoId: parsed.meta.originalPhotoId,
    enhancementStatus:
      parsed.meta.enhancementStatus ||
      (inferredVariant === 'enhanced' ? 'enhanced' : inferredVariant === 'placeholder' ? 'placeholder' : 'original'),
    isActivePublic: parsed.meta.isActivePublic ?? Boolean(row.is_cover),
    enhancedUrl: parsed.meta.enhancedUrl,
    enhancedStoragePath: parsed.meta.enhancedStoragePath,
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
        url: getPremiumPlaceholderByBodyStyle(row.body_style || undefined),
        alt: title || 'Vehicle photo',
        sortOrder: 0,
        isCover: true,
        source: 'placeholder',
        variant: 'placeholder',
        enhancementStatus: 'placeholder',
        isActivePublic: true,
      },
    ]

    return normalizeRecordPhotos({
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
      wholesalePrice: row.wholesale_price ?? undefined,
      isWholesaleVisible: row.wholesale_visible ?? false,
      wholesaleStatus: row.wholesale_status || undefined,
      wholesaleNotes: row.wholesale_notes || undefined,
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
    })
  })
}

export async function listRuntimeInventoryRecords(): Promise<InventoryRecord[]> {
  const overrides = readOverrides()

  if (isSupabaseConfigured()) {
    const supabaseRecords = await loadSupabaseInventoryRecords()
    if (supabaseRecords && supabaseRecords.length > 0) {
      const merged = supabaseRecords.map((record) => applyOverride(record, overrides[record.id]))
      return applyPhotoOverrides(merged)
    }
  }

  const base = mergeLocalRuntimeRecords(getSeedInventoryRecords())
  return applyPhotoOverrides(base)
}

function persistWholesaleOverride(
  id: string,
  values: Pick<InventoryRecordFullUpdate, 'wholesalePrice' | 'isWholesaleVisible' | 'wholesaleStatus' | 'wholesaleNotes'>,
) {
  const hasWholesaleData = Object.values(values).some((value) => value !== undefined)
  if (!hasWholesaleData) return

  const overrides = readOverrides()
  overrides[id] = {
    ...overrides[id],
    ...values,
  }
  writeOverrides(overrides)
}

function createLocalRuntimeRecord(input: InventoryRecordCreateInput): InventoryRecord {
  const id = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const title = `${input.year} ${input.make} ${input.model} ${input.trim || ''}`.trim()

  return normalizeRecordPhotos({
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
    wholesalePrice: input.wholesalePrice,
    isWholesaleVisible: input.isWholesaleVisible ?? false,
    wholesaleStatus: input.wholesaleStatus,
    wholesaleNotes: input.wholesaleNotes,
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
        url: getPremiumPlaceholderByBodyStyle(input.bodyStyle),
        alt: title,
        sortOrder: 0,
        isCover: true,
        source: 'placeholder',
        variant: 'placeholder',
        enhancementStatus: 'placeholder',
        isActivePublic: true,
      },
    ],
  })
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
      persistWholesaleOverride(data.id, {
        wholesalePrice: input.wholesalePrice,
        isWholesaleVisible: input.isWholesaleVisible,
        wholesaleStatus: input.wholesaleStatus,
        wholesaleNotes: input.wholesaleNotes,
      })
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

  persistWholesaleOverride(id, {
    wholesalePrice: updates.wholesalePrice,
    isWholesaleVisible: updates.isWholesaleVisible,
    wholesaleStatus: updates.wholesaleStatus,
    wholesaleNotes: updates.wholesaleNotes,
  })

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

// ---- Full-field update (add/edit form: supports year/make/model/vin etc.) ----

export async function updateRuntimeInventoryRecordFull(
  id: string,
  updates: InventoryRecordFullUpdate,
): Promise<InventoryRecord | null> {
  const client = getSupabaseBrowserClient()

  persistWholesaleOverride(id, {
    wholesalePrice: updates.wholesalePrice,
    isWholesaleVisible: updates.isWholesaleVisible,
    wholesaleStatus: updates.wholesaleStatus,
    wholesaleNotes: updates.wholesaleNotes,
  })

  if (client) {
    const payload: Record<string, unknown> = {}
    if (updates.stockNumber !== undefined) payload.stock_number = updates.stockNumber
    if (updates.vin !== undefined) payload.vin = updates.vin
    if (updates.year !== undefined) payload.year = updates.year
    if (updates.make !== undefined) payload.make = updates.make
    if (updates.model !== undefined) payload.model = updates.model
    if (updates.trim !== undefined) payload.trim = updates.trim
    if (updates.mileage !== undefined) payload.mileage = updates.mileage
    if (updates.bodyStyle !== undefined) payload.body_style = updates.bodyStyle
    if (updates.price !== undefined) payload.sale_price = updates.price
    if (updates.status !== undefined) payload.status = updates.status
    if (updates.available !== undefined) payload.available_publicly = updates.available
    if (updates.isPublished !== undefined) payload.is_published = updates.isPublished
    if (updates.isFeatured !== undefined) payload.is_featured = updates.isFeatured
    if (updates.description !== undefined) payload.public_description = updates.description
    if (updates.features !== undefined) payload.features = updates.features
    if (updates.color !== undefined) payload.color = updates.color
    if (updates.condition !== undefined) payload.vehicle_condition = updates.condition
    if (updates.drivetrain !== undefined) payload.drivetrain = updates.drivetrain
    if (updates.engine !== undefined) payload.engine = updates.engine
    if (updates.transmission !== undefined) payload.transmission = updates.transmission

    const { error } = await client.from('inventory_units').update(payload).eq('id', id)
    if (!error) {
      emitInventoryUpdate()
      const records = await listRuntimeInventoryRecords()
      return records.find((r) => r.id === id) || null
    }
  }

  // Local path — update imported record directly, fall back to field-level overrides for seed records
  const importedRecords = readImportedRecords()
  const importedIndex = importedRecords.findIndex((r) => r.id === id)

  if (importedIndex >= 0) {
    const existing = importedRecords[importedIndex]
    importedRecords[importedIndex] = {
      ...existing,
      stockNumber: updates.stockNumber ?? existing.stockNumber,
      vin: updates.vin ?? existing.vin,
      year: updates.year ?? existing.year,
      make: updates.make ?? existing.make,
      model: updates.model ?? existing.model,
      trim: updates.trim ?? existing.trim,
      mileage: updates.mileage ?? existing.mileage,
      bodyStyle: updates.bodyStyle ?? existing.bodyStyle,
      price: updates.price ?? existing.price,
      wholesalePrice: updates.wholesalePrice ?? existing.wholesalePrice,
      isWholesaleVisible: updates.isWholesaleVisible ?? existing.isWholesaleVisible,
      wholesaleStatus: updates.wholesaleStatus ?? existing.wholesaleStatus,
      wholesaleNotes: updates.wholesaleNotes ?? existing.wholesaleNotes,
      status: updates.status ?? existing.status,
      available: updates.available ?? existing.available,
      isPublished: updates.isPublished ?? existing.isPublished,
      isFeatured: updates.isFeatured ?? existing.isFeatured,
      description: updates.description ?? existing.description,
      features: updates.features ?? existing.features,
      color: updates.color ?? existing.color,
      condition: updates.condition ?? existing.condition,
      drivetrain: updates.drivetrain ?? existing.drivetrain,
      engine: updates.engine ?? existing.engine,
      transmission: updates.transmission ?? existing.transmission,
    }
    writeImportedRecords(importedRecords)
  } else {
    // Seed record — use override system for the fields it supports
    const overrides = readOverrides()
    overrides[id] = { ...overrides[id], ...updates }
    writeOverrides(overrides)
  }

  const records = await listRuntimeInventoryRecords()
  return records.find((r) => r.id === id) || null
}

// ---- Photo management ----

export async function attachInventoryPhotos(
  unitId: string,
  newPhotos: Omit<InventoryPhotoRecord, 'id' | 'inventoryId'>[],
): Promise<InventoryPhotoRecord[]> {
  const client = getSupabaseBrowserClient()
  const created: InventoryPhotoRecord[] = []

  if (client) {
    for (const photo of newPhotos) {
      const normalizedPhoto: Omit<InventoryPhotoRecord, 'id' | 'inventoryId'> = {
        ...photo,
        variant: photo.variant || (isPlaceholderUrl(photo.url) ? 'placeholder' : 'original'),
        enhancementStatus:
          photo.enhancementStatus ||
          (photo.variant === 'enhanced' ? 'enhanced' : isPlaceholderUrl(photo.url) ? 'placeholder' : 'original'),
        isActivePublic: photo.isActivePublic ?? photo.isCover,
      }

      const row = {
        inventory_unit_id: unitId,
        photo_url: normalizedPhoto.url,
        storage_path: normalizedPhoto.storagePath || null,
        alt_text: encodeStoredPhotoAlt(normalizedPhoto.alt, normalizedPhoto),
        sort_order: normalizedPhoto.sortOrder,
        is_cover: normalizedPhoto.isCover,
      }
      const { data, error } = await client.from('vehicle_photos').insert(row).select('id').single()
      if (!error && data?.id) {
        created.push(normalizePhotoRecord({ id: data.id, inventoryId: unitId, ...normalizedPhoto }))
      }
    }
    if (created.length > 0) emitInventoryUpdate()
    return created
  }

  // Local fallback
  const overrides = readPhotoOverrides()
  const existing = overrides[unitId] || []
  for (const photo of newPhotos) {
    const id = `photo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const normalizedPhoto: Omit<InventoryPhotoRecord, 'id' | 'inventoryId'> = {
      ...photo,
      variant: photo.variant || (isPlaceholderUrl(photo.url) ? 'placeholder' : 'original'),
      enhancementStatus:
        photo.enhancementStatus ||
        (photo.variant === 'enhanced' ? 'enhanced' : isPlaceholderUrl(photo.url) ? 'placeholder' : 'original'),
      isActivePublic: photo.isActivePublic ?? photo.isCover,
    }
    created.push(normalizePhotoRecord({ id, inventoryId: unitId, ...normalizedPhoto }))
  }
  overrides[unitId] = [...existing, ...created]
  writePhotoOverrides(overrides)
  return created
}

export async function removeInventoryPhoto(unitId: string, photoId: string): Promise<void> {
  const client = getSupabaseBrowserClient()

  if (client) {
    await client.from('vehicle_photos').delete().eq('id', photoId)
    emitInventoryUpdate()
    return
  }

  const overrides = readPhotoOverrides()
  const photos = (overrides[unitId] || []).filter((p) => p.id !== photoId)
  overrides[unitId] = photos
  writePhotoOverrides(overrides)
}

export async function setInventoryCoverPhoto(unitId: string, photoId: string): Promise<void> {
  const client = getSupabaseBrowserClient()

  if (client) {
    await client.from('vehicle_photos').update({ is_cover: false }).eq('inventory_unit_id', unitId)
    await client.from('vehicle_photos').update({ is_cover: true }).eq('id', photoId)
    emitInventoryUpdate()
    return
  }

  const overrides = readPhotoOverrides()
  overrides[unitId] = (overrides[unitId] || []).map((p) => ({ ...p, isCover: p.id === photoId }))
  writePhotoOverrides(overrides)
}

export async function reorderInventoryPhotos(unitId: string, orderedIds: string[]): Promise<void> {
  const client = getSupabaseBrowserClient()

  if (client) {
    for (let i = 0; i < orderedIds.length; i++) {
      await client.from('vehicle_photos').update({ sort_order: i }).eq('id', orderedIds[i])
    }
    emitInventoryUpdate()
    return
  }

  const overrides = readPhotoOverrides()
  const existing = overrides[unitId] || []
  const byId = new Map(existing.map((p) => [p.id, p]))
  overrides[unitId] = orderedIds
    .map((id, i) => {
      const p = byId.get(id)
      return p ? { ...p, sortOrder: i } : null
    })
    .filter(Boolean) as InventoryPhotoRecord[]
  writePhotoOverrides(overrides)
}

// ---- Upload a File to Supabase Storage and return public URL ----

export async function uploadInventoryPhotoFile(
  unitId: string,
  file: File,
): Promise<{ url: string; storagePath: string } | null> {
  const client = getSupabaseBrowserClient()
  const bucket = getSupabaseStorageBucket()

  if (!client || !bucket) return null

  const ext = file.name.split('.').pop() || 'jpg'
  const storagePath = `inventory/${unitId}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`

  const { error } = await client.storage.from(bucket).upload(storagePath, file, { upsert: false })
  if (error) return null

  const { data } = client.storage.from(bucket).getPublicUrl(storagePath)
  return { url: data.publicUrl, storagePath }
}

function dataUrlToFile(dataUrl: string, filename: string): File {
  const [head, content] = dataUrl.split(',')
  const mime = head.match(/data:(.*?);base64/)?.[1] || 'image/jpeg'
  const binary = atob(content)
  const len = binary.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i)
  return new File([bytes], filename, { type: mime })
}

function getPhotoById(records: InventoryRecord[], unitId: string, photoId: string): { record: InventoryRecord; photo: InventoryPhotoRecord } | null {
  const record = records.find((r) => r.id === unitId)
  if (!record) return null
  const photo = record.photos.find((p) => p.id === photoId)
  if (!photo) return null
  return { record, photo }
}

export async function enhanceInventoryPhoto(
  unitId: string,
  photoId: string,
): Promise<InventoryPhotoRecord | null> {
  const records = await listRuntimeInventoryRecords()
  const found = getPhotoById(records, unitId, photoId)
  if (!found) return null

  const { record, photo } = found
  if (photo.variant === 'placeholder' || isPlaceholderUrl(photo.url)) return null

  const enhancement = await enhanceInventoryPhotoAsset({ sourceUrl: photo.url, upscaleFactor: 1.2, quality: 0.9 })
  if (!enhancement.ok || !enhancement.dataUrl) return null

  let url = enhancement.dataUrl
  let storagePath: string | undefined

  if (isSupabaseConfigured()) {
    const file = dataUrlToFile(enhancement.dataUrl, `enhanced-${photo.id}.jpg`)
    const uploaded = await uploadInventoryPhotoFile(unitId, file)
    if (uploaded) {
      url = uploaded.url
      storagePath = uploaded.storagePath
    }
  }

  const created = await attachInventoryPhotos(unitId, [
    {
      url,
      storagePath,
      alt: `${photo.alt} (Enhanced)`,
      sortOrder: Math.max(...record.photos.map((p) => p.sortOrder), 0) + 1,
      isCover: photo.isCover,
      source: storagePath ? 'supabase' : 'remote',
      variant: 'enhanced',
      originalPhotoId: photo.id,
      enhancementStatus: 'enhanced',
      isActivePublic: true,
    },
  ])

  if (created[0]?.isCover) {
    await setInventoryCoverPhoto(unitId, created[0].id)
  }

  return created[0] || null
}

export async function enhanceAllInventoryPhotos(unitId: string): Promise<number> {
  const records = await listRuntimeInventoryRecords()
  const record = records.find((r) => r.id === unitId)
  if (!record) return 0

  let count = 0
  for (const photo of record.photos) {
    if (photo.variant === 'enhanced' || photo.variant === 'placeholder' || isPlaceholderUrl(photo.url)) continue
    const enhanced = await enhanceInventoryPhoto(unitId, photo.id)
    if (enhanced) count += 1
  }
  return count
}

export async function useEnhancedPhotoAsPublic(
  unitId: string,
  enhancedPhotoId: string,
): Promise<void> {
  await setInventoryCoverPhoto(unitId, enhancedPhotoId)
}

export async function revertEnhancedPhotoToOriginal(
  unitId: string,
  enhancedPhotoId: string,
): Promise<void> {
  const records = await listRuntimeInventoryRecords()
  const record = records.find((r) => r.id === unitId)
  if (!record) return

  const enhanced = record.photos.find((p) => p.id === enhancedPhotoId)
  const originalId = enhanced?.originalPhotoId
  if (!originalId) return

  await setInventoryCoverPhoto(unitId, originalId)
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

  const wholesaleRecords = useMemo(
    () =>
      records.filter(
        (record) =>
          Boolean(record.available) &&
          Boolean(record.isWholesaleVisible) &&
          typeof record.wholesalePrice === 'number' &&
          record.wholesalePrice > 0,
      ),
    [records],
  )

  return {
    records,
    publicRecords,
    wholesaleRecords,
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

  const normalizedId = id?.trim().toLowerCase()

  const record = useMemo(
    () =>
      catalog.records.find((item) => {
        if (!normalizedId) return false
        const itemId = item.id.trim().toLowerCase()
        const listingId = item.listingId?.trim().toLowerCase()
        const stock = item.stockNumber?.trim().toLowerCase()
        const vin = item.vin?.trim().toLowerCase()

        return itemId === normalizedId || listingId === normalizedId || stock === normalizedId || vin === normalizedId
      }) || null,
    [catalog.records, normalizedId],
  )

  return {
    ...catalog,
    record,
  }
}