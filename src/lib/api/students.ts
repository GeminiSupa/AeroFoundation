import { supabase, getSupabaseAdmin } from '../supabaseClient';
import { formatSupabaseError } from './errorFormat';

export interface StudentData {
  id: string;
  roll_number: string;
  class_id?: string;
  section?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  parent_id?: string;
  admission_date: string;
  status: 'active' | 'inactive' | 'graduated';
  profile?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
}

export async function getStudents(): Promise<{ success: true; data: any[] } | { success: false; error: string }> {
  try {
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        profile:profiles!students_id_fkey(id, full_name, email, avatar_url),
        parent:profiles!students_parent_id_fkey(id, full_name, email, phone)
      `);

    if (error) throw error;
    const list = (data || []).map((row: any) => ({
      ...row,
      // class_name was derived from classes; we now avoid the join to prevent RLS recursion
      class_name: row.class_name ?? null,
      parent_name: row.parent?.full_name ?? null,
      parent_phone: row.parent?.phone ?? null,
    }));
    return { success: true, data: list };
  } catch (err: any) {
    const msg = formatSupabaseError(err);
    console.error('getStudents error:', msg);
    return { success: false, error: msg || 'Failed to fetch students' };
  }
}

export async function getStudent(id: string): Promise<{ success: true; data: any } | { success: false; error: string }> {
  try {
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        profile:profiles(id, full_name, email, avatar_url)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return { success: true, data: data! };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to fetch student' };
  }
}

export async function createStudent(student: Partial<StudentData>) {
  const { data, error } = await supabase
    .from('students')
    .insert(student)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateStudent(id: string, updates: Partial<StudentData>) {
  const { data, error } = await supabase
    .from('students')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Upsert a student record (insert or update by id). Used for CSV import. */
export async function upsertStudent(row: Partial<StudentData>): Promise<{ success: true; data: any } | { success: false; error: string }> {
  try {
    const supabaseAdmin = getSupabaseAdmin() as any;
    const { data, error } = await supabaseAdmin
      .from('students')
      .upsert(
        {
          id: row.id,
          roll_number: row.roll_number ?? '',
          class_id: row.class_id || null,
          section: row.section || null,
          date_of_birth: row.date_of_birth || null,
          gender: row.gender || null,
          parent_id: row.parent_id || null,
          admission_date: row.admission_date || new Date().toISOString(),
          status: row.status ?? 'active',
        },
        { onConflict: 'id' }
      )
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: data! };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to upsert student' };
  }
}

export async function deleteStudent(id: string) {
  const { error } = await supabase
    .from('students')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function linkParentToStudent(studentId: string, parentId: string | null) {
  const { data, error } = await supabase
    .from('students')
    .update({ parent_id: parentId })
    .eq('id', studentId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getChildrenForParent(parentId: string) {
  const { data, error } = await supabase
    .from('students')
    .select(`
      *,
      profile:profiles(id, full_name, email, avatar_url),
      class:classes(id, section_code, subject:subjects(name, code))
    `)
    .eq('parent_id', parentId);

  if (error) throw error;
  const list = data || [];
  return list.map((row: any) => ({
    ...row,
    class: row.class
      ? { ...row.class, name: row.class.subject?.name || row.class.subject?.code, section: row.class.section_code }
      : null,
  }));
}
