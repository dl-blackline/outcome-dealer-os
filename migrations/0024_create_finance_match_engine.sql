-- Finance Match Engine tables
-- Migration 0024

-- Lenders table
CREATE TABLE IF NOT EXISTS lenders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  short_name TEXT,
  lender_type TEXT NOT NULL CHECK (lender_type IN ('bank', 'credit_union', 'finance_company', 'captive', 'other')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT,
  website TEXT,
  phone TEXT,
  portal_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Lender programs table
CREATE TABLE IF NOT EXISTS lender_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lender_id UUID NOT NULL REFERENCES lenders(id) ON DELETE CASCADE,
  program_name TEXT NOT NULL,
  program_code TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  description TEXT,
  target_tier TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Lender program versions table
CREATE TABLE IF NOT EXISTS lender_program_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES lender_programs(id) ON DELETE CASCADE,
  version_label TEXT NOT NULL,
  effective_date DATE,
  expiration_date DATE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'active', 'archived')),
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  source_document_url TEXT,
  extraction_method TEXT CHECK (extraction_method IN ('manual', 'ai_extracted', 'api_feed')),
  extraction_confidence NUMERIC(4,3),
  needs_review BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Lender program documents table
CREATE TABLE IF NOT EXISTS lender_program_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES lender_programs(id) ON DELETE CASCADE,
  version_id UUID REFERENCES lender_program_versions(id) ON DELETE SET NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('rate_sheet', 'guidelines', 'addendum', 'bulletin', 'other')),
  file_name TEXT NOT NULL,
  file_url TEXT,
  uploaded_by TEXT,
  effective_date DATE,
  expiration_date DATE,
  processing_status TEXT NOT NULL DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'extracted', 'failed', 'approved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Lender rules table
CREATE TABLE IF NOT EXISTS lender_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_version_id UUID NOT NULL REFERENCES lender_program_versions(id) ON DELETE CASCADE,
  rule_name TEXT NOT NULL,
  category TEXT NOT NULL,
  field TEXT NOT NULL,
  operator TEXT NOT NULL CHECK (operator IN ('eq', 'ne', 'lt', 'lte', 'gt', 'gte', 'in', 'not_in', 'contains', 'not_contains')),
  value JSONB NOT NULL,
  severity TEXT NOT NULL DEFAULT 'hard_fail' CHECK (severity IN ('hard_fail', 'warning', 'info')),
  message TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_ai_generated BOOLEAN NOT NULL DEFAULT FALSE,
  needs_review BOOLEAN NOT NULL DEFAULT FALSE,
  confidence NUMERIC(4,3),
  explanation TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Lender contacts table
CREATE TABLE IF NOT EXISTS lender_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lender_id UUID NOT NULL REFERENCES lenders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT,
  email TEXT,
  phone TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Lender match runs table
CREATE TABLE IF NOT EXISTS lender_match_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id TEXT,
  run_by_user_id TEXT,
  input_snapshot JSONB NOT NULL,
  calculated_ltv NUMERIC(6,4),
  calculated_pti NUMERIC(6,4),
  calculated_dti NUMERIC(6,4),
  calculated_amount_financed NUMERIC(12,2),
  calculated_total_backend NUMERIC(12,2),
  programs_evaluated INTEGER NOT NULL DEFAULT 0,
  greenlights INTEGER NOT NULL DEFAULT 0,
  reviews INTEGER NOT NULL DEFAULT 0,
  fails INTEGER NOT NULL DEFAULT 0,
  run_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Lender match results table
CREATE TABLE IF NOT EXISTS lender_match_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_run_id UUID NOT NULL REFERENCES lender_match_runs(id) ON DELETE CASCADE,
  lender_id UUID NOT NULL REFERENCES lenders(id),
  program_id UUID NOT NULL REFERENCES lender_programs(id),
  program_version_id UUID NOT NULL REFERENCES lender_program_versions(id),
  status TEXT NOT NULL CHECK (status IN ('greenlight', 'review', 'fail', 'backend_only', 'info_needed')),
  confidence NUMERIC(4,3) NOT NULL DEFAULT 0,
  reasons JSONB NOT NULL DEFAULT '[]',
  restructure_suggestions JSONB NOT NULL DEFAULT '[]',
  passed_rules INTEGER NOT NULL DEFAULT 0,
  failed_rules INTEGER NOT NULL DEFAULT 0,
  warning_rules INTEGER NOT NULL DEFAULT 0,
  total_rules INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Uploaded program processing jobs table
CREATE TABLE IF NOT EXISTS uploaded_program_processing_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES lender_program_documents(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'extracted', 'needs_review', 'failed', 'approved', 'rejected')),
  extracted_data JSONB,
  extracted_rules JSONB NOT NULL DEFAULT '[]',
  approved_rules JSONB NOT NULL DEFAULT '[]',
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lender_programs_lender_id ON lender_programs(lender_id);
CREATE INDEX IF NOT EXISTS idx_lender_program_versions_program_id ON lender_program_versions(program_id);
CREATE INDEX IF NOT EXISTS idx_lender_rules_program_version_id ON lender_rules(program_version_id);
CREATE INDEX IF NOT EXISTS idx_lender_contacts_lender_id ON lender_contacts(lender_id);
CREATE INDEX IF NOT EXISTS idx_lender_match_results_run_id ON lender_match_results(match_run_id);
CREATE INDEX IF NOT EXISTS idx_lender_match_runs_deal_id ON lender_match_runs(deal_id);
