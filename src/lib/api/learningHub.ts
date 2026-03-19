import { supabase } from '../supabaseClient';
import type { UserRole } from '../../types';
import { formatSupabaseError } from './errorFormat';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// ====================================================
// UNIFIED LEARNING HUB API
// ====================================================
// Complete API for the unified class, scheduling, and academic management system

// Types
export interface AcademicSession {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'completed';
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  description?: string;
  color: string;
  department?: string;
  gradeLevel?: string;
  isActive: boolean;
}

export interface Class {
  id: string;
  subjectId: string;
  academicSessionId: string;
  sectionCode: string;
  teacherId?: string;
  roomNumber?: string;
  capacity: number;
  status: 'draft' | 'active' | 'cancelled' | 'completed';
  subject?: Subject;
  teacher?: { id: string; full_name: string; email: string };
  enrolledCount: number;
  scheduleSlots: ScheduleSlot[];
}

export interface ScheduleSlot {
  id: string;
  classId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  roomNumber?: string;
  recurrenceType: 'weekly' | 'biweekly' | 'once';
  isActive: boolean;
}

export interface ClassEnrollment {
  id: string;
  classId: string;
  studentId: string;
  enrollmentDate: string;
  status: 'active' | 'withdrawn' | 'completed';
  grade?: string;
  notes?: string;
  student?: { id: string; full_name: string; email: string; roll_number?: string };
}

export interface AttendanceRecord {
  id: string;
  classId: string;
  studentId: string;
  scheduleSlotId?: string;
  attendanceDate: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
  markedBy?: string;
}

export interface Assignment {
  id: string;
  classId: string;
  title: string;
  description?: string;
  type: 'homework' | 'quiz' | 'project' | 'exam' | 'other';
  dueDate?: string;
  totalPoints?: number;
  weight: number;
  status: 'draft' | 'published' | 'closed';
  createdBy: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  submittedAt?: string;
  content?: string;
  grade?: number;
  feedback?: string;
  status: 'submitted' | 'graded' | 'late' | 'missing';
}

export interface Grade {
  id: string;
  classId: string;
  studentId: string;
  assignmentId?: string;
  gradeType: 'assignment' | 'quiz' | 'exam' | 'participation' | 'final';
  score?: number;
  maxScore?: number;
  percentage?: number;
  comments?: string;
  gradedBy?: string;
  gradedAt?: string;
}

export interface ClassCommunication {
  id: string;
  classId: string;
  authorId: string;
  title: string;
  content: string;
  type: 'announcement' | 'reminder' | 'update' | 'alert';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  isPinned: boolean;
  expiresAt?: string;
  readBy: string[];
  author?: { id: string; full_name: string; email: string };
  createdAt: string;
}

export interface DashboardStats {
  totalClasses: number;
  currentClasses: number;
  attendanceRate: number;
  upcomingAssignments: number;
  averageGrade: number;
  activeEnrollments: number;
}

// ====================================================
// DASHBOARD & OVERVIEW
// ====================================================

