-- ============================================================================
-- Clinical Therapy Companion — 0008 Profile Accessory
-- Run order: 8 of N  (after 0007_fill_content_columns.sql)
--
-- Adds an `accessory` column to profiles so the avatar customizer can persist
-- the user's chosen accessory (crown / star / heart / sparkles / etc.).
-- ============================================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS accessory text;
