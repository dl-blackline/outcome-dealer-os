import { useCallback, useEffect, useState } from 'react'
import type { VaultDocument, UploadDocumentInput, DocCategory } from './documentVault.types'

const STORAGE_KEY = 'outcome.documentVault.docs'

function now(): string {
  return new Date().toISOString()
}

function readLocal(): VaultDocument[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? (JSON.parse(raw) as VaultDocument[]) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeLocal(docs: VaultDocument[]): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(docs))
}

const SEED_DOCS: VaultDocument[] = [
  {
    id: 'doc-seed-1',
    name: 'Retail Installment Contract — D-10842',
    description: 'Signed RIC for Whitfield deal',
    category: 'deal',
    fileType: 'pdf',
    fileSize: 245000,
    mimeType: 'application/pdf',
    status: 'active',
    entityType: 'deal',
    entityId: 'D-10842',
    entityLabel: 'D-10842 — Whitfield',
    tags: ['signed', 'ric'],
    uploadedBy: 'Dana L.',
    pageCount: 4,
    uploadedAt: now(),
  },
  {
    id: 'doc-seed-2',
    name: 'Buyer Order — D-10835',
    description: 'Executed buyer order for Marcus Johnson',
    category: 'deal',
    fileType: 'pdf',
    fileSize: 120000,
    mimeType: 'application/pdf',
    status: 'active',
    entityType: 'deal',
    entityId: 'D-10835',
    entityLabel: 'D-10835 — Johnson',
    tags: ['buyer-order'],
    uploadedBy: 'Kelly M.',
    pageCount: 2,
    uploadedAt: now(),
  },
  {
    id: 'doc-seed-3',
    name: "Driver's License Scan — Rebecca Nguyen",
    description: 'Front and back DL scan',
    category: 'customer',
    fileType: 'image',
    fileSize: 890000,
    mimeType: 'image/jpeg',
    status: 'active',
    entityType: 'customer',
    entityLabel: 'Rebecca Nguyen',
    tags: ['id', 'compliance'],
    uploadedBy: 'Tony R.',
    uploadedAt: now(),
  },
  {
    id: 'doc-seed-4',
    name: 'Gap Agreement — D-10842',
    category: 'deal',
    fileType: 'pdf',
    fileSize: 98000,
    mimeType: 'application/pdf',
    status: 'active',
    entityType: 'deal',
    entityId: 'D-10842',
    entityLabel: 'D-10842 — Whitfield',
    tags: ['gap', 'fi'],
    uploadedBy: 'Dana L.',
    pageCount: 1,
    uploadedAt: now(),
  },
  {
    id: 'doc-seed-5',
    name: 'Recon Invoice — Premier Body Shop — A1039',
    description: 'Body work invoice for Silverado #A1039',
    category: 'recon',
    fileType: 'pdf',
    fileSize: 68000,
    mimeType: 'application/pdf',
    status: 'active',
    entityType: 'inventory',
    entityId: 'A1039',
    entityLabel: 'A1039 — 2021 Silverado',
    tags: ['invoice', 'body'],
    uploadedBy: 'Mike R.',
    pageCount: 1,
    uploadedAt: now(),
  },
  {
    id: 'doc-seed-6',
    name: 'Trade Title — D-10835 Tacoma',
    description: 'Original title for trade vehicle',
    category: 'title_payoff',
    fileType: 'pdf',
    fileSize: 55000,
    mimeType: 'application/pdf',
    status: 'pending_review',
    entityType: 'deal',
    entityId: 'D-10835',
    entityLabel: 'D-10835 — Johnson (Trade)',
    tags: ['title', 'trade'],
    uploadedBy: 'Office Manager',
    pageCount: 1,
    uploadedAt: now(),
  },
]

export function useDocumentVaultRuntime() {
  const [documents, setDocuments] = useState<VaultDocument[]>(() => {
    const stored = readLocal()
    if (stored.length > 0) return stored
    writeLocal(SEED_DOCS)
    return SEED_DOCS
  })

  useEffect(() => { writeLocal(documents) }, [documents])

  const addDocument = useCallback((input: UploadDocumentInput): VaultDocument => {
    const doc: VaultDocument = {
      id: crypto.randomUUID(),
      name: input.name,
      description: input.description,
      category: input.category,
      fileType: input.fileType,
      fileSize: input.fileSize,
      mimeType: input.mimeType,
      status: 'active',
      entityType: input.entityType,
      entityId: input.entityId,
      entityLabel: input.entityLabel,
      tags: input.tags ?? [],
      uploadedBy: input.uploadedBy,
      storagePath: input.storagePath,
      previewUrl: input.previewUrl,
      downloadUrl: input.downloadUrl,
      pageCount: input.pageCount,
      uploadedAt: now(),
    }
    setDocuments((prev) => [doc, ...prev])
    return doc
  }, [])

  const updateDocument = useCallback((id: string, updates: Partial<VaultDocument>) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates, updatedAt: now() } : d))
    )
  }, [])

  const archiveDocument = useCallback((id: string) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'archived', updatedAt: now() } : d))
    )
  }, [])

  const deleteDocument = useCallback((id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id))
  }, [])

  const getByCategory = useCallback(
    (category: DocCategory) => documents.filter((d) => d.category === category),
    [documents]
  )

  const getByEntity = useCallback(
    (entityType: string, entityId: string) =>
      documents.filter((d) => d.entityType === entityType && d.entityId === entityId),
    [documents]
  )

  return {
    documents,
    loading: false,
    addDocument,
    updateDocument,
    archiveDocument,
    deleteDocument,
    getByCategory,
    getByEntity,
  }
}
