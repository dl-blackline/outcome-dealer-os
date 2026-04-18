/**
 * Buyer Hub Event Bridge
 *
 * Thin wrappers that convert customer form submissions into canonical events,
 * route them through the event bus (which triggers auto-card rules), and
 * optionally persist progress data to localStorage for the NextStepsPage.
 *
 * All customer submissions use actorType 'system' because the EventBusRow
 * type does not include a 'customer' actor type. The session ID stored in
 * localStorage identifies the anonymous customer session.
 */
import { emitEvent } from '@/domains/events/event.bus'
import { createFinanceCreditApplication } from '@/domains/credit/financeApplication.service'
import { getRequiredDocumentsForScoreRange } from '@/domains/credit/financeApplication.rules'
import type {
  InquirySubmission,
  QuickAppSubmission,
  TradeInSubmission,
  AppointmentRequest,
} from './buyerHub.types'

const SESSION_KEY = 'outcome-dealer-buyer-session'

/** Retrieve or create a stable anonymous session ID for this browser. */
export function getBuyerSessionId(): string {
  try {
    const existing = localStorage.getItem(SESSION_KEY)
    if (existing) return existing
    const id = crypto.randomUUID()
    localStorage.setItem(SESSION_KEY, id)
    return id
  } catch {
    return crypto.randomUUID()
  }
}

export async function submitInquiry(
  data: InquirySubmission
): Promise<{ ok: boolean; submissionId: string }> {
  const submissionId = crypto.randomUUID()

  await emitEvent(
    {
      eventName: 'inquiry_submitted',
      objectType: 'lead',
      objectId: submissionId,
      actorType: 'system',
      payload: {
        sessionId: getBuyerSessionId(),
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        unitId: data.unitId,
        message: data.message,
        preferredContact: data.preferredContact,
      },
    }
  )

  return { ok: true, submissionId }
}

export async function submitQuickApp(
  data: QuickAppSubmission
): Promise<{
  ok: boolean
  submissionId: string
  applicationId: string
  leadId: string
  customerId: string
  requiredDocuments: string[]
  missingDocuments: string[]
}> {
  const submissionId = crypto.randomUUID()
  const leadId = crypto.randomUUID()
  const customerId = crypto.randomUUID()

  const createResult = await createFinanceCreditApplication(
    {
      leadId,
      customerId,
      quickAppSubmissionId: submissionId,
      identity: {
        fullLegalName: data.fullLegalName,
        dateOfBirth: data.dateOfBirth,
        phone: data.phone,
        email: data.email,
        driverLicenseNumber: data.driverLicenseNumber,
        ssnRaw: data.ssnRaw,
      },
      currentResidence: {
        addressLine1: data.currentAddressLine1,
        addressLine2: data.currentAddressLine2,
        city: data.currentCity,
        state: data.currentState,
        zip: data.currentZip,
        housingStatus: data.housingStatus,
        housingStatusOther: data.housingStatusOther,
        monthlyHousingPayment: data.monthlyHousingPayment,
        timeAtResidence: {
          years: data.residenceYears,
          months: data.residenceMonths,
        },
      },
      previousResidence: data.previousResidenceAddressLine1
        ? {
            addressLine1: data.previousResidenceAddressLine1,
            addressLine2: data.previousResidenceAddressLine2,
            city: data.previousResidenceCity || '',
            state: data.previousResidenceState || '',
            zip: data.previousResidenceZip || '',
            housingStatus: data.previousHousingStatus || 'other',
            housingStatusOther: data.previousHousingStatusOther,
            monthlyHousingPayment: data.previousMonthlyHousingPayment,
            timeAtResidence: {
              years: data.previousResidenceYears || 0,
              months: data.previousResidenceMonths || 0,
            },
          }
        : undefined,
      currentEmployment: {
        employerName: data.employerName,
        occupationTitle: data.occupationTitle,
        employmentStatus: data.employmentStatus,
        employmentStatusOther: data.employmentStatusOther,
        grossMonthlyIncome: data.grossMonthlyIncome,
        annualIncome: data.annualIncome,
        timeAtEmployer: {
          years: data.employerYears,
          months: data.employerMonths,
        },
      },
      previousEmployment: data.previousEmployerName
        ? {
            employerName: data.previousEmployerName,
            occupationTitle: data.previousOccupationTitle || '',
            employmentStatus: 'other',
            grossMonthlyIncome: data.previousEmployerGrossMonthlyIncome,
            annualIncome: data.previousEmployerAnnualIncome,
            timeAtEmployer: {
              years: data.previousEmployerYears || 0,
              months: data.previousEmployerMonths || 0,
            },
          }
        : undefined,
      creditScoreRange: data.creditScoreRange,
    },
    {
      actorType: 'system',
      actorId: 'buyer_hub',
      source: 'buyer_hub',
    }
  )

  if (!createResult.ok) {
    throw new Error(createResult.error.message)
  }

  await emitEvent(
    {
      eventName: 'quick_app_started',
      objectType: 'lead',
      objectId: leadId,
      actorType: 'system',
      payload: { sessionId: getBuyerSessionId(), email: data.email },
    }
  )

  await emitEvent(
    {
      eventName: 'quick_app_completed',
      objectType: 'lead',
      objectId: leadId,
      actorType: 'system',
      payload: {
        sessionId: getBuyerSessionId(),
        fullLegalName: data.fullLegalName,
        email: data.email,
        phone: data.phone,
        annualIncome: data.annualIncome,
        creditScoreRange: data.creditScoreRange,
        applicationId: createResult.value.id,
        unitId: data.unitId,
      },
    }
  )

  return {
    ok: true,
    submissionId,
    applicationId: createResult.value.id,
    leadId,
    customerId,
    requiredDocuments: getRequiredDocumentsForScoreRange(data.creditScoreRange),
    missingDocuments: createResult.value.missingDocuments,
  }
}

export async function submitTradeIn(
  data: TradeInSubmission
): Promise<{ ok: boolean; submissionId: string }> {
  const submissionId = crypto.randomUUID()

  await emitEvent(
    {
      eventName: 'trade_in_started',
      objectType: 'lead',
      objectId: submissionId,
      actorType: 'system',
      payload: { sessionId: getBuyerSessionId(), email: data.ownerEmail },
    }
  )

  await emitEvent(
    {
      eventName: 'trade_in_submitted',
      objectType: 'lead',
      objectId: submissionId,
      actorType: 'system',
      payload: {
        sessionId: getBuyerSessionId(),
        year: data.year,
        make: data.make,
        model: data.model,
        mileage: data.mileage,
        condition: data.condition,
        vin: data.vin,
        ownerEmail: data.ownerEmail,
        linkedUnitId: data.linkedUnitId,
      },
    }
  )

  return { ok: true, submissionId }
}

export async function submitAppointmentRequest(
  data: AppointmentRequest
): Promise<{ ok: boolean; submissionId: string }> {
  const submissionId = crypto.randomUUID()

  await emitEvent(
    {
      eventName: 'appointment_requested',
      objectType: 'lead',
      objectId: submissionId,
      actorType: 'system',
      payload: {
        sessionId: getBuyerSessionId(),
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        preferredDate: data.preferredDate,
        preferredTime: data.preferredTime,
        type: data.type,
        unitId: data.unitId,
        notes: data.notes,
      },
    }
  )

  return { ok: true, submissionId }
}
