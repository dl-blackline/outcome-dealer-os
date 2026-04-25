import { db } from '@/lib/db/supabase'
import {
  LenderRow,
  LenderProgramRow,
  LenderProgramVersionRow,
  LenderRuleRow,
} from './finance-match.types'

const SEED_FLAG = 'outcome.finance.seeded'

// Fixed UUIDs for seed data relationships
const IDS = {
  // Lenders
  capitalOne: 'a1000000-0000-0000-0000-000000000001',
  cps: 'a1000000-0000-0000-0000-000000000002',
  firstBankOhio: 'a1000000-0000-0000-0000-000000000003',
  huntington: 'a1000000-0000-0000-0000-000000000004',
  gls: 'a1000000-0000-0000-0000-000000000005',
  ffccu: 'a1000000-0000-0000-0000-000000000006',
  aulCorp: 'a1000000-0000-0000-0000-000000000007',

  // Programs
  capitalOneDiamond: 'b1000000-0000-0000-0000-000000000001',
  capitalOneExecDiamond: 'b1000000-0000-0000-0000-000000000002',
  cpsStandard: 'b1000000-0000-0000-0000-000000000003',
  fboStandard: 'b1000000-0000-0000-0000-000000000004',
  huntingtonAuto: 'b1000000-0000-0000-0000-000000000005',
  glsStandard: 'b1000000-0000-0000-0000-000000000006',
  ffccuAuto: 'b1000000-0000-0000-0000-000000000007',
  aulVsc: 'b1000000-0000-0000-0000-000000000008',

  // Versions
  capitalOneDiamondV1: 'c1000000-0000-0000-0000-000000000001',
  capitalOneExecDiamondV1: 'c1000000-0000-0000-0000-000000000002',
  cpsStandardV1: 'c1000000-0000-0000-0000-000000000003',
  fboStandardV1: 'c1000000-0000-0000-0000-000000000004',
  huntingtonAutoV1: 'c1000000-0000-0000-0000-000000000005',
  glsStandardV1: 'c1000000-0000-0000-0000-000000000006',
  ffccuAutoV1: 'c1000000-0000-0000-0000-000000000007',
  aulVscV1: 'c1000000-0000-0000-0000-000000000008',
}

const SEED_EXPLANATION = 'Demo seed data — verify against current lender guidelines before use.'
const NOW = new Date().toISOString()

function seedRow<T extends { id: string; created_at: string }>(base: Omit<T, 'created_at' | 'updated_at'> & { id: string }): T {
  return { ...base, created_at: NOW } as unknown as T
}

// ─── Lenders ─────────────────────────────────────────────────────────────────

const SEED_LENDERS: LenderRow[] = [
  {
    id: IDS.capitalOne, name: 'Capital One Auto Finance', short_name: 'Capital One',
    lender_type: 'bank', is_active: true,
    website: 'https://www.capitalone.com/auto-financing/', phone: '1-800-946-0332',
    portal_url: 'https://dealer.capitalone.com', notes: 'Prime/near-prime bank lender',
    created_at: NOW,
  },
  {
    id: IDS.cps, name: 'Consumer Portfolio Services', short_name: 'CPS',
    lender_type: 'finance_company', is_active: true,
    website: 'https://www.consumerportfolio.com', phone: '1-800-234-6789',
    notes: 'Subprime specialty lender',
    created_at: NOW,
  },
  {
    id: IDS.firstBankOhio, name: 'First Bank of Ohio', short_name: 'FBO',
    lender_type: 'bank', is_active: true,
    notes: 'Regional Ohio bank with competitive auto rates',
    created_at: NOW,
  },
  {
    id: IDS.huntington, name: 'Huntington Auto Finance', short_name: 'Huntington',
    lender_type: 'bank', is_active: true,
    website: 'https://www.huntington.com', phone: '1-800-480-2265',
    notes: 'Regional Midwest bank lender',
    created_at: NOW,
  },
  {
    id: IDS.gls, name: 'Global Lending Services', short_name: 'GLS',
    lender_type: 'finance_company', is_active: true,
    website: 'https://www.globallending.com', phone: '1-800-424-9091',
    notes: 'Deep subprime specialty lender',
    created_at: NOW,
  },
  {
    id: IDS.ffccu, name: 'First Financial Credit Union', short_name: 'FFCCU',
    lender_type: 'credit_union', is_active: true,
    notes: 'Ohio-based credit union with competitive rates',
    created_at: NOW,
  },
  {
    id: IDS.aulCorp, name: 'AUL Corp', short_name: 'AUL',
    lender_type: 'finance_company', is_active: true,
    website: 'https://www.aulcorp.com', phone: '1-800-826-3207',
    notes: 'Backend products: VSC, GAP, Ancillary',
    created_at: NOW,
  },
]