export async function getLearningHubStats(userId: string, role: UserRole): Promise<ApiResponse<DashboardStats>> {
  try {
    let stats: DashboardStats = {
      totalClasses: 0,
      currentClasses: 0,
      attendanceRate: 0,
      upcomingAssignments: 0,
      averageGrade: 0,
      activeEnrollments: 0
    };

    // Determine role-scoped class/student visibility
    let scopedClassIds: string[] | null = null;
    let scopedStudentIds: string[] | null = null;

    if (role === 'teacher') {
      const { data: teacherClasses, error } = await supabase
        .from('classes')
        .select('id')
        .eq('teacher_id', userId)
        .eq('status', 'active');
      if (error) throw error;
      scopedClassIds = (teacherClasses || []).map((c: any) => c.id).filter(Boolean);
    } else if (role === 'student') {
      const { data: enrollments, error } = await supabase
        .from('class_enrollments')
        .select('class_id')
        .eq('student_id', userId)
        .eq('status', 'active');
      if (error) throw error;
      scopedClassIds = [...new Set((enrollments || []).map((e: any) => e.class_id).filter(Boolean))];
      scopedStudentIds = [userId];
    } else if (role === 'parent') {
      const { data: children, error } = await supabase
        .from('students')
        .select('id, class_id')
        .eq('parent_id', userId)
        .eq('status', 'active');
      if (error) throw error;
      scopedStudentIds = (children || []).map((s: any) => s.id).filter(Boolean);
      scopedClassIds = [...new Set((children || []).map((s: any) => s.class_id).filter(Boolean))];
    }

    // Get current time info
    const now = new Date();
    const currentDayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

    // Get active enrollments count
    const { count: enrollmentCount } =
      role === 'student'
        ? await supabase
            .from('class_enrollments')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active')
            .eq('student_id', userId)
        : role === 'teacher' && scopedClassIds
          ? (scopedClassIds.length > 0
              ? await supabase
                  .from('class_enrollments')
                  .select('*', { count: 'exact', head: true })
                  .eq('status', 'active')
                  .in('class_id', scopedClassIds)
              : { count: 0 })
          : role === 'parent' && scopedStudentIds
            ? (scopedStudentIds.length > 0
                ? await supabase
                    .from('class_enrollments')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'active')
                    .in('student_id', scopedStudentIds)
                : { count: 0 })
            : await supabase
                .from('class_enrollments')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'active');

    stats.activeEnrollments = enrollmentCount || 0;

    // Get classes based on role
    if (role === 'teacher' && scopedClassIds) {
      stats.totalClasses = scopedClassIds.length;
    } else if ((role === 'student' || role === 'parent') && scopedClassIds) {
      stats.totalClasses = scopedClassIds.length;
    } else {
      const { count: classCount } = await supabase
        .from('classes')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');
      stats.totalClasses = classCount || 0;
    }

    // Calculate current classes (happening right now)
    // For now, count schedule slots active at current time
    // This will be refined once we have proper schedule-slot to class relationships
    const { count: currentClassCount } = await supabase
      .from('schedule_slots')
      .select('*', { count: 'exact', head: true })
      .eq('day_of_week', currentDayOfWeek)
      .lte('start_time', currentTime)
      .gte('end_time', currentTime);

    stats.currentClasses = currentClassCount || 0;

    // Calculate attendance rate (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { count: presentCount } =
      role === 'student'
        ? await supabase
            .from('attendance_records')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'present')
            .eq('student_id', userId)
            .gte('attendance_date', thirtyDaysAgo)
        : role === 'teacher' && scopedClassIds
          ? (scopedClassIds.length > 0
              ? await supabase
                  .from('attendance_records')
                  .select('*', { count: 'exact', head: true })
                  .eq('status', 'present')
                  .in('class_id', scopedClassIds)
                  .gte('attendance_date', thirtyDaysAgo)
              : { count: 0 })
          : role === 'parent' && scopedStudentIds
            ? (scopedStudentIds.length > 0
                ? await supabase
                    .from('attendance_records')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'present')
                    .in('student_id', scopedStudentIds)
                    .gte('attendance_date', thirtyDaysAgo)
                : { count: 0 })
            : await supabase
                .from('attendance_records')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'present')
                .gte('attendance_date', thirtyDaysAgo);

    const { count: totalAttendanceCount } =
      role === 'student'
        ? await supabase
            .from('attendance_records')
            .select('*', { count: 'exact', head: true })
            .eq('student_id', userId)
            .gte('attendance_date', thirtyDaysAgo)
        : role === 'teacher' && scopedClassIds
          ? (scopedClassIds.length > 0
              ? await supabase
                  .from('attendance_records')
                  .select('*', { count: 'exact', head: true })
                  .in('class_id', scopedClassIds)
                  .gte('attendance_date', thirtyDaysAgo)
              : { count: 0 })
          : role === 'parent' && scopedStudentIds
            ? (scopedStudentIds.length > 0
                ? await supabase
                    .from('attendance_records')
                    .select('*', { count: 'exact', head: true })
                    .in('student_id', scopedStudentIds)
                    .gte('attendance_date', thirtyDaysAgo)
                : { count: 0 })
            : await supabase
                .from('attendance_records')
                .select('*', { count: 'exact', head: true })
                .gte('attendance_date', thirtyDaysAgo);

    const totalAttendance = totalAttendanceCount ?? 0;
    stats.attendanceRate = totalAttendance > 0
      ? Math.round((presentCount || 0) / totalAttendance * 100)
      : 100;

    // Get upcoming assignments (next 7 days)
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const { count: upcomingAssignmentsCount } =
      scopedClassIds && (role === 'teacher' || role === 'student' || role === 'parent')
        ? (scopedClassIds.length > 0
            ? await supabase
                .from('assignments')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'published')
                .in('class_id', scopedClassIds)
                .lte('due_date', nextWeek)
                .gt('due_date', new Date().toISOString())
            : { count: 0 })
        : await supabase
            .from('assignments')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'published')
            .lte('due_date', nextWeek)
            .gt('due_date', new Date().toISOString());

    stats.upcomingAssignments = upcomingAssignmentsCount || 0;

    // Calculate average grade for student/parent
    if (role === 'student') {
      const { data: studentGrades } = await supabase
        .from('grades')
        .select('percentage')
        .eq('student_id', userId)
        .not('percentage', 'is', null);

      if (studentGrades && studentGrades.length > 0) {
        const total = studentGrades.reduce((sum, grade) => sum + (grade.percentage || 0), 0);
        stats.averageGrade = Math.round(total / studentGrades.length);
      }
    } else if (role === 'parent' && scopedStudentIds && scopedStudentIds.length > 0) {
      const { data: childrenGrades } = await supabase
        .from('grades')
        .select('percentage')
        .in('student_id', scopedStudentIds)
        .not('percentage', 'is', null);

      if (childrenGrades && childrenGrades.length > 0) {
        const total = childrenGrades.reduce((sum, grade) => sum + (grade.percentage || 0), 0);
        stats.averageGrade = Math.round(total / childrenGrades.length);
      }
    }

    return { success: true, data: stats };
  } catch (error: any) {
    console.error('getLearningHubStats error:', error);
    return { success: false, error: error?.message || 'Failed to load dashboard stats' };
  }
}

