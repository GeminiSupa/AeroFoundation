import type { ApiResponse } from '../../types/index';
import { supabase } from '../supabaseClient';
import { writeAuditLog } from './auditlogs';

interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  content: string;
  attachments?: string[];
  submittedAt: string;
  grade?: number;
  feedback?: string;
  status: 'pending' | 'submitted' | 'graded';
}

/**
 * Submit an assignment (Student only)
 */
export async function submitAssignment(data: {
  assignmentId: string;
  studentId: string;
  content: string;
  attachments?: File[];
}): Promise<ApiResponse<Submission>> {
  try {
    const payload: any = {
      assignment_id: data.assignmentId,
      student_id: data.studentId,
      content: data.content,
      submitted_at: new Date().toISOString(),
      status: 'submitted',
    };
    const { data: inserted, error } = await supabase
      .from('submissions')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    const mapped: Submission = {
      id: inserted.id,
      assignmentId: inserted.assignment_id,
      studentId: inserted.student_id,
      studentName: inserted.student_name || '-',
      content: inserted.content,
      submittedAt: inserted.submitted_at,
      grade: inserted.grade || undefined,
      feedback: inserted.feedback || undefined,
      status: inserted.grade ? 'graded' : 'pending',
    };
    // audit log best-effort
    const actor = (await supabase.auth.getUser()).data.user;
    writeAuditLog({
      actor_id: actor?.id || null,
      actor_name: actor?.email || null,
      action: 'submit_assignment',
      entity: 'submission',
      entity_id: mapped.id,
      details: { assignment_id: mapped.assignmentId },
    } as any);
    return { success: true, data: mapped, message: 'Assignment submitted successfully' };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to submit assignment',
    };
  }
}

/**
 * Get submissions for an assignment (Teacher only)
 */
export async function getAssignmentSubmissions(assignmentId: string): Promise<ApiResponse<Submission[]>> {
  try {
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('assignment_id', assignmentId)
      .order('submitted_at', { ascending: false });
    if (error) throw error;
    const rows = data || [];
    const mapped: Submission[] = rows.map((s: any) => ({
      id: s.id,
      assignmentId: s.assignment_id,
      studentId: s.student_id,
      studentName: s.student_name || '-',
      content: s.content,
      submittedAt: s.submitted_at,
      grade: s.grade || undefined,
      feedback: s.feedback || undefined,
      status: (s.grade ? 'graded' : 'pending') as 'graded' | 'pending',
    }));
    return { success: true, data: mapped };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch submissions',
    };
  }
}

/**
 * Get student's submission for an assignment
 */
export async function getStudentSubmission(
  assignmentId: string,
  studentId: string
): Promise<ApiResponse<Submission | null>> {
  try {
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('assignment_id', assignmentId)
      .eq('student_id', studentId)
      .maybeSingle();
    if (error) throw error;
    if (!data) return { success: true, data: null };
    const mapped: Submission = {
      id: data.id,
      assignmentId: data.assignment_id,
      studentId: data.student_id,
      studentName: data.student_name || '-',
      content: data.content,
      submittedAt: data.submitted_at,
      grade: data.grade || undefined,
      feedback: data.feedback || undefined,
      status: data.grade ? 'graded' : 'pending',
    };
    return { success: true, data: mapped };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch submission',
    };
  }
}

/**
 * Grade a submission (Teacher only)
 */
export async function gradeSubmission(data: {
  submissionId: string;
  grade: number;
  feedback?: string;
}): Promise<ApiResponse<Submission>> {
  try {
    const { data: updated, error } = await supabase
      .from('submissions')
      .update({ grade: data.grade, feedback: data.feedback, graded_at: new Date().toISOString() })
      .eq('id', data.submissionId)
      .select()
      .single();
    if (error) throw error;
    const mapped: Submission = {
      id: updated.id,
      assignmentId: updated.assignment_id,
      studentId: updated.student_id,
      studentName: updated.student_name || '-',
      content: updated.content,
      submittedAt: updated.submitted_at,
      grade: updated.grade || undefined,
      feedback: updated.feedback || undefined,
      status: updated.grade ? 'graded' : 'pending',
    };
    // audit log best-effort
    const actor = (await supabase.auth.getUser()).data.user;
    writeAuditLog({
      actor_id: actor?.id || null,
      actor_name: actor?.email || null,
      action: 'grade_submission',
      entity: 'submission',
      entity_id: mapped.id,
      details: { grade: mapped.grade },
    } as any);
    return { success: true, data: mapped, message: 'Submission graded successfully' };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to grade submission',
    };
  }
}
