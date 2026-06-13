-- ============================================================================
-- Clinical Therapy Companion — 0001 Initial Schema
-- Run order: 1 of 4
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- ENUMS
-- ============================================================================

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'child', 'teen', 'couples', 'family', 'therapist', 'admin'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE assignment_status AS ENUM (
    'not_started', 'in_progress', 'completed', 'overdue'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE pairing_status AS ENUM ('pending', 'active', 'disconnected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE repair_status AS ENUM ('sent', 'acknowledged', 'resolved');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM (
    'mood_alert',
    'worksheet_assigned',
    'therapist_note',
    'check_in_request',
    'partner_activity',
    'badge_earned',
    'system'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================================
-- PROFILES — extends auth.users via the on_auth_user_created trigger
-- (see 0002_triggers.sql). Profiles row is auto-inserted on signup.
-- ============================================================================

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  name text NOT NULL,
  role user_role NOT NULL,
  age int,
  avatar text,                       -- emoji shorthand or storage URL
  profile_color text,
  emotional_focus text[] DEFAULT '{}',
  parenting_relationship text,       -- mother / father / guardian
  bio text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role);

-- ============================================================================
-- RELATIONSHIPS — parent_child_links + therapist_clients
-- ============================================================================

CREATE TABLE IF NOT EXISTS parent_child_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  child_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (parent_id, child_id),
  CHECK (parent_id <> child_id)
);

CREATE INDEX IF NOT EXISTS pcl_parent_idx ON parent_child_links(parent_id);
CREATE INDEX IF NOT EXISTS pcl_child_idx  ON parent_child_links(child_id);

CREATE TABLE IF NOT EXISTS therapist_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (therapist_id, client_id),
  CHECK (therapist_id <> client_id)
);

CREATE INDEX IF NOT EXISTS tc_therapist_idx ON therapist_clients(therapist_id);
CREATE INDEX IF NOT EXISTS tc_client_idx    ON therapist_clients(client_id);

-- ============================================================================
-- CONTENT LIBRARY — worksheets, affirmations, coping tools, resources, dates
-- ============================================================================

CREATE TABLE IF NOT EXISTS worksheets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  description text,
  audience    text NOT NULL DEFAULT 'all',   -- child | teen | couples | family | all
  program_id  text,                           -- gottman_12week | psychodynamic_suite | ...
  content     jsonb NOT NULL DEFAULT '{}',
  is_template boolean NOT NULL DEFAULT true,
  created_by  uuid REFERENCES profiles(id),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS worksheets_audience_idx ON worksheets(audience);
CREATE INDEX IF NOT EXISTS worksheets_program_idx  ON worksheets(program_id);

CREATE TABLE IF NOT EXISTS affirmations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text       text NOT NULL,
  audience   text NOT NULL DEFAULT 'all',
  accent     text,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS affirmations_audience_idx ON affirmations(audience);

CREATE TABLE IF NOT EXISTS coping_tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  category    text,                           -- breathing | grounding | visualization | ...
  description text,
  steps       jsonb DEFAULT '[]',
  audience    text NOT NULL DEFAULT 'all',
  accent      text,
  created_by  uuid REFERENCES profiles(id),
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS coping_tools_audience_idx ON coping_tools(audience);
CREATE INDEX IF NOT EXISTS coping_tools_category_idx ON coping_tools(category);

CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  type        text,                           -- article | video | book | external
  url         text,
  description text,
  audience    text NOT NULL DEFAULT 'all',
  created_by  uuid REFERENCES profiles(id),
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS resources_audience_idx ON resources(audience);

CREATE TABLE IF NOT EXISTS date_ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  description text,
  category    text,
  created_by  uuid REFERENCES profiles(id),
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- ASSIGNMENTS & RESPONSES
-- ============================================================================

CREATE TABLE IF NOT EXISTS worksheet_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worksheet_id uuid NOT NULL REFERENCES worksheets(id) ON DELETE CASCADE,
  assignee_id  uuid NOT NULL REFERENCES profiles(id)   ON DELETE CASCADE,
  assigned_by  uuid REFERENCES profiles(id),
  status       assignment_status NOT NULL DEFAULT 'not_started',
  due_date     timestamptz,
  progress     int NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  notes        text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS wa_assignee_idx  ON worksheet_assignments(assignee_id);
CREATE INDEX IF NOT EXISTS wa_worksheet_idx ON worksheet_assignments(worksheet_id);
CREATE INDEX IF NOT EXISTS wa_status_idx    ON worksheet_assignments(status);

CREATE TABLE IF NOT EXISTS worksheet_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES worksheet_assignments(id) ON DELETE CASCADE,
  user_id       uuid NOT NULL REFERENCES profiles(id)              ON DELETE CASCADE,
  answers       jsonb NOT NULL DEFAULT '{}',
  completed_at  timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS wr_assignment_idx ON worksheet_responses(assignment_id);
CREATE INDEX IF NOT EXISTS wr_user_idx       ON worksheet_responses(user_id);