// ─── Programs ─────────────────────────────────────────────────────────────────

const SEED_PROGRAMS: LenderProgramRow[] = [
  {
    id: IDS.capitalOneDiamond, lender_id: IDS.capitalOne,
    program_name: 'Diamond Tier', program_code: 'COF-DIAMOND',
    is_active: true, target_tier: 'A/B',
    description: 'Prime borrowers with 680+ credit score',
    created_at: NOW,
  },
  {
    id: IDS.capitalOneExecDiamond, lender_id: IDS.capitalOne,
    program_name: 'Executive Diamond', program_code: 'COF-EXEC-DIAMOND',
    is_active: true, target_tier: 'A+',
    description: 'Super prime borrowers with 750+ credit score',
    created_at: NOW,
  },
  {
    id: IDS.cpsStandard, lender_id: IDS.cps,
    program_name: 'Standard Subprime', program_code: 'CPS-STD',
    is_active: true, target_tier: 'C/D',
    description: 'Non-prime auto lending program',
    created_at: NOW,
  },
  {
    id: IDS.fboStandard, lender_id: IDS.firstBankOhio,
    program_name: 'Standard Auto', program_code: 'FBO-AUTO',
    is_active: true, target_tier: 'A/B',
    description: 'Standard auto finance for qualified borrowers',
    created_at: NOW,
  },
  {
    id: IDS.huntingtonAuto, lender_id: IDS.huntington,
    program_name: 'Huntington Auto Finance', program_code: 'HNB-AUTO',
    is_active: true, target_tier: 'A/B',
    description: 'Midwest regional auto lending',
    created_at: NOW,
  },
  {
    id: IDS.glsStandard, lender_id: IDS.gls,
    program_name: 'GLS Deep Subprime', program_code: 'GLS-DEEP',
    is_active: true, target_tier: 'D/E/F',
    description: 'Deep subprime lending program',
    created_at: NOW,
  },
  {
    id: IDS.ffccuAuto, lender_id: IDS.ffccu,
    program_name: 'FFCCU Auto Loan', program_code: 'FFCCU-AUTO',
    is_active: true, target_tier: 'A/B',
    description: 'Credit union competitive auto financing',
    created_at: NOW,
  },
  {
    id: IDS.aulVsc, lender_id: IDS.aulCorp,
    program_name: 'AUL VSC Program', program_code: 'AUL-VSC',
    is_active: true, target_tier: 'all',
    description: 'Vehicle service contract backend product',
    created_at: NOW,
  },
]

// ─── Versions ─────────────────────────────────────────────────────────────────

