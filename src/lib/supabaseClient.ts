import { createClient } from '@supabase/supabase-js';

function cleanEnv(v: string | undefined) {
  return (v || '').trim().replace(/^["']|["']$/g, '');
}

// Next.js: client-exposed env must be NEXT_PUBLIC_*
// We also accept legacy VITE_* so local .env can transition smoothly.
const rawUrl = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL);
const rawAnon = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY);

// Service role must NEVER be exposed to the browser.
const rawService = cleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

const supabaseUrl = rawUrl || '';
const supabaseAnonKey = rawAnon || '';
const serviceRoleKey = rawService || '';

if (typeof window !== 'undefined') {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      '[Supabase] Missing env. In .env.local set:\n  NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co\n  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key\nRestart the dev server after editing .env.local.'
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

let _supabaseAdmin: ReturnType<typeof createClient> | null = null;

/**
 * Server-only admin client (service role).
 * IMPORTANT: never call this from the browser.
 */
export function getSupabaseAdmin() {
  if (typeof window !== 'undefined') {
    throw new Error('getSupabaseAdmin() is server-only');
  }
  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY (server-only env var)');
  }
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return _supabaseAdmin;
}

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
