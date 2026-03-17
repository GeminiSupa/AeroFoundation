import { supabase, getSupabaseAdmin } from '../supabaseClient';
import type { UserRole } from '../../types';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: UserRole;
  phone?: string;
  address?: string;
  date_of_birth?: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  full_name: string;
  role: 'admin' | 'teacher' | 'student' | 'parent';
  phone?: string;
  address?: string;
  additional_data?: any;
}

/**
 * Create a new user with profile and role-specific data.
 * Inserts into allowed_users first so the trigger can set profile.role; then creates auth user.
 */
export async function createUser(data: CreateUserData) {
  try {
    const supabaseAdmin = getSupabaseAdmin() as any;
    // Step 1: Ensure email is in allowed_users so handle_new_user trigger can set role
    const { error: rpcError } = await supabase.rpc('add_allowed_user', {
      p_email: data.email.trim().toLowerCase(),
      p_role: data.role,
    });
    if (rpcError) throw rpcError;

    // Step 2: Create auth user (admin API via service role, avoids switching current session)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        full_name: data.full_name,
      },
    } as any);

    if (authError) {
      // Supabase email rate limit check - give a user friendly message
      if (
        authError.message?.toLowerCase().includes('rate limit') ||
        authError.message?.toLowerCase().includes('email rate') ||
        (authError as any)?.status === 429
      ) {
        throw new Error('Email sending limit reached. You can still create the account — the user can log in with their password without needing to verify email. Please wait a few minutes before adding more users, or disable email confirmation in your Supabase dashboard.');
      }
      throw authError;
    }
    const createdUser = (authData as any)?.user ?? (authData as any);
    if (!createdUser?.id) throw new Error('User creation failed');

    // Step 3: Wait for profile to be created by trigger
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Step 3b: Update profile with phone and address if provided
    if (data.phone || data.address) {
      const profileUpdates: Record<string, string> = {};
      if (data.phone) profileUpdates['phone'] = data.phone;
      if (data.address) profileUpdates['address'] = data.address;
      await supabaseAdmin.from('profiles').update(profileUpdates).eq('id', createdUser.id);
    }

    // Step 4: Create role-specific records if needed
    if (data.role === 'student' && data.additional_data) {
      const studentData = data.additional_data;
      const { error: studentError } = await supabaseAdmin
        .from('students')
        .insert({
          id: createdUser.id, // Link to the profile
          roll_number: studentData.roll_number,
          class_id: studentData.class_id,
          section: studentData.section,
          date_of_birth: studentData.date_of_birth,
          gender: studentData.gender,
          parent_id: studentData.parent_id,
          status: 'active',
        });

      if (studentError) throw studentError;
    }

    if (data.role === 'teacher' && data.additional_data) {
      const teacherData = data.additional_data;
      const { error: teacherError } = await supabaseAdmin
        .from('teachers')
        .insert({
          id: createdUser.id, // Link to the profile
          employee_id: teacherData.employee_id,
          department: teacherData.department,
          subject: teacherData.subject,
          qualification: teacherData.qualification,
          experience: teacherData.experience,
          phone: data.phone,
          date_of_joining: new Date().toISOString(),
          salary: teacherData.salary,
          status: 'active',
        });

      if (teacherError) throw teacherError;
    }

    return { success: true, user: createdUser, data: createdUser };
  } catch (error: any) {
    console.error('Error creating user:', error);
    return { success: false, error: error.message, user: null, data: null };
  }
}

/**
 * Get all users with their profiles
 */
export async function getUsers(role?: string) {
  try {
    let query = supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (role) {
      query = query.eq('role', role);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Get user by ID
 */
export async function getUser(id: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Update user profile
 */
export async function updateUser(id: string, updates: Partial<UserProfile>) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Deactivate user (soft delete)
 */
export async function deactivateUser(id: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Delete user (alias for deactivateUser for backward compatibility)
 */
export async function deleteUser(id: string) {
  try {
    const supabaseAdmin = getSupabaseAdmin() as any;
    // Hard delete the auth user; cascades to profiles (and students/teachers) via FK.
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (error) throw error;
    return { success: true, data: null };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Get parents only
 */
export async function getParents() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'parent')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
