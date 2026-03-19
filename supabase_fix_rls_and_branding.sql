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

-- Ensure helper exists (idempotent)
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'owner', 'super_admin')
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

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
-- Finance pages require: students + profiles directory + fee_payments + payroll.
-- =====================================================

-- Profiles directory (needed for dropdowns + joins)
DO $$
BEGIN
  IF to_regclass('public.profiles') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated can view profiles directory" ON public.profiles';
    EXECUTE 'CREATE POLICY "Authenticated can view profiles directory" ON public.profiles FOR SELECT TO authenticated USING (true)';
  END IF;
END $$;

-- Fee structures / payments / payroll policies (idempotent; only if tables exist)
DO $$
BEGIN
  IF to_regclass('public.fee_structures') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "fee_structures_read" ON public.fee_structures';
    EXECUTE 'CREATE POLICY "fee_structures_read" ON public.fee_structures FOR SELECT TO authenticated USING (true)';
    EXECUTE 'DROP POLICY IF EXISTS "fee_structures_admin" ON public.fee_structures';
    EXECUTE 'CREATE POLICY "fee_structures_admin" ON public.fee_structures FOR ALL USING (public.is_admin_user())';
  END IF;

  IF to_regclass('public.fee_payments') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "fee_payments_read" ON public.fee_payments';
    EXECUTE ''CREATE POLICY "fee_payments_read" ON public.fee_payments FOR SELECT USING (
      public.is_admin_user()
      OR paid_by = auth.uid()
      OR student_id IN (
        SELECT id FROM public.students
        WHERE id = auth.uid() OR parent_id = auth.uid()
      )
    )'';
    EXECUTE 'DROP POLICY IF EXISTS "fee_payments_admin" ON public.fee_payments';
    EXECUTE 'CREATE POLICY "fee_payments_admin" ON public.fee_payments FOR ALL USING (public.is_admin_user())';
  END IF;

  IF to_regclass('public.payroll') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "payroll_own" ON public.payroll';
    EXECUTE 'CREATE POLICY "payroll_own" ON public.payroll FOR SELECT USING (employee_id = auth.uid())';
    EXECUTE 'DROP POLICY IF EXISTS "payroll_admin" ON public.payroll';
    EXECUTE 'CREATE POLICY "payroll_admin" ON public.payroll FOR ALL USING (public.is_admin_user())';
  END IF;
END $$;

SELECT 'All fixes applied successfully!' AS status;
