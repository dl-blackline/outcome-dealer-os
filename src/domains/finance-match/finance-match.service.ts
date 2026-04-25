import { findMany, findById, insert, update } from '@/lib/db/helpers'
import { db } from '@/lib/db/supabase'
import { ServiceResult, ok, fail } from '@/types/common'
import { UUID } from '@/types/common'
import {
  LenderRow,
  LenderProgramRow,
  LenderProgramVersionRow,
  LenderRuleRow,
  LenderContactRow,
  LenderMatchRunRow,
  LenderMatchResultRow,
  UploadedProgramJobRow,
  Lender,
  LenderProgram,
  LenderProgramVersion,
  LenderRule,
  LenderContact,
  LenderMatchRun,
  LenderMatchResult,
  UploadedProgramJob,
  DealStructureInput,
  mapLenderRow,
  mapLenderProgramRow,
  mapLenderProgramVersionRow,
  mapLenderRuleRow,
  mapLenderContactRow,
  mapLenderMatchRunRow,
  mapLenderMatchResultRow,
  mapUploadedProgramJobRow,
} from './finance-match.types'
import { runMatchEngine, MatchProgramInput } from './finance-match.rules'
import { buildDealCalculations } from './finance-match.calculations'

// ─── Lender CRUD ──────────────────────────────────────────────────────────────

export async function listLenders(): Promise<ServiceResult<Lender[]>> {
  try {
    const rows = await findMany<LenderRow>('lenders')
    return ok(rows.map(mapLenderRow))
  } catch (e) {
    return fail({ code: 'LIST_LENDERS_ERROR', message: String(e) })
  }
}

export async function getLender(id: UUID): Promise<ServiceResult<Lender | null>> {
  try {
    const row = await findById<LenderRow>('lenders', id)
    return ok(row ? mapLenderRow(row) : null)
  } catch (e) {
    return fail({ code: 'GET_LENDER_ERROR', message: String(e) })
  }
}

export async function createLender(
  input: Omit<LenderRow, 'id' | 'created_at' | 'updated_at'>
): Promise<ServiceResult<Lender>> {
  try {
    const row = await insert<LenderRow>('lenders', input)
    return ok(mapLenderRow(row))
  } catch (e) {
    return fail({ code: 'CREATE_LENDER_ERROR', message: String(e) })
  }
}

// ─── Lender Programs ──────────────────────────────────────────────────────────

export async function listLenderPrograms(lenderId?: UUID): Promise<ServiceResult<LenderProgram[]>> {
  try {
    const rows = await findMany<LenderProgramRow>(
      'lender_programs',
      lenderId ? (r) => r.lender_id === lenderId : undefined
    )
    return ok(rows.map(mapLenderProgramRow))
  } catch (e) {
    return fail({ code: 'LIST_PROGRAMS_ERROR', message: String(e) })
  }
}

export async function listProgramVersions(
  programId?: UUID
): Promise<ServiceResult<LenderProgramVersion[]>> {
  try {
    const rows = await findMany<LenderProgramVersionRow>(
      'lender_program_versions',
      programId ? (r) => r.program_id === programId : undefined
    )
    return ok(rows.map(mapLenderProgramVersionRow))
  } catch (e) {
    return fail({ code: 'LIST_VERSIONS_ERROR', message: String(e) })
  }
}

export async function approveProgramVersion(
  versionId: UUID,
  approvedBy: string
): Promise<ServiceResult<LenderProgramVersion>> {
  try {
    const row = await update<LenderProgramVersionRow>('lender_program_versions', versionId, {
      status: 'active',
      approved_by: approvedBy,
      approved_at: new Date().toISOString(),
    })
    if (!row) return fail({ code: 'VERSION_NOT_FOUND', message: 'Program version not found' })
    return ok(mapLenderProgramVersionRow(row))
  } catch (e) {
    return fail({ code: 'APPROVE_VERSION_ERROR', message: String(e) })
  }
}

// ─── Lender Rules ─────────────────────────────────────────────────────────────

export async function getLenderRules(programVersionId: UUID): Promise<ServiceResult<LenderRule[]>> {
  try {
    const rows = await findMany<LenderRuleRow>(
      'lender_rules',
      (r) => r.program_version_id === programVersionId && r.is_active
    )
    return ok(rows.map(mapLenderRuleRow))
  } catch (e) {
    return fail({ code: 'GET_RULES_ERROR', message: String(e) })
  }
}

