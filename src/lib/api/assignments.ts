import type { Assignment, AssignmentFormData, ApiResponse } from '../../types';
import { supabase } from '../supabaseClient';
import { writeAuditLog } from './auditlogs';

/**
 * Get all assignments for a teacher
 */
export async function getTeacherAssignments(teacherId: string): Promise<ApiResponse<Assignment[]>> {
  try {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    const mapped: Assignment[] = (data || []).map((a: any) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      classId: a.class_id,
      className: a.class_name,
      teacherId: a.teacher_id,
      teacherName: a.teacher_name,
      subject: a.subject,
      dueDate: a.due_date,
      maxScore: a.max_score,
      createdAt: a.created_at,
      status: a.status,
    }));
    return { success: true, data: mapped };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch assignments',
    };
  }
}

/**
 * Get all assignments for a student
 */
export async function getStudentAssignments(studentId: string): Promise<ApiResponse<Assignment[]>> {
  try {
    // Assignments are tied to classes. For a student, fetch active enrollments then pull published assignments.
    const { data: enrollments, error: enrollErr } = await supabase
      .from('class_enrollments')
      .select('class_id')
      .eq('student_id', studentId)
      .eq('status', 'active');
    if (enrollErr) throw enrollErr;

    const classIds = (enrollments || []).map((e: any) => e.class_id).filter(Boolean);
    if (classIds.length === 0) return { success: true, data: [] };

    const { data, error } = await supabase
      .from('assignments')
      .select(`
        *,
        class:classes(id, section_code, subject:subjects(name, code)),
        creator:profiles!assignments_created_by_fkey(id, full_name)
      `)
      .in('class_id', classIds)
      .eq('status', 'published')
      .order('due_date', { ascending: true, nullsFirst: false });
    if (error) throw error;

    const mapped: Assignment[] = (data || []).map((a: any) => {
      const subjectName = a.class?.subject?.name || a.class?.subject?.code || 'Assignment';
      const classLabel = a.class ? [subjectName, a.class.section_code].filter(Boolean).join(' ') : 'Class';
      return {
        id: a.id,
        title: a.title,
        description: a.description || '',
        classId: a.class_id,
        className: classLabel,
        teacherId: a.created_by || a.creator?.id || '',
        teacherName: a.creator?.full_name || 'Teacher',
        subject: subjectName,
        dueDate: a.due_date || '',
        maxScore: a.total_points ?? 0,
        createdAt: a.created_at,
        status: a.status,
      };
    });
    return { success: true, data: mapped };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch assignments',
    };
  }
}

/**
 * Create a new assignment (Teacher only)
 */
export async function createAssignment(data: AssignmentFormData): Promise<ApiResponse<Assignment>> {
  try {
    const payload = {
      title: data.title,
      description: data.description,
      class_id: data.classId,
      subject: data.subject,
      due_date: data.dueDate,
      max_score: data.maxScore,
      status: 'assigned',
    } as any;
    const { data: inserted, error } = await supabase
      .from('assignments')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    const mapped: Assignment = {
      id: inserted.id,
      title: inserted.title,
      description: inserted.description,
      classId: inserted.class_id,
      className: inserted.class_name,
      teacherId: inserted.teacher_id,
      teacherName: inserted.teacher_name,
      subject: inserted.subject,
      dueDate: inserted.due_date,
      maxScore: inserted.max_score,
      createdAt: inserted.created_at,
      status: inserted.status,
    };
    const actor = (await supabase.auth.getUser()).data.user;
    writeAuditLog({
      actor_id: actor?.id || null,
      actor_name: actor?.email || null,
      action: 'create_assignment',
      entity: 'assignment',
      entity_id: inserted.id,
      details: { title: inserted.title, class_id: inserted.class_id },
    } as any);
    return { success: true, data: mapped, message: 'Assignment created successfully' };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to create assignment',
    };
  }
}

/**
 * Update an assignment (Teacher only)
 */
export async function updateAssignment(
  id: string,
  data: Partial<AssignmentFormData>
): Promise<ApiResponse<Assignment>> {
  try {
    const updates: any = {
      ...(data.title && { title: data.title }),
      ...(data.description && { description: data.description }),
      ...(data.classId && { class_id: data.classId }),
      ...(data.subject && { subject: data.subject }),
      ...(data.dueDate && { due_date: data.dueDate }),
      ...(typeof data.maxScore !== 'undefined' && { max_score: data.maxScore }),
    };
    const { data: updated, error } = await supabase
      .from('assignments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    const mapped: Assignment = {
      id: updated.id,
      title: updated.title,
      description: updated.description,
      classId: updated.class_id,
      className: updated.class_name,
      teacherId: updated.teacher_id,
      teacherName: updated.teacher_name,
      subject: updated.subject,
      dueDate: updated.due_date,
      maxScore: updated.max_score,
      createdAt: updated.created_at,
      status: updated.status,
    };
    return { success: true, data: mapped, message: 'Assignment updated successfully' };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to update assignment',
    };
  }
}

/**
 * Delete an assignment (Teacher only)
 */
export async function deleteAssignment(id: string): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase
      .from('assignments')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { success: true, message: 'Assignment deleted successfully' };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to delete assignment',
    };
  }
}

/**
 * Get assignment by ID
 */
export async function getAssignmentById(id: string): Promise<ApiResponse<Assignment>> {
  try {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    const mapped: Assignment = {
      id: data.id,
      title: data.title,
      description: data.description,
      classId: data.class_id,
      className: data.class_name,
      teacherId: data.teacher_id,
      teacherName: data.teacher_name,
      subject: data.subject,
      dueDate: data.due_date,
      maxScore: data.max_score,
      createdAt: data.created_at,
      status: data.status,
    };
    return { success: true, data: mapped };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch assignment',
    };
  }
}