const SEED_VERSIONS: LenderProgramVersionRow[] = [
  {
    id: IDS.capitalOneDiamondV1, program_id: IDS.capitalOneDiamond,
    version_label: '2024-Q1', status: 'active', extraction_method: 'manual',
    needs_review: false, effective_date: '2024-01-01', created_at: NOW,
  },
  {
    id: IDS.capitalOneExecDiamondV1, program_id: IDS.capitalOneExecDiamond,
    version_label: '2024-Q1', status: 'active', extraction_method: 'manual',
    needs_review: false, effective_date: '2024-01-01', created_at: NOW,
  },
  {
    id: IDS.cpsStandardV1, program_id: IDS.cpsStandard,
    version_label: '2024-Q1', status: 'active', extraction_method: 'manual',
    needs_review: false, effective_date: '2024-01-01', created_at: NOW,
  },
  {
    id: IDS.fboStandardV1, program_id: IDS.fboStandard,
    version_label: '2024-Q1', status: 'active', extraction_method: 'manual',
    needs_review: false, effective_date: '2024-01-01', created_at: NOW,
  },
  {
    id: IDS.huntingtonAutoV1, program_id: IDS.huntingtonAuto,
    version_label: '2024-Q1', status: 'active', extraction_method: 'manual',
    needs_review: false, effective_date: '2024-01-01', created_at: NOW,
  },
  {
    id: IDS.glsStandardV1, program_id: IDS.glsStandard,
    version_label: '2024-Q1', status: 'active', extraction_method: 'manual',
    needs_review: false, effective_date: '2024-01-01', created_at: NOW,
  },
  {
    id: IDS.ffccuAutoV1, program_id: IDS.ffccuAuto,
    version_label: '2024-Q1', status: 'active', extraction_method: 'manual',
    needs_review: false, effective_date: '2024-01-01', created_at: NOW,
  },
  {
    id: IDS.aulVscV1, program_id: IDS.aulVsc,
    version_label: '2024-Q1', status: 'active', extraction_method: 'manual',
    needs_review: false, effective_date: '2024-01-01', created_at: NOW,
  },
]

// ─── Rules ────────────────────────────────────────────────────────────────────

const MIDWEST_STATES = ['OH', 'MI', 'IN', 'KY', 'PA', 'WV', 'TN', 'MO', 'IL', 'WI']
const ALL_US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY',
  'LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND',
  'OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
]
const GOOD_TITLES = ['clean', 'certified']

function rule(
  versionId: string,
  partial: Omit<LenderRuleRow, 'id' | 'created_at' | 'updated_at' | 'program_version_id' | 'is_active' | 'is_ai_generated' | 'needs_review' | 'confidence' | 'explanation' | 'sort_order'>
): LenderRuleRow {
  return {
    id: crypto.randomUUID(),
    program_version_id: versionId,
    is_active: true,
    is_ai_generated: false,
    needs_review: false,
    confidence: 0.8,
    explanation: SEED_EXPLANATION,
    sort_order: 0,
    created_at: NOW,
    ...partial,
  }
}

