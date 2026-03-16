import { createClient } from '@supabase/supabase-js';

// Single source of truth: .env.local in project root. Variable names MUST start with VITE_ for Vite to expose them.
// Restart the dev server (npm run dev) after any change to .env.local.
const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim().replace(/^["']|["']$/g, '');
const rawAnon = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim().replace(/^["']|["']$/g, '');
const rawService = (import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '').trim().replace(/^["']|["']$/g, '');

const supabaseUrl = rawUrl || '';
const supabaseAnonKey = rawAnon || '';
const serviceRoleKey = rawService || '';

if (typeof window !== 'undefined') {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      '[Supabase] Missing env. In .env.local (project root) set:\n  VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co\n  VITE_SUPABASE_ANON_KEY=your_anon_key\nNames must start with VITE_. Restart the dev server after editing .env.local.'
    );
  } else if (!supabaseUrl.includes('ilmdsuplyjwfbgnhcejh') && supabaseUrl.includes('.supabase.co')) {
    console.warn('[Supabase] URL is for a different project. To use ilmdsuplyjwfbgnhcejh, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local for that project, then restart.');
  }
}

// Create a singleton Supabase client for client-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Admin client with service role (bypasses RLS) - ONLY use for admin operations
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Helper function to get the current user session
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error getting session:', error);
    return null;
  }
  return session;
}

// Helper function to get the current user
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting user:', error);
    return null;
  }
  return user;
}

// Helper function to sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}
