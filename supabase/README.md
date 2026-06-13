# Supabase Backend

Schema, RLS policies and seed data for the Clinical Therapy Companion app.

## Files

| Order | File | Purpose |
|-------|------|---------|
| 1 | `migrations/0001_schema.sql` | All tables, enums, indexes, foreign keys |
| 2 | `migrations/0002_triggers.sql` | `updated_at` triggers, auto-profile on signup, RLS helper functions |
| 3 | `migrations/0003_rls.sql` | Row Level Security policies for every table |
| 4 | `migrations/0004_seed.sql` | Starter affirmations / coping tools / resources / worksheets |
| 5 | `migrations/0005_admin_helpers.sql` | `set_user_role`, `pair_couple`, `link_parent_child`, `assign_therapist_clients` |
| 6 | `migrations/0006_client_resources.sql` | Per-client resource assignments table + RLS |

Run them **in numeric order**. Each file is idempotent — re-running is safe.

## How to apply

### Option A — Paste in the Supabase SQL Editor (simplest)

1. Open https://supabase.com/dashboard/project/zbkeojfcwclminguaxnl/sql/new
2. Open `migrations/0001_schema.sql` locally, copy the whole file
3. Paste into the editor, click **Run**
4. Wait for "Success. No rows returned"
5. Repeat for `0002_triggers.sql`, `0003_rls.sql`, `0004_seed.sql`

### Option B — Supabase CLI (versioned, recommended once you're comfortable)

```bash
npm install -g supabase
supabase login
supabase link --project-ref zbkeojfcwclminguaxnl
supabase db push
```

The CLI tracks which migrations have been applied and only runs new ones.

## Verification

After applying all four files, run this in the SQL editor to confirm:

```sql
-- Should return ~20 tables
SELECT count(*) FROM pg_tables WHERE schemaname = 'public';

-- Should return some affirmations / coping tools / worksheets
SELECT count(*) FROM affirmations;
SELECT count(*) FROM coping_tools;
SELECT count(*) FROM worksheets;

-- Confirm RLS is on every table (should be empty)
SELECT tablename FROM pg_tables
WHERE schemaname = 'public' AND rowsecurity = false;
```

## After migrations: rotate the service_role key

The service_role key has full DB access and bypasses RLS. Rotate it once
migrations are in:

1. Open https://supabase.com/dashboard/project/zbkeojfcwclminguaxnl/settings/api-keys
2. Use the **Disable JWT-based API keys** flow, OR generate new "Publishable + Secret" keys
3. Update any local scripts that used the old key

The **anon key** (used by the mobile app) does not need rotation — RLS protects the data.

## Auth notes

- Sign-up uses email + password (`supabase.auth.signUp`)
- Pass `options.data` with `name`, `role`, `age`, `avatar`, etc. — the
  `handle_new_user` trigger reads it and creates the matching `profiles` row
- Every child/teen is its own auth user (Option A from project decisions)
- The app's RegisterScreen offers only four roles: **child / teen / partner / parent**.
  Therapists and admins are created by the database admin only (see below).

## Creating a therapist or admin account

Therapists and admins cannot self-register. Create them in two steps:

### Step 1 — create the auth user

1. Open https://supabase.com/dashboard/project/zbkeojfcwclminguaxnl/auth/users
2. Click **Add user → Create new user**
3. Enter email + password
4. (Optional) Tick **Auto Confirm User** so they can log in immediately

This creates an `auth.users` row. The `handle_new_user` trigger fires and inserts
a matching `profiles` row with `role = 'child'` by default.

### Step 2 — promote to therapist or admin

Open the SQL Editor and run:

```sql
SELECT public.set_user_role('dr.smith@clinic.com', 'therapist', 'Dr. Smith');
SELECT public.set_user_role('owner@clinic.com',    'admin',     'Site Admin');
```

The function is idempotent. The user can now log in via the app and will be
routed to the therapist / admin dashboard.

## Common admin operations (SQL Editor)

```sql
-- Pair two couples-role users
SELECT public.pair_couple('john@example.com', 'sarah@example.com');

-- Link a parent to a child / teen
SELECT public.link_parent_child('maria@example.com', 'sophie@example.com');

-- Assign multiple clients to a therapist
SELECT public.assign_therapist_clients(
  'dr.smith@clinic.com',
  ARRAY['sophie@example.com', 'alex@example.com', 'maria@example.com']
);

-- See every account by role
SELECT id, email, name, role, created_at
FROM profiles ORDER BY role, created_at DESC;
```

## RLS at a glance

| Who | Can read |
|-----|----------|
| User | Own profile, own mood/journal/worksheets, partner's couples-sync data |
| Parent | Own kids' profiles, mood entries, worksheet assignments — **not** journals |
| Therapist | All assigned clients' data including journals |
| Admin | Everything |

Children's **journal_entries** are intentionally not visible to parents — clinical privacy.
