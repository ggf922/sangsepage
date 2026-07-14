-- ============================================================
-- SangSePage - Storage Buckets Setup
-- ============================================================

-- 상품 이미지 버킷 (사용자가 업로드한 원본 이미지)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  TRUE,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- AI 생성 이미지 버킷
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'generated-images',
  'generated-images',
  TRUE,
  20971520, -- 20MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 템플릿 썸네일 버킷 (관리자만 업로드)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'template-thumbnails',
  'template-thumbnails',
  TRUE,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============ Storage RLS Policies ============

-- product-images: 본인 폴더만 업로드/삭제, 모두 조회 가능 (public)
DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;
CREATE POLICY "Anyone can view product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Users can upload own product images" ON storage.objects;
CREATE POLICY "Users can upload own product images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can delete own product images" ON storage.objects;
CREATE POLICY "Users can delete own product images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can update own product images" ON storage.objects;
CREATE POLICY "Users can update own product images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'product-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- generated-images: 본인 폴더만 업로드/삭제, 모두 조회 가능
DROP POLICY IF EXISTS "Anyone can view generated images" ON storage.objects;
CREATE POLICY "Anyone can view generated images" ON storage.objects
  FOR SELECT USING (bucket_id = 'generated-images');

DROP POLICY IF EXISTS "Users can upload own generated images" ON storage.objects;
CREATE POLICY "Users can upload own generated images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'generated-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can delete own generated images" ON storage.objects;
CREATE POLICY "Users can delete own generated images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'generated-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- template-thumbnails: 모두 조회, 관리자만 업로드/수정/삭제
DROP POLICY IF EXISTS "Anyone can view template thumbnails" ON storage.objects;
CREATE POLICY "Anyone can view template thumbnails" ON storage.objects
  FOR SELECT USING (bucket_id = 'template-thumbnails');

DROP POLICY IF EXISTS "Only admins manage template thumbnails" ON storage.objects;
CREATE POLICY "Only admins manage template thumbnails" ON storage.objects
  FOR ALL USING (
    bucket_id = 'template-thumbnails'
    AND EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );
