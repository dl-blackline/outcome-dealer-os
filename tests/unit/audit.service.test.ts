import { describe, it, expect } from 'vitest'

import { writeAuditLog, getAuditLogsByEntity } from '@/domains/audit/audit.service'

describe('Audit Service', () => {
  it('should write audit log with correct change envelope', async () => {
    const result = await writeAuditLog({
      action: 'trade_value_updated',
      objectType: 'trade_appraisal',
      objectId: 'trade-123',
      before: { proposedValue: 5000 },
      after: { proposedValue: 5500 },
      userId: 'user-456',
      userRole: 'sales_manager',
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.action).toBe('trade_value_updated')
      expect(result.value.entityType).toBe('trade_appraisal')
      expect(result.value.beforeState).toEqual({ proposedValue: 5000 })
      expect(result.value.afterState).toEqual({ proposedValue: 5500 })
    }
  })

  it('should support optional confidence score and review flag', async () => {
    const result = await writeAuditLog({
      action: 'ai_output_persisted',
      objectType: 'lead',
      objectId: 'lead-789',
      after: { score: 92 },
      confidenceScore: 0.72,
      requiresReview: true,
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.confidenceScore).toBe(0.72)
      expect(result.value.requiresReview).toBe(true)
    }
  })

  it('should retrieve audit logs by entity', async () => {
    const entityId = 'audit-test-999'

    await writeAuditLog({
      action: 'test_action',
      objectType: 'test',
      objectId: entityId,
      after: { value: 100 },
    })

    const result = await getAuditLogsByEntity('test', entityId)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.length).toBeGreaterThan(0)
      expect(result.value.every((log) => log.entityId === entityId)).toBe(true)
    }
  })
})