-- ============================================================================
-- DAILY TRACKING — mood + journal
-- ============================================================================

CREATE TABLE IF NOT EXISTS mood_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mood       text NOT NULL,
  score      int CHECK (score >= 1 AND score <= 10),
  note       text,
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS mood_user_idx ON mood_entries(user_id);
CREATE INDEX IF NOT EXISTS mood_date_idx ON mood_entries(user_id, entry_date DESC);

CREATE TABLE IF NOT EXISTS journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body       text NOT NULL,
  mood       text,
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS journal_user_idx ON journal_entries(user_id);

-- ============================================================================
-- COUPLES SYNC
-- ============================================================================

CREATE TABLE IF NOT EXISTS couple_pairings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_a_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  partner_b_id    uuid REFERENCES profiles(id) ON DELETE CASCADE,
  invite_code     text UNIQUE,
  status          pairing_status NOT NULL DEFAULT 'pending',
  paired_at       timestamptz,
  disconnected_at timestamptz,
  created_by      uuid REFERENCES profiles(id),
  created_at      timestamptz NOT NULL DEFAULT now(),
  CHECK (partner_a_id <> partner_b_id)
);

CREATE INDEX IF NOT EXISTS cp_partner_a_idx ON couple_pairings(partner_a_id);
CREATE INDEX IF NOT EXISTS cp_partner_b_idx ON couple_pairings(partner_b_id);
CREATE INDEX IF NOT EXISTS cp_status_idx    ON couple_pairings(status);

CREATE TABLE IF NOT EXISTS partner_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES profiles(id)        ON DELETE CASCADE,
  pairing_id uuid REFERENCES couple_pairings(id)          ON DELETE CASCADE,
  mood       int CHECK (mood       BETWEEN 1 AND 10),
  connection int CHECK (connection BETWEEN 1 AND 10),
  stress     int CHECK (stress     BETWEEN 1 AND 10),
  need       text,
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pc_user_idx    ON partner_checkins(user_id);
CREATE INDEX IF NOT EXISTS pc_pairing_idx ON partner_checkins(pairing_id);

CREATE TABLE IF NOT EXISTS repair_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pairing_id      uuid NOT NULL REFERENCES couple_pairings(id) ON DELETE CASCADE,
  from_user_id    uuid NOT NULL REFERENCES profiles(id)        ON DELETE CASCADE,
  to_user_id      uuid NOT NULL REFERENCES profiles(id)        ON DELETE CASCADE,
  message         text NOT NULL,
  response        text,
  status          repair_status NOT NULL DEFAULT 'sent',
  sent_at         timestamptz NOT NULL DEFAULT now(),
  acknowledged_at timestamptz
);

CREATE INDEX IF NOT EXISTS rr_pairing_idx ON repair_requests(pairing_id);
CREATE INDEX IF NOT EXISTS rr_status_idx  ON repair_requests(status);

CREATE TABLE IF NOT EXISTS appreciations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pairing_id   uuid NOT NULL REFERENCES couple_pairings(id) ON DELETE CASCADE,
  from_user_id uuid NOT NULL REFERENCES profiles(id)        ON DELETE CASCADE,
  to_user_id   uuid NOT NULL REFERENCES profiles(id)        ON DELETE CASCADE,
  message      text NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS appr_pairing_idx ON appreciations(pairing_id);

CREATE TABLE IF NOT EXISTS conflict_pauses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pairing_id       uuid NOT NULL REFERENCES couple_pairings(id) ON DELETE CASCADE,
  started_by       uuid NOT NULL REFERENCES profiles(id)        ON DELETE CASCADE,
  duration_minutes int NOT NULL DEFAULT 20,
  reason           text,
  started_at       timestamptz NOT NULL DEFAULT now(),
  ended_at         timestamptz
);

CREATE INDEX IF NOT EXISTS cps_pairing_idx ON conflict_pauses(pairing_id);

CREATE TABLE IF NOT EXISTS shared_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pairing_id   uuid NOT NULL REFERENCES couple_pairings(id) ON DELETE CASCADE,
  title        text NOT NULL,
  description  text,
  progress     int NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  completed_at timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sg_pairing_idx ON shared_goals(pairing_id);

-- ============================================================================
-- THERAPIST NOTES
-- ============================================================================

CREATE TABLE IF NOT EXISTS therapist_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body         text NOT NULL,
  is_private   boolean NOT NULL DEFAULT false,   -- hidden from the client themselves
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tn_therapist_idx ON therapist_notes(therapist_id);
CREATE INDEX IF NOT EXISTS tn_client_idx    ON therapist_notes(client_id);

-- ============================================================================
-- NOTIFICATIONS & BADGES
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type       notification_type NOT NULL,
  title      text NOT NULL,
  body       text,
  meta       jsonb DEFAULT '{}',
  read_at    timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notif_user_idx   ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notif_unread_idx ON notifications(user_id, read_at) WHERE read_at IS NULL;

CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id  text NOT NULL,
  earned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS badges_user_idx ON badges(user_id);
