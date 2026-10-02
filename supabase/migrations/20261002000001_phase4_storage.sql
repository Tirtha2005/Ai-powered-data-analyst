-- Phase 4: Supabase Storage Bucket and RLS Policies

-- 1. CREATE PRIVATE BUCKET FOR DATASETS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'datasets',
  'datasets',
  false,
  104857600, -- 100MB limit
  ARRAY['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/octet-stream', 'text/plain']
)
ON CONFLICT (id) DO NOTHING;

-- 2. STORAGE RLS POLICIES FOR 'datasets' BUCKET

-- INSERT Policy: Authenticated users can upload to their own folder (folder name matches auth.uid())
DROP POLICY IF EXISTS "Authenticated users can upload own datasets" ON storage.objects;
CREATE POLICY "Authenticated users can upload own datasets"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'datasets' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- SELECT Policy: Authenticated users can view/download their own dataset files
DROP POLICY IF EXISTS "Authenticated users can view own datasets" ON storage.objects;
CREATE POLICY "Authenticated users can view own datasets"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'datasets' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- UPDATE Policy: Authenticated users can update their own dataset files
DROP POLICY IF EXISTS "Authenticated users can update own datasets" ON storage.objects;
CREATE POLICY "Authenticated users can update own datasets"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'datasets' AND
    (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'datasets' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- DELETE Policy: Authenticated users can delete their own dataset files
DROP POLICY IF EXISTS "Authenticated users can delete own datasets" ON storage.objects;
CREATE POLICY "Authenticated users can delete own datasets"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'datasets' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
