-- Fix: Allow authenticated users to insert their own profile row
-- This is needed so the cart API can upsert a profile before inserting into donation_cart
-- (prevents "violates foreign key constraint donation_cart_user_id_fkey")

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polname = 'Users can insert own profile'
    AND polrelid = 'profiles'::regclass
  ) THEN
    CREATE POLICY "Users can insert own profile"
      ON profiles FOR INSERT
      TO authenticated
      WITH CHECK (id = auth.uid());
  END IF;
END$$;

-- Backfill: Create missing profile rows for existing auth users
-- Run this once to fix users who signed up before the trigger was in place
INSERT INTO public.profiles (id, full_name, created_at)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data->>'full_name', u.email),
  u.created_at
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
);
