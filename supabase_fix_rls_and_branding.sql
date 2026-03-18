-- =====================================================
-- FIX 1: RLS Infinite Recursion on Students Table
-- The "classes_read" policy references students, and students references classes,
-- causing infinite recursion. Drop the conflicting policy.
-- =====================================================

DO $$
BEGIN
  IF to_regclass('public.classes') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "classes_read" ON public.classes';
  END IF;
END $$;
-- "Anyone can view classes" (line 748 of original schema) already provides 
-- authenticated SELECT access without referencing students.

-- =====================================================
-- FIX 2: Add Admin DELETE/INSERT/UPDATE policies on students
-- The original schema only has SELECT policies for students.
-- Admin needs full CRUD.
-- =====================================================

DROP POLICY IF EXISTS "Admins manage students" ON public.students;
CREATE POLICY "Admins manage students" ON public.students 
  FOR ALL USING (public.is_admin_user());

-- =====================================================
-- FIX 3: Add Admin DELETE/INSERT/UPDATE policies on teachers
-- Same pattern - ensure admin has full access.
-- =====================================================

DROP POLICY IF EXISTS "Admins manage teachers" ON public.teachers;
CREATE POLICY "Admins manage teachers" ON public.teachers 
  FOR ALL USING (public.is_admin_user());

DROP POLICY IF EXISTS "Teachers view own profile" ON public.teachers;
CREATE POLICY "Teachers view own profile" ON public.teachers 
  FOR SELECT USING (id = auth.uid());

-- =====================================================
-- FIX 4: Fix Logo Upload - Create "branding" storage bucket with proper policies
-- This fixes the "row-level security policy" error on logo upload.
-- =====================================================

-- Create the storage bucket (idempotent)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'branding', 
  'branding', 
  true,         -- public bucket so logos are accessible
  5242880,      -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

-- Allow authenticated admin users to upload logos
DROP POLICY IF EXISTS "Admins can upload branding" ON storage.objects;
CREATE POLICY "Admins can upload branding" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'branding' 
    AND auth.role() = 'authenticated'
    AND public.is_admin_user()
  );

-- Allow authenticated admin users to update logos
DROP POLICY IF EXISTS "Admins can update branding" ON storage.objects;
CREATE POLICY "Admins can update branding" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'branding' 
    AND auth.role() = 'authenticated'
    AND public.is_admin_user()
  );

-- Allow public read access to branding assets (logos)
DROP POLICY IF EXISTS "Public can view branding" ON storage.objects;
CREATE POLICY "Public can view branding" ON storage.objects
  FOR SELECT USING (bucket_id = 'branding');

-- Allow admins to delete branding assets
DROP POLICY IF EXISTS "Admins can delete branding" ON storage.objects;
CREATE POLICY "Admins can delete branding" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'branding'
    AND auth.role() = 'authenticated'
    AND public.is_admin_user()
  );

-- =====================================================
-- FIX 5: Ensure fee_payments and payroll have proper admin read access
-- These should already work through existing policies, but let's be explicit.
-- =====================================================

-- fee_payments: Already has "fee_payments_read" and "fee_payments_admin" 
-- payroll: Already has "payroll_admin"
-- No changes needed here; the RLS policies are fine.
-- The issue is likely that fee_payments joins students which has the recursion bug.
-- Fix 1 above resolves this.

SELECT 'All fixes applied successfully!' AS status;
