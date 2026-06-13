-- ============================================================================
-- Clinical Therapy Companion — 0006 Client Resources
-- Run order: 6 of N  (after 0005_admin_helpers.sql)
--
-- Adds a join table for "I as therapist assigned this resource to this client".
-- Allows the therapist to attach a personalized note per assignment.
-- ============================================================================

CREATE TABLE IF NOT EXISTS client_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id    uuid NOT NULL REFERENCES profiles(id)  ON DELETE CASCADE,
  resource_id  uuid NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  assigned_by  uuid REFERENCES profiles(id),
  note         text,
  assigned_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, resource_id)
);

CREATE INDEX IF NOT EXISTS cr_client_idx  ON client_resources(client_id);
CREATE INDEX IF NOT EXISTS cr_resource_idx ON client_resources(resource_id);

ALTER TABLE client_resources ENABLE ROW LEVEL SECURITY;

-- Read: the client themselves, the parents of a minor client, the assigning
-- therapist or any clinician
DROP POLICY IF EXISTS cr_select ON client_resources;
CREATE POLICY cr_select ON client_resources FOR SELECT
USING (
  client_id = auth.uid()
  OR assigned_by = auth.uid()
  OR public.is_parent_of(client_id)
  OR public.is_clinician()
);

-- Write: clinicians only
DROP POLICY IF EXISTS cr_insert ON client_resources;
CREATE POLICY cr_insert ON client_resources FOR INSERT
WITH CHECK (public.is_clinician());

DROP POLICY IF EXISTS cr_update ON client_resources;
CREATE POLICY cr_update ON client_resources FOR UPDATE
USING (public.is_clinician());

DROP POLICY IF EXISTS cr_delete ON client_resources;
CREATE POLICY cr_delete ON client_resources FOR DELETE
USING (public.is_clinician());
