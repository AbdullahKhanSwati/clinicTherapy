-- ============================================================================
-- Clinical Therapy Companion — 0003 Row Level Security
-- Run order: 3 of 4  (after 0002_triggers.sql)
--
-- Every table starts LOCKED. Only listed policies grant access.
-- service_role bypasses RLS entirely (used by admin scripts only).
-- ============================================================================

-- ============================================================================
-- ENABLE RLS ON EVERY TABLE
-- ============================================================================

ALTER TABLE profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_child_links    ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapist_clients     ENABLE ROW LEVEL SECURITY;
ALTER TABLE worksheets            ENABLE ROW LEVEL SECURITY;
ALTER TABLE affirmations          ENABLE ROW LEVEL SECURITY;
ALTER TABLE coping_tools          ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources             ENABLE ROW LEVEL SECURITY;
ALTER TABLE date_ideas            ENABLE ROW LEVEL SECURITY;
ALTER TABLE worksheet_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE worksheet_responses   ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_entries          ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries       ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_pairings       ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_checkins      ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_requests       ENABLE ROW LEVEL SECURITY;
ALTER TABLE appreciations         ENABLE ROW LEVEL SECURITY;
ALTER TABLE conflict_pauses       ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_goals          ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapist_notes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications         ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges                ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES — self + linked relationships
-- ============================================================================

DROP POLICY IF EXISTS profiles_select ON profiles;
CREATE POLICY profiles_select ON profiles FOR SELECT
USING (
  auth.uid() = id
  OR public.is_clinician()
  OR public.is_parent_of(id)
  OR public.is_therapist_of(id)
  OR public.is_partner_of(id)
  OR EXISTS (
    SELECT 1 FROM parent_child_links
    WHERE child_id = auth.uid() AND parent_id = profiles.id
  )
);

DROP POLICY IF EXISTS profiles_update ON profiles;
CREATE POLICY profiles_update ON profiles FOR UPDATE
USING (auth.uid() = id OR public.is_clinician());

-- INSERT: only via handle_new_user trigger (service_role).
-- DELETE: via CASCADE from auth.users.

-- ============================================================================
-- PARENT_CHILD_LINKS — both parties + clinicians can read; clinicians write
-- ============================================================================

DROP POLICY IF EXISTS pcl_select ON parent_child_links;
CREATE POLICY pcl_select ON parent_child_links FOR SELECT
USING (parent_id = auth.uid() OR child_id = auth.uid() OR public.is_clinician());

DROP POLICY IF EXISTS pcl_insert ON parent_child_links;
CREATE POLICY pcl_insert ON parent_child_links FOR INSERT
WITH CHECK (public.is_clinician());

DROP POLICY IF EXISTS pcl_delete ON parent_child_links;
CREATE POLICY pcl_delete ON parent_child_links FOR DELETE
USING (public.is_clinician());

-- ============================================================================
-- THERAPIST_CLIENTS
-- ============================================================================

DROP POLICY IF EXISTS tc_select ON therapist_clients;
CREATE POLICY tc_select ON therapist_clients FOR SELECT
USING (therapist_id = auth.uid() OR client_id = auth.uid() OR public.is_clinician());

DROP POLICY IF EXISTS tc_insert ON therapist_clients;
CREATE POLICY tc_insert ON therapist_clients FOR INSERT
WITH CHECK (public.is_clinician());

DROP POLICY IF EXISTS tc_delete ON therapist_clients;
CREATE POLICY tc_delete ON therapist_clients FOR DELETE
USING (public.is_clinician());

-- ============================================================================
-- CONTENT LIBRARY — everyone reads, clinicians write
-- ============================================================================

DROP POLICY IF EXISTS worksheets_select ON worksheets;
CREATE POLICY worksheets_select ON worksheets FOR SELECT
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS worksheets_write ON worksheets;
CREATE POLICY worksheets_write ON worksheets FOR ALL
USING (public.is_clinician())
WITH CHECK (public.is_clinician());

DROP POLICY IF EXISTS affirmations_select ON affirmations;
CREATE POLICY affirmations_select ON affirmations FOR SELECT
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS affirmations_write ON affirmations;
CREATE POLICY affirmations_write ON affirmations FOR ALL
USING (public.is_clinician())
WITH CHECK (public.is_clinician());

DROP POLICY IF EXISTS coping_tools_select ON coping_tools;
CREATE POLICY coping_tools_select ON coping_tools FOR SELECT
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS coping_tools_write ON coping_tools;
CREATE POLICY coping_tools_write ON coping_tools FOR ALL
USING (public.is_clinician())
WITH CHECK (public.is_clinician());

DROP POLICY IF EXISTS resources_select ON resources;
CREATE POLICY resources_select ON resources FOR SELECT
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS resources_write ON resources;
CREATE POLICY resources_write ON resources FOR ALL
USING (public.is_clinician())
WITH CHECK (public.is_clinician());

