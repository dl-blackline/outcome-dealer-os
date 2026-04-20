-- Migration 0019: Finance Credit Application Schema Updates
-- Purpose: Add missing columns introduced by the multi-applicant model and fix
--          the document_type CHECK constraint so joint-application document types
--          are accepted. Also corrects the malformed updated_at trigger for the
--          documents table that was left incomplete in migration 0016.
-- Dependencies: 0016

-- ---------------------------------------------------------------------------
-- 1. Add new columns to finance_credit_applications
--    These columns were added to the service layer after migration 0016 was
--    written. They carry structured per-applicant JSON and an explicit type
--    discriminator. All are nullable to preserve backward compatibility with
--    rows written before this migration.
-- ---------------------------------------------------------------------------
alter table finance_credit_applications
  add column if not exists application_type text
    check (application_type in ('individual', 'joint'));

alter table finance_credit_applications
  add column if not exists primary_applicant_json jsonb;

alter table finance_credit_applications
  add column if not exists co_applicant_json jsonb;

-- Index the new type discriminator for efficient filtering
create index if not exists idx_finance_credit_apps_type
  on finance_credit_applications(application_type);

-- ---------------------------------------------------------------------------
-- 2. Expand the document_type CHECK constraint on finance_credit_application_documents
--    The original constraint only allowed the 5 legacy types. Joint applications
--    require 4 additional role-scoped types. We drop the old constraint by its
--    auto-generated name and replace it with a wider one.
-- ---------------------------------------------------------------------------
alter table finance_credit_application_documents
  drop constraint if exists finance_credit_application_documents_document_type_check;

alter table finance_credit_application_documents
  add constraint finance_credit_application_documents_document_type_check
    check (document_type in (
      'proof_of_income',
      'proof_of_residency',
      'references',
      'proof_of_insurance',
      'driver_license',
      'primary_proof_of_income',
      'primary_proof_of_residency',
      'co_applicant_proof_of_income',
      'co_applicant_proof_of_residency'
    ));

-- ---------------------------------------------------------------------------
-- 3. Fix the updated_at trigger for finance_credit_application_documents
--    Migration 0016 contained a syntax error that left this trigger incomplete.
--    We drop and recreate it here idempotently.
-- ---------------------------------------------------------------------------
drop trigger if exists trg_finance_credit_application_documents_updated_at
  on finance_credit_application_documents;

create trigger trg_finance_credit_application_documents_updated_at
  before update on finance_credit_application_documents
  for each row execute function set_updated_at();
