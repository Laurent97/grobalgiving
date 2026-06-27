-- Fix: Allow authenticated users to insert donations (needed by /api/donations/initiate)
-- The donations table has RLS enabled but had no INSERT policy, causing 500 errors.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polname = 'Authenticated users can insert donations'
    AND polrelid = 'donations'::regclass
  ) THEN
    CREATE POLICY "Authenticated users can insert donations"
      ON donations FOR INSERT
      TO authenticated
      WITH CHECK (donor_id = auth.uid() OR donor_id IS NULL);
  END IF;
END$$;