DROP POLICY IF EXISTS date_ideas_select ON date_ideas;
CREATE POLICY date_ideas_select ON date_ideas FOR SELECT
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS date_ideas_write ON date_ideas;
CREATE POLICY date_ideas_write ON date_ideas FOR ALL
USING (public.is_clinician())
WITH CHECK (public.is_clinician());

-- ============================================================================
-- ASSIGNMENTS & RESPONSES
-- ============================================================================

DROP POLICY IF EXISTS wa_select ON worksheet_assignments;
CREATE POLICY wa_select ON worksheet_assignments FOR SELECT
USING (
  assignee_id = auth.uid()
  OR assigned_by = auth.uid()
  OR public.is_clinician()
  OR public.is_parent_of(assignee_id)
  OR public.is_therapist_of(assignee_id)
);

DROP POLICY IF EXISTS wa_insert ON worksheet_assignments;
CREATE POLICY wa_insert ON worksheet_assignments FOR INSERT
WITH CHECK (public.is_clinician());

DROP POLICY IF EXISTS wa_update ON worksheet_assignments;
CREATE POLICY wa_update ON worksheet_assignments FOR UPDATE
USING (assignee_id = auth.uid() OR public.is_clinician());

DROP POLICY IF EXISTS wa_delete ON worksheet_assignments;
CREATE POLICY wa_delete ON worksheet_assignments FOR DELETE
USING (public.is_clinician());

DROP POLICY IF EXISTS wr_select ON worksheet_responses;
CREATE POLICY wr_select ON worksheet_responses FOR SELECT
USING (
  user_id = auth.uid()
  OR public.is_clinician()
  OR public.is_parent_of(user_id)
  OR public.is_therapist_of(user_id)
);

DROP POLICY IF EXISTS wr_insert ON worksheet_responses;
CREATE POLICY wr_insert ON worksheet_responses FOR INSERT
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS wr_update ON worksheet_responses;
CREATE POLICY wr_update ON worksheet_responses FOR UPDATE
USING (user_id = auth.uid());

-- ============================================================================
-- MOOD ENTRIES — self + caregivers + partner
-- ============================================================================

DROP POLICY IF EXISTS mood_select ON mood_entries;
CREATE POLICY mood_select ON mood_entries FOR SELECT
USING (
  user_id = auth.uid()
  OR public.is_clinician()
  OR public.is_parent_of(user_id)
  OR public.is_therapist_of(user_id)
  OR public.is_partner_of(user_id)
);

DROP POLICY IF EXISTS mood_insert ON mood_entries;
CREATE POLICY mood_insert ON mood_entries FOR INSERT
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS mood_update ON mood_entries;
CREATE POLICY mood_update ON mood_entries FOR UPDATE
USING (user_id = auth.uid());

DROP POLICY IF EXISTS mood_delete ON mood_entries;
CREATE POLICY mood_delete ON mood_entries FOR DELETE
USING (user_id = auth.uid());

-- ============================================================================
-- JOURNAL ENTRIES — private. Therapist may read (clinical care).
-- Parents do NOT see their teen's journal (privacy by design).
-- ============================================================================

DROP POLICY IF EXISTS journal_select ON journal_entries;
CREATE POLICY journal_select ON journal_entries FOR SELECT
USING (
  user_id = auth.uid()
  OR public.is_therapist_of(user_id)
  OR public.current_role() = 'admin'
);

DROP POLICY IF EXISTS journal_write ON journal_entries;
CREATE POLICY journal_write ON journal_entries FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- COUPLE PAIRINGS — clinician-created (admin pairing flow)
-- ============================================================================

DROP POLICY IF EXISTS cp_select ON couple_pairings;
CREATE POLICY cp_select ON couple_pairings FOR SELECT
USING (
  partner_a_id = auth.uid()
  OR partner_b_id = auth.uid()
  OR public.is_clinician()
);

DROP POLICY IF EXISTS cp_insert ON couple_pairings;
CREATE POLICY cp_insert ON couple_pairings FOR INSERT
WITH CHECK (public.is_clinician());

DROP POLICY IF EXISTS cp_update ON couple_pairings;
CREATE POLICY cp_update ON couple_pairings FOR UPDATE
USING (
  partner_a_id = auth.uid()
  OR partner_b_id = auth.uid()
  OR public.is_clinician()
);

DROP POLICY IF EXISTS cp_delete ON couple_pairings;
CREATE POLICY cp_delete ON couple_pairings FOR DELETE
USING (public.is_clinician());

-- ============================================================================
-- PARTNER CHECK-INS — partners see each other's
-- ============================================================================

DROP POLICY IF EXISTS pc_select ON partner_checkins;
CREATE POLICY pc_select ON partner_checkins FOR SELECT
USING (
  user_id = auth.uid()
  OR public.is_partner_of(user_id)
  OR public.is_clinician()
  OR public.is_therapist_of(user_id)
);

