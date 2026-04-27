import { describe, it, expect } from 'vitest'

import {
  upsertSyncState,
  markSyncSuccess,
  markSyncFailed,
  listFailedSyncs,
} from '@/domains/integrations/integration.service'

describe('Integration Service', () => {
  it('should create sync state correctly', async () => {
    const result = await upsertSyncState({
      sourceSystem: 'dms',
      targetSystem: 'crm',
      objectType: 'customer',
      objectId: 'cust-123',
      status: 'pending',
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.sourceSystem).toBe('dms')
      expect(result.value.targetSystem).toBe('crm')
      expect(result.value.objectType).toBe('customer')
      expect(result.value.status).toBe('pending')
    }
  })

  it('should mark sync as successful', async () => {
    await upsertSyncState({
      sourceSystem: 'crm',
      targetSystem: 'marketing',
      objectType: 'lead',
      objectId: 'lead-456',
      status: 'pending',
    })

    const result = await markSyncSuccess('crm', 'marketing', 'lead', 'lead-456')

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.status).toBe('success')
      expect(result.value.errorCount).toBe(0)
      expect(result.value.lastSuccessfulSyncAt).toBeDefined()
    }
  })

  it('should mark sync as failed with exponential backoff', async () => {
    await upsertSyncState({
      sourceSystem: 'lender',
      targetSystem: 'dms',
      objectType: 'credit_app',
      objectId: 'app-789',
      status: 'syncing',
    })

    const result = await markSyncFailed(
      'lender',
      'dms',
      'credit_app',
      'app-789',
      'Connection timeout'
    )

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.status).toBe('failed')
      expect(result.value.errorCount).toBe(1)
      expect(result.value.lastErrorMessage).toBe('Connection timeout')
      expect(result.value.retryBackoffSeconds).toBeGreaterThan(0)
    }
  })

  it('should list all failed syncs', async () => {
    await upsertSyncState({
      sourceSystem: 'test-src',
      targetSystem: 'test-dst',
      objectType: 'test',
      objectId: 'test-999',
      status: 'failed',
    })

    const result = await listFailedSyncs()

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.length).toBeGreaterThan(0)
      expect(result.value.every((sync) => sync.status === 'failed')).toBe(true)
    }
  })
})
