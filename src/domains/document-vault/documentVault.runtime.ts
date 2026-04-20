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

export function useDocumentVaultRuntime() {
  const [documents, setDocuments] = useState<VaultDocument[]>(() => {
    return readLocal()
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