DROP POLICY IF EXISTS pc_insert ON partner_checkins;
CREATE POLICY pc_insert ON partner_checkins FOR INSERT
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS pc_update ON partner_checkins;
CREATE POLICY pc_update ON partner_checkins FOR UPDATE
USING (user_id = auth.uid());

-- ============================================================================
-- REPAIR REQUESTS / APPRECIATIONS / CONFLICT PAUSES / SHARED GOALS
-- ============================================================================

DROP POLICY IF EXISTS rr_select ON repair_requests;
CREATE POLICY rr_select ON repair_requests FOR SELECT
USING (public.in_pairing(pairing_id) OR public.is_clinician());

DROP POLICY IF EXISTS rr_insert ON repair_requests;
CREATE POLICY rr_insert ON repair_requests FOR INSERT
WITH CHECK (from_user_id = auth.uid() AND public.in_pairing(pairing_id));

DROP POLICY IF EXISTS rr_update ON repair_requests;
CREATE POLICY rr_update ON repair_requests FOR UPDATE
USING (public.in_pairing(pairing_id));

DROP POLICY IF EXISTS appr_select ON appreciations;
CREATE POLICY appr_select ON appreciations FOR SELECT
USING (public.in_pairing(pairing_id) OR public.is_clinician());

DROP POLICY IF EXISTS appr_insert ON appreciations;
CREATE POLICY appr_insert ON appreciations FOR INSERT
WITH CHECK (from_user_id = auth.uid() AND public.in_pairing(pairing_id));

DROP POLICY IF EXISTS cps_select ON conflict_pauses;
CREATE POLICY cps_select ON conflict_pauses FOR SELECT
USING (public.in_pairing(pairing_id) OR public.is_clinician());

DROP POLICY IF EXISTS cps_insert ON conflict_pauses;
CREATE POLICY cps_insert ON conflict_pauses FOR INSERT
WITH CHECK (started_by = auth.uid() AND public.in_pairing(pairing_id));

DROP POLICY IF EXISTS cps_update ON conflict_pauses;
CREATE POLICY cps_update ON conflict_pauses FOR UPDATE
USING (public.in_pairing(pairing_id));

DROP POLICY IF EXISTS sg_select ON shared_goals;
CREATE POLICY sg_select ON shared_goals FOR SELECT
USING (public.in_pairing(pairing_id) OR public.is_clinician());

DROP POLICY IF EXISTS sg_write ON shared_goals;
CREATE POLICY sg_write ON shared_goals FOR ALL
USING (public.in_pairing(pairing_id) OR public.is_clinician())
WITH CHECK (public.in_pairing(pairing_id) OR public.is_clinician());

-- ============================================================================
-- THERAPIST NOTES
-- Therapist always sees own notes. Client sees only non-private notes about
-- themselves. Parent of a minor client sees notes too. Admin sees all.
-- ============================================================================

DROP POLICY IF EXISTS tn_select ON therapist_notes;
CREATE POLICY tn_select ON therapist_notes FOR SELECT
USING (
  therapist_id = auth.uid()
  OR (client_id = auth.uid() AND NOT is_private)
  OR public.is_parent_of(client_id)
  OR public.current_role() = 'admin'
);

DROP POLICY IF EXISTS tn_write ON therapist_notes;
CREATE POLICY tn_write ON therapist_notes FOR ALL
USING (therapist_id = auth.uid() OR public.current_role() = 'admin')
WITH CHECK (therapist_id = auth.uid() OR public.current_role() = 'admin');

-- ============================================================================
-- NOTIFICATIONS — own only
-- ============================================================================

DROP POLICY IF EXISTS notif_select ON notifications;
CREATE POLICY notif_select ON notifications FOR SELECT
USING (user_id = auth.uid());

DROP POLICY IF EXISTS notif_insert ON notifications;
CREATE POLICY notif_insert ON notifications FOR INSERT
WITH CHECK (public.is_clinician() OR user_id = auth.uid());

DROP POLICY IF EXISTS notif_update ON notifications;
CREATE POLICY notif_update ON notifications FOR UPDATE
USING (user_id = auth.uid());

-- ============================================================================
-- BADGES — earned by self; visible to self + caregivers
-- ============================================================================

DROP POLICY IF EXISTS badges_select ON badges;
CREATE POLICY badges_select ON badges FOR SELECT
USING (
  user_id = auth.uid()
  OR public.is_parent_of(user_id)
  OR public.is_therapist_of(user_id)
  OR public.is_clinician()
);

DROP POLICY IF EXISTS badges_insert ON badges;
CREATE POLICY badges_insert ON badges FOR INSERT
WITH CHECK (user_id = auth.uid() OR public.is_clinician());
