import fs from 'node:fs/promises'
import path from 'node:path'

const repoRoot = path.resolve(new URL('..', import.meta.url).pathname)
const csvPath = path.join(repoRoot, 'src/domains/buyer-hub/data/nationalCarMartInventory.seed.csv')
const generatedTsPath = path.join(
  repoRoot,
  'src/domains/buyer-hub/data/nationalCarMartInventory.generated.ts',
)
const publicRoot = path.join(repoRoot, 'public')
const inventoryDir = path.join(publicRoot, 'inventory/national-car-mart')
const placeholderPublicPath = '/inventory/national-car-mart/placeholder.jpg'
const placeholderDiskPath = path.join(inventoryDir, 'placeholder.jpg')

const FALLBACK_JPEG_BASE64 =
  '/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxAQEBUQEBAVFhUVFRUVFRUVFRUVFRUWFhUXFhUYHSggGBolGxUVITEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0OGxAQGy0fICUtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAAEAAQMBIgACEQEDEQH/xAAcAAABBQEBAQAAAAAAAAAAAAAAAQMEBQYCBwj/xAA5EAACAQMDAgQDBwMFAQAAAAABAgMABBESIQUTMUEGIlFhcYEykaEHFCNCUrHB0fAkM2LxFiRDY//EABkBAAMBAQEAAAAAAAAAAAAAAAABAgMEBf/EACQRAAICAgICAgIDAQAAAAAAAAABAhEDIRIxBEEiUWEFEzJx/9oADAMBAAIRAxEAPwD9xREQEREBERAREQEREBERAREQEREBERAT//2Q=='

function parseCsv(content) {
  const lines = content.replace(/^\uFEFF/, '').split(/\r?\n/).filter(Boolean)
  if (lines.length < 2) return []
  const headers = parseCsvLine(lines[0])
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line)
    const row = {}
    headers.forEach((header, index) => {
      row[header] = values[index] ?? ''
    })
    return row
  })
}

function parseCsvLine(line) {
  const values = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current)
      current = ''
    } else {
      current += char
    }
  }
  values.push(current)
  return values
}

function toBool(value) {
  const normalized = String(value ?? '').trim().toLowerCase()
  return normalized === 'true' || normalized === '1' || normalized === 'yes'
}

function normalizeImagePath(imagePath) {
  const raw = imagePath?.trim() || placeholderPublicPath
  return raw.startsWith('/') ? raw : `/${raw}`
}

function toNumber(value, fallback = 0) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

async function ensurePlaceholder() {
  await fs.mkdir(inventoryDir, { recursive: true })
  try {
    await fs.access(placeholderDiskPath)
  } catch {
    await fs.writeFile(placeholderDiskPath, Buffer.from(FALLBACK_JPEG_BASE64, 'base64'))
  }
}

async function downloadOrFallback(sourceUrl, targetPath) {
  try {
    if (!sourceUrl?.startsWith('http://') && !sourceUrl?.startsWith('https://')) {
      throw new Error('invalid source URL')
    }

    const response = await fetch(sourceUrl, { redirect: 'follow' })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = Buffer.from(await response.arrayBuffer())
    if (!data.length) {
      throw new Error('empty image response')
    }

    await fs.writeFile(targetPath, data)
    return 'downloaded'
  } catch {
    await fs.copyFile(placeholderDiskPath, targetPath)
    return 'placeholder'
  }
}

function formatGeneratedTs(units) {
  return `/* eslint-disable */\n// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.\n// Source: src/domains/buyer-hub/data/nationalCarMartInventory.seed.csv\n\nexport interface NationalCarMartInventoryUnit {\n  id: string\n  listingId: string\n  vin: string\n  stockNumber: string\n  year: number\n  make: string\n  model: string\n  trim: string\n  bodyStyle: string\n  mileage: number\n  askingPrice: number\n  transmission: string\n  imagePath: string\n  imageSourceUrl: string\n  detailUrl: string\n  photoArchiveStatus: string\n  highlights: string[]\n  available: boolean\n  imageUrl: string\n  status: 'frontline'\n  daysInStock: number\n}\n\nexport type PublicInventoryUnit = NationalCarMartInventoryUnit\n\nexport const BUYER_HUB_INVENTORY: NationalCarMartInventoryUnit[] = ${JSON.stringify(units, null, 2)}\n\nexport const NATIONAL_CAR_MART_INVENTORY = BUYER_HUB_INVENTORY\n`
}

async function main() {
  await ensurePlaceholder()

  const csvText = await fs.readFile(csvPath, 'utf8')
  const rows = parseCsv(csvText)
  if (rows.length !== 108) {
    throw new Error(`Expected exactly 108 rows, got ${rows.length}`)
  }

  let placeholderCount = 0
  const units = []

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i]
    const imagePath = normalizeImagePath(row.imagePath)
    const targetPath = path.join(publicRoot, imagePath.replace(/^\//, ''))
    await fs.mkdir(path.dirname(targetPath), { recursive: true })

    const imageResult = await downloadOrFallback(row.imageSourceUrl?.trim(), targetPath)
    if (imageResult === 'placeholder') placeholderCount += 1

    const highlights = String(row.highlights ?? '')
      .split('|')
      .map((s) => s.trim())
      .filter(Boolean)

    units.push({
      id: String(row.id ?? '').trim(),
      listingId: String(row.listingId ?? '').trim(),
      vin: String(row.vin ?? '').trim(),
      stockNumber: String(row.stockNumber ?? '').trim(),
      year: toNumber(row.year, 0),
      make: String(row.make ?? '').trim(),
      model: String(row.model ?? '').trim(),
      trim: String(row.trim ?? '').trim(),
      bodyStyle: String(row.bodyStyle ?? '').trim(),
      mileage: toNumber(row.mileage, 0),
      askingPrice: toNumber(row.askingPrice, 0),
      transmission: String(row.transmission ?? '').trim(),
      imagePath,
      imageSourceUrl: String(row.imageSourceUrl ?? '').trim(),
      detailUrl: String(row.detailUrl ?? '').trim(),
      photoArchiveStatus: String(row.photoArchiveStatus ?? '').trim() || imageResult,
      highlights,
      available: toBool(row.available),
      imageUrl: imagePath,
      status: 'frontline',
      daysInStock: (i % 120) + 1,
    })
  }

  await fs.writeFile(generatedTsPath, formatGeneratedTs(units), 'utf8')

  console.log(`Generated ${units.length} inventory units`) 
  console.log(`Images in ${inventoryDir}`)
  console.log(`Fallback placeholders used: ${placeholderCount}`)
  console.log(`Generated module: ${generatedTsPath}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