export async function createLenderRule(
  input: Omit<LenderRuleRow, 'id' | 'created_at' | 'updated_at'>
): Promise<ServiceResult<LenderRule>> {
  try {
    const row = await insert<LenderRuleRow>('lender_rules', input)
    return ok(mapLenderRuleRow(row))
  } catch (e) {
    return fail({ code: 'CREATE_RULE_ERROR', message: String(e) })
  }
}

export async function updateLenderRule(
  id: UUID,
  input: Partial<Omit<LenderRuleRow, 'id' | 'created_at'>>
): Promise<ServiceResult<LenderRule>> {
  try {
    const row = await update<LenderRuleRow>('lender_rules', id, input)
    if (!row) return fail({ code: 'RULE_NOT_FOUND', message: 'Lender rule not found' })
    return ok(mapLenderRuleRow(row))
  } catch (e) {
    return fail({ code: 'UPDATE_RULE_ERROR', message: String(e) })
  }
}

// ─── Lender Contacts ──────────────────────────────────────────────────────────

export async function listLenderContacts(lenderId: UUID): Promise<ServiceResult<LenderContact[]>> {
  try {
    const rows = await findMany<LenderContactRow>(
      'lender_contacts',
      (r) => r.lender_id === lenderId
    )
    return ok(rows.map(mapLenderContactRow))
  } catch (e) {
    return fail({ code: 'LIST_CONTACTS_ERROR', message: String(e) })
  }
}

// ─── Match Run ────────────────────────────────────────────────────────────────

export async function saveMatchRun(
  run: Omit<LenderMatchRunRow, 'id' | 'created_at' | 'updated_at'>,
  results: Array<Omit<LenderMatchResultRow, 'id' | 'created_at' | 'updated_at' | 'match_run_id'>>
): Promise<ServiceResult<{ run: LenderMatchRun; results: LenderMatchResult[] }>> {
  try {
    const savedRun = await insert<LenderMatchRunRow>('lender_match_runs', run)
    const savedResults: LenderMatchResult[] = []

    for (const result of results) {
      const savedResult = await insert<LenderMatchResultRow>('lender_match_results', {
        ...result,
        match_run_id: savedRun.id,
      })
      savedResults.push(mapLenderMatchResultRow(savedResult, '', ''))
    }

    return ok({ run: mapLenderMatchRunRow(savedRun), results: savedResults })
  } catch (e) {
    return fail({ code: 'SAVE_MATCH_RUN_ERROR', message: String(e) })
  }
}

export async function getMatchRunHistory(dealId?: string): Promise<ServiceResult<LenderMatchRun[]>> {
  try {
    const rows = await findMany<LenderMatchRunRow>(
      'lender_match_runs',
      dealId ? (r) => r.deal_id === dealId : undefined
    )
    return ok(rows.map(mapLenderMatchRunRow))
  } catch (e) {
    return fail({ code: 'GET_HISTORY_ERROR', message: String(e) })
  }
}

// ─── Main runFinanceMatch ─────────────────────────────────────────────────────

