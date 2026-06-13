-- ============================================================================
-- Clinical Therapy Companion — 0005 Admin Helpers
-- Run order: 5 of N  (after 0004_seed.sql)
--
-- Helpers for the admin to create / promote privileged accounts directly
-- from the SQL Editor. These cannot be done from the mobile app because
-- therapists and admins are not self-registerable.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- set_user_role(email, new_role, new_name?)
--
-- After creating an auth user in the dashboard (Auth → Users → Add user),
-- run this to promote them to therapist or admin and set a display name.
--
--   SELECT public.set_user_role('dr.smith@clinic.com', 'therapist', 'Dr. Smith');
--   SELECT public.set_user_role('owner@clinic.com',    'admin',     'Site Admin');
--
-- Idempotent — safe to call repeatedly.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_user_role(
  _email     text,
  _new_role  user_role,
  _new_name  text DEFAULT NULL
)
RETURNS TABLE (
  out_id    uuid,
  out_email text,
  out_name  text,
  out_role  user_role
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid;
BEGIN
  SELECT u.id INTO _uid
  FROM auth.users u
  WHERE lower(u.email) = lower(_email);

  IF _uid IS NULL THEN
    RAISE EXCEPTION
      'No auth user found for email %. Create them first in Auth → Users → Add user.',
      _email;
  END IF;

  -- Ensure a profile row exists (defensive — trigger should have made one)
  INSERT INTO public.profiles AS p (id, email, name, role)
  VALUES (_uid, _email, COALESCE(_new_name, split_part(_email, '@', 1)), _new_role)
  ON CONFLICT (id) DO UPDATE
    SET role = EXCLUDED.role,
        name = COALESCE(EXCLUDED.name, p.name);

  RETURN QUERY
    SELECT p.id, p.email, p.name, p.role
    FROM public.profiles p
    WHERE p.id = _uid;
END;
$$;

-- ----------------------------------------------------------------------------
-- create_user_with_role(email, password, role, name?)
--
-- Create an auth user + matching profiles row in one SQL call. Use this when
-- you don't want to click through the Auth → Users dashboard for therapists,
-- admins, or any seeded account.
--
--   SELECT public.create_user_with_role(
--     'dr.smith@clinic.com',   -- email
--     'StrongPassword123!',    -- plaintext password (bcrypt-hashed by us)
--     'therapist',             -- role enum
--     'Dr. Smith'              -- optional display name
--   );
--
-- The returned uuid is the new user.id. Email is auto-confirmed so the user
-- can sign in immediately via the app.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_user_with_role(
  _email     text,
  _password  text,
  _role      user_role,
  _name      text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  _uid          uuid := gen_random_uuid();
  _now          timestamptz := now();
  _display_name text := COALESCE(_name, split_part(_email, '@', 1));
  _email_lower  text := lower(_email);
BEGIN
  IF EXISTS (SELECT 1 FROM auth.users u WHERE lower(u.email) = _email_lower) THEN
    RAISE EXCEPTION 'A user with email % already exists.', _email;
  END IF;

  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    _uid,
    'authenticated',
    'authenticated',
    _email_lower,
    crypt(_password, gen_salt('bf')),
    _now,
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('name', _display_name, 'role', _role::text),
    _now, _now,
    '', '', '', ''
  );

  INSERT INTO auth.identities (
    id, user_id, provider, provider_id, identity_data,
    last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    _uid,
    'email',
    _uid::text,
    jsonb_build_object(
      'sub',            _uid::text,
      'email',          _email_lower,
      'email_verified', true,
      'provider',       'email'
    ),
    _now, _now, _now
  );

  UPDATE public.profiles
  SET role = _role,
      name = _display_name,
      email = _email_lower
  WHERE id = _uid;

  RETURN _uid;
END;
$$;

-- ----------------------------------------------------------------------------
-- assign_therapist_clients(therapist_email, client_emails[])
--
-- Bulk-link a therapist to one or more clients in a single call.
--   SELECT public.assign_therapist_clients(
--     'dr.smith@clinic.com',
--     ARRAY['sophie@example.com','maria@example.com']
--   );
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.assign_therapist_clients(
  _therapist_email text,
  _client_emails   text[]
)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _t_id uuid;
  _c_id uuid;
  _client_email text;
  _added int := 0;
BEGIN
  SELECT id INTO _t_id FROM public.profiles
   WHERE lower(email) = lower(_therapist_email)
     AND role IN ('therapist', 'admin');

  IF _t_id IS NULL THEN
    RAISE EXCEPTION 'No therapist/admin found for email %', _therapist_email;
  END IF;

  FOREACH _client_email IN ARRAY _client_emails LOOP
    SELECT id INTO _c_id FROM public.profiles
     WHERE lower(email) = lower(_client_email);

    IF _c_id IS NOT NULL THEN
      INSERT INTO public.therapist_clients (therapist_id, client_id)
      VALUES (_t_id, _c_id)
      ON CONFLICT (therapist_id, client_id) DO NOTHING;
      _added := _added + 1;
    END IF;
  END LOOP;

  RETURN _added;
END;
$$;

-- ----------------------------------------------------------------------------
-- link_parent_child(parent_email, child_email)
--
-- Convenience: link a parent to a child (or teen) by email.
--   SELECT public.link_parent_child('maria@example.com','sophie@example.com');
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.link_parent_child(
  _parent_email text,
  _child_email  text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _p_id uuid;
  _c_id uuid;
  _link_id uuid;
BEGIN
  SELECT id INTO _p_id FROM public.profiles
   WHERE lower(email) = lower(_parent_email) AND role = 'family';
  IF _p_id IS NULL THEN
    RAISE EXCEPTION 'No parent (role=family) with email %', _parent_email;
  END IF;

  SELECT id INTO _c_id FROM public.profiles
   WHERE lower(email) = lower(_child_email) AND role IN ('child', 'teen');
  IF _c_id IS NULL THEN
    RAISE EXCEPTION 'No child/teen with email %', _child_email;
  END IF;

  INSERT INTO public.parent_child_links (parent_id, child_id)
  VALUES (_p_id, _c_id)
  ON CONFLICT (parent_id, child_id) DO UPDATE SET parent_id = EXCLUDED.parent_id
  RETURNING id INTO _link_id;

  RETURN _link_id;
END;
$$;

-- ----------------------------------------------------------------------------
-- pair_couple(partner_a_email, partner_b_email)
--
-- Convenience: link two couples-role accounts as an active pairing.
--   SELECT public.pair_couple('john@example.com','sarah@example.com');
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.pair_couple(
  _a_email text,
  _b_email text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _a_id uuid;
  _b_id uuid;
  _pairing_id uuid;
BEGIN
  SELECT id INTO _a_id FROM public.profiles
   WHERE lower(email) = lower(_a_email) AND role = 'couples';
  IF _a_id IS NULL THEN
    RAISE EXCEPTION 'No couples-role user for email %', _a_email;
  END IF;

  SELECT id INTO _b_id FROM public.profiles
   WHERE lower(email) = lower(_b_email) AND role = 'couples';
  IF _b_id IS NULL THEN
    RAISE EXCEPTION 'No couples-role user for email %', _b_email;
  END IF;

  -- Prevent duplicate active pairings for either partner
  IF EXISTS (
    SELECT 1 FROM public.couple_pairings
    WHERE status = 'active'
      AND (partner_a_id IN (_a_id, _b_id) OR partner_b_id IN (_a_id, _b_id))
  ) THEN
    RAISE EXCEPTION 'One of these users is already in an active pairing.';
  END IF;

  INSERT INTO public.couple_pairings
    (partner_a_id, partner_b_id, status, paired_at, created_by)
  VALUES
    (_a_id, _b_id, 'active', now(),
     (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1))
  RETURNING id INTO _pairing_id;

  RETURN _pairing_id;
END;
$$;
