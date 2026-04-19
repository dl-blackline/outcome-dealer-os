/**
 * import.ingest.ts
 *
 * Converts raw uploaded files into a uniform RawRow[] array.
 * Supports: CSV, TSV, XLSX (requires xlsx package), and plain text.
 * PDF text extraction is handled by reading the file as text (works for
 * text-based PDFs; scanned PDFs require server-side OCR).
 */
import { UUID } from '@/types/common'
import { RawRow } from './import.types'

// ─── CSV / TSV helpers ────────────────────────────────────────────────────────

/** Parse a single CSV/TSV line respecting quoted fields */
function splitLine(line: string, delimiter: string): string[] {
  const cells: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === delimiter && !inQuotes) {
      cells.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  cells.push(current.trim())
  return cells
}

function detectDelimiter(firstLine: string): string {
  const commas = (firstLine.match(/,/g) || []).length
  const tabs = (firstLine.match(/\t/g) || []).length
  const semicolons = (firstLine.match(/;/g) || []).length
  if (tabs >= commas && tabs >= semicolons) return '\t'
  if (semicolons > commas) return ';'
  return ','
}

function parseDelimitedText(text: string, sourceFileId: UUID): RawRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim())
  if (lines.length < 2) return []

  const delimiter = detectDelimiter(lines[0])
  const headers = splitLine(lines[0], delimiter).map((h) =>
    h.toLowerCase().replace(/[^a-z0-9_]/g, '_')
  )

  return lines.slice(1).map((line, idx) => {
    const values = splitLine(line, delimiter)
    const rawColumns: Record<string, string> = {}
    headers.forEach((h, i) => {
      rawColumns[h] = values[i] ?? ''
    })
    return {
      rawText: line,
      rawColumns,
      sourceFileId,
      rowIndex: idx,
    }
  })
}

// ─── Plain text (one record per line or paragraph) ───────────────────────────

function parsePlainText(text: string, sourceFileId: UUID): RawRow[] {
  // Try to split on blank-line-separated paragraphs first
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)

  if (paragraphs.length > 1) {
    return paragraphs.map((p, idx) => ({
      rawText: p,
      sourceFileId,
      rowIndex: idx,
    }))
  }

  // Fallback: one record per non-empty line
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line, idx) => ({
      rawText: line,
      sourceFileId,
      rowIndex: idx,
    }))
}

// ─── XLSX ─────────────────────────────────────────────────────────────────────

async function parseXLSX(buffer: ArrayBuffer, sourceFileId: UUID): Promise<RawRow[]> {
  const XLSX = await import('xlsx')
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: false })
  const firstSheetName = workbook.SheetNames[0]
  if (!firstSheetName) return []

  const worksheet = workbook.Sheets[firstSheetName]
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
    defval: '',
    raw: false,
  })

  return rows.map((row, idx) => {
    const rawColumns: Record<string, string> = {}
    for (const [key, value] of Object.entries(row)) {
      const normalizedKey = key.toLowerCase().replace(/[^a-z0-9_]/g, '_')
      rawColumns[normalizedKey] = String(value ?? '').trim()
    }

    const rawText = Object.entries(rawColumns)
      .map(([k, v]) => `${k}: ${v}`)
      .join(' | ')

    return {
      rawText,
      rawColumns,
      sourceFileId,
      rowIndex: idx,
    }
  })
}

// ─── PDF text extraction ──────────────────────────────────────────────────────

function extractPdfText(text: string): string {
  // Strip common PDF artefacts when the file is read as raw text.
  return (
    text
      // eslint-disable-next-line no-control-regex
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ')
      .replace(/\s{3,}/g, '\n')
      .trim()
  )
}

// ─── Public entry point ───────────────────────────────────────────────────────

export async function ingestFile(file: File, sourceFileId: UUID): Promise<RawRow[]> {
  const name = file.name.toLowerCase()

  if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
    const buffer = await file.arrayBuffer()
    return parseXLSX(buffer, sourceFileId)
  }
  const text = await file.text()

  if (name.endsWith('.csv') || name.endsWith('.tsv')) {
    return parseDelimitedText(text, sourceFileId)
  }

  if (name.endsWith('.pdf')) {
    const cleaned = extractPdfText(text)
    // Try delimited first (some PDF exports embed CSV-like tables)
    const firstLine = cleaned.split('\n')[0] ?? ''
    const hasDelimiters = firstLine.includes(',') || firstLine.includes('\t')
    if (hasDelimiters) return parseDelimitedText(cleaned, sourceFileId)
    return parsePlainText(cleaned, sourceFileId)
  }

  // Generic text: try delimited first, then paragraph/line split
  const firstLine = text.split('\n')[0] ?? ''
  const commas = (firstLine.match(/,/g) || []).length
  if (commas >= 2) return parseDelimitedText(text, sourceFileId)
  return parsePlainText(text, sourceFileId)
}
