-- Migration: 0023_create_playbook_execution_center.sql
-- Creates the Playbook & Execution Center schema
-- Note: The module uses localStorage fallback when Supabase is not configured.

-- ─── Playbooks ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS playbooks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  description   TEXT NOT NULL DEFAULT '',
  category      TEXT NOT NULL DEFAULT 'operations',
  owner         TEXT NOT NULL DEFAULT '',
  visibility    TEXT NOT NULL DEFAULT 'private',
  status        TEXT NOT NULL DEFAULT 'active',
  priority      TEXT NOT NULL DEFAULT 'medium',
  tags          TEXT[] NOT NULL DEFAULT '{}',
  collaborators JSONB NOT NULL DEFAULT '[]',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT playbooks_category_check
    CHECK (category IN ('sales','finance','service','marketing','operations','hr','strategy','compliance','other')),
  CONSTRAINT playbooks_visibility_check
    CHECK (visibility IN ('public','private','restricted')),
  CONSTRAINT playbooks_status_check
    CHECK (status IN ('active','draft','archived','paused')),
  CONSTRAINT playbooks_priority_check
    CHECK (priority IN ('low','medium','high','critical'))
);

-- ─── Projects ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS playbook_projects (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playbook_id     UUID NOT NULL REFERENCES playbooks(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT NOT NULL DEFAULT '',
  objective       TEXT NOT NULL DEFAULT '',
  owner           TEXT NOT NULL DEFAULT '',
  collaborators   JSONB NOT NULL DEFAULT '[]',
  status          TEXT NOT NULL DEFAULT 'planning',
  priority        TEXT NOT NULL DEFAULT 'medium',
  start_date      DATE,
  target_date     DATE,
  next_milestone  TEXT,
  blockers        TEXT,
  tags            TEXT[] NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT projects_status_check
    CHECK (status IN ('planning','active','on_hold','completed','cancelled')),
  CONSTRAINT projects_priority_check
    CHECK (priority IN ('low','medium','high','critical'))
);

-- ─── Entries / Notes ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS playbook_entries (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playbook_id       UUID NOT NULL REFERENCES playbooks(id) ON DELETE CASCADE,
  project_id        UUID REFERENCES playbook_projects(id) ON DELETE SET NULL,
  title             TEXT NOT NULL,
  type              TEXT NOT NULL DEFAULT 'idea',
  summary           TEXT NOT NULL DEFAULT '',
  body              TEXT,
  discussed_with    TEXT[] NOT NULL DEFAULT '{}',
  people_mentioned  TEXT[] NOT NULL DEFAULT '{}',
  department        TEXT,
  tags              TEXT[] NOT NULL DEFAULT '{}',
  priority          TEXT NOT NULL DEFAULT 'medium',
  status            TEXT NOT NULL DEFAULT 'open',
  next_step         TEXT,
  due_date          DATE,
  linked_records    JSONB NOT NULL DEFAULT '[]',
  attachments       JSONB NOT NULL DEFAULT '[]',
  created_by        TEXT NOT NULL DEFAULT '',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT entries_type_check
    CHECK (type IN ('idea','issue','meeting_note','strategy_note','decision','follow_up','update','blocker','observation')),
  CONSTRAINT entries_priority_check
    CHECK (priority IN ('low','medium','high','urgent')),
  CONSTRAINT entries_status_check
    CHECK (status IN ('open','in_progress','resolved','archived','converted'))
);

-- ─── Decisions ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS playbook_decisions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playbook_id       UUID NOT NULL REFERENCES playbooks(id) ON DELETE CASCADE,
  project_id        UUID REFERENCES playbook_projects(id) ON DELETE SET NULL,
  title             TEXT NOT NULL,
  summary           TEXT NOT NULL DEFAULT '',
  rationale         TEXT,
  decided_by        TEXT NOT NULL DEFAULT '',
  date_decided      DATE NOT NULL DEFAULT CURRENT_DATE,
  status            TEXT NOT NULL DEFAULT 'decided',
  impacts           TEXT[] NOT NULL DEFAULT '{}',
  linked_entry_ids  UUID[] NOT NULL DEFAULT '{}',
  tags              TEXT[] NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT decisions_status_check
    CHECK (status IN ('proposed','decided','implemented','reversed'))
);

-- ─── Action Items ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS playbook_action_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playbook_id     UUID NOT NULL REFERENCES playbooks(id) ON DELETE CASCADE,
  project_id      UUID REFERENCES playbook_projects(id) ON DELETE SET NULL,
  source_entry_id UUID REFERENCES playbook_entries(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  owner           TEXT NOT NULL DEFAULT '',
  due_date        DATE,
  priority        TEXT NOT NULL DEFAULT 'medium',
  status          TEXT NOT NULL DEFAULT 'open',
  created_by      TEXT NOT NULL DEFAULT '',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT action_items_priority_check
    CHECK (priority IN ('low','medium','high','urgent')),
  CONSTRAINT action_items_status_check
    CHECK (status IN ('open','in_progress','completed','cancelled','blocked'))
);

