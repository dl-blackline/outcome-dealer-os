import { ServiceContext, ServiceResult, ok, fail, UUID } from '@/types/common'
import { findById, findMany, insert, update } from '@/lib/db/helpers'
import { hasPermission } from '@/domains/roles/policy'
import { publishEvent } from '@/domains/events/event.publisher'
import { writeAuditLog } from '@/domains/audit/audit.service'
import {
  FinanceCreditApplicationRow,
  FinanceCreditApplication,
  FinanceApplicationDocument,
  FinanceApplicationDocumentRow,
  CreateFinanceApplicationInput,
  UploadFinanceDocumentInput,
  mapFinanceCreditApplicationRowToDomain,
  mapFinanceApplicationDocumentRowToDomain,
} from './financeApplication.types'
import {
  getRequiredDocumentsForScoreRange,
  normalizeAndValidateSSN,
  shouldRequirePreviousEmployer,
  shouldRequirePreviousResidence,
  sanitizeFileName,
  isAllowedUploadMimeType,
  isAllowedUploadSize,
} from './financeApplication.rules'

const APPLICATION_TABLE = 'finance_credit_applications'
const DOCUMENT_TABLE = 'finance_credit_application_documents'

function buildSensitiveTokenRef(): string {
  return `token_ssn_${crypto.randomUUID().replace(/-/g, '')}`
}

function validateCreateInput(input: CreateFinanceApplicationInput): string[] {
  const errors: string[] = []

  if (!input.identity.fullLegalName.trim()) errors.push('Full legal name is required')
  if (!input.identity.phone.trim()) errors.push('Phone is required')
  if (!input.identity.email.trim()) errors.push('Email is required')
  if (!normalizeAndValidateSSN(input.identity.ssnRaw)) errors.push('A valid SSN is required')

  if (!input.currentResidence.addressLine1.trim()) errors.push('Current address is required')
  if (!input.currentResidence.city.trim()) errors.push('Current residence city is required')
  if (!input.currentResidence.state.trim()) errors.push('Current residence state is required')
  if (!input.currentResidence.zip.trim()) errors.push('Current residence ZIP is required')

  if (!input.currentEmployment.employerName.trim()) errors.push('Employer name is required')
  if (!input.currentEmployment.occupationTitle.trim()) errors.push('Job title is required')

  if (shouldRequirePreviousResidence(input.currentResidence) && !input.previousResidence) {
    errors.push('Previous residence is required when current residency is under 2 years')
  }

  if (shouldRequirePreviousEmployer(input.currentEmployment) && !input.previousEmployment) {
    errors.push('Previous employment is required when current employment is under 2 years')
  }

  return errors
}

async function enforceViewPermission(ctx: ServiceContext): Promise<ServiceResult<null>> {
  if (ctx.actorType === 'user' && ctx.actorRole) {
    if (!hasPermission({ role: ctx.actorRole as any }, 'view_credit_apps')) {
      return fail({ code: 'PERMISSION_DENIED', message: 'Insufficient permissions to view finance applications' })
    }
  }

  return ok(null)
}

async function enforceEditPermission(ctx: ServiceContext): Promise<ServiceResult<null>> {
  if (ctx.actorType === 'user' && ctx.actorRole) {
    if (!hasPermission({ role: ctx.actorRole as any }, 'edit_credit_apps')) {
      return fail({ code: 'PERMISSION_DENIED', message: 'Insufficient permissions to edit finance applications' })
    }
  }

  return ok(null)
}

function deriveCompleteness(requiredDocuments: string[], uploadedDocuments: string[]) {
  const missingDocuments = requiredDocuments.filter((requiredType) => !uploadedDocuments.includes(requiredType))
  const completenessStatus = missingDocuments.length > 0 ? 'docs_missing' : 'ready'
  const applicationStatus = missingDocuments.length > 0 ? 'documents_pending' : 'ready_for_review'

  return { missingDocuments, completenessStatus, applicationStatus }
}

