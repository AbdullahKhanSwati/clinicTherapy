-- ============================================================================
-- Clinical Therapy Companion — 0007 Fill Content Columns
-- Run order: 7 of N  (after 0006_client_resources.sql)
--
-- Adds columns the CreateContentScreen form collected but used to drop:
--   - affirmations.category   text
--   - coping_tools.duration   text
--   - resources.content       text
--   - resources.category      text
--   - therapist_notes.category text   (so AddNote stops smuggling it in body)
-- ============================================================================

ALTER TABLE affirmations
  ADD COLUMN IF NOT EXISTS category text;

ALTER TABLE coping_tools
  ADD COLUMN IF NOT EXISTS duration text;

ALTER TABLE resources
  ADD COLUMN IF NOT EXISTS content  text,
  ADD COLUMN IF NOT EXISTS category text;

ALTER TABLE therapist_notes
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'note';
