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
import { getRequiredDocumentsForApplication } from '@/domains/credit/financeApplication.rules'
import {
  sendInquiryNotification,
  sendAppointmentNotification,
  sendQuickAppNotification,
  sendTradeInNotification,
} from '@/services/email.service'
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

  void sendInquiryNotification({
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    message: data.message,
    preferredContact: data.preferredContact,
    vehicleInfo: data.unitId,
  })

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
      applicationType: data.applicationType,
      primaryApplicant: {
        identity: {
          fullLegalName: data.primaryApplicant.fullLegalName,
          dateOfBirth: data.primaryApplicant.dateOfBirth,
          phone: data.primaryApplicant.phone,
          email: data.primaryApplicant.email,
          driverLicenseNumber: data.primaryApplicant.driverLicenseNumber,
          ssnRaw: data.primaryApplicant.ssnRaw,
        },
        currentResidence: {
          addressLine1: data.primaryApplicant.currentAddressLine1,
          addressLine2: data.primaryApplicant.currentAddressLine2,
          city: data.primaryApplicant.currentCity,
          state: data.primaryApplicant.currentState,
          zip: data.primaryApplicant.currentZip,
          housingStatus: data.primaryApplicant.housingStatus,
          housingStatusOther: data.primaryApplicant.housingStatusOther,
          monthlyHousingPayment: data.primaryApplicant.monthlyHousingPayment,
          timeAtResidence: {
            years: data.primaryApplicant.residenceYears,
            months: data.primaryApplicant.residenceMonths,
          },
        },
        previousResidence: data.primaryApplicant.previousResidenceAddressLine1
          ? {
              addressLine1: data.primaryApplicant.previousResidenceAddressLine1,
              addressLine2: data.primaryApplicant.previousResidenceAddressLine2,
              city: data.primaryApplicant.previousResidenceCity || '',
              state: data.primaryApplicant.previousResidenceState || '',
              zip: data.primaryApplicant.previousResidenceZip || '',
              housingStatus: data.primaryApplicant.previousHousingStatus || 'other',
              housingStatusOther: data.primaryApplicant.previousHousingStatusOther,
              monthlyHousingPayment: data.primaryApplicant.previousMonthlyHousingPayment,
              timeAtResidence: {
                years: data.primaryApplicant.previousResidenceYears || 0,
                months: data.primaryApplicant.previousResidenceMonths || 0,
              },
            }
          : undefined,
        currentEmployment: {
          employerName: data.primaryApplicant.employerName,
          occupationTitle: data.primaryApplicant.occupationTitle,
          employmentStatus: data.primaryApplicant.employmentStatus,
          employmentStatusOther: data.primaryApplicant.employmentStatusOther,
          grossMonthlyIncome: data.primaryApplicant.grossMonthlyIncome,
          annualIncome: data.primaryApplicant.annualIncome,
          timeAtEmployer: {
            years: data.primaryApplicant.employerYears,
            months: data.primaryApplicant.employerMonths,
          },
        },
        previousEmployment: data.primaryApplicant.previousEmployerName
          ? {
              employerName: data.primaryApplicant.previousEmployerName,
              occupationTitle: data.primaryApplicant.previousOccupationTitle || '',
              employmentStatus: 'other',
              grossMonthlyIncome: data.primaryApplicant.previousEmployerGrossMonthlyIncome,
              annualIncome: data.primaryApplicant.previousEmployerAnnualIncome,
              timeAtEmployer: {
                years: data.primaryApplicant.previousEmployerYears || 0,
                months: data.primaryApplicant.previousEmployerMonths || 0,
              },
            }
          : undefined,
        creditScoreRange: data.primaryApplicant.creditScoreRange,
      },
      coApplicant: data.coApplicant
        ? {
            identity: {
              fullLegalName: data.coApplicant.fullLegalName,
              dateOfBirth: data.coApplicant.dateOfBirth,
              phone: data.coApplicant.phone,
              email: data.coApplicant.email,
              driverLicenseNumber: data.coApplicant.driverLicenseNumber,
              ssnRaw: data.coApplicant.ssnRaw,
            },
            currentResidence: {
              addressLine1: data.coApplicant.currentAddressLine1,
              addressLine2: data.coApplicant.currentAddressLine2,
              city: data.coApplicant.currentCity,
              state: data.coApplicant.currentState,
              zip: data.coApplicant.currentZip,
              housingStatus: data.coApplicant.housingStatus,
              housingStatusOther: data.coApplicant.housingStatusOther,
              monthlyHousingPayment: data.coApplicant.monthlyHousingPayment,
              timeAtResidence: {
                years: data.coApplicant.residenceYears,
                months: data.coApplicant.residenceMonths,
              },
            },
            previousResidence: data.coApplicant.previousResidenceAddressLine1
              ? {
                  addressLine1: data.coApplicant.previousResidenceAddressLine1,
                  addressLine2: data.coApplicant.previousResidenceAddressLine2,
                  city: data.coApplicant.previousResidenceCity || '',
                  state: data.coApplicant.previousResidenceState || '',
                  zip: data.coApplicant.previousResidenceZip || '',
                  housingStatus: data.coApplicant.previousHousingStatus || 'other',
                  housingStatusOther: data.coApplicant.previousHousingStatusOther,
                  monthlyHousingPayment: data.coApplicant.previousMonthlyHousingPayment,
                  timeAtResidence: {
                    years: data.coApplicant.previousResidenceYears || 0,
                    months: data.coApplicant.previousResidenceMonths || 0,
                  },
                }
              : undefined,
            currentEmployment: {
              employerName: data.coApplicant.employerName,
              occupationTitle: data.coApplicant.occupationTitle,
              employmentStatus: data.coApplicant.employmentStatus,
              employmentStatusOther: data.coApplicant.employmentStatusOther,
              grossMonthlyIncome: data.coApplicant.grossMonthlyIncome,
              annualIncome: data.coApplicant.annualIncome,
              timeAtEmployer: {
                years: data.coApplicant.employerYears,
                months: data.coApplicant.employerMonths,
              },
            },
            previousEmployment: data.coApplicant.previousEmployerName
              ? {
                  employerName: data.coApplicant.previousEmployerName,
                  occupationTitle: data.coApplicant.previousOccupationTitle || '',
                  employmentStatus: 'other',
                  grossMonthlyIncome: data.coApplicant.previousEmployerGrossMonthlyIncome,
                  annualIncome: data.coApplicant.previousEmployerAnnualIncome,
                  timeAtEmployer: {
                    years: data.coApplicant.previousEmployerYears || 0,
                    months: data.coApplicant.previousEmployerMonths || 0,
                  },
                }
              : undefined,
            creditScoreRange: data.coApplicant.creditScoreRange,
          }
        : undefined,
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
      payload: { sessionId: getBuyerSessionId(), email: data.primaryApplicant.email },
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
        fullLegalName: data.primaryApplicant.fullLegalName,
        email: data.primaryApplicant.email,
        phone: data.primaryApplicant.phone,
        annualIncome: data.primaryApplicant.annualIncome,
        creditScoreRange: data.primaryApplicant.creditScoreRange,
        applicationType: data.applicationType,
        coApplicantName: data.coApplicant?.fullLegalName,
        applicationId: createResult.value.id,
        unitId: data.unitId,
      },
    }
  )

  void sendQuickAppNotification({
    fullLegalName: data.primaryApplicant.fullLegalName,
    email: data.primaryApplicant.email,
    phone: data.primaryApplicant.phone,
    creditScoreRange:
      data.applicationType === 'joint' && data.coApplicant
        ? `${data.primaryApplicant.creditScoreRange} / ${data.coApplicant.creditScoreRange}`
        : data.primaryApplicant.creditScoreRange,
    vehicleInfo: data.unitId,
  })

  return {
    ok: true,
    submissionId,
    applicationId: createResult.value.id,
    leadId,
    customerId,
    requiredDocuments: getRequiredDocumentsForApplication(
      data.applicationType,
      data.primaryApplicant.creditScoreRange,
      data.coApplicant?.creditScoreRange,
    ),
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

  void sendTradeInNotification({
    firstName: data.ownerEmail.split('@')[0],
    lastName: '',
    email: data.ownerEmail,
    vehicleYear: data.year,
    vehicleMake: data.make,
    vehicleModel: data.model,
    mileage: data.mileage,
    condition: data.condition,
  })

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

  void sendAppointmentNotification({
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    preferredDate: data.preferredDate,
    preferredTime: data.preferredTime,
    appointmentType: data.type,
    vehicleInfo: data.unitId,
    notes: data.notes,
  })

  return { ok: true, submissionId }
}
