import { UUID } from '@/types/common'

export interface IntegrationSyncState {
  id: UUID
  sourceSystem: string
  targetSystem: string
  objectType: string
  objectId: UUID
  lastSuccessfulSyncAt?: string
  lastAttemptAt?: string
  errorCount: number
  lastErrorMessage?: string
  retryBackoffSeconds: number
  status: 'pending' | 'syncing' | 'success' | 'failed' | 'recovering'
  createdAt: string
  updatedAt?: string
}

export interface UpsertSyncStatePayload {
  sourceSystem: string
  targetSystem: string
  objectType: string
  objectId: UUID
  status?: 'pending' | 'syncing' | 'success' | 'failed' | 'recovering'
}
