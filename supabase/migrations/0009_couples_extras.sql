-- ============================================================================
-- 0009 — Couples-sync extras.
--
-- Adds the small columns the client-side couples flows need:
--   1. appreciations.type    — categorises an appreciation as one of
--      'appreciation' | 'memory' | 'quality' | 'thank_you'. Stored as plain
--      text so the UI can add more types without a schema change.
--   2. conflict_pauses.return_note — free text written by the partner when
--      they emerge from a pause (what they felt + what they need now).
-- ============================================================================

ALTER TABLE appreciations
  ADD COLUMN IF NOT EXISTS type text;

ALTER TABLE conflict_pauses
  ADD COLUMN IF NOT EXISTS return_note text;
