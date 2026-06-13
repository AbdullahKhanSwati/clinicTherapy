-- ============================================================================
-- Clinical Therapy Companion — 0002 Triggers & Helper Functions
-- Run order: 2 of 4  (after 0001_schema.sql)
-- ============================================================================

-- ============================================================================
-- updated_at trigger — generic
-- ============================================================================

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS worksheets_updated_at ON worksheets;
CREATE TRIGGER worksheets_updated_at BEFORE UPDATE ON worksheets
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS wa_updated_at ON worksheet_assignments;
CREATE TRIGGER wa_updated_at BEFORE UPDATE ON worksheet_assignments
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS wr_updated_at ON worksheet_responses;
CREATE TRIGGER wr_updated_at BEFORE UPDATE ON worksheet_responses
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS journal_updated_at ON journal_entries;
CREATE TRIGGER journal_updated_at BEFORE UPDATE ON journal_entries
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS tn_updated_at ON therapist_notes;
CREATE TRIGGER tn_updated_at BEFORE UPDATE ON therapist_notes
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS sg_updated_at ON shared_goals;
CREATE TRIGGER sg_updated_at BEFORE UPDATE ON shared_goals
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============================================================================
-- handle_new_user — auto-create a profiles row on auth.users INSERT
-- Reads role / name / age / etc from raw_user_meta_data passed during signUp.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, email, name, role, age, avatar, profile_color,
    parenting_relationship, emotional_focus
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'child'::user_role),
    NULLIF(NEW.raw_user_meta_data->>'age', '')::int,
    NEW.raw_user_meta_data->>'avatar',
    NEW.raw_user_meta_data->>'profile_color',
    NEW.raw_user_meta_data->>'parenting_relationship',
    COALESCE(
      ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data->'emotional_focus')),
      '{}'::text[]
    )
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- RLS HELPER FUNCTIONS — used inside policies in 0003_rls.sql.
-- All are SECURITY DEFINER so RLS on profiles doesn't recursively block them.
-- ============================================================================

-- Current user's role (NULL if no profile row yet)
CREATE OR REPLACE FUNCTION public.current_role()
RETURNS user_role
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

-- True if current user is therapist or admin
CREATE OR REPLACE FUNCTION public.is_clinician()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT public.current_role() IN ('therapist', 'admin')
$$;

-- True if current user is a parent of the given child
CREATE OR REPLACE FUNCTION public.is_parent_of(_child uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.parent_child_links
    WHERE parent_id = auth.uid() AND child_id = _child
  )
$$;

-- True if current user is the therapist of the given client
CREATE OR REPLACE FUNCTION public.is_therapist_of(_client uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.therapist_clients
    WHERE therapist_id = auth.uid() AND client_id = _client
  )
$$;

-- True if current user is the partner of the given user via an ACTIVE pairing
CREATE OR REPLACE FUNCTION public.is_partner_of(_other uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.couple_pairings
    WHERE status = 'active'
      AND (
        (partner_a_id = auth.uid() AND partner_b_id = _other)
        OR
        (partner_b_id = auth.uid() AND partner_a_id = _other)
      )
  )
$$;

-- True if current user is part of the given pairing (any status)
CREATE OR REPLACE FUNCTION public.in_pairing(_pairing uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.couple_pairings
    WHERE id = _pairing
      AND (partner_a_id = auth.uid() OR partner_b_id = auth.uid())
  )
$$;