export async function createFinanceCreditApplication(
  input: CreateFinanceApplicationInput,
  ctx: ServiceContext
): Promise<ServiceResult<FinanceCreditApplication>> {
  try {
    const validationErrors = validateCreateInput(input)
    if (validationErrors.length > 0) {
      return fail({ code: 'VALIDATION_ERROR', message: validationErrors.join('; ') })
    }

    const ssn = normalizeAndValidateSSN(input.identity.ssnRaw)
    if (!ssn) {
      return fail({ code: 'VALIDATION_ERROR', message: 'Invalid SSN format' })
    }

    const requiredDocuments = getRequiredDocumentsForScoreRange(input.creditScoreRange)
    const uploadedDocuments: string[] = []
    const { missingDocuments, completenessStatus, applicationStatus } = deriveCompleteness(requiredDocuments, uploadedDocuments)

    const row = await insert<FinanceCreditApplicationRow>(APPLICATION_TABLE, {
      lead_id: input.leadId,
      customer_id: input.customerId,
      quick_app_submission_id: input.quickAppSubmissionId,
      applicant_json: {
        fullLegalName: input.identity.fullLegalName.trim(),
        dateOfBirth: input.identity.dateOfBirth,
        phone: input.identity.phone.trim(),
        email: input.identity.email.trim().toLowerCase(),
        driverLicenseNumber: input.identity.driverLicenseNumber?.trim(),
        ssnLast4: ssn.last4,
        ssnTokenRef: buildSensitiveTokenRef(),
      },
      current_residence_json: input.currentResidence,
      previous_residence_json: input.previousResidence,
      current_employment_json: input.currentEmployment,
      previous_employment_json: input.previousEmployment,
      credit_score_range: input.creditScoreRange,
      required_documents: requiredDocuments,
      uploaded_documents: uploadedDocuments,
      application_status: applicationStatus,
      completeness_status: completenessStatus,
      missing_documents: missingDocuments,
    })

    const application = mapFinanceCreditApplicationRowToDomain(row)

    await writeAuditLog({
      action: 'finance_credit_application.create',
      objectType: 'credit_app',
      objectId: application.id,
      after: {
        id: application.id,
        leadId: application.leadId,
        customerId: application.customerId,
        creditScoreRange: application.creditScoreRange,
        requiredDocuments: application.requiredDocuments,
        missingDocuments: application.missingDocuments,
        ssnTokenRef: application.applicant.ssnTokenRef,
        ssnLast4: application.applicant.ssnLast4,
      },
      userId: ctx.actorId,
      userRole: ctx.actorRole,
      source: ctx.source,
    })

    await publishEvent({
      eventName: 'credit_app_submitted',
      objectType: 'credit_app',
      objectId: application.id,
      payload: {
        applicationId: application.id,
        leadId: application.leadId,
        customerId: application.customerId,
        creditScoreRange: application.creditScoreRange,
        requiredDocuments: application.requiredDocuments,
        missingDocuments: application.missingDocuments,
      },
      actorType: ctx.actorType,
      actorId: ctx.actorId,
    })

    return ok(application)
  } catch (error) {
    return fail({ code: 'CREATE_FINANCE_APP_FAILED', message: 'Failed to create finance application', details: { error: String(error) } })
  }
}

