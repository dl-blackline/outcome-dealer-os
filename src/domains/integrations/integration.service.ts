import { ServiceResult, ok, fail, ServiceContext, UUID } from '@/types/common'
import { IntegrationSyncState, UpsertSyncStatePayload } from './integration.types'
import { IntegrationSyncStateRow } from '@/lib/db/supabase'
import { insert, update, findOne, findMany } from '@/lib/db/helpers'
import { publishEvent } from '@/domains/events/event.publisher'

export async function upsertSyncState(
  payload: UpsertSyncStatePayload,
  ctx?: ServiceContext
): Promise<ServiceResult<IntegrationSyncState>> {
  try {
    const existing = await findOne<IntegrationSyncStateRow>(
      'integration_sync_states',
      (row) =>
        row.source_system === payload.sourceSystem &&
        row.target_system === payload.targetSystem &&
        row.object_type === payload.objectType &&
        row.object_id === payload.objectId
    )

    if (existing) {
      const updatedRow = await update<IntegrationSyncStateRow>(
        'integration_sync_states',
        existing.id,
        {
          status: payload.status || existing.status,
          last_attempt_at: new Date().toISOString(),
        }
      )

      if (!updatedRow) {
        return fail({
          code: 'UPDATE_FAILED',
          message: 'Failed to update sync state',
        })
      }

      return ok(mapRowToDomain(updatedRow))
    }

    const syncRow: Omit<IntegrationSyncStateRow, 'id' | 'created_at' | 'updated_at'> = {
      source_system: payload.sourceSystem,
      target_system: payload.targetSystem,
      object_type: payload.objectType,
      object_id: payload.objectId,
      last_attempt_at: new Date().toISOString(),
      error_count: 0,
      retry_backoff_seconds: 0,
      status: payload.status || 'pending',
    }

    const savedRow = await insert<IntegrationSyncStateRow>('integration_sync_states', syncRow)
    return ok(mapRowToDomain(savedRow))
  } catch (error) {
    return fail({
      code: 'UPSERT_SYNC_STATE_FAILED',
      message: 'Failed to upsert sync state',
      details: { error: String(error) },
    })
  }
}

export async function markSyncPending(
  sourceSystem: string,
  targetSystem: string,
  objectType: string,
  objectId: UUID,
  ctx?: ServiceContext
): Promise<ServiceResult<IntegrationSyncState>> {
  return upsertSyncState(
    { sourceSystem, targetSystem, objectType, objectId, status: 'pending' },
    ctx
  )
}

export async function markSyncSuccess(
  sourceSystem: string,
  targetSystem: string,
  objectType: string,
  objectId: UUID,
  ctx?: ServiceContext
): Promise<ServiceResult<IntegrationSyncState>> {
  try {
    const existing = await findOne<IntegrationSyncStateRow>(
      'integration_sync_states',
      (row) =>
        row.source_system === sourceSystem &&
        row.target_system === targetSystem &&
        row.object_type === objectType &&
        row.object_id === objectId
    )

    if (!existing) {
      return fail({
        code: 'SYNC_STATE_NOT_FOUND',
        message: 'Sync state not found',
      })
    }

    const now = new Date().toISOString()
    const wasRecovering = existing.status === 'failed' || existing.status === 'recovering'

    const updatedRow = await update<IntegrationSyncStateRow>(
      'integration_sync_states',
      existing.id,
      {
        status: 'success',
        last_successful_sync_at: now,
        last_attempt_at: now,
        error_count: 0,
        last_error_message: undefined,
        retry_backoff_seconds: 0,
      }
    )

    if (!updatedRow) {
      return fail({
        code: 'UPDATE_FAILED',
        message: 'Failed to mark sync success',
      })
    }

    if (wasRecovering) {
      await publishEvent(
        {
          eventName: 'integration_sync_recovered',
          objectType: 'integration_sync_state',
          objectId: updatedRow.id,
          payload: {
            sourceSystem,
            targetSystem,
            objectType,
            entityId: objectId,
          },
        },
        ctx
      )
    }

    return ok(mapRowToDomain(updatedRow))
  } catch (error) {
    return fail({
      code: 'MARK_SYNC_SUCCESS_FAILED',
      message: 'Failed to mark sync success',
      details: { error: String(error) },
    })
  }
}

export async function markSyncFailed(
  sourceSystem: string,
  targetSystem: string,
  objectType: string,
  objectId: UUID,
  errorMessage: string,
  ctx?: ServiceContext
): Promise<ServiceResult<IntegrationSyncState>> {
  try {
    const existing = await findOne<IntegrationSyncStateRow>(
      'integration_sync_states',
      (row) =>
        row.source_system === sourceSystem &&
        row.target_system === targetSystem &&
        row.object_type === objectType &&
        row.object_id === objectId
    )

    if (!existing) {
      return fail({
        code: 'SYNC_STATE_NOT_FOUND',
        message: 'Sync state not found',
      })
    }

    const now = new Date().toISOString()
    const newErrorCount = existing.error_count + 1
    const backoff = Math.min(Math.pow(2, newErrorCount) * 60, 3600)

    const updatedRow = await update<IntegrationSyncStateRow>(
      'integration_sync_states',
      existing.id,
      {
        status: 'failed',
        last_attempt_at: now,
        error_count: newErrorCount,
        last_error_message: errorMessage,
        retry_backoff_seconds: backoff,
      }
    )

    if (!updatedRow) {
      return fail({
        code: 'UPDATE_FAILED',
        message: 'Failed to mark sync failed',
      })
    }

    await publishEvent(
      {
        eventName: 'integration_sync_failed',
        objectType: 'integration_sync_state',
        objectId: updatedRow.id,
        payload: {
          sourceSystem,
          targetSystem,
          objectType,
          entityId: objectId,
          errorMessage,
          errorCount: newErrorCount,
        },
      },
      ctx
    )

    return ok(mapRowToDomain(updatedRow))
  } catch (error) {
    return fail({
      code: 'MARK_SYNC_FAILED_FAILED',
      message: 'Failed to mark sync failed',
      details: { error: String(error) },
    })
  }
}

export async function listFailedSyncs(): Promise<ServiceResult<IntegrationSyncState[]>> {
  try {
    const rows = await findMany<IntegrationSyncStateRow>(
      'integration_sync_states',
      (row) => row.status === 'failed'
    )

    const states = rows.map(mapRowToDomain)
    return ok(states)
  } catch (error) {
    return fail({
      code: 'LIST_FAILED_SYNCS_FAILED',
      message: 'Failed to list failed syncs',
      details: { error: String(error) },
    })
  }
}

function mapRowToDomain(row: IntegrationSyncStateRow): IntegrationSyncState {
  return {
    id: row.id,
    sourceSystem: row.source_system,
    targetSystem: row.target_system,
    objectType: row.object_type,
    objectId: row.object_id,
    lastSuccessfulSyncAt: row.last_successful_sync_at,
    lastAttemptAt: row.last_attempt_at,
    errorCount: row.error_count,
    lastErrorMessage: row.last_error_message,
    retryBackoffSeconds: row.retry_backoff_seconds,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