export async function runFinanceMatch(
  input: DealStructureInput,
  userId?: string
): Promise<ServiceResult<{ run: LenderMatchRun; results: LenderMatchResult[] }>> {
  try {
    // Load all active lenders
    const lendersResult = await listLenders()
    if (!lendersResult.ok) return fail(lendersResult.error)
    const lenders = lendersResult.value.filter((l) => l.isActive)

    // Load programs for each lender
    const programsResult = await listLenderPrograms()
    if (!programsResult.ok) return fail(programsResult.error)
    const programs = programsResult.value.filter((p) => p.isActive)

    // Load active versions for each program
    const versionsResult = await listProgramVersions()
    if (!versionsResult.ok) return fail(versionsResult.error)
    const activeVersions = versionsResult.value.filter((v) => v.status === 'active')

    // For each active version, load rules
    const matchPrograms: MatchProgramInput[] = []
    const lenderMap = new Map(lenders.map((l) => [l.id, l]))
    const programMap = new Map(programs.map((p) => [p.id, p]))

    for (const version of activeVersions) {
      const program = programMap.get(version.programId)
      if (!program) continue
      const lender = lenderMap.get(program.lenderId)
      if (!lender) continue

      const rulesResult = await getLenderRules(version.id)
      if (!rulesResult.ok) continue

      matchPrograms.push({
        lenderId: lender.id,
        lenderName: lender.name,
        programId: program.id,
        programName: program.programName,
        programVersionId: version.id,
        rules: rulesResult.value,
      })
    }

    // Run the match engine
    const { results: engineResults, runStats } = runMatchEngine(input, matchPrograms)
    const calc = buildDealCalculations(input)

    // Save run and results
    const runData: Omit<LenderMatchRunRow, 'id' | 'created_at' | 'updated_at'> = {
      deal_id: input.dealId,
      run_by_user_id: userId,
      input_snapshot: input as unknown as Record<string, unknown>,
      calculated_ltv: calc.ltv,
      calculated_pti: calc.pti,
      calculated_dti: calc.dti,
      calculated_amount_financed: calc.amountFinanced,
      calculated_total_backend: calc.totalBackend,
      programs_evaluated: runStats.programsEvaluated,
      greenlights: runStats.greenlights,
      reviews: runStats.reviews,
      fails: runStats.fails,
      run_at: new Date().toISOString(),
    }

    const resultRows = engineResults.map((r) => ({
      lender_id: r.lenderId,
      program_id: r.programId,
      program_version_id: r.programVersionId,
      status: r.status,
      confidence: r.confidence,
      reasons: r.reasons,
      restructure_suggestions: r.restructureSuggestions,
      passed_rules: r.passedRules,
      failed_rules: r.failedRules,
      warning_rules: r.warningRules,
      total_rules: r.totalRules,
    }))

    const saveResult = await saveMatchRun(runData, resultRows)
    if (!saveResult.ok) {
      // Even if save fails, return the match results
      const fakeRun: LenderMatchRun = {
        id: crypto.randomUUID(),
        ...runData,
        inputSnapshot: input,
        calculatedLtv: calc.ltv,
        calculatedPti: calc.pti,
        calculatedDti: calc.dti,
        calculatedAmountFinanced: calc.amountFinanced,
        calculatedTotalBackend: calc.totalBackend,
        programsEvaluated: engineResults.length,
        greenlights: engineResults.filter(r => r.status === 'greenlight').length,
        reviews: engineResults.filter(r => r.status === 'review').length,
        fails: engineResults.filter(r => r.status === 'fail').length,
        runAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      }
      return ok({ run: fakeRun, results: engineResults })
    }

    // Merge lender/program names back into saved results
    const namedResults = saveResult.value.results.map((r, i) => ({
      ...r,
      lenderName: engineResults[i]?.lenderName ?? '',
      programName: engineResults[i]?.programName ?? '',
      status: engineResults[i]?.status ?? r.status,
      reasons: engineResults[i]?.reasons ?? [],
      restructureSuggestions: engineResults[i]?.restructureSuggestions ?? [],
      confidence: engineResults[i]?.confidence ?? r.confidence,
      passedRules: engineResults[i]?.passedRules ?? 0,
      failedRules: engineResults[i]?.failedRules ?? 0,
      warningRules: engineResults[i]?.warningRules ?? 0,
      totalRules: engineResults[i]?.totalRules ?? 0,
    }))

    return ok({ run: saveResult.value.run, results: namedResults })
  } catch (e) {
    return fail({ code: 'RUN_FINANCE_MATCH_ERROR', message: String(e) })
  }
}

// ─── Processing Jobs ──────────────────────────────────────────────────────────

export async function listProcessingJobs(): Promise<ServiceResult<UploadedProgramJob[]>> {
  try {
    const rows = await findMany<UploadedProgramJobRow>('uploaded_program_processing_jobs')
    return ok(rows.map(mapUploadedProgramJobRow))
  } catch (e) {
    return fail({ code: 'LIST_JOBS_ERROR', message: String(e) })
  }
}

export async function createProcessingJob(
  documentId: UUID | undefined,
  extractedData: Record<string, unknown>
): Promise<ServiceResult<UploadedProgramJob>> {
  try {
    const row = await insert<UploadedProgramJobRow>('uploaded_program_processing_jobs', {
      document_id: documentId,
      status: 'extracted',
      extracted_data: extractedData,
      extracted_rules: [],
      approved_rules: [],
    })
    return ok(mapUploadedProgramJobRow(row))
  } catch (e) {
    return fail({ code: 'CREATE_JOB_ERROR', message: String(e) })
  }
}

export async function approveJobRules(
  jobId: UUID,
  rules: Partial<LenderRuleRow>[] = [],
  reviewedBy = 'system'
): Promise<ServiceResult<UploadedProgramJob>> {
  try {
    const row = await update<UploadedProgramJobRow>('uploaded_program_processing_jobs', jobId, {
      status: 'approved',
      approved_rules: rules as Partial<LenderRuleRow>[],
      reviewed_by: reviewedBy,
      reviewed_at: new Date().toISOString(),
    })
    if (!row) return fail({ code: 'JOB_NOT_FOUND', message: 'Processing job not found' })
    return ok(mapUploadedProgramJobRow(row))
  } catch (e) {
    return fail({ code: 'APPROVE_JOB_ERROR', message: String(e) })
  }
}
