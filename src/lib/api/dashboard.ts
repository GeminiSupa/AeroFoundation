import { supabase } from '../supabaseClient';

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  attendanceRate: number;
  aiInsights: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Get admin dashboard statistics
 */
export async function getAdminDashboardStats(): Promise<ApiResponse<DashboardStats>> {
  try {
    // Get total students count (from students table, not profiles)
    const { count: studentsCount } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true });

    // Get total teachers count (from profiles where role = 'teacher')
    const { count: teachersCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'teacher');

    // Calculate attendance rate (from attendance records)
    // This is a simplified calculation - you might want to make it more sophisticated
    const { data: attendanceData } = await supabase
      .from('attendance_records')
      .select('status');

    let totalDays = 0;
    let presentDays = 0;
    if (attendanceData) {
      totalDays = attendanceData.length;
      presentDays = attendanceData.filter(a => a.status === 'present').length;
    }
    const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100 * 10) / 10 : 0;

    // For now, AI insights count is mock data
    // You can integrate with actual AI insights table when available
    const aiInsights = 0;

    const stats: DashboardStats = {
      totalStudents: studentsCount || 0,
      totalTeachers: teachersCount || 0,
      attendanceRate,
      aiInsights,
    };

    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      success: false,
      error: 'Failed to fetch dashboard statistics',
    };
  }
}

/**
 * Get teacher dashboard statistics
 */
export interface TeacherDashboardStats {
  todaysClasses: number;
  pendingGrading: number;
  activeAssignments: number;
}

