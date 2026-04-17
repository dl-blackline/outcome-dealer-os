import { ServiceResult, ok, fail, UUID } from '@/types/common'
import { findById, findMany, insert, update } from '@/lib/db/helpers'
import {
  ImportJob,
  ImportJobRow,
  ImportJobStatus,
  mapImportJobRowToDomain,
} from './import.types'

const TABLE = 'import_jobs'

export async function createImportJob(
  fileName: string,
  totalRows: number
): Promise<ServiceResult<ImportJob>> {
  try {
    const row = await insert<ImportJobRow>(TABLE, {
      file_name: fileName,
      status: 'pending',
      total_rows: totalRows,
      processed_rows: 0,
      failed_rows: 0,
      source_import_id: crypto.randomUUID(),
    })
    return ok(mapImportJobRowToDomain(row))
  } catch (error) {
    return fail({
      code: 'CREATE_IMPORT_JOB_FAILED',
      message: 'Failed to create import job',
      details: { error: String(error) },
    })
  }
}

export async function getImportJob(id: UUID): Promise<ServiceResult<ImportJob>> {
  try {
    const row = await findById<ImportJobRow>(TABLE, id)
    if (!row) return fail({ code: 'NOT_FOUND', message: 'Import job not found' })
    return ok(mapImportJobRowToDomain(row))
  } catch (error) {
    return fail({
      code: 'GET_IMPORT_JOB_FAILED',
      message: 'Failed to get import job',
      details: { error: String(error) },
    })
  }
}

export async function listImportJobs(): Promise<ServiceResult<ImportJob[]>> {
  try {
    const rows = await findMany<ImportJobRow>(TABLE)
    const sorted = rows.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    return ok(sorted.map(mapImportJobRowToDomain))
  } catch (error) {
    return fail({
      code: 'LIST_IMPORT_JOBS_FAILED',
      message: 'Failed to list import jobs',
      details: { error: String(error) },
    })
  }
}

export async function updateImportJob(
  id: UUID,
  updates: {
    status?: ImportJobStatus
    processedRows?: number
    failedRows?: number
    totalRows?: number
  }
): Promise<ServiceResult<ImportJob>> {
  try {
    const row = await update<ImportJobRow>(TABLE, id, {
      ...(updates.status !== undefined && { status: updates.status }),
      ...(updates.processedRows !== undefined && { processed_rows: updates.processedRows }),
      ...(updates.failedRows !== undefined && { failed_rows: updates.failedRows }),
      ...(updates.totalRows !== undefined && { total_rows: updates.totalRows }),
    })
    if (!row) return fail({ code: 'NOT_FOUND', message: 'Import job not found' })
    return ok(mapImportJobRowToDomain(row))
  } catch (error) {
    return fail({
      code: 'UPDATE_IMPORT_JOB_FAILED',
      message: 'Failed to update import job',
      details: { error: String(error) },
    })
  }
}
