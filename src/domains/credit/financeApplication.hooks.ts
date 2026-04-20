import { useEffect, useState, useCallback } from 'react'
import type { QueryResult } from '@/hooks/useQueryResult'
import { useAuth } from '@/domains/auth'
import type {
  FinanceApplicationDocument,
  FinanceCreditApplication,
  CreateFinanceApplicationInput,
  UploadFinanceDocumentInput,
} from './financeApplication.types'
import {
  createFinanceCreditApplication,
  deleteFinanceCreditApplication,
  getFinanceCreditApplicationById,
  listFinanceCreditApplications,
  listFinanceDocumentsByApplication,
  uploadFinanceApplicationDocument,
} from './financeApplication.service'

function buildContext(actorType: 'user' | 'system', actorId?: string, actorRole?: string) {
  return {
    actorType,
    actorId,
    actorRole,
    source: actorType === 'user' ? 'internal_ui' : 'buyer_hub',
  }
}

export function useFinanceApplications(): QueryResult<FinanceCreditApplication[]> & { refresh: () => void } {
  const { user } = useAuth()
  const [data, setData] = useState<FinanceCreditApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [version, setVersion] = useState(0)

  const refresh = useCallback(() => setVersion(v => v + 1), [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const ctx = buildContext('user', user?.id, user?.role)

    listFinanceCreditApplications(ctx).then((result) => {
      if (!cancelled) {
        if (result.ok) {
          setData(result.value)
          setError(null)
        } else {
          setData([])
          setError(result.error.message)
        }
        setLoading(false)
      }
    })

    return () => { cancelled = true }
  }, [user?.id, user?.role, version])

  return { data, loading, error, refresh }
}

export function useFinanceApplication(id: string): QueryResult<FinanceCreditApplication | null> {
  const { user } = useAuth()
  const [data, setData] = useState<FinanceCreditApplication | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      setError('Missing finance application id')
      return
    }

    let cancelled = false
    const ctx = buildContext('user', user?.id, user?.role)

    getFinanceCreditApplicationById(id, ctx).then((result) => {
      if (!cancelled) {
        if (result.ok) {
          setData(result.value)
          setError(null)
        } else {
          setData(null)
          setError(result.error.message)
        }
        setLoading(false)
      }
    })

    return () => { cancelled = true }
  }, [id, user?.id, user?.role])

  return { data, loading, error }
}

export function useFinanceApplicationDocuments(applicationId: string): QueryResult<FinanceApplicationDocument[]> {
  const { user } = useAuth()
  const [data, setData] = useState<FinanceApplicationDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!applicationId) {
      setLoading(false)
      setError('Missing finance application id')
      return
    }

    let cancelled = false
    const ctx = buildContext('user', user?.id, user?.role)

    listFinanceDocumentsByApplication(applicationId, ctx).then((result) => {
      if (!cancelled) {
        if (result.ok) {
          setData(result.value)
          setError(null)
        } else {
          setData([])
          setError(result.error.message)
        }
        setLoading(false)
      }
    })

    return () => { cancelled = true }
  }, [applicationId, user?.id, user?.role])

  return { data, loading, error }
}

export function useFinanceApplicationMutations() {
  const { user } = useAuth()

  const createPublicApplication = useCallback(async (input: CreateFinanceApplicationInput) => {
    return createFinanceCreditApplication(input, {
      actorType: 'system',
      actorId: 'buyer_hub',
      source: 'buyer_hub',
    })
  }, [])

  const createInternalApplication = useCallback(async (input: CreateFinanceApplicationInput) => {
    return createFinanceCreditApplication(input, {
      actorType: 'user',
      actorId: user?.id,
      actorRole: user?.role,
      source: 'internal_ui',
    })
  }, [user?.id, user?.role])

  const uploadPublicDocument = useCallback(async (input: UploadFinanceDocumentInput) => {
    return uploadFinanceApplicationDocument(input, {
      actorType: 'system',
      actorId: 'buyer_hub',
      source: 'buyer_hub',
    })
  }, [])

  const uploadInternalDocument = useCallback(async (input: UploadFinanceDocumentInput) => {
    return uploadFinanceApplicationDocument(input, {
      actorType: 'user',
      actorId: user?.id,
      actorRole: user?.role,
      source: 'internal_ui',
    })
  }, [user?.id, user?.role])

  const deleteApplication = useCallback(async (id: string) => {
    return deleteFinanceCreditApplication(id, {
      actorType: 'user',
      actorId: user?.id,
      actorRole: user?.role,
      source: 'internal_ui',
    })
  }, [user?.id, user?.role])

  return {
    createPublicApplication,
    createInternalApplication,
    uploadPublicDocument,
    uploadInternalDocument,
    deleteApplication,
  }
}
