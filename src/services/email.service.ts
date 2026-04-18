/**
 * Email Service (client-side)
 *
 * Thin wrapper around the /api/send-email Netlify Function.
 * The SendGrid API key never touches the browser — all secrets
 * live server-side inside the function.
 *
 * If the function isn't available (local dev without Netlify CLI, or
 * the env var isn't set) the call degrades gracefully and returns
 * { ok: true, skipped: true } so forms continue to work.
 */

export type EmailType = 'inquiry' | 'appointment' | 'quick_app' | 'trade_in'

export interface SendEmailOptions {
  type: EmailType
  /** Override recipient — defaults to dealer email on the server */
  to?: string
  /** Override subject line */
  subject?: string
  /** Key/value pairs rendered as a table in the email body */
  fields: Record<string, string | undefined>
}

export interface SendEmailResult {
  ok: boolean
  skipped?: boolean
  error?: string
}

const FUNCTION_ENDPOINT = '/api/send-email'

export async function sendEmail(opts: SendEmailOptions): Promise<SendEmailResult> {
  try {
    const res = await fetch(FUNCTION_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(opts),
    })

    if (!res.ok) {
      const text = await res.text()
      console.warn('[emailService] Non-OK response:', res.status, text)
      return { ok: false, error: `HTTP ${res.status}` }
    }

    return (await res.json()) as SendEmailResult
  } catch (err) {
    // Network error or function not available — degrade silently
    console.warn('[emailService] Email skipped (function unavailable):', err)
    return { ok: true, skipped: true }
  }
}

/** Convenience: notify the dealer that a new inquiry was submitted */
export function sendInquiryNotification(params: {
  firstName: string
  lastName: string
  email: string
  phone?: string
  message?: string
  preferredContact?: string
  vehicleInfo?: string
}): Promise<SendEmailResult> {
  return sendEmail({
    type: 'inquiry',
    fields: {
      'First Name': params.firstName,
      'Last Name': params.lastName,
      'Email': params.email,
      'Phone': params.phone,
      'Preferred Contact': params.preferredContact,
      'Vehicle': params.vehicleInfo,
      'Message': params.message,
    },
  })
}

/** Convenience: notify the dealer that an appointment was requested */
export function sendAppointmentNotification(params: {
  firstName: string
  lastName: string
  email: string
  phone?: string
  preferredDate?: string
  preferredTime?: string
  appointmentType?: string
  vehicleInfo?: string
  notes?: string
}): Promise<SendEmailResult> {
  return sendEmail({
    type: 'appointment',
    fields: {
      'First Name': params.firstName,
      'Last Name': params.lastName,
      'Email': params.email,
      'Phone': params.phone,
      'Date': params.preferredDate,
      'Time': params.preferredTime,
      'Type': params.appointmentType,
      'Vehicle': params.vehicleInfo,
      'Notes': params.notes,
    },
  })
}

/** Convenience: notify the dealer of a new quick app / credit application */
export function sendQuickAppNotification(params: {
  fullLegalName: string
  email: string
  phone?: string
  creditScoreRange?: string
  vehicleInfo?: string
}): Promise<SendEmailResult> {
  return sendEmail({
    type: 'quick_app',
    fields: {
      'Applicant Name': params.fullLegalName,
      'Email': params.email,
      'Phone': params.phone,
      'Credit Range': params.creditScoreRange,
      'Vehicle Interest': params.vehicleInfo,
    },
  })
}

/** Convenience: notify the dealer of a trade-in request */
export function sendTradeInNotification(params: {
  firstName: string
  lastName: string
  email: string
  phone?: string
  vehicleYear?: string | number
  vehicleMake?: string
  vehicleModel?: string
  mileage?: string | number
  condition?: string
}): Promise<SendEmailResult> {
  const vehicle = [params.vehicleYear, params.vehicleMake, params.vehicleModel].filter(Boolean).join(' ')
  return sendEmail({
    type: 'trade_in',
    fields: {
      'Customer Name': `${params.firstName} ${params.lastName}`,
      'Email': params.email,
      'Phone': params.phone,
      'Trade Vehicle': vehicle || undefined,
      'Mileage': params.mileage !== undefined ? String(params.mileage) : undefined,
      'Condition': params.condition,
    },
  })
}