-- ─── Timeline Events ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS playbook_timeline_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playbook_id   UUID NOT NULL REFERENCES playbooks(id) ON DELETE CASCADE,
  project_id    UUID REFERENCES playbook_projects(id) ON DELETE SET NULL,
  entity_type   TEXT NOT NULL,
  entity_id     UUID NOT NULL,
  entity_title  TEXT NOT NULL DEFAULT '',
  event_type    TEXT NOT NULL,
  actor         TEXT NOT NULL DEFAULT '',
  detail        TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT timeline_entity_type_check
    CHECK (entity_type IN ('playbook','project','entry','decision','action_item')),
  CONSTRAINT timeline_event_type_check
    CHECK (event_type IN ('playbook_created','project_created','project_updated','entry_created','decision_created','action_item_created','action_item_completed','status_changed','collaborator_added','file_attached'))
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_playbook_projects_playbook_id ON playbook_projects(playbook_id);
CREATE INDEX IF NOT EXISTS idx_playbook_entries_playbook_id ON playbook_entries(playbook_id);
CREATE INDEX IF NOT EXISTS idx_playbook_entries_project_id ON playbook_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_playbook_entries_type ON playbook_entries(type);
CREATE INDEX IF NOT EXISTS idx_playbook_entries_status ON playbook_entries(status);
CREATE INDEX IF NOT EXISTS idx_playbook_decisions_playbook_id ON playbook_decisions(playbook_id);
CREATE INDEX IF NOT EXISTS idx_playbook_action_items_playbook_id ON playbook_action_items(playbook_id);
CREATE INDEX IF NOT EXISTS idx_playbook_action_items_status ON playbook_action_items(status);
CREATE INDEX IF NOT EXISTS idx_playbook_timeline_playbook_id ON playbook_timeline_events(playbook_id);
CREATE INDEX IF NOT EXISTS idx_playbook_timeline_project_id ON playbook_timeline_events(project_id);

-- ─── Updated-at triggers ──────────────────────────────────────────────────────
CREATE TRIGGER set_playbooks_updated_at
  BEFORE UPDATE ON playbooks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_playbook_projects_updated_at
  BEFORE UPDATE ON playbook_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_playbook_entries_updated_at
  BEFORE UPDATE ON playbook_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_playbook_decisions_updated_at
  BEFORE UPDATE ON playbook_decisions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_playbook_action_items_updated_at
  BEFORE UPDATE ON playbook_action_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── Row-Level Security (enable but allow authenticated users for now) ─────────
ALTER TABLE playbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE playbook_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE playbook_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE playbook_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE playbook_action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE playbook_timeline_events ENABLE ROW LEVEL SECURITY;

-- Authenticated staff can read all records
CREATE POLICY playbooks_select_authenticated ON playbooks
  FOR SELECT TO authenticated USING (true);

CREATE POLICY playbooks_insert_authenticated ON playbooks
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY playbooks_update_authenticated ON playbooks
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY playbooks_delete_authenticated ON playbooks
  FOR DELETE TO authenticated USING (true);

-- Projects
CREATE POLICY projects_select_authenticated ON playbook_projects
  FOR SELECT TO authenticated USING (true);
CREATE POLICY projects_insert_authenticated ON playbook_projects
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY projects_update_authenticated ON playbook_projects
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY projects_delete_authenticated ON playbook_projects
  FOR DELETE TO authenticated USING (true);

-- Entries
CREATE POLICY entries_select_authenticated ON playbook_entries
  FOR SELECT TO authenticated USING (true);
CREATE POLICY entries_insert_authenticated ON playbook_entries
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY entries_update_authenticated ON playbook_entries
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY entries_delete_authenticated ON playbook_entries
  FOR DELETE TO authenticated USING (true);

-- Decisions
CREATE POLICY decisions_select_authenticated ON playbook_decisions
  FOR SELECT TO authenticated USING (true);
CREATE POLICY decisions_insert_authenticated ON playbook_decisions
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY decisions_update_authenticated ON playbook_decisions
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY decisions_delete_authenticated ON playbook_decisions
  FOR DELETE TO authenticated USING (true);

-- Action Items
CREATE POLICY action_items_select_authenticated ON playbook_action_items
  FOR SELECT TO authenticated USING (true);
CREATE POLICY action_items_insert_authenticated ON playbook_action_items
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY action_items_update_authenticated ON playbook_action_items
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY action_items_delete_authenticated ON playbook_action_items
  FOR DELETE TO authenticated USING (true);

-- Timeline
CREATE POLICY timeline_select_authenticated ON playbook_timeline_events
  FOR SELECT TO authenticated USING (true);
CREATE POLICY timeline_insert_authenticated ON playbook_timeline_events
  FOR INSERT TO authenticated WITH CHECK (true);
