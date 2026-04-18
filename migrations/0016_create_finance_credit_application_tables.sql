-- Migration 0016: Finance Credit Application Hardening
-- Purpose: Add finance-ready credit application and document checklist tables
-- Dependencies: 0015

create table if not exists finance_credit_applications (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid,
  customer_id uuid,
  quick_app_submission_id uuid,
  applicant_json jsonb not null,
  current_residence_json jsonb not null,
  previous_residence_json jsonb,
  current_employment_json jsonb not null,
  previous_employment_json jsonb,
  credit_score_range text not null check (credit_score_range in ('under_550', '550_599', '600_649', '650_699', '700_749', '750_plus')),
  required_documents jsonb not null default '[]'::jsonb,
  uploaded_documents jsonb not null default '[]'::jsonb,
  application_status text not null check (application_status in ('submitted', 'documents_pending', 'under_review', 'ready_for_review')),
  completeness_status text not null check (completeness_status in ('incomplete', 'docs_missing', 'ready')),
  missing_documents jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists finance_credit_application_documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references finance_credit_applications(id) on delete cascade,
  lead_id uuid,
  customer_id uuid,
  document_type text not null check (document_type in ('proof_of_income', 'proof_of_residency', 'references', 'proof_of_insurance', 'driver_license')),
  file_name text not null,
  mime_type text not null,
  file_size_bytes bigint not null check (file_size_bytes > 0 and file_size_bytes <= 10485760),
  storage_ref text not null,
  uploaded_by_actor_type text not null check (uploaded_by_actor_type in ('user', 'agent', 'system')),
  upload_status text not null check (upload_status in ('uploaded', 'rejected')),
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_finance_credit_apps_lead on finance_credit_applications(lead_id);
create index if not exists idx_finance_credit_apps_customer on finance_credit_applications(customer_id);
create index if not exists idx_finance_credit_apps_status on finance_credit_applications(application_status, completeness_status);
create index if not exists idx_finance_credit_docs_application on finance_credit_application_documents(application_id);
create index if not exists idx_finance_credit_docs_type on finance_credit_application_documents(document_type);

-- Trigger updates
create trigger trg_finance_credit_applications_updated_at
before update on finance_credit_applications
for each row execute function set_updated_at();

create trigger trg_finance_credit_application_documents_updated_at
before update on finance_credit_application_documents

-- Row Level Security
-- Customers (unauthenticated / anon) can insert but not read other rows.
-- Authenticated staff can read and update all rows.
alter table finance_credit_applications enable row level security;
alter table finance_credit_application_documents enable row level security;

-- Staff read/write (any authenticated Supabase user with a valid JWT)
create policy "staff_all_finance_credit_applications"
  on finance_credit_applications
  for all
  to authenticated
  using (true)
  with check (true);

create policy "staff_all_finance_credit_documents"
  on finance_credit_application_documents
  for all
  to authenticated
  using (true)
  with check (true);

-- Anonymous customers may insert a new application but cannot read others
create policy "anon_insert_finance_credit_application"
  on finance_credit_applications
  for insert
  to anon
  with check (true);

create policy "anon_insert_finance_credit_document"
  on finance_credit_application_documents
  for insert
  to anon
  with check (true);
for each row execute function set_updated_at();