export async function getTeacherDashboardStats(teacherId: string): Promise<ApiResponse<TeacherDashboardStats>> {
  try {
    // Count today's classes (class_schedules view has day_of_week: 0=Sun, 6=Sat)
    const todayDayOfWeek = new Date().getDay();
    const { count: todaysClassesCount } = await supabase
      .from('class_schedules')
      .select('*', { count: 'exact', head: true })
      .eq('teacher_id', teacherId)
      .eq('day_of_week', todayDayOfWeek);

    // Count pending grading submissions
    const { count: pendingGradingCount } = await supabase
      .from('assignment_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'submitted');

    // Count active assignments (assignments have class_id; teacher via classes.teacher_id)
    const { data: teacherClassIds } = await supabase.from('classes').select('id').eq('teacher_id', teacherId);
    const ids = (teacherClassIds || []).map((c: { id: string }) => c.id);
    const { count: activeAssignmentsCount } = ids.length > 0
      ? await supabase.from('assignments').select('*', { count: 'exact', head: true }).in('class_id', ids).gte('due_date', new Date().toISOString())
      : { count: 0 };

    const stats: TeacherDashboardStats = {
      todaysClasses: todaysClassesCount || 0,
      pendingGrading: pendingGradingCount || 0,
      activeAssignments: activeAssignmentsCount || 0,
    };

    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    console.error('Error fetching teacher dashboard stats:', error);
    return {
      success: false,
      error: 'Failed to fetch teacher dashboard statistics',
    };
  }
}

export interface TeacherTodayClass {
  id: string;
  subject: string;
  classLabel: string;
  timeRange: string;
  room: string | null;
}

/**
 * Get today's classes for a teacher with basic display fields.
 */
export async function getTeacherTodayClasses(teacherId: string): Promise<ApiResponse<TeacherTodayClass[]>> {
  try {
    const todayDayOfWeek = new Date().getDay();
    const { data, error } = await supabase
      .from('class_schedules')
      .select(`
        id,
        day_of_week,
        start_time,
        end_time,
        room,
        class:classes(
          id,
          section_code,
          subject:subjects(name, code)
        )
      `)
      .eq('teacher_id', teacherId)
      .eq('day_of_week', todayDayOfWeek)
      .order('start_time', { ascending: true });

    if (error) throw error;

    const rows: TeacherTodayClass[] = (data || []).map((item: any) => {
      const subjectName = item.class?.subject?.name || item.class?.subject?.code || 'Class';
      const section = item.class?.section_code || '';
      const classLabel = [subjectName, section].filter(Boolean).join(' ');
      const start = item.start_time ?? '';
      const end = item.end_time ?? '';
      return {
        id: item.id,
        subject: subjectName,
        classLabel,
        timeRange: start && end ? `${start} - ${end}` : start || end || '',
        room: item.room ?? null,
      };
    });

    return { success: true, data: rows };
  } catch (error: any) {
    console.error('Error fetching teacher today classes:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch today classes',
    };
  }
}

/**
 * Get student dashboard statistics
 */
export interface StudentDashboardStats {
  pendingAssignments: number;
  pendingGrades: number;
  attendancePercentage: number;
}

export async function getStudentDashboardStats(studentId: string): Promise<ApiResponse<StudentDashboardStats>> {
  try {
    // Count pending assignments (published assignments in student's active classes)
    const today = new Date().toISOString();
    const { data: enrollments, error: enrollErr } = await supabase
      .from('class_enrollments')
      .select('class_id')
      .eq('student_id', studentId)
      .eq('status', 'active');
    if (enrollErr) throw enrollErr;

    const classIds = (enrollments || []).map((e: any) => e.class_id).filter(Boolean);
    const { count: pendingAssignmentsCount } = classIds.length > 0
      ? await supabase
          .from('assignments')
          .select('*', { count: 'exact', head: true })
          .in('class_id', classIds)
          .eq('status', 'published')
          .gte('due_date', today)
      : { count: 0 };

    // Count pending grades
    const { count: pendingGradesCount } = await supabase
      .from('assignment_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', studentId)
      .eq('status', 'submitted');

    // Calculate attendance percentage
    const { data: attendanceData } = await supabase
      .from('attendance_records')
      .select('status')
      .eq('student_id', studentId);

    let attendancePercentage = 100;
    if (attendanceData && attendanceData.length > 0) {
      const presentDays = attendanceData.filter(a => a.status === 'present').length;
      attendancePercentage = Math.round((presentDays / attendanceData.length) * 100);
    }

    const stats: StudentDashboardStats = {
      pendingAssignments: pendingAssignmentsCount || 0,
      pendingGrades: pendingGradesCount || 0,
      attendancePercentage,
    };

    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    console.error('Error fetching student dashboard stats:', error);
    return {
      success: false,
      error: 'Failed to fetch student dashboard statistics',
    };
  }
}

export async function getStudentAverageGrade(studentId: string): Promise<ApiResponse<number>> {
  try {
    const { data, error } = await supabase
      .from('grades')
      .select('percentage')
      .eq('student_id', studentId)
      .not('percentage', 'is', null);
    if (error) throw error;

    const rows = (data || []).map((r: any) => Number(r.percentage)).filter((n: number) => Number.isFinite(n));
    const avg = rows.length > 0 ? Math.round(rows.reduce((a: number, b: number) => a + b, 0) / rows.length) : 0;
    return { success: true, data: avg };
  } catch (error: any) {
    console.error('Error fetching student average grade:', error);
    return { success: false, error: error?.message || 'Failed to fetch student average grade' };
  }
}

/**
 * Get parent dashboard statistics
 */
export interface ParentDashboardStats {
  childrenCount: number;
  unpaidFees: number;
  attendanceAlerts: number;
}

export async function getParentDashboardStats(parentId: string): Promise<ApiResponse<ParentDashboardStats>> {
  try {
    // Count children
    const { count: childrenCount } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('parent_id', parentId);

    // Count unpaid fees
    const { count: unpaidFeesCount } = await supabase
      .from('fee_payments')
      .select('*', { count: 'exact', head: true })
      .eq('parent_id', parentId)
      .eq('status', 'unpaid');

    // Count attendance alerts (students with low attendance)
    // This is a simplified version - you might want to make it more sophisticated
    const attendanceAlerts = 0; // TODO: Implement proper logic

    const stats: ParentDashboardStats = {
      childrenCount: childrenCount || 0,
      unpaidFees: unpaidFeesCount || 0,
      attendanceAlerts,
    };

    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    console.error('Error fetching parent dashboard stats:', error);
    return {
      success: false,
      error: 'Failed to fetch parent dashboard statistics',
    };
  }
}