// ====================================================
// CLASSES MANAGEMENT
// ====================================================

export async function getClassesForUser(userId: string, role: UserRole): Promise<ApiResponse<Class[]>> {
  try {
    // First get classes based on role
    let classesQuery = supabase
      .from('classes')
      .select(`
        *,
        subject:subjects(*),
        teacher:profiles!classes_teacher_id_fkey(id, full_name, email)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    // Filter based on role
    if (role === 'teacher') {
      classesQuery = classesQuery.eq('teacher_id', userId);
    }

    const { data: classRows, error: classError } = await classesQuery;
    if (classError) throw classError;

    if (!classRows || classRows.length === 0) {
      return { success: true, data: [] };
    }

    // Get enrollments and schedule slots for these classes
    const classIds = classRows.map(c => c.id);

    const [enrollmentsResult, slotsResult] = await Promise.all([
      supabase
        .from('class_enrollments')
        .select('class_id, status')
        .in('class_id', classIds)
        .eq('status', 'active'),
      supabase
        .from('schedule_slots')
        .select('*')
        .in('class_id', classIds)
        .eq('is_active', true)
        .order('day_of_week')
    ]);

    // Group data by class
    const enrollmentsByClass = new Map<string, any[]>();
    const slotsByClass = new Map<string, ScheduleSlot[]>();

    if (enrollmentsResult.data) {
      enrollmentsResult.data.forEach(enrollment => {
        const list = enrollmentsByClass.get(enrollment.class_id) || [];
        list.push(enrollment);
        enrollmentsByClass.set(enrollment.class_id, list);
      });
    }

    if (slotsResult.data) {
      slotsResult.data.forEach(slot => {
        const list = slotsByClass.get(slot.class_id) || [];
        list.push(slot);
        slotsByClass.set(slot.class_id, list);
      });
    }

    // Build final class objects
    const classes: Class[] = classRows.map(row => ({
      id: row.id,
      subjectId: row.subject_id,
      academicSessionId: row.academic_session_id,
      sectionCode: row.section_code,
      teacherId: row.teacher_id,
      roomNumber: row.room_number,
      capacity: row.capacity,
      status: row.status,
      subject: row.subject,
      teacher: row.teacher,
      enrolledCount: enrollmentsByClass.get(row.id)?.length || 0,
      scheduleSlots: slotsByClass.get(row.id) || []
    }));

    // Additional filtering for students and parents
    let filteredClasses = classes;

    if (role === 'student') {
      const { data: studentEnrollments } = await supabase
        .from('class_enrollments')
        .select('class_id')
        .eq('student_id', userId)
        .eq('status', 'active');

      const enrolledClassIds = new Set(studentEnrollments?.map(e => e.class_id) || []);
      filteredClasses = classes.filter(cls => enrolledClassIds.has(cls.id));
    }

    if (role === 'parent') {
      // Get all children of this parent
      const { data: children } = await supabase
        .from('students')
        .select('id')
        .eq('parent_id', userId);

      if (children && children.length > 0) {
        const childIds = children.map(c => c.id);
        const { data: childEnrollments } = await supabase
          .from('class_enrollments')
          .select('class_id')
          .in('student_id', childIds)
          .eq('status', 'active');

        const enrolledClassIds = new Set(childEnrollments?.map(e => e.class_id) || []);
        filteredClasses = classes.filter(cls => enrolledClassIds.has(cls.id));
      } else {
        filteredClasses = [];
      }
    }

    return { success: true, data: filteredClasses };
  } catch (error: any) {
    const msg = formatSupabaseError(error);
    console.error('getClassesForUser error:', msg);
    return { success: false, error: msg || 'Failed to load classes' };
  }
}

// ====================================================
// SCHEDULE MANAGEMENT
// ====================================================

export async function getUserSchedule(userId: string, role: UserRole, date?: string): Promise<ApiResponse<any[]>> {
  try {
    const targetDate = date ? new Date(date) : new Date();
    const dayOfWeek = targetDate.getDay(); // 0 = Sunday, 6 = Saturday

    let scheduleQuery = supabase
      .from('schedule_slots')
      .select(`
        *,
        class:classes(
          id,
          section_code,
          room_number,
          subject:subjects(name, code, color),
          teacher:profiles!classes_teacher_id_fkey(full_name)
        )
      `)
      .eq('is_active', true)
      .eq('day_of_week', dayOfWeek);

    // Filter classes based on user role
    if (role === 'teacher') {
      scheduleQuery = scheduleQuery.eq('class.teacher_id', userId);
    } else if (role === 'student') {
      // Get classes where student is enrolled
      const { data: enrollments } = await supabase
        .from('class_enrollments')
        .select('class_id')
        .eq('student_id', userId)
        .eq('status', 'active');

      if (enrollments && enrollments.length > 0) {
        const classIds = enrollments.map(e => e.class_id);
        scheduleQuery = scheduleQuery.in('class_id', classIds);
      } else {
        return { success: true, data: [] };
      }
    } else if (role === 'parent') {
      // Get classes where parent's children are enrolled
      const { data: children } = await supabase
        .from('students')
        .select('id')
        .eq('parent_id', userId);

      if (children && children.length > 0) {
        const childIds = children.map(c => c.id);
        const { data: childEnrollments } = await supabase
          .from('class_enrollments')
          .select('class_id')
          .in('student_id', childIds)
          .eq('status', 'active');

        if (childEnrollments && childEnrollments.length > 0) {
          const classIds = childEnrollments.map(e => e.class_id);
          scheduleQuery = scheduleQuery.in('class_id', classIds);
        } else {
          return { success: true, data: [] };
        }
      } else {
        return { success: true, data: [] };
      }
    }

    const { data, error } = await scheduleQuery.order('start_time');
    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error: any) {
    const msg = formatSupabaseError(error);
    console.error('getUserSchedule error:', msg);
    return { success: false, error: msg || 'Failed to load schedule' };
  }
}

// ====================================================
// ASSIGNMENTS & GRADES
// ====================================================

export async function getUserAssignments(userId: string, role: UserRole): Promise<ApiResponse<Assignment[]>> {
  try {
    let assignmentsQuery = supabase
      .from('assignments')
      .select(`
        *,
        class:classes(
          section_code,
          subject:subjects(name, code)
        )
      `)
      .eq('status', 'published')
      .order('due_date', { ascending: true });

    // Filter based on role
    if (role === 'student') {
      // Get assignments for classes where student is enrolled
      const { data: enrollments } = await supabase
        .from('class_enrollments')
        .select('class_id')
        .eq('student_id', userId)
        .eq('status', 'active');

      if (enrollments && enrollments.length > 0) {
        const classIds = enrollments.map(e => e.class_id);
        assignmentsQuery = assignmentsQuery.in('class_id', classIds);
      } else {
        return { success: true, data: [] };
      }
    } else if (role === 'teacher') {
      // Get assignments created by this teacher
      assignmentsQuery = assignmentsQuery.eq('created_by', userId);
    }

    const { data, error } = await assignmentsQuery;
    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error: any) {
    const msg = formatSupabaseError(error);
    console.error('getUserAssignments error:', msg);
    return { success: false, error: msg || 'Failed to load assignments' };
  }
}

export async function getUserGrades(userId: string, role: UserRole): Promise<ApiResponse<Grade[]>> {
  try {
    let gradesQuery = supabase
      .from('grades')
      .select(`
        *,
        assignment:assignments(title),
        class:classes(
          section_code,
          subject:subjects(name, code)
        ),
        graded_by_profile:profiles!grades_graded_by_fkey(full_name)
      `)
      .order('graded_at', { ascending: false });

    if (role === 'student') {
      gradesQuery = gradesQuery.eq('student_id', userId);
    }

    const { data, error } = await gradesQuery.limit(50);
    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error: any) {
    const msg = formatSupabaseError(error);
    console.error('getUserGrades error:', msg);
    return { success: false, error: msg || 'Failed to load grades' };
  }
}

// ====================================================
// COMMUNICATIONS
// ====================================================

export async function getClassCommunications(userId: string, role: UserRole, classId?: string): Promise<ApiResponse<ClassCommunication[]>> {
  try {
    let commsQuery = supabase
      .from('class_communications')
      .select(`
        *,
        author:profiles!class_communications_author_id_fkey(id, full_name, email)
      `)
      .order('created_at', { ascending: false });

    // Filter based on role and access
    if (classId) {
      commsQuery = commsQuery.eq('class_id', classId);
    } else {
      // Get communications for classes the user has access to
      let classIds: string[] = [];

      if (role === 'teacher') {
        const { data: teacherClasses } = await supabase
          .from('classes')
          .select('id')
          .eq('teacher_id', userId)
          .eq('status', 'active');
        classIds = teacherClasses?.map(c => c.id) || [];
      } else if (role === 'student') {
        const { data: enrollments } = await supabase
          .from('class_enrollments')
          .select('class_id')
          .eq('student_id', userId)
          .eq('status', 'active');
        classIds = enrollments?.map(e => e.class_id) || [];
      } else if (role === 'parent') {
        const { data: children } = await supabase
          .from('students')
          .select('id')
          .eq('parent_id', userId);

        if (children && children.length > 0) {
          const childIds = children.map(c => c.id);
          const { data: childEnrollments } = await supabase
            .from('class_enrollments')
            .select('class_id')
            .in('student_id', childIds)
            .eq('status', 'active');
          classIds = childEnrollments?.map(e => e.class_id) || [];
        }
      }

      if (classIds.length > 0) {
        commsQuery = commsQuery.in('class_id', classIds);
      } else {
        return { success: true, data: [] };
      }
    }

    const { data, error } = await commsQuery.limit(50);
    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('getClassCommunications error:', error);
    return { success: false, error: error?.message || 'Failed to load communications' };
  }
}

// ====================================================
// ENROLLMENT MANAGEMENT
// ====================================================

// ====================================================
// STUDENT SEARCH (for enrollment)
// ====================================================

export async function searchStudents(term: string, excludeClassId?: string): Promise<ApiResponse<any[]>> {
  try {
    const trimmed = term?.trim() || '';
    if (!trimmed) return { success: true, data: [] };

    let query = supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('role', 'student')
      .ilike('full_name', `%${trimmed}%`)
      .limit(20);

    const { data: profiles, error: profileError } = await query;
    if (profileError) throw profileError;

    if (!profiles || profiles.length === 0) {
      return { success: true, data: [] };
    }

    // Get roll numbers
    const ids = profiles.map(p => p.id);
    const { data: students } = await supabase
      .from('students')
      .select('id, roll_number')
      .in('id', ids)
      .eq('status', 'active');

    // Filter out students already enrolled in the specified class
    let filteredProfiles = profiles;
    if (excludeClassId) {
      const { data: enrollments } = await supabase
        .from('class_enrollments')
        .select('student_id')
        .eq('class_id', excludeClassId)
        .eq('status', 'active');

      const enrolledStudentIds = new Set(enrollments?.map(e => e.student_id) || []);
      filteredProfiles = profiles.filter(p => !enrolledStudentIds.has(p.id));
    }

    // Combine data
    const mapped = filteredProfiles?.map((profile: any) => {
      const student = students?.find(s => s.id === profile.id);
      return {
        id: profile.id,
        full_name: profile.full_name || '',
        email: profile.email || '',
        roll_number: student?.roll_number || '',
      };
    }) || [];

    return { success: true, data: mapped };
  } catch (error: any) {
    console.error('searchStudents error:', error);
    return { success: false, error: error?.message || 'Failed to search students' };
  }
}

// ====================================================
// UTILITY FUNCTIONS
// ====================================================

export async function getClassRoster(classId: string): Promise<ApiResponse<any[]>> {
  try {
    const { data, error } = await supabase
      .from('class_enrollments')
      .select(`
        id,
        status,
        enrollment_date,
        grade,
        student:profiles!class_enrollments_student_id_fkey(id, full_name, email)
      `)
      .eq('class_id', classId)
      .eq('status', 'active')
      .order('enrollment_date');

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('getClassRoster error:', error);
    return { success: false, error: error?.message || 'Failed to load roster' };
  }
}

// ====================================================
// CLASS MANAGEMENT
// ====================================================

export async function createClass(data: {
  subjectId: string;
  academicSessionId: string;
  sectionCode: string;
  teacherId?: string;
  roomNumber?: string;
  capacity: number;
}): Promise<ApiResponse<string>> {
  try {
    const { data: result, error } = await supabase
      .from('classes')
      .insert({
        subject_id: data.subjectId,
        academic_session_id: data.academicSessionId,
        section_code: data.sectionCode,
        teacher_id: data.teacherId || null,
        room_number: data.roomNumber || null,
        capacity: data.capacity,
        status: 'active'
      })
      .select('id')
      .single();

    if (error) throw error;
    return { success: true, message: 'Class created successfully', data: result.id };
  } catch (error: any) {
    console.error('createClass error:', error);
    return { success: false, error: error?.message || 'Failed to create class' };
  }
}

export async function getSubjects(): Promise<ApiResponse<Subject[]>> {
  try {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('getSubjects error:', error);
    return { success: false, error: error?.message || 'Failed to load subjects' };
  }
}

export async function getAcademicSessions(): Promise<ApiResponse<AcademicSession[]>> {
  try {
    const { data, error } = await supabase
      .from('academic_sessions')
      .select('*')
      .order('start_date', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('getAcademicSessions error:', error);
    return { success: false, error: error?.message || 'Failed to load academic sessions' };
  }
}

export async function getTeachers(): Promise<ApiResponse<any[]>> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('role', 'teacher')
      .order('full_name');

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('getTeachers error:', error);
    return { success: false, error: error?.message || 'Failed to load teachers' };
  }
}

// ====================================================
// ASSIGNMENT MANAGEMENT
// ====================================================

export async function createAssignment(data: {
  classId: string;
  title: string;
  description?: string;
  dueDate?: string;
  totalPoints?: number;
}): Promise<ApiResponse<string>> {
  try {
    const { data: result, error } = await supabase
      .from('assignments')
      .insert({
        class_id: data.classId,
        title: data.title,
        description: data.description,
        due_date: data.dueDate,
        total_points: data.totalPoints,
        status: 'published',
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select('id')
      .single();

    if (error) throw error;
    return { success: true, message: 'Assignment created successfully', data: result.id };
  } catch (error: any) {
    console.error('createAssignment error:', error);
    return { success: false, error: error?.message || 'Failed to create assignment' };
  }
}

// ====================================================
// ATTENDANCE MANAGEMENT
// ====================================================

export async function recordAttendance(data: {
  classId: string;
  studentId: string;
  attendanceDate: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
}): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase
      .from('attendance_records')
      .upsert({
        class_id: data.classId,
        student_id: data.studentId,
        attendance_date: data.attendanceDate,
        status: data.status,
        notes: data.notes,
        marked_by: (await supabase.auth.getUser()).data.user?.id
      });

    if (error) throw error;
    return { success: true, message: 'Attendance recorded successfully' };
  } catch (error: any) {
    console.error('recordAttendance error:', error);
    return { success: false, error: error?.message || 'Failed to record attendance' };
  }
}

// ====================================================
// SCHEDULE MANAGEMENT
// ====================================================

export async function getScheduleSlots(): Promise<ApiResponse<any[]>> {
  try {
    const { data, error } = await supabase
      .from('schedule_slots')
      .select(`
        *,
        class:classes(*, subject:subjects(*), teacher:profiles!classes_teacher_id_fkey(*))
      `)
      .order('day_of_week')
      .order('start_time');

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error: any) {
    const msg = formatSupabaseError(error);
    console.error('getScheduleSlots error:', msg);
    return { success: false, error: msg || 'Failed to load schedule slots' };
  }
}

export async function createScheduleSlot(data: {
  classId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}): Promise<ApiResponse<string>> {
  try {
    // Check for conflicts first
    const { data: conflicts, error: conflictError } = await supabase
      .from('schedule_slots')
      .select('id')
      .eq('day_of_week', data.dayOfWeek)
      .or(`and(start_time.lt.${data.endTime},end_time.gt.${data.startTime})`);

    if (conflictError) throw conflictError;

    if (conflicts && conflicts.length > 0) {
      return { success: false, error: 'Schedule conflict detected. This time slot overlaps with an existing class.' };
    }

    const { data: result, error } = await supabase
      .from('schedule_slots')
      .insert({
        class_id: data.classId,
        day_of_week: data.dayOfWeek,
        start_time: data.startTime,
        end_time: data.endTime
      })
      .select('id')
      .single();

    if (error) throw error;
    return { success: true, message: 'Schedule slot created successfully', data: result.id };
  } catch (error: any) {
    console.error('createScheduleSlot error:', error);
    return { success: false, error: error?.message || 'Failed to create schedule slot' };
  }
}

export async function updateScheduleSlot(id: string, data: {
  classId?: string;
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
}): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase
      .from('schedule_slots')
      .update({
        class_id: data.classId,
        day_of_week: data.dayOfWeek,
        start_time: data.startTime,
        end_time: data.endTime
      })
      .eq('id', id);

    if (error) throw error;
    return { success: true, message: 'Schedule slot updated successfully' };
  } catch (error: any) {
    console.error('updateScheduleSlot error:', error);
    return { success: false, error: error?.message || 'Failed to update schedule slot' };
  }
}

export async function deleteScheduleSlot(id: string): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase
      .from('schedule_slots')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true, message: 'Schedule slot deleted successfully' };
  } catch (error: any) {
    console.error('deleteScheduleSlot error:', error);
    return { success: false, error: error?.message || 'Failed to delete schedule slot' };
  }
}

export async function checkScheduleConflicts(dayOfWeek: number, startTime: string, endTime: string, excludeId?: string): Promise<ApiResponse<any[]>> {
  try {
    let query = supabase
      .from('schedule_slots')
      .select(`
        *,
        class:classes(*, subject:subjects(*), teacher:profiles!classes_teacher_id_fkey(*))
      `)
      .eq('day_of_week', dayOfWeek)
      .or(`and(start_time.lt.${endTime},end_time.gt.${startTime})`);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('checkScheduleConflicts error:', error);
    return { success: false, error: error?.message || 'Failed to check schedule conflicts' };
  }
}

// ====================================================
// SUBJECT MANAGEMENT
// ====================================================

export async function createSubject(data: {
  name: string;
  code: string;
  description?: string;
  color?: string;
  department?: string;
  gradeLevel?: string;
}): Promise<ApiResponse<string>> {
  try {
    const { data: result, error } = await supabase
      .from('subjects')
      .insert({
        name: data.name,
        code: data.code,
        description: data.description,
        color: data.color || '#0D6EFD',
        department: data.department,
        grade_level: data.gradeLevel,
        is_active: true
      })
      .select('id')
      .single();

    if (error) throw error;
    return { success: true, message: 'Subject created successfully', data: result.id };
  } catch (error: any) {
    console.error('createSubject error:', error);
    return { success: false, error: error?.message || 'Failed to create subject' };
  }
}

// ====================================================
// ENROLLMENT MANAGEMENT
// ====================================================

export async function enrollStudentInClass(classId: string, studentId: string): Promise<ApiResponse<void>> {
  try {
    // Check if student is already enrolled
    const { data: existing } = await supabase
      .from('class_enrollments')
      .select('id')
      .eq('class_id', classId)
      .eq('student_id', studentId)
      .eq('status', 'active')
      .single();

    if (existing) {
      return { success: false, error: 'Student is already enrolled in this class' };
    }

    // Check class capacity
    const { data: classData } = await supabase
      .from('classes')
      .select('capacity, enrollment_count')
      .eq('id', classId)
      .single();

    if (classData && (classData.enrollment_count || 0) >= classData.capacity) {
      return { success: false, error: 'Class is at full capacity' };
    }

    const { error } = await supabase
      .from('class_enrollments')
      .insert({
        class_id: classId,
        student_id: studentId,
        status: 'active',
        enrollment_date: new Date().toISOString()
      });

    if (error) throw error;

    // Update enrollment count
    await supabase.rpc('increment_class_enrollment', { class_id: classId });

    return { success: true, message: 'Student enrolled successfully' };
  } catch (error: any) {
    console.error('enrollStudentInClass error:', error);
    return { success: false, error: error?.message || 'Failed to enroll student' };
  }
}

export async function bulkEnrollStudents(classId: string, studentIds: string[]): Promise<ApiResponse<void>> {
  try {
    // Check class capacity
    const { data: classData } = await supabase
      .from('classes')
      .select('capacity, enrollment_count')
      .eq('id', classId)
      .single();

    const currentEnrolled = classData?.enrollment_count || 0;
    const availableSlots = (classData?.capacity || 0) - currentEnrolled;

    if (studentIds.length > availableSlots) {
      return { success: false, error: `Only ${availableSlots} slots available. Cannot enroll ${studentIds.length} students.` };
    }

    const enrollments = studentIds.map(studentId => ({
      class_id: classId,
      student_id: studentId,
      status: 'active' as const,
      enrollment_date: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('class_enrollments')
      .insert(enrollments);

    if (error) throw error;

    // Update enrollment count
    await supabase.rpc('increment_class_enrollment', { class_id: classId, count: studentIds.length });

    return { success: true, message: `${studentIds.length} students enrolled successfully` };
  } catch (error: any) {
    console.error('bulkEnrollStudents error:', error);
    return { success: false, error: error?.message || 'Failed to enroll students' };
  }
}

export async function unenrollStudentFromClass(classId: string, studentId: string): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase
      .from('class_enrollments')
      .update({ status: 'withdrawn' })
      .eq('class_id', classId)
      .eq('student_id', studentId);

    if (error) throw error;

    // Update enrollment count
    await supabase.rpc('decrement_class_enrollment', { class_id: classId });

    return { success: true, message: 'Student unenrolled successfully' };
  } catch (error: any) {
    console.error('unenrollStudentFromClass error:', error);
    return { success: false, error: error?.message || 'Failed to unenroll student' };
  }
}

// Get enrolled students for a class
export async function getEnrolledStudentsForClass(classId: string): Promise<ApiResponse<any[]>> {
  try {
    const { data, error } = await supabase
      .from('class_enrollments')
      .select(`
        *,
        student:profiles!class_enrollments_student_id_fkey(id, full_name, email)
      `)
      .eq('class_id', classId)
      .eq('status', 'active')
      .order('enrollment_date', { ascending: false });

    if (error) throw error;

    // Also fetch student details from students table
    const studentIds = data?.map(e => e.student_id) || [];
    const { data: studentDetails } = await supabase
      .from('students')
      .select('id, roll_number')
      .in('id', studentIds);

    const studentMap = new Map(studentDetails?.map(s => [s.id, s]) || []);

    const enriched = (data || []).map(enrollment => ({
      ...enrollment,
      student: {
        ...enrollment.student,
        roll_number: studentMap.get(enrollment.student_id)?.roll_number || 'N/A'
      }
    }));

    return { success: true, data: enriched };
  } catch (error: any) {
    console.error('getEnrolledStudentsForClass error:', error);
    return { success: false, error: error?.message || 'Failed to fetch enrolled students' };
  }
}

// Export class students list (returns CSV data)
export async function exportClassStudents(classId: string): Promise<ApiResponse<string>> {
  try {
    const result = await getEnrolledStudentsForClass(classId);
    if (!result.success || !result.data) {
      return { success: false, error: 'Failed to fetch students for export' };
    }

    // Create CSV content
    const headers = ['Roll Number', 'Name', 'Email', 'Enrollment Date', 'Status'];
    const rows = result.data.map(e => [
      e.student?.roll_number || 'N/A',
      e.student?.full_name || 'Unknown',
      e.student?.email || 'N/A',
      new Date(e.enrollment_date).toLocaleDateString(),
      e.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return { success: true, data: csvContent };
  } catch (error: any) {
    console.error('exportClassStudents error:', error);
    return { success: false, error: error?.message || 'Failed to export students' };
  }
}
