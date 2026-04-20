/**
 * AI Close Probability Forecasting.
 *
 * Weighted scoring model (no ML required) that produces:
 *   closeProbability: 0-100
 *   riskScore: 0-100 (inverse)
 *   recommendedAction: string
 *
 * Score = (repPerformance * 0.25) + (customerHistory * 0.25)
 *       + (dealValue * 0.20) + (engagementSpeed * 0.20) + (sourceQuality * 0.10)
 * Then normalised to 0-100.
 */
import { ServiceResult, ok, fail, UUID } from '@/types/common'
import { db } from '@/lib/db/supabase'
import { CloseProbability, CloseProbabilityRow } from './intelligence.types'

const TABLE = 'close_probability'

function rowToCloseProbability(row: CloseProbabilityRow): CloseProbability {
  return {
    id: row.id,
    dealId: row.deal_id,
    closeProbability: row.close_probability,
    riskScore: row.risk_score,
    recommendedAction: row.recommended_action,
    scoringBreakdown: row.scoring_breakdown,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export interface CloseProbabilityInputs {
  repPerformanceScore: number
  customerHistoryScore: number
  dealValueScore: number
  engagementSpeedScore: number
  sourceQualityScore: number
}

const SOURCE_QUALITY: Record<string, number> = {
  Referral: 0.95,
  'Website Form': 0.75,
  'Phone Call': 0.80,
  'Trade-In Appraisal': 0.85,
  'Email Campaign': 0.55,
  'Social Media': 0.50,
  'Third-party Lead': 0.40,
}

export function sourceQualityScore(source?: string): number {
  if (!source) return 0.5
  return SOURCE_QUALITY[source] ?? 0.5
}

function recommendAction(score: number): string {
  if (score >= 80) return 'Prioritise — high close probability. Push to sign today.'
  if (score >= 65) return 'Follow up within 24 hours with a personalised offer.'
  if (score >= 50) return 'Nurture — send value-add content and schedule a test drive.'
  if (score >= 35) return 'Re-qualify — verify intent and budget before investing more time.'
  return 'Low priority — place in long-term drip sequence.'
}

export async function scoreCloseProbability(
  dealId: UUID,
  inputs: CloseProbabilityInputs
): Promise<ServiceResult<CloseProbability>> {
  try {
    const breakdown = {
      repPerformance: Math.round(inputs.repPerformanceScore * 0.25 * 100),
      customerHistory: Math.round(inputs.customerHistoryScore * 0.25 * 100),
      dealValue: Math.round(inputs.dealValueScore * 0.20 * 100),
      engagementSpeed: Math.round(inputs.engagementSpeedScore * 0.20 * 100),
      sourceQuality: Math.round(inputs.sourceQualityScore * 0.10 * 100),
    }

    const rawScore =
      inputs.repPerformanceScore * 0.25 +
      inputs.customerHistoryScore * 0.25 +
      inputs.dealValueScore * 0.2 +
      inputs.engagementSpeedScore * 0.2 +
      inputs.sourceQualityScore * 0.1

    const closeProbability = Math.round(Math.min(rawScore, 1) * 100)
    const riskScore = 100 - closeProbability
    const recommendedAction = recommendAction(closeProbability)

    const existing = await db.findOne<CloseProbabilityRow>(
      TABLE,
      (r) => r.deal_id === dealId
    )

    let row: CloseProbabilityRow
    if (existing) {
      const updated = await db.update<CloseProbabilityRow>(TABLE, existing.id, {
        close_probability: closeProbability,
        risk_score: riskScore,
        recommended_action: recommendedAction,
        scoring_breakdown: breakdown,
      })
      row = updated ?? existing
    } else {
      row = await db.insert<CloseProbabilityRow>(TABLE, {
        deal_id: dealId,
        close_probability: closeProbability,
        risk_score: riskScore,
        recommended_action: recommendedAction,
        scoring_breakdown: breakdown,
      })
    }

    return ok(rowToCloseProbability(row))
  } catch (error) {
    return fail({
      code: 'SCORE_PROBABILITY_FAILED',
      message: 'Failed to score close probability',
      details: { error: String(error) },
    })
  }
}

export async function getCloseProbability(
  dealId: UUID
): Promise<ServiceResult<CloseProbability | null>> {
  try {
    const row = await db.findOne<CloseProbabilityRow>(TABLE, (r) => r.deal_id === dealId)
    return ok(row ? rowToCloseProbability(row) : null)
  } catch (error) {
    return fail({
      code: 'GET_PROBABILITY_FAILED',
      message: 'Failed to get close probability',
      details: { error: String(error) },
    })
  }
}

export async function listCloseProbabilities(): Promise<ServiceResult<CloseProbability[]>> {
  try {
    const rows = await db.findMany<CloseProbabilityRow>(TABLE)
    return ok(rows.map(rowToCloseProbability))
  } catch (error) {
    return fail({
      code: 'LIST_PROBABILITY_FAILED',
      message: 'Failed to list close probabilities',
      details: { error: String(error) },
    })
  }
}

/**
 * Close probability scores are no longer seeded automatically with demo data.
 * Scores are generated as real deals are created and processed.
 */
export async function ensureCloseProbabilitySeeded(): Promise<void> {
  // No-op: demo seeding removed. Scores are generated via real deal processing.
}