function buildRules(): LenderRuleRow[] {
  const rules: LenderRuleRow[] = []

  // ── Capital One Diamond (680+ credit, LTV ≤ 120%, PTI ≤ 20%, 10yr/120k)
  rules.push(
    rule(IDS.capitalOneDiamondV1, { rule_name: 'State Territory', category: 'state_territory', field: 'state', operator: 'in', value: ALL_US_STATES, severity: 'hard_fail', message: 'State not in approved territory' }),
    rule(IDS.capitalOneDiamondV1, { rule_name: 'Min Credit Score', category: 'credit_score', field: 'credit_score', operator: 'gte', value: 680, severity: 'hard_fail', message: 'Credit score must be 680 or higher for Diamond tier' }),
    rule(IDS.capitalOneDiamondV1, { rule_name: 'Max Mileage', category: 'mileage', field: 'vehicle_mileage', operator: 'lte', value: 120000, severity: 'hard_fail', message: 'Vehicle mileage must not exceed 120,000 miles' }),
    rule(IDS.capitalOneDiamondV1, { rule_name: 'Max Vehicle Age', category: 'vehicle_age', field: 'vehicle_age', operator: 'lte', value: 10, severity: 'hard_fail', message: 'Vehicle must be 10 model years old or newer' }),
    rule(IDS.capitalOneDiamondV1, { rule_name: 'Max LTV', category: 'ltv', field: 'ltv', operator: 'lte', value: 1.20, severity: 'hard_fail', message: 'LTV must not exceed 120%' }),
    rule(IDS.capitalOneDiamondV1, { rule_name: 'Max PTI', category: 'pti', field: 'pti', operator: 'lte', value: 0.20, severity: 'warning', message: 'PTI exceeds 20% guideline' }),
    rule(IDS.capitalOneDiamondV1, { rule_name: 'Max DTI', category: 'dti', field: 'dti', operator: 'lte', value: 0.50, severity: 'hard_fail', message: 'DTI must not exceed 50%' }),
    rule(IDS.capitalOneDiamondV1, { rule_name: 'Min Monthly Income', category: 'income', field: 'monthly_gross_income', operator: 'gte', value: 1500, severity: 'hard_fail', message: 'Minimum monthly gross income of $1,500 required' }),
    rule(IDS.capitalOneDiamondV1, { rule_name: 'Title Exclusion', category: 'title_type', field: 'title_type', operator: 'in', value: GOOD_TITLES, severity: 'hard_fail', message: 'Salvage, flood, and rebuilt titles not accepted' }),
    rule(IDS.capitalOneDiamondV1, { rule_name: 'Max Term', category: 'term', field: 'proposed_term', operator: 'lte', value: 72, severity: 'hard_fail', message: 'Maximum loan term is 72 months' }),
    rule(IDS.capitalOneDiamondV1, { rule_name: 'Max Backend', category: 'backend', field: 'total_backend', operator: 'lte', value: 4000, severity: 'warning', message: 'Total backend products exceed $4,000 guideline' }),
    rule(IDS.capitalOneDiamondV1, { rule_name: 'No Active Bankruptcy', category: 'bankruptcy', field: 'has_bankruptcy', operator: 'ne', value: true, severity: 'hard_fail', message: 'Active bankruptcy on file — not eligible for Diamond tier' }),
    rule(IDS.capitalOneDiamondV1, { rule_name: 'No Recent Repossession', category: 'repossession', field: 'has_repossession', operator: 'ne', value: true, severity: 'hard_fail', message: 'Recent repossession on file — not eligible for Diamond tier' }),
  )

  // ── Capital One Executive Diamond (750+ credit, LTV ≤ 115%, PTI ≤ 18%)
  rules.push(
    rule(IDS.capitalOneExecDiamondV1, { rule_name: 'State Territory', category: 'state_territory', field: 'state', operator: 'in', value: ALL_US_STATES, severity: 'hard_fail', message: 'State not in approved territory' }),
    rule(IDS.capitalOneExecDiamondV1, { rule_name: 'Min Credit Score', category: 'credit_score', field: 'credit_score', operator: 'gte', value: 750, severity: 'hard_fail', message: 'Credit score must be 750 or higher for Executive Diamond' }),
    rule(IDS.capitalOneExecDiamondV1, { rule_name: 'Max Mileage', category: 'mileage', field: 'vehicle_mileage', operator: 'lte', value: 80000, severity: 'hard_fail', message: 'Vehicle mileage must not exceed 80,000 miles' }),
    rule(IDS.capitalOneExecDiamondV1, { rule_name: 'Max Vehicle Age', category: 'vehicle_age', field: 'vehicle_age', operator: 'lte', value: 7, severity: 'hard_fail', message: 'Vehicle must be 7 model years old or newer' }),
    rule(IDS.capitalOneExecDiamondV1, { rule_name: 'Max LTV', category: 'ltv', field: 'ltv', operator: 'lte', value: 1.15, severity: 'hard_fail', message: 'LTV must not exceed 115% for Executive Diamond' }),
    rule(IDS.capitalOneExecDiamondV1, { rule_name: 'Max PTI', category: 'pti', field: 'pti', operator: 'lte', value: 0.18, severity: 'warning', message: 'PTI exceeds 18% guideline for Executive Diamond' }),
    rule(IDS.capitalOneExecDiamondV1, { rule_name: 'Max DTI', category: 'dti', field: 'dti', operator: 'lte', value: 0.45, severity: 'hard_fail', message: 'DTI must not exceed 45%' }),
    rule(IDS.capitalOneExecDiamondV1, { rule_name: 'Min Monthly Income', category: 'income', field: 'monthly_gross_income', operator: 'gte', value: 3000, severity: 'hard_fail', message: 'Minimum monthly gross income of $3,000 required' }),
    rule(IDS.capitalOneExecDiamondV1, { rule_name: 'Title Exclusion', category: 'title_type', field: 'title_type', operator: 'in', value: GOOD_TITLES, severity: 'hard_fail', message: 'Salvage, flood, and rebuilt titles not accepted' }),
    rule(IDS.capitalOneExecDiamondV1, { rule_name: 'Max Term', category: 'term', field: 'proposed_term', operator: 'lte', value: 72, severity: 'hard_fail', message: 'Maximum loan term is 72 months' }),
    rule(IDS.capitalOneExecDiamondV1, { rule_name: 'No Bankruptcy', category: 'bankruptcy', field: 'has_bankruptcy', operator: 'ne', value: true, severity: 'hard_fail', message: 'Bankruptcy on file — not eligible' }),
    rule(IDS.capitalOneExecDiamondV1, { rule_name: 'No Repossession', category: 'repossession', field: 'has_repossession', operator: 'ne', value: true, severity: 'hard_fail', message: 'Repossession on file — not eligible' }),
  )

  // ── CPS Standard Subprime (500+ credit, LTV ≤ 130%)
  rules.push(
    rule(IDS.cpsStandardV1, { rule_name: 'State Territory', category: 'state_territory', field: 'state', operator: 'in', value: MIDWEST_STATES, severity: 'hard_fail', message: 'State not in CPS approved territory (OH, MI, IN, KY, PA, WV, TN, MO, IL, WI)' }),
    rule(IDS.cpsStandardV1, { rule_name: 'Min Credit Score', category: 'credit_score', field: 'credit_score', operator: 'gte', value: 500, severity: 'hard_fail', message: 'Minimum 500 credit score required' }),
    rule(IDS.cpsStandardV1, { rule_name: 'Max Mileage', category: 'mileage', field: 'vehicle_mileage', operator: 'lte', value: 150000, severity: 'hard_fail', message: 'Mileage must not exceed 150,000' }),
    rule(IDS.cpsStandardV1, { rule_name: 'Max Vehicle Age', category: 'vehicle_age', field: 'vehicle_age', operator: 'lte', value: 15, severity: 'hard_fail', message: 'Vehicle must be 15 years old or newer' }),
    rule(IDS.cpsStandardV1, { rule_name: 'Max LTV', category: 'ltv', field: 'ltv', operator: 'lte', value: 1.30, severity: 'hard_fail', message: 'LTV must not exceed 130%' }),
    rule(IDS.cpsStandardV1, { rule_name: 'Max PTI', category: 'pti', field: 'pti', operator: 'lte', value: 0.25, severity: 'warning', message: 'PTI exceeds 25% guideline' }),
    rule(IDS.cpsStandardV1, { rule_name: 'Min Monthly Income', category: 'income', field: 'monthly_gross_income', operator: 'gte', value: 1200, severity: 'hard_fail', message: 'Minimum monthly income of $1,200 required' }),
    rule(IDS.cpsStandardV1, { rule_name: 'Title Exclusion', category: 'title_type', field: 'title_type', operator: 'not_in', value: ['salvage', 'flood'], severity: 'hard_fail', message: 'Salvage and flood titles not accepted' }),
    rule(IDS.cpsStandardV1, { rule_name: 'Max Term', category: 'term', field: 'proposed_term', operator: 'lte', value: 72, severity: 'hard_fail', message: 'Maximum term is 72 months' }),
  )

  // ── First Bank of Ohio (640+ credit, Midwest states)
  rules.push(
    rule(IDS.fboStandardV1, { rule_name: 'State Territory', category: 'state_territory', field: 'state', operator: 'in', value: MIDWEST_STATES, severity: 'hard_fail', message: 'First Bank of Ohio serves OH, MI, IN, KY, PA, WV, TN, MO, IL, WI' }),
    rule(IDS.fboStandardV1, { rule_name: 'Min Credit Score', category: 'credit_score', field: 'credit_score', operator: 'gte', value: 640, severity: 'hard_fail', message: 'Minimum 640 credit score required' }),
    rule(IDS.fboStandardV1, { rule_name: 'Max Mileage', category: 'mileage', field: 'vehicle_mileage', operator: 'lte', value: 100000, severity: 'hard_fail', message: 'Mileage must not exceed 100,000' }),
    rule(IDS.fboStandardV1, { rule_name: 'Max Vehicle Age', category: 'vehicle_age', field: 'vehicle_age', operator: 'lte', value: 10, severity: 'hard_fail', message: 'Vehicle must be 10 years or newer' }),
    rule(IDS.fboStandardV1, { rule_name: 'Max LTV', category: 'ltv', field: 'ltv', operator: 'lte', value: 1.25, severity: 'hard_fail', message: 'LTV must not exceed 125%' }),
    rule(IDS.fboStandardV1, { rule_name: 'Max PTI', category: 'pti', field: 'pti', operator: 'lte', value: 0.20, severity: 'warning', message: 'PTI exceeds 20% guideline' }),
    rule(IDS.fboStandardV1, { rule_name: 'Max DTI', category: 'dti', field: 'dti', operator: 'lte', value: 0.50, severity: 'hard_fail', message: 'DTI must not exceed 50%' }),
    rule(IDS.fboStandardV1, { rule_name: 'Min Monthly Income', category: 'income', field: 'monthly_gross_income', operator: 'gte', value: 1800, severity: 'hard_fail', message: 'Minimum $1,800 monthly income required' }),
    rule(IDS.fboStandardV1, { rule_name: 'Title Exclusion', category: 'title_type', field: 'title_type', operator: 'in', value: GOOD_TITLES, severity: 'hard_fail', message: 'Only clean and certified titles accepted' }),
    rule(IDS.fboStandardV1, { rule_name: 'Max Term', category: 'term', field: 'proposed_term', operator: 'lte', value: 72, severity: 'hard_fail', message: 'Maximum term is 72 months' }),
    rule(IDS.fboStandardV1, { rule_name: 'No Bankruptcy', category: 'bankruptcy', field: 'has_bankruptcy', operator: 'ne', value: true, severity: 'hard_fail', message: 'Bankruptcy disqualifies from FBO program' }),
  )

  // ── Huntington Auto (660+ credit)
  rules.push(
    rule(IDS.huntingtonAutoV1, { rule_name: 'State Territory', category: 'state_territory', field: 'state', operator: 'in', value: MIDWEST_STATES, severity: 'hard_fail', message: 'Huntington serves Midwest states only' }),
    rule(IDS.huntingtonAutoV1, { rule_name: 'Min Credit Score', category: 'credit_score', field: 'credit_score', operator: 'gte', value: 660, severity: 'hard_fail', message: 'Minimum 660 credit score required' }),
    rule(IDS.huntingtonAutoV1, { rule_name: 'Max Mileage', category: 'mileage', field: 'vehicle_mileage', operator: 'lte', value: 100000, severity: 'hard_fail', message: 'Mileage must not exceed 100,000' }),
    rule(IDS.huntingtonAutoV1, { rule_name: 'Max Vehicle Age', category: 'vehicle_age', field: 'vehicle_age', operator: 'lte', value: 10, severity: 'hard_fail', message: 'Vehicle must be 10 years or newer' }),
    rule(IDS.huntingtonAutoV1, { rule_name: 'Max LTV', category: 'ltv', field: 'ltv', operator: 'lte', value: 1.20, severity: 'hard_fail', message: 'LTV must not exceed 120%' }),
    rule(IDS.huntingtonAutoV1, { rule_name: 'Max PTI', category: 'pti', field: 'pti', operator: 'lte', value: 0.20, severity: 'warning', message: 'PTI exceeds 20% guideline' }),
    rule(IDS.huntingtonAutoV1, { rule_name: 'Min Monthly Income', category: 'income', field: 'monthly_gross_income', operator: 'gte', value: 2000, severity: 'hard_fail', message: 'Minimum $2,000 monthly income required' }),
    rule(IDS.huntingtonAutoV1, { rule_name: 'Title Exclusion', category: 'title_type', field: 'title_type', operator: 'in', value: GOOD_TITLES, severity: 'hard_fail', message: 'Only clean and certified titles accepted' }),
    rule(IDS.huntingtonAutoV1, { rule_name: 'Max Term', category: 'term', field: 'proposed_term', operator: 'lte', value: 72, severity: 'hard_fail', message: 'Maximum term is 72 months' }),
    rule(IDS.huntingtonAutoV1, { rule_name: 'No Bankruptcy', category: 'bankruptcy', field: 'has_bankruptcy', operator: 'ne', value: true, severity: 'hard_fail', message: 'Bankruptcy disqualifies from program' }),
  )

  // ── GLS Deep Subprime (475+ credit, higher LTV)
  rules.push(
    rule(IDS.glsStandardV1, { rule_name: 'State Territory', category: 'state_territory', field: 'state', operator: 'in', value: MIDWEST_STATES, severity: 'hard_fail', message: 'GLS serves Midwest states only' }),
    rule(IDS.glsStandardV1, { rule_name: 'Min Credit Score', category: 'credit_score', field: 'credit_score', operator: 'gte', value: 475, severity: 'hard_fail', message: 'Minimum 475 credit score required' }),
    rule(IDS.glsStandardV1, { rule_name: 'Max Mileage', category: 'mileage', field: 'vehicle_mileage', operator: 'lte', value: 130000, severity: 'hard_fail', message: 'Mileage must not exceed 130,000' }),
    rule(IDS.glsStandardV1, { rule_name: 'Max Vehicle Age', category: 'vehicle_age', field: 'vehicle_age', operator: 'lte', value: 12, severity: 'hard_fail', message: 'Vehicle must be 12 years or newer' }),
    rule(IDS.glsStandardV1, { rule_name: 'Max LTV', category: 'ltv', field: 'ltv', operator: 'lte', value: 1.40, severity: 'hard_fail', message: 'LTV must not exceed 140%' }),
    rule(IDS.glsStandardV1, { rule_name: 'Max PTI', category: 'pti', field: 'pti', operator: 'lte', value: 0.28, severity: 'warning', message: 'PTI exceeds 28% guideline' }),
    rule(IDS.glsStandardV1, { rule_name: 'Min Monthly Income', category: 'income', field: 'monthly_gross_income', operator: 'gte', value: 1000, severity: 'hard_fail', message: 'Minimum $1,000 monthly income required' }),
    rule(IDS.glsStandardV1, { rule_name: 'Title Exclusion', category: 'title_type', field: 'title_type', operator: 'not_in', value: ['salvage', 'flood'], severity: 'hard_fail', message: 'Salvage and flood titles not accepted' }),
    rule(IDS.glsStandardV1, { rule_name: 'Max Term', category: 'term', field: 'proposed_term', operator: 'lte', value: 72, severity: 'hard_fail', message: 'Maximum term is 72 months' }),
  )

  // ── FFCCU Auto Loan (660+ credit, Ohio focus)
  rules.push(
    rule(IDS.ffccuAutoV1, { rule_name: 'State Territory', category: 'state_territory', field: 'state', operator: 'in', value: ['OH', 'KY', 'IN'], severity: 'hard_fail', message: 'FFCCU serves OH, KY, IN members only' }),
    rule(IDS.ffccuAutoV1, { rule_name: 'Min Credit Score', category: 'credit_score', field: 'credit_score', operator: 'gte', value: 660, severity: 'hard_fail', message: 'Minimum 660 credit score required' }),
    rule(IDS.ffccuAutoV1, { rule_name: 'Max Mileage', category: 'mileage', field: 'vehicle_mileage', operator: 'lte', value: 100000, severity: 'hard_fail', message: 'Mileage must not exceed 100,000' }),
    rule(IDS.ffccuAutoV1, { rule_name: 'Max Vehicle Age', category: 'vehicle_age', field: 'vehicle_age', operator: 'lte', value: 8, severity: 'hard_fail', message: 'Vehicle must be 8 years or newer' }),
    rule(IDS.ffccuAutoV1, { rule_name: 'Max LTV', category: 'ltv', field: 'ltv', operator: 'lte', value: 1.10, severity: 'hard_fail', message: 'LTV must not exceed 110%' }),
    rule(IDS.ffccuAutoV1, { rule_name: 'Max PTI', category: 'pti', field: 'pti', operator: 'lte', value: 0.18, severity: 'warning', message: 'PTI exceeds 18% credit union guideline' }),
    rule(IDS.ffccuAutoV1, { rule_name: 'Max DTI', category: 'dti', field: 'dti', operator: 'lte', value: 0.43, severity: 'hard_fail', message: 'DTI must not exceed 43%' }),
    rule(IDS.ffccuAutoV1, { rule_name: 'Min Monthly Income', category: 'income', field: 'monthly_gross_income', operator: 'gte', value: 2000, severity: 'hard_fail', message: 'Minimum $2,000 monthly income required' }),
    rule(IDS.ffccuAutoV1, { rule_name: 'Title Exclusion', category: 'title_type', field: 'title_type', operator: 'in', value: GOOD_TITLES, severity: 'hard_fail', message: 'Only clean and certified titles accepted' }),
    rule(IDS.ffccuAutoV1, { rule_name: 'Max Term', category: 'term', field: 'proposed_term', operator: 'lte', value: 60, severity: 'hard_fail', message: 'Maximum term is 60 months' }),
    rule(IDS.ffccuAutoV1, { rule_name: 'No Bankruptcy', category: 'bankruptcy', field: 'has_bankruptcy', operator: 'ne', value: true, severity: 'hard_fail', message: 'Bankruptcy disqualifies from credit union program' }),
    rule(IDS.ffccuAutoV1, { rule_name: 'No Repossession', category: 'repossession', field: 'has_repossession', operator: 'ne', value: true, severity: 'hard_fail', message: 'Repossession on file — not eligible' }),
  )

  // ── AUL Corp VSC (backend only program - very permissive)
  rules.push(
    rule(IDS.aulVscV1, { rule_name: 'Max Vehicle Age', category: 'vehicle_age', field: 'vehicle_age', operator: 'lte', value: 15, severity: 'hard_fail', message: 'VSC available for vehicles 15 years or newer' }),
    rule(IDS.aulVscV1, { rule_name: 'Max Mileage', category: 'mileage', field: 'vehicle_mileage', operator: 'lte', value: 150000, severity: 'hard_fail', message: 'VSC available for vehicles under 150,000 miles' }),
    rule(IDS.aulVscV1, { rule_name: 'Title Exclusion', category: 'title_type', field: 'title_type', operator: 'not_in', value: ['salvage', 'flood'], severity: 'hard_fail', message: 'VSC not available for salvage or flood title vehicles' }),
  )

  return rules
}

