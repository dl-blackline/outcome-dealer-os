/**
 * Deal Forms Printing System — persistence service.
 *
 * Saves and loads SavedPacketRecord entries using the KV-backed db client,
 * following the same pattern as other domain services in this codebase.
 */
import { ok, fail } from '@/types/common'
import type { ServiceResult } from '@/types/common'
import { db } from '@/lib/db/supabase'
import type { DbRow } from '@/lib/db/supabase'
import type { SavedPacketRecord } from './dealForms.types'

const TABLE = 'deal_form_packets'

interface SavedPacketRow extends DbRow {
  deal_id: string
  deal_label: string
  form_ids: string[]
  forms_included: string[]
  preset_name?: string
  created_by?: string
  version: number
}

function rowToRecord(row: SavedPacketRow): SavedPacketRecord {
  return {
    id: row.id,
    dealId: row.deal_id,
    dealLabel: row.deal_label,
    formIds: row.form_ids,
    formsIncluded: row.forms_included,
    presetName: row.preset_name,
    createdAt: row.created_at,
    createdBy: row.created_by,
    version: row.version,
  }
}

export async function listPacketsForDeal(
  dealId: string
): Promise<ServiceResult<SavedPacketRecord[]>> {
  try {
    const rows = await db.findMany<SavedPacketRow>(TABLE, (r) => r.deal_id === dealId)
    const sorted = rows
      .map(rowToRecord)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return ok(sorted)
  } catch (error) {
    return fail({
      code: 'LIST_PACKETS_FAILED',
      message: 'Failed to list saved packets',
      details: { error: String(error) },
    })
  }
}

export async function savePacketRecord(
  input: Omit<SavedPacketRecord, 'id' | 'createdAt'>
): Promise<ServiceResult<SavedPacketRecord>> {
  try {
    const row = await db.insert<SavedPacketRow>(TABLE, {
      deal_id: input.dealId,
      deal_label: input.dealLabel,
      form_ids: input.formIds,
      forms_included: input.formsIncluded,
      preset_name: input.presetName,
      created_by: input.createdBy,
      version: input.version,
    })
    return ok(rowToRecord(row))
  } catch (error) {
    return fail({
      code: 'SAVE_PACKET_FAILED',
      message: 'Failed to save packet',
      details: { error: String(error) },
    })
  }
}

export async function deletePacketRecord(id: string): Promise<ServiceResult<boolean>> {
  try {
    const deleted = await db.deleteById(TABLE, id)
    return ok(deleted)
  } catch (error) {
    return fail({
      code: 'DELETE_PACKET_FAILED',
      message: 'Failed to delete packet',
      details: { error: String(error) },
    })
  }
}
