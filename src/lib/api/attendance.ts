import { supabase } from '../supabaseClient';
import { writeAuditLog } from './auditlogs';

export interface AttendanceRecord {
  id?: string;
  attendance_date: string;
  class_id: string;
  student_id: string;
  status: 'present' | 'absent' | 'late';
  taken_by_teacher_id?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AttendanceReportRow {
  id: string;
  attendance_date: string;
  status: 'present' | 'absent' | 'late';
  class_name: string;
  class_section?: string;
  class_room?: string;
  student_id: string;
  roll_number: string;
  student_name: string;
  student_email: string;
  teacher_name: string;
  notes?: string;
  created_at: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Get students for a specific class
 */
export async function getStudentsForClass(classId: string): Promise<ApiResponse<any[]>> {
  try {
    const { data, error } = await supabase
      .from('students')
      .select(`
        id,
        roll_number,
        section,
        status,
        profile:profiles(id, full_name, email, avatar_url)
      `)
      .eq('class_id', classId)
      .eq('status', 'active')
      .order('roll_number', { ascending: true });

    if (error) throw error;

    return {
      success: true,
      data: data || [],
    };
  } catch (error: any) {
    console.error('Error fetching students for class:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch students',
    };
  }
}

/**
 * Submit attendance records (upsert to handle updates)
 */
export async function submitAttendance(records: AttendanceRecord[]): Promise<ApiResponse<AttendanceRecord[]>> {
  try {
    if (!records || records.length === 0) {
      return {
        success: false,
        error: 'No attendance records provided',
      };
    }

    // Prepare records for upsert (include updated_at for each)
    const recordsWithTimestamp = records.map(record => ({
      ...record,
      updated_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from('attendance_records')
      .upsert(recordsWithTimestamp, {
        onConflict: 'attendance_date,class_id,student_id',
      })
      .select();

    if (error) throw error;

    // Write audit log
    const actor = (await supabase.auth.getUser()).data.user;
    if (actor && records.length > 0) {
      writeAuditLog({
        actor_id: actor.id,
        actor_name: actor.email || null,
        action: 'submit_attendance',
        entity: 'attendance_records',
        entity_id: records[0].class_id,
        details: { 
          count: records.length,
          date: records[0].attendance_date,
        },
      } as any);
    }

    return {
      success: true,
      data: data || [],
      message: `Attendance submitted for ${records.length} students`,
    };
  } catch (error: any) {
    console.error('Error submitting attendance:', error);
    return {
      success: false,
      error: error.message || 'Failed to submit attendance',
    };
  }
}

/**
 * Get attendance report with filters (admin view)
 */
export async function getAttendanceReport(filters?: {
  startDate?: string;
  endDate?: string;
  classId?: string;
  studentId?: string;
}): Promise<ApiResponse<AttendanceReportRow[]>> {
  try {
    let query = supabase
      .from('admin_attendance_report')
      .select('*')
      .order('attendance_date', { ascending: false });

    if (filters?.startDate) {
      query = query.gte('attendance_date', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('attendance_date', filters.endDate);
    }

    if (filters?.classId) {
      query = query.eq('class_id', filters.classId);
    }

    if (filters?.studentId) {
      query = query.eq('student_id', filters.studentId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return {
      success: true,
      data: data || [],
    };
  } catch (error: any) {
    console.error('Error fetching attendance report:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch attendance report',
    };
  }
}

/**
 * Get attendance for a specific student
 */
export async function getStudentAttendance(studentId: string, startDate?: string, endDate?: string): Promise<ApiResponse<AttendanceRecord[]>> {
  try {
    let query = supabase
      .from('attendance_records')
      .select('*')
      .eq('student_id', studentId)
      .order('attendance_date', { ascending: false });

    if (startDate) {
      query = query.gte('attendance_date', startDate);
    }

    if (endDate) {
      query = query.lte('attendance_date', endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    return {
      success: true,
      data: data || [],
    };
  } catch (error: any) {
    console.error('Error fetching student attendance:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch student attendance',
    };
  }
}

/**
 * Get attendance for a specific class on a specific date
 */
export async function getClassAttendanceForDate(classId: string, date: string): Promise<ApiResponse<AttendanceRecord[]>> {
  try {
    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('class_id', classId)
      .eq('attendance_date', date)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    return {
      success: true,
      data: data || [],
    };
  } catch (error: any) {
    console.error('Error fetching class attendance:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch class attendance',
    };
  }
}
