import { supabase } from '../supabaseClient';
import type { UserProfile } from '../../types/index';
import type { UserRole } from '../../types';

interface LoginFormData {
  email: string;
  password: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Sign in with email and password
 */
export async function signIn(data: LoginFormData): Promise<ApiResponse<UserProfile>> {
  try {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Fetch user profile from database (same project – uses anon key + RLS)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return {
        success: false,
        error: profileError.code === 'PGRST116'
          ? 'Profile not found. Please contact administrator.'
          : profileError.message || 'Could not load profile.',
      };
    }
    if (!profile) {
      return {
        success: false,
        error: 'Profile not found. Please contact administrator.',
      };
    }

    const userProfile: UserProfile = {
      id: profile.id,
      email: profile.email,
      name: profile.full_name || 'User',
      role: profile.role as any,
      avatar: profile.avatar_url,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
      children: [],
    };

    return {
      success: true,
      data: userProfile,
      message: 'Signed in successfully',
    };
  } catch (error: any) {
    const msg = error?.message || 'An unexpected error occurred during sign in';
    // "Failed to fetch" usually means wrong Supabase URL/key or network/CORS
    if (typeof msg === 'string' && msg.toLowerCase().includes('failed to fetch')) {
      return {
        success: false,
        error: 'Cannot reach server. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local (Supabase Dashboard > Settings > API), then restart the dev server.',
      };
    }
    return {
      success: false,
      error: msg,
    };
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      message: 'Signed out successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: 'An unexpected error occurred during sign out',
    };
  }
}

/**
 * Get the current user profile
 */
export async function getCurrentUserProfile(): Promise<ApiResponse<UserProfile>> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    // Fetch complete profile from database
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return {
        success: false,
        error: 'Profile not found',
      };
    }

    const userProfile: UserProfile = {
      id: profile.id,
      email: profile.email,
      name: profile.full_name || 'User',
      role: profile.role as any,
      avatar: profile.avatar_url,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
      children: [],
    };

    return {
      success: true,
      data: userProfile,
    };
  } catch (error: any) {
    const msg = error?.message || 'Failed to fetch user profile';
    if (typeof msg === 'string' && msg.toLowerCase().includes('failed to fetch')) {
      return {
        success: false,
        error: 'Cannot reach server. Check .env.local: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
      };
    }
    return {
      success: false,
      error: msg,
    };
  }
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email: string): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      message: 'Password reset email sent',
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to send password reset email',
    };
  }
}
