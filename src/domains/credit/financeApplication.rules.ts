import {
  CreditScoreRange,
  RequiredDocumentType,
  ResidenceInfo,
  EmploymentInfo,
} from './financeApplication.types'

export const CREDIT_SCORE_LABELS: Record<CreditScoreRange, string> = {
  under_550: 'Under 550',
  '550_599': '550-599',
  '600_649': '600-649',
  '650_699': '650-699',
  '700_749': '700-749',
  '750_plus': '750+',
}

export const DOCUMENT_LABELS: Record<RequiredDocumentType, string> = {
  proof_of_income: 'Proof of income',
  proof_of_residency: 'Proof of residency',
  references: 'References',
  proof_of_insurance: 'Proof of insurance',
  driver_license: 'Driver license',
}

export function getRequiredDocumentsForScoreRange(scoreRange: CreditScoreRange): RequiredDocumentType[] {
  if (scoreRange === 'under_550' || scoreRange === '550_599' || scoreRange === '600_649') {
    return ['proof_of_income', 'proof_of_residency', 'references', 'proof_of_insurance']
  }

  return ['driver_license', 'proof_of_insurance']
}

export function shouldRequirePreviousResidence(currentResidence: ResidenceInfo): boolean {
  return (currentResidence.timeAtResidence.years * 12 + currentResidence.timeAtResidence.months) < 24
}

export function shouldRequirePreviousEmployer(currentEmployment: EmploymentInfo): boolean {
  return (currentEmployment.timeAtEmployer.years * 12 + currentEmployment.timeAtEmployer.months) < 24
}

export function normalizeAndValidateSSN(rawInput: string): { digitsOnly: string; masked: string; last4: string } | null {
  const digitsOnly = rawInput.replace(/\D/g, '')
  if (digitsOnly.length !== 9) return null

  const masked = `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3, 5)}-${digitsOnly.slice(5)}`
  const last4 = digitsOnly.slice(5)

  return { digitsOnly, masked, last4 }
}

export function maskSSNForDisplay(last4: string): string {
  return `***-**-${last4}`
}

export function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 128)
}

export function isAllowedUploadMimeType(mimeType: string): boolean {
  const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']
  return allowed.includes(mimeType.toLowerCase())
}

export function isAllowedUploadSize(fileSizeBytes: number): boolean {
  const maxBytes = 10 * 1024 * 1024
  return fileSizeBytes > 0 && fileSizeBytes <= maxBytes
}