// ─── Main Seed Function ───────────────────────────────────────────────────────

async function insertSeedData() {
  const rules = buildRules()

  for (const lender of SEED_LENDERS) {
    await db.insert<LenderRow>('lenders', lender as Omit<LenderRow, 'id' | 'created_at' | 'updated_at'>)
  }

  for (const program of SEED_PROGRAMS) {
    await db.insert<LenderProgramRow>('lender_programs', program as Omit<LenderProgramRow, 'id' | 'created_at' | 'updated_at'>)
  }

  for (const version of SEED_VERSIONS) {
    await db.insert<LenderProgramVersionRow>('lender_program_versions', version as Omit<LenderProgramVersionRow, 'id' | 'created_at' | 'updated_at'>)
  }

  for (const r of rules) {
    await db.insert<LenderRuleRow>('lender_rules', r as Omit<LenderRuleRow, 'id' | 'created_at' | 'updated_at'>)
  }
}

export async function initializeSeedData(): Promise<void> {
  if (typeof window === 'undefined') return
  if (window.localStorage.getItem(SEED_FLAG)) return

  try {
    await insertSeedData()
    window.localStorage.setItem(SEED_FLAG, '1')
  } catch (e) {
    console.warn('[Finance Match] Seed data initialization failed:', e)
  }
}
