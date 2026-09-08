-- 007_storage.sql
-- Storage Buckets & Policies for Nila Thozhan

-- 1. Create Buckets if not existing
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('land-documents', 'land-documents', false, 52428800, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/tiff']),
    ('processed-documents', 'processed-documents', false, 52428800, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']),
    ('generated-reports', 'generated-reports', false, 52428800, ARRAY['application/pdf', 'text/csv', 'application/json'])
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Storage Policies for land-documents bucket
CREATE POLICY "Authenticated users can upload land documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'land-documents' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can read their own or authorized documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'land-documents'
    AND (
        (storage.foldername(name))[1] = auth.uid()::text
        OR public.get_current_user_role() IN ('OFFICER', 'HIGH_AUTHORITY')
    )
);

CREATE POLICY "Users can update their own documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'land-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'land-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Storage Policies for processed-documents & generated-reports
CREATE POLICY "Officers and High Authority can access processed documents"
ON storage.objects FOR ALL
TO authenticated
USING (
    bucket_id IN ('processed-documents', 'generated-reports')
    AND public.get_current_user_role() IN ('OFFICER', 'HIGH_AUTHORITY')
)
WITH CHECK (
    bucket_id IN ('processed-documents', 'generated-reports')
    AND public.get_current_user_role() IN ('OFFICER', 'HIGH_AUTHORITY')
);
