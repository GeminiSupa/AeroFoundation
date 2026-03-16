-- Fix: infinite recursion on "profiles" - policies must not SELECT from profiles inside a policy ON profiles.
-- Run this in Supabase SQL Editor if you already have the schema applied.

-- Ensure helper exists and bypasses RLS when used in policies
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'owner', 'super_admin'));
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- Replace policies that caused recursion (they were reading from profiles inside a policy on profiles)
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.is_admin_user());

DROP POLICY IF EXISTS "Admins manage allowed_users" ON public.allowed_users;
CREATE POLICY "Admins manage allowed_users" ON public.allowed_users FOR ALL USING (public.is_admin_user());