export async function uploadFinanceApplicationDocument(
  input: UploadFinanceDocumentInput,
  ctx: ServiceContext
): Promise<ServiceResult<FinanceApplicationDocument>> {
  try {
    const canEdit = await enforceEditPermission(ctx)
    if (!canEdit.ok) return canEdit

    const applicationRow = await findById<FinanceCreditApplicationRow>(APPLICATION_TABLE, input.applicationId)
    if (!applicationRow) {
      return fail({ code: 'NOT_FOUND', message: 'Finance application not found' })
    }

    if (!isAllowedUploadMimeType(input.mimeType)) {
      return fail({ code: 'VALIDATION_ERROR', message: 'Unsupported file type. Allowed: PDF, PNG, JPEG.' })
    }

    if (!isAllowedUploadSize(input.fileSizeBytes)) {
      return fail({ code: 'VALIDATION_ERROR', message: 'File size must be between 1 byte and 10 MB.' })
    }

    const sanitizedName = sanitizeFileName(input.fileName)

    const documentRow = await insert<FinanceApplicationDocumentRow>(DOCUMENT_TABLE, {
      application_id: input.applicationId,
      lead_id: input.leadId || applicationRow.lead_id,
      customer_id: input.customerId || applicationRow.customer_id,
      document_type: input.documentType,
      file_name: sanitizedName,
      mime_type: input.mimeType,
      file_size_bytes: input.fileSizeBytes,
      storage_ref: `finance-docs/${input.applicationId}/${crypto.randomUUID()}-${sanitizedName}`,
      uploaded_by_actor_type: input.uploadedByActorType,
      upload_status: 'uploaded',
      rejection_reason: undefined,
    })

    const existingUploads = applicationRow.uploaded_documents || []
    const mergedUploads = Array.from(new Set([...existingUploads, input.documentType]))
    const { missingDocuments, completenessStatus, applicationStatus } = deriveCompleteness(
      applicationRow.required_documents,
      mergedUploads,
    )

    await update<FinanceCreditApplicationRow>(APPLICATION_TABLE, input.applicationId, {
      uploaded_documents: mergedUploads,
      missing_documents: missingDocuments,
      completeness_status: completenessStatus,
      application_status: applicationStatus,
    })

    const document = mapFinanceApplicationDocumentRowToDomain(documentRow)

    await writeAuditLog({
      action: 'finance_credit_application.document_uploaded',
      objectType: 'credit_app',
      objectId: input.applicationId,
      after: {
        documentId: document.id,
        documentType: document.documentType,
        fileName: document.fileName,
        mimeType: document.mimeType,
        fileSizeBytes: document.fileSizeBytes,
      },
      userId: ctx.actorId,
      userRole: ctx.actorRole,
      source: ctx.source,
    })

    await publishEvent({
      eventName: 'stip_missing',
      objectType: 'credit_app',
      objectId: input.applicationId,
      payload: {
        uploadedDocumentType: document.documentType,
        missingDocuments,
      },
      actorType: ctx.actorType,
      actorId: ctx.actorId,
    })

    return ok(document)
  } catch (error) {
    return fail({ code: 'UPLOAD_FINANCE_DOC_FAILED', message: 'Failed to upload finance document', details: { error: String(error) } })
  }
}

export async function getFinanceCreditApplicationById(
  id: UUID,
  ctx: ServiceContext
): Promise<ServiceResult<FinanceCreditApplication>> {
  try {
    const canView = await enforceViewPermission(ctx)
    if (!canView.ok) return canView

    const row = await findById<FinanceCreditApplicationRow>(APPLICATION_TABLE, id)
    if (!row) return fail({ code: 'NOT_FOUND', message: 'Finance application not found' })

    return ok(mapFinanceCreditApplicationRowToDomain(row))
  } catch (error) {
    return fail({ code: 'GET_FINANCE_APP_FAILED', message: 'Failed to get finance application', details: { error: String(error) } })
  }
}

export async function listFinanceCreditApplications(ctx: ServiceContext): Promise<ServiceResult<FinanceCreditApplication[]>> {
  try {
    const canView = await enforceViewPermission(ctx)
    if (!canView.ok) return canView

    const rows = await findMany<FinanceCreditApplicationRow>(APPLICATION_TABLE)
    const sorted = rows.slice().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return ok(sorted.map(mapFinanceCreditApplicationRowToDomain))
  } catch (error) {
    return fail({ code: 'LIST_FINANCE_APPS_FAILED', message: 'Failed to list finance applications', details: { error: String(error) } })
  }
}

export async function listFinanceDocumentsByApplication(
  applicationId: UUID,
  ctx: ServiceContext
): Promise<ServiceResult<FinanceApplicationDocument[]>> {
  try {
    const canView = await enforceViewPermission(ctx)
    if (!canView.ok) return canView

    const rows = await findMany<FinanceApplicationDocumentRow>(DOCUMENT_TABLE, (row) => row.application_id === applicationId)
    const sorted = rows.slice().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return ok(sorted.map(mapFinanceApplicationDocumentRowToDomain))
  } catch (error) {
    return fail({ code: 'LIST_FINANCE_DOCS_FAILED', message: 'Failed to list finance documents', details: { error: String(error) } })
  }
}
