-- Create storage buckets and policies for file uploads
-- Run this in the Supabase SQL editor

-- ============================================
-- PAYMENT RECEIPTS BUCKET
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-receipts',
  'payment-receipts',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to payment-receipts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polname = 'Authenticated users can upload receipts'
    AND polrelid = 'storage.objects'::regclass
  ) THEN
    CREATE POLICY "Authenticated users can upload receipts"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'payment-receipts');
  END IF;
END$$;

-- Allow public read of payment-receipts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polname = 'Public can view receipts'
    AND polrelid = 'storage.objects'::regclass
  ) THEN
    CREATE POLICY "Public can view receipts"
      ON storage.objects FOR SELECT
      TO public
      USING (bucket_id = 'payment-receipts');
  END IF;
END$$;

-- Allow users to delete their own receipts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polname = 'Users can delete own receipts'
    AND polrelid = 'storage.objects'::regclass
  ) THEN
    CREATE POLICY "Users can delete own receipts"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (bucket_id = 'payment-receipts' AND owner = auth.uid());
  END IF;
END$$;

-- ============================================
-- PROJECT IMAGES BUCKET
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-images',
  'project-images',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated admins/nonprofit admins to upload project images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polname = 'Authenticated users can upload project images'
    AND polrelid = 'storage.objects'::regclass
  ) THEN
    CREATE POLICY "Authenticated users can upload project images"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'project-images');
  END IF;
END$$;

-- Allow public read of project images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polname = 'Public can view project images'
    AND polrelid = 'storage.objects'::regclass
  ) THEN
    CREATE POLICY "Public can view project images"
      ON storage.objects FOR SELECT
      TO public
      USING (bucket_id = 'project-images');
  END IF;
END$$;
