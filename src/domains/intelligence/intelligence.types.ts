import { UUID } from '@/types/common'
import { DbRow } from '@/lib/db/supabase'

// ─── CLV Engine ──────────────────────────────────────────────────────────────

export interface CustomerIntelligenceRow extends DbRow {
  customer_id: UUID
  customer_lifetime_value: number
  total_deals: number
  avg_deal_profit: number
  last_deal_date?: string
}

export interface CustomerIntelligence {
  id: UUID
  customerId: UUID
  customerLifetimeValue: number
  totalDeals: number
  avgDealProfit: number
  lastDealDate?: string
  createdAt: string
  updatedAt?: string
}

// ─── Rep Attribution ─────────────────────────────────────────────────────────

export type AttributionType = 'CLOSE' | 'SOURCE' | 'ASSIST' | 'FOLLOW_UP'

export interface DealAttributionRow extends DbRow {
  deal_id: UUID
  sales_rep_id: string
  sales_rep_name?: string
  attribution_type: AttributionType
}

export interface DealAttribution {
  id: UUID
  dealId: UUID
  salesRepId: string
  salesRepName?: string
  attributionType: AttributionType
  createdAt: string
}

export interface RepPerformanceRow extends DbRow {
  rep_id: string
  rep_name?: string
  total_deals: number
  total_profit: number
  avg_profit_per_deal: number
  conversion_rate: number
  weighted_attribution_score: number
}

export interface RepPerformance {
  id: UUID
  repId: string
  repName?: string
  totalDeals: number
  totalProfit: number
  avgProfitPerDeal: number
  conversionRate: number
  weightedAttributionScore: number
  createdAt: string
  updatedAt?: string
}

// ─── Close Probability ────────────────────────────────────────────────────────

export interface CloseProbabilityRow extends DbRow {
  deal_id: UUID
  close_probability: number
  risk_score: number
  recommended_action: string
  scoring_breakdown: Record<string, number>
}

export interface CloseProbability {
  id: UUID
  dealId: UUID
  closeProbability: number
  riskScore: number
  recommendedAction: string
  scoringBreakdown: Record<string, number>
  createdAt: string
  updatedAt?: string
}

// ─── VIN Enrichment ───────────────────────────────────────────────────────────

export interface VinEnrichmentRow extends DbRow {
  inventory_unit_id: UUID
  vin: string
  decoded_year?: number
  decoded_make?: string
  decoded_model?: string
  decoded_trim?: string
  body_type?: string
  engine_description?: string
  estimated_market_value?: number
  price_accuracy_score?: number
  enrichment_source: string
  enriched_at: string
}

export interface VinEnrichment {
  id: UUID
  inventoryUnitId: UUID
  vin: string
  decodedYear?: number
  decodedMake?: string
  decodedModel?: string
  decodedTrim?: string
  bodyType?: string
  engineDescription?: string
  estimatedMarketValue?: number
  priceAccuracyScore?: number
  enrichmentSource: string
  enrichedAt: string
  createdAt: string
}

export interface NHTSADecodeResult {
  Value: string | null
  ValueId: string | null
  Variable: string
  VariableId: number
}

export interface NHTSAResponse {
  Count: number
  Message: string
  Results: NHTSADecodeResult[]
}

// ─── Ingestion Stream ─────────────────────────────────────────────────────────

export type IngestionEventType =
  | 'job_started'
  | 'row_parsed'
  | 'ai_extracted'
  | 'customer_created'
  | 'deal_created'
  | 'deduplicated'
  | 'vin_enriched'
  | 'clv_updated'
  | 'rep_attributed'
  | 'probability_scored'
  | 'job_complete'
  | 'row_error'

export interface IngestionEvent {
  id: string
  jobId: string
  type: IngestionEventType
  timestamp: string
  message: string
  data?: Record<string, unknown>
  confidence?: number
}

export interface IngestionJobState {
  jobId: string
  totalRows: number
  processedRows: number
  successCount: number
  errorCount: number
  rowsPerSecond: number
  status: 'idle' | 'running' | 'complete' | 'error'
  startedAt?: string
  completedAt?: string
  aiConfidenceDistribution: { high: number; medium: number; low: number }
}
