-- =====================================================
-- FIX: "Cannot coerce the result to a single JSON object" 
-- This error occurs when a client uses .update().select().single() 
-- but the user lacks UPDATE policies (so 0 rows get updated)
-- or lacks SELECT policies on the updated row.
-- We ensure admins have full CRUD on core tables.
-- =====================================================

-- 1. Ensure Admins can fully manage profiles
DROP POLICY IF EXISTS "Admins manage profiles" ON public.profiles;
CREATE POLICY "Admins manage profiles" ON public.profiles 
  FOR ALL USING (public.is_admin_user());

-- 2. Ensure Admins can fully manage timetable_entries
DROP POLICY IF EXISTS "Admins manage timetable_entries" ON public.timetable_entries;
CREATE POLICY "Admins manage timetable_entries" ON public.timetable_entries 
  FOR ALL USING (public.is_admin_user());

-- 3. Ensure Admins can fully manage announcements
DROP POLICY IF EXISTS "Admins manage announcements" ON public.announcements;
CREATE POLICY "Admins manage announcements" ON public.announcements 
  FOR ALL USING (public.is_admin_user());

-- 4. Ensure Admins can fully manage subjects
DROP POLICY IF EXISTS "Admins manage subjects" ON public.subjects;
CREATE POLICY "Admins manage subjects" ON public.subjects 
  FOR ALL USING (public.is_admin_user());

-- 5. Ensure Admins can fully manage classes
DROP POLICY IF EXISTS "Admins manage classes" ON public.classes;
CREATE POLICY "Admins manage classes" ON public.classes 
  FOR ALL USING (public.is_admin_user());

SELECT 'JSON Coercion Fixes Applied!' as status;
