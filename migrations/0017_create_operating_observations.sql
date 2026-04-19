-- Migration 0017: Executive Operating Review Observations
-- Purpose: Structured storage for operating weakness observations and action tracking
-- Dependencies: 0016

create table if not exists operating_observations (
  id uuid primary key default gen_random_uuid(),
    title text not null,
      category text not null check (
          category in (
                'Marketing',
                      'Sales',
                            'Finance',
                                  'Service',
                                        'Lot Presentation',
                                              'Website',
                                                    'Inventory / Merchandising',
                                                          'Staffing',
                                                                'Process',
                                                                      'Customer Experience',
                                                                            'Follow-Up',
                                                                                  'Leadership',
                                                                                        'Other'
                                                                                            )
                                                                                              ),
                                                                                                department text not null check (
                                                                                                    department in ('Marketing', 'Sales', 'Finance', 'Service', 'Inventory', 'Operations', 'Management', 'Other')
                                                                                                      ),
                                                                                                        location_area text,
                                                                                                          date_observed date not null default current_date,
                                                                                                            observed_by text not null,
                                                                                                              severity text not null check (severity in ('Low', 'Medium', 'High', 'Critical')),
                                                                                                                urgency text not null check (urgency in ('Routine', 'Soon', 'Urgent', 'Immediate')),
                                                                                                                  status text not null check (status in ('New', 'Under Review', 'Discussed with Owner', 'Assigned', 'In Progress', 'Resolved', 'Closed')),
                                                                                                                    owner_accountable text,
                                                                                                                      short_summary text not null,
                                                                                                                        full_notes text,
                                                                                                                          recommendation text,
                                                                                                                            impact text,
                                                                                                                              follow_up_needed text,
                                                                                                                                follow_up_date date,
                                                                                                                                  reviewed_with_owner boolean not null default false,
                                                                                                                                    review_meeting_date date,
                                                                                                                                      discuss_next_meeting boolean not null default false,
                                                                                                                                        tags text[] not null default '{}',
                                                                                                                                          evidence_links text[] not null default '{}',
                                                                                                                                            action_items jsonb not null default '[]'::jsonb,
                                                                                                                                              pinned boolean not null default false,
                                                                                                                                                created_at timestamptz not null default now(),
                                                                                                                                                  updated_at timestamptz not null default now()
                                                                                                                                                  );

                                                                                                                                                  create index if not exists idx_operating_observations_date on operating_observations(date_observed desc);
                                                                                                                                                  create index if not exists idx_operating_observations_category on operating_observations(category);
                                                                                                                                                  create index if not exists idx_operating_observations_severity on operating_observations(severity);
                                                                                                                                                  create index if not exists idx_operating_observations_status on operating_observations(status);
                                                                                                                                                  create index if not exists idx_operating_observations_follow_up_date on operating_observations(follow_up_date);

                                                                                                                                                  create trigger trg_operating_observations_updated_at
                                                                                                                                                  before update on operating_observations
                                                                                                                                                  for each row execute function set_updated_at();

                                                                                                                                                  alter table operating_observations enable row level security;

                                                                                                                                                  create policy "staff_all_operating_observations"
                                                                                                                                                    on operating_observations
                                                                                                                                                      for all
                                                                                                                                                        to authenticated
                                                                                                                                                          using (true)
                                                                                                                                                            with check (true);

                                                                                                                                                            create policy "anon_insert_operating_observations"
                                                                                                                                                              on operating_observations
                                                                                                                                                                for insert
                                                                                                                                                                  to anon
                                                                                                                                                                    with check (true);
                                                                                                                                                                    