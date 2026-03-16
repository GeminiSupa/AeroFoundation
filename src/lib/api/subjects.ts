import { supabase } from '../supabaseClient';
import { writeAuditLog } from './auditlogs';

export interface SubjectData {
  id: string;
  name: string;
  code?: string;
  department?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Get all subjects
 */
export async function getSubjects(): Promise<ApiResponse<SubjectData[]>> {
  try {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    return {
      success: true,
      data: data || [],
    };
  } catch (error: any) {
    console.error('Error fetching subjects:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch subjects',
    };
  }
}

/**
 * Get a single subject by ID
 */
export async function getSubjectById(subjectId: string): Promise<ApiResponse<SubjectData>> {
  try {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('id', subjectId)
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error('Error fetching subject:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch subject',
    };
  }
}

/**
 * Create a new subject
 */
export async function createSubject(data: Partial<SubjectData>): Promise<ApiResponse<SubjectData>> {
  try {
    const { data: inserted, error } = await supabase
      .from('subjects')
      .insert({
        name: data.name,
        code: data.code || null,
        department: data.department || null,
      })
      .select()
      .single();

    if (error) throw error;

    // Write audit log
    const actor = (await supabase.auth.getUser()).data.user;
    if (actor) {
      writeAuditLog({
        actor_id: actor.id,
        actor_name: actor.email || null,
        action: 'create_subject',
        entity: 'subject',
        entity_id: inserted.id,
        details: { name: inserted.name, code: inserted.code },
      } as any);
    }

    return {
      success: true,
      data: inserted,
      message: 'Subject created successfully',
    };
  } catch (error: any) {
    console.error('Error creating subject:', error);
    return {
      success: false,
      error: error.message || 'Failed to create subject',
    };
  }
}

/**
 * Update a subject
 */
export async function updateSubject(
  subjectId: string,
  updates: Partial<SubjectData>
): Promise<ApiResponse<SubjectData>> {
  try {
    const { data: updated, error } = await supabase
      .from('subjects')
      .update({
        name: updates.name,
        code: updates.code,
        department: updates.department,
        updated_at: new Date().toISOString(),
      })
      .eq('id', subjectId)
      .select()
      .single();

    if (error) throw error;

    // Write audit log
    const actor = (await supabase.auth.getUser()).data.user;
    if (actor) {
      writeAuditLog({
        actor_id: actor.id,
        actor_name: actor.email || null,
        action: 'update_subject',
        entity: 'subject',
        entity_id: subjectId,
        details: { updates },
      } as any);
    }

    return {
      success: true,
      data: updated,
      message: 'Subject updated successfully',
    };
  } catch (error: any) {
    console.error('Error updating subject:', error);
    return {
      success: false,
      error: error.message || 'Failed to update subject',
    };
  }
}

/**
 * Delete a subject
 */
export async function deleteSubject(subjectId: string): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', subjectId);

    if (error) throw error;

    // Write audit log
    const actor = (await supabase.auth.getUser()).data.user;
    if (actor) {
      writeAuditLog({
        actor_id: actor.id,
        actor_name: actor.email || null,
        action: 'delete_subject',
        entity: 'subject',
        entity_id: subjectId,
        details: {},
      } as any);
    }

    return {
      success: true,
      message: 'Subject deleted successfully',
    };
  } catch (error: any) {
    console.error('Error deleting subject:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete subject',
    };
  }
}

