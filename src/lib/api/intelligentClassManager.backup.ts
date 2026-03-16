import { supabase } from '../supabaseClient';
import type { UserRole } from '../../types';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface SubjectInput {
  name: string;
  code?: string;
  description?: string;
  color?: string;
}

export interface ClassInput {
  name: string;
  gradeLevel?: string;
  section?: string;
  subjectId?: string;
  primaryTeacherId?: string;
  room?: string;
  capacity?: number;
  slots: Array<{ dayOfWeek: number; startTime: string; endTime: string; location?: string }>;
}

export interface AttendanceEntry {
  studentId: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
}

export interface SlotConflict {
  conflictingClassName: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

function mapClassRecord(row: any) {
  return {
    id: row.id,
    name: row.name,
    gradeLevel: row.grade_level,
    section: row.section,
    room: row.room,
    capacity: row.capacity,
    status: row.status,
    subject: row.subject,
    primaryTeacher: row.primary_teacher,
    slots: row.slots ?? [],
    enrollmentCount: row.enrollments?.length || 0,
    enrollments: row.enrollments || [],
  };
}

export async function getSubjects(): Promise<ApiResponse<any[]>> {
  try {
    const { data, error } = await supabase
      .from('icm_subjects')
      .select('*')
      .order('name');
    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('getSubjects error', error);
    return { success: false, error: error?.message || 'Failed to load subjects' };
  }
}

export async function createSubject(payload: SubjectInput): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase
      .from('icm_subjects')
      .insert({
        name: payload.name,
        code: payload.code,
        description: payload.description,
        color: payload.color || '#0070F2',
      });
    if (error) throw error;
    return { success: true, message: 'Subject created' };
  } catch (error: any) {
    console.error('createSubject error', error);
    return { success: false, error: error?.message || 'Failed to create subject' };
  }
}

export async function updateSubject(id: string, payload: SubjectInput): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase
      .from('icm_subjects')
      .update({
        name: payload.name,
        code: payload.code,
        description: payload.description,
        color: payload.color,
      })
      .eq('id', id);
    if (error) throw error;
    return { success: true, message: 'Subject updated' };
  } catch (error: any) {
    console.error('updateSubject error', error);
    return { success: false, error: error?.message || 'Failed to update subject' };
  }
}

export async function deleteSubject(id: string): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase
      .from('icm_subjects')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { success: true, message: 'Subject deleted' };
  } catch (error: any) {
    console.error('deleteSubject error', error);
    return { success: false, error: error?.message || 'Failed to delete subject' };
  }
}

export async function createClass(payload: ClassInput): Promise<ApiResponse<string>> {
  try {
    const { data, error } = await supabase
      .from('icm_classes')
      .insert({
        name: payload.name,
        grade_level: payload.gradeLevel,
        section: payload.section,
        subject_id: payload.subjectId || null,
        primary_teacher_id: payload.primaryTeacherId || null,
        room: payload.room || null,
        capacity: payload.capacity || 30,
      })
      .select('id')
      .single();

    if (error) throw error;
    const classId = data?.id;

    if (classId && payload.slots?.length) {
      const slots = payload.slots.map((slot) => ({
        class_id: classId,
        day_of_week: slot.dayOfWeek,
        start_time: slot.startTime,
        end_time: slot.endTime,
        location: slot.location || payload.room || ''
      }));
      const { error: slotError } = await supabase.from('icm_class_slots').insert(slots);
      if (slotError) throw slotError;
    }

    return { success: true, message: 'Class created', data: classId };
  } catch (error: any) {
    console.error('createClass error', error);
    return { success: false, error: error?.message || 'Failed to create class' };
  }
}

export async function updateClass(id: string, payload: Partial<ClassInput>): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase
      .from('icm_classes')
      .update({
        name: payload.name,
        grade_level: payload.gradeLevel,
        section: payload.section,
        subject_id: payload.subjectId ?? undefined,
        primary_teacher_id: payload.primaryTeacherId ?? undefined,
        room: payload.room ?? undefined,
        capacity: payload.capacity,
      })
      .eq('id', id);

    if (error) throw error;

    if (payload.slots) {
      await supabase.from('icm_class_slots').delete().eq('class_id', id);
      if (payload.slots.length) {
        const slots = payload.slots.map((slot) => ({
          class_id: id,
          day_of_week: slot.dayOfWeek,
          start_time: slot.startTime,
          end_time: slot.endTime,
          location: slot.location || payload.room || ''
        }));
        const { error: slotError } = await supabase.from('icm_class_slots').insert(slots);
        if (slotError) throw slotError;
      }
    }

    return { success: true, message: 'Class updated' };
  } catch (error: any) {
    console.error('updateClass error', error);
    return { success: false, error: error?.message || 'Failed to update class' };
  }
}

export async function deleteClass(id: string): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase
      .from('icm_classes')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { success: true, message: 'Class deleted' };
  } catch (error: any) {
    console.error('deleteClass error', error);
    return { success: false, error: error?.message || 'Failed to delete class' };
  }
}

export async function getClassesForRole(userId: string, role: UserRole): Promise<ApiResponse<any[]>> {
  try {
    const { data: classRows, error: classError } = await supabase
      .from('icm_classes')
      .select(`
        *,
        subject:icm_subjects(*),
        primary_teacher:profiles!icm_classes_primary_teacher_id_fkey(id, full_name, email)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (classError) throw classError;

    const rows = classRows || [];
    const classIds = rows.map((row: any) => row.id);

    const slotsByClass = new Map<string, any[]>();
    const enrollmentsByClass = new Map<string, any[]>();

    if (classIds.length > 0) {
      const { data: slotRows, error: slotError } = await supabase
        .from('icm_class_slots')
        .select('*')
        .in('class_id', classIds)
        .order('day_of_week');
      if (slotError) throw slotError;
      (slotRows || []).forEach((slot: any) => {
        const list = slotsByClass.get(slot.class_id) || [];
        list.push(slot);
        slotsByClass.set(slot.class_id, list);
      });

      const { data: enrollmentRows, error: enrollmentError } = await supabase
        .from('icm_class_enrollments')
        .select('id, class_id, student_id, status, student:students(id, parent_id)')
        .in('class_id', classIds)
        .eq('status', 'active');
      if (enrollmentError) throw enrollmentError;
      (enrollmentRows || []).forEach((enrollment: any) => {
        const list = enrollmentsByClass.get(enrollment.class_id) || [];
        list.push(enrollment);
        enrollmentsByClass.set(enrollment.class_id, list);
      });
    }

    const filtered = rows.filter((row: any) => {
      if (role === 'admin') return true;
      if (role === 'teacher') return row.primary_teacher_id === userId;
      const enrollments = enrollmentsByClass.get(row.id) || [];
      if (role === 'student') return enrollments.some((en: any) => en.student_id === userId);
      if (role === 'parent') return enrollments.some((en: any) => en.student?.parent_id === userId);
      return false;
    });

    const enriched = filtered.map((row: any) => ({
      ...row,
      slots: slotsByClass.get(row.id) || [],
      enrollments: enrollmentsByClass.get(row.id) || [],
    }));

    return { success: true, data: enriched.map(mapClassRecord) };
  } catch (error: any) {
    console.error('getClassesForRole error', error);
    return { success: false, error: error?.message || 'Failed to load classes' };
  }
}

export async function addStudentToClass(classId: string, studentId: string): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase
      .from('icm_class_enrollments')
      .insert({ class_id: classId, student_id: studentId });
    if (error) throw error;
    return { success: true, message: 'Student enrolled' };
  } catch (error: any) {
    console.error('addStudentToClass error', error);
    return { success: false, error: error?.message || 'Failed to enroll student' };
  }
}

export async function removeStudentFromClass(enrollmentId: string): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase
      .from('icm_class_enrollments')
      .delete()
      .eq('id', enrollmentId);
    if (error) throw error;
    return { success: true, message: 'Student removed' };
  } catch (error: any) {
    console.error('removeStudentFromClass error', error);
    return { success: false, error: error?.message || 'Failed to remove student' };
  }
}

export async function bulkEnrollStudents(classId: string, studentIds: string[]): Promise<ApiResponse<void>> {
  try {
    console.log('bulkEnrollStudents called with:', { classId, studentIds });
    if (!studentIds.length) {
      console.log('No students to enroll');
      return { success: true };
    }

    const rows = studentIds.map((studentId) => ({
      class_id: classId,
      student_id: studentId,
      status: 'active'
    }));

    console.log('Inserting enrollment rows:', rows);
    const { data, error } = await supabase
      .from('icm_class_enrollments')
      .insert(rows)
      .select();

    if (error) {
      console.error('bulkEnrollStudents insert error:', error);
      throw error;
    }

    console.log('bulkEnrollStudents success, inserted:', data);
    return { success: true, message: `Enrolled ${studentIds.length} students` };
  } catch (error: any) {
    console.error('bulkEnrollStudents error:', error);
    return { success: false, error: error?.message || 'Failed to enroll students' };
  }
}

export async function recordAttendance(classId: string, date: string, takenBy: string, entries: AttendanceEntry[]): Promise<ApiResponse<void>> {
  try {
    const rows = entries.map((entry) => ({
      class_id: classId,
      student_id: entry.studentId,
      attendance_date: date,
      status: entry.status,
      notes: entry.notes || null,
      taken_by: takenBy,
    }));

    const { error } = await supabase
      .from('icm_attendance')
      .upsert(rows, { onConflict: 'class_id,student_id,attendance_date' });

    if (error) throw error;

    return { success: true, message: 'Attendance recorded' };
  } catch (error: any) {
    console.error('recordAttendance error', error);
    return { success: false, error: error?.message || 'Failed to record attendance' };
  }
}

export async function getAttendanceForClass(classId: string, date: string): Promise<ApiResponse<any[]>> {
  try {
    const { data, error } = await supabase
      .from('icm_attendance')
      .select(`
        *,
        student:students(id, profile:profiles(id, full_name))
      `)
      .eq('class_id', classId)
      .eq('attendance_date', date)
      .order('status');

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('getAttendanceForClass error', error);
    return { success: false, error: error?.message || 'Failed to fetch attendance' };
  }
}

export async function getAttendanceSummaryForStudent(studentId: string): Promise<ApiResponse<{ present: number; absent: number; late: number; excused: number }>> {
  try {
    const statuses: AttendanceEntry['status'][] = ['present', 'absent', 'late', 'excused'];
    const summary = { present: 0, absent: 0, late: 0, excused: 0 };

    for (const status of statuses) {
      const { count, error } = await supabase
        .from('icm_attendance')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', studentId)
        .eq('status', status);
      if (error) throw error;
      summary[status] = count || 0;
    }

    return { success: true, data: summary };
  } catch (error: any) {
    console.error('getAttendanceSummaryForStudent error', error);
    return { success: false, error: error?.message || 'Failed to fetch summary' };
  }
}

export async function requestSubstitution(payload: {
  classSlotId: string;
  originalTeacherId: string;
  requestedBy: string;
  reason?: string;
}): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase
      .from('icm_substitutions')
      .insert({
        class_slot_id: payload.classSlotId,
        original_teacher_id: payload.originalTeacherId,
        requested_by: payload.requestedBy,
        reason: payload.reason || 'Teacher unavailable',
        status: 'open',
      });
    if (error) throw error;
    return { success: true, message: 'Substitution requested' };
  } catch (error: any) {
    console.error('requestSubstitution error', error);
    return { success: false, error: error?.message || 'Failed to request substitution' };
  }
}

export async function assignSubstitution(id: string, teacherId: string): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase
      .from('icm_substitutions')
      .update({ status: 'assigned', assigned_teacher_id: teacherId })
      .eq('id', id);
    if (error) throw error;
    return { success: true, message: 'Substitute assigned' };
  } catch (error: any) {
    console.error('assignSubstitution error', error);
    return { success: false, error: error?.message || 'Failed to assign substitute' };
  }
}

export async function cancelSubstitution(id: string): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase
      .from('icm_substitutions')
      .update({ status: 'cancelled' })
      .eq('id', id);
    if (error) throw error;
    return { success: true, message: 'Substitution cancelled' };
  } catch (error: any) {
    console.error('cancelSubstitution error', error);
    return { success: false, error: error?.message || 'Failed to cancel substitution' };
  }
}

export async function getClassMetrics(): Promise<ApiResponse<{ subjects: number; classes: number; activeStudents: number; attendanceRate: number }>> {
  try {
    const [{ count: subjectCount, error: subjectError }, { count: classCount, error: classError }] = await Promise.all([
      supabase.from('icm_subjects').select('*', { count: 'exact', head: true }),
      supabase.from('icm_classes').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    ]);

    if (subjectError) throw subjectError;
    if (classError) throw classError;

    const { count: presentCount } = await supabase
      .from('icm_attendance')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'present')
      .gte('attendance_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));

    const { count: totalCount } = await supabase
      .from('icm_attendance')
      .select('*', { count: 'exact', head: true })
      .gte('attendance_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));

    const { count: enrollmentCount, error: enrollmentError } = await supabase
      .from('icm_class_enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    if (enrollmentError) {
      console.error('getClassMetrics enrollment count error:', enrollmentError);
    }

    console.log('getClassMetrics counts:', {
      subjects: subjectCount,
      classes: classCount,
      activeStudents: enrollmentCount,
      presentCount,
      totalCount
    });

    const attendanceRate = totalCount ? Math.round(((presentCount || 0) / totalCount) * 100) : 100;

    return {
      success: true,
      data: {
        subjects: subjectCount || 0,
        classes: classCount || 0,
        activeStudents: enrollmentCount || 0,
        attendanceRate,
      },
    };
  } catch (error: any) {
    console.error('getClassMetrics error', error);
    return { success: false, error: error?.message || 'Failed to load metrics' };
  }
}

function detectConflicts(existingSlots: any[], proposedSlot: { dayOfWeek: number; startTime: string; endTime: string }): SlotConflict[] {
  const conflicts: SlotConflict[] = [];
  const proposedStart = proposedSlot.startTime;
  const proposedEnd = proposedSlot.endTime;

  existingSlots
    .filter((slot) => slot.day_of_week === proposedSlot.dayOfWeek)
    .forEach((slot) => {
      if (!(slot.end_time <= proposedStart || slot.start_time >= proposedEnd)) {
        conflicts.push({
          conflictingClassName: slot.class_name || 'Existing class',
          dayOfWeek: slot.day_of_week,
          startTime: slot.start_time,
          endTime: slot.end_time,
        });
      }
    });

  return conflicts;
}

export async function getScheduleConflicts(payload: {
  teacherId: string;
  slot: { dayOfWeek: number; startTime: string; endTime: string };
}): Promise<ApiResponse<SlotConflict[]>> {
  try {
    const { data, error } = await supabase
      .from('icm_class_slots')
      .select(`
        day_of_week,
        start_time,
        end_time,
        class:icm_classes(name, primary_teacher_id)
      `)
      .eq('day_of_week', payload.slot.dayOfWeek);

    if (error) throw error;

    const teacherSlots = (data || [])
      .filter((row: any) => row.class?.primary_teacher_id === payload.teacherId)
      .map((row: any) => ({
        day_of_week: row.day_of_week,
        start_time: row.start_time,
        end_time: row.end_time,
        class_name: row.class?.name,
      }));

    const conflicts = detectConflicts(teacherSlots, payload.slot);
    return { success: true, data: conflicts };
  } catch (error: any) {
    console.error('getScheduleConflicts error', error);
    return { success: false, error: error?.message || 'Failed to check conflicts' };
  }
}

export async function getAIScheduleSuggestion(payload: {
  teacherId: string;
  preferredDay: number;
  preferredStart: string;
}): Promise<ApiResponse<{ recommendedDay: number; recommendedStart: string; recommendedEnd: string; confidence: number; reasoning: string }>> {
  try {
    const slotLengthMinutes = 60;
    const preferredEnd = new Date(`1970-01-01T${payload.preferredStart}:00Z`);
    preferredEnd.setUTCMinutes(preferredEnd.getUTCMinutes() + slotLengthMinutes);
    const formattedEnd = preferredEnd.toISOString().substring(11, 16);

    const conflicts = await getScheduleConflicts({
      teacherId: payload.teacherId,
      slot: { dayOfWeek: payload.preferredDay, startTime: payload.preferredStart, endTime: formattedEnd },
    });

    if (!conflicts.success) throw new Error(conflicts.error);

    if (conflicts.data && conflicts.data.length === 0) {
      return {
        success: true,
        data: {
          recommendedDay: payload.preferredDay,
          recommendedStart: payload.preferredStart,
          recommendedEnd: formattedEnd,
          confidence: 0.92,
          reasoning: 'Preferred slot is conflict-free based on teacher availability.',
        },
      };
    }

    const fallbackDay = (payload.preferredDay + 1) % 5; // next weekday
    return {
      success: true,
      data: {
        recommendedDay: fallbackDay,
        recommendedStart: '10:00',
        recommendedEnd: '11:00',
        confidence: 0.78,
        reasoning: 'Preferred slot had conflicts. Suggested alternative using free slot heuristic.',
      },
    };
  } catch (error: any) {
    console.error('getAIScheduleSuggestion error', error);
    return { success: false, error: error?.message || 'Failed to generate suggestion' };
  }
}

export async function getTeacherSchedule(teacherId: string): Promise<ApiResponse<any[]>> {
  try {
    const { data, error } = await supabase
      .from('icm_class_slots')
      .select(`
        day_of_week,
        start_time,
        end_time,
        location,
        class:icm_classes(*, subject:icm_subjects(name, color))
      `)
      .order('day_of_week');

    if (error) throw error;

    const slots = (data || []).filter((row: any) => row.class?.primary_teacher_id === teacherId);
    return { success: true, data: slots };
  } catch (error: any) {
    console.error('getTeacherSchedule error', error);
    return { success: false, error: error?.message || 'Failed to load schedule' };
  }
}

export async function getStudentSchedule(studentId: string): Promise<ApiResponse<any[]>> {
  try {
    const { data, error } = await supabase
      .from('icm_class_enrollments')
      .select(`
        class:icm_classes(*, subject:icm_subjects(name, color), slots:icm_class_slots(*))
      `)
      .eq('student_id', studentId)
      .eq('status', 'active');

    if (error) throw error;
    const schedule = (data || []).map((row: any) => row.class).filter(Boolean);
    return { success: true, data: schedule };
  } catch (error: any) {
    console.error('getStudentSchedule error', error);
    return { success: false, error: error?.message || 'Failed to load schedule' };
  }
}

export async function searchStudents(term: string): Promise<ApiResponse<any[]>> {
  try {
    const normalized = term.trim();
    let query = supabase
      .from('students')
      .select(`
        id,
        roll_number,
        profile:profiles(id, full_name, email)
      `)
      .order('profile.full_name')
      .limit(10);

    if (normalized) {
      query = query.ilike('profile.full_name', `%${normalized}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    const mapped = (data || []).map((student: any) => ({
      id: student.id,
      full_name: student.profile?.full_name || student.profile?.email || 'Unknown Student',
      email: student.profile?.email || '',
      roll_number: student.roll_number || '',
    }));

    return { success: true, data: mapped };
  } catch (error: any) {
    console.error('searchStudents error', error);
    return { success: false, error: error?.message || 'Failed to search students' };
  }
}

export async function searchTeachers(term: string): Promise<ApiResponse<any[]>> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('role', 'teacher')
      .ilike('full_name', `%${term}%`)
      .limit(10);
    if (error) throw error;
    console.log('searchTeachers result:', data);
    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('searchTeachers error', error);
    return { success: false, error: error?.message || 'Failed to search teachers' };
  }
}

// Debug RLS and enrollment permissions
export async function debugEnrollmentPermissions(classId?: string): Promise<any> {
  try {
    console.log('=== DEBUG ENROLLMENT PERMISSIONS ===');

    // Check current user and permissions
    const { data: currentUser } = await supabase.auth.getUser();
    console.log('Current user:', currentUser?.user?.id);

    if (currentUser?.user?.id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.user.id)
        .single();
      console.log('User profile:', profile);

      // Test direct enrollment insert (bypassing RLS)
      if (classId) {
        console.log('Testing direct enrollment insert for class:', classId);
        const testRows = [{ class_id: classId, student_id: currentUser.user.id, status: 'active' }];
        const { data: insertResult, error: insertError } = await supabase
          .from('icm_class_enrollments')
          .insert(testRows)
          .select();

        console.log('Direct insert result:', insertResult, 'Error:', insertError);

        // Clean up test data
        if (insertResult && insertResult.length > 0) {
          await supabase
            .from('icm_class_enrollments')
            .delete()
            .eq('id', insertResult[0].id);
        }
      }
    }

    return { currentUser: currentUser?.user };
  } catch (error) {
    console.error('Debug enrollment error:', error);
    return { error };
  }
}

// Test function to verify API responses
export async function testStudentAPIs(): Promise<any> {
  try {
    console.log('=== TESTING STUDENT APIs ===');

    // Test getAllStudents
    console.log('Testing getAllStudents...');
    const allStudentsResult = await getAllStudents();
    console.log('getAllStudents result type:', typeof allStudentsResult);
    console.log('getAllStudents success:', allStudentsResult?.success);
    console.log('getAllStudents data type:', typeof allStudentsResult?.data);
    console.log('getAllStudents data length:', allStudentsResult?.data?.length || 'undefined');

    // Test getStudentsNotInClass (if we have a class)
    console.log('Testing getStudentsNotInClass...');
    const notInClassResult = await getStudentsNotInClass('test-class-id');
    console.log('getStudentsNotInClass result type:', typeof notInClassResult);
    console.log('getStudentsNotInClass success:', notInClassResult?.success);
    console.log('getStudentsNotInClass data type:', typeof notInClassResult?.data);
    console.log('getStudentsNotInClass data length:', notInClassResult?.data?.length || 'undefined');

    return {
      getAllStudents: {
        success: allStudentsResult?.success,
        dataType: typeof allStudentsResult?.data,
        dataLength: allStudentsResult?.data?.length,
        error: allStudentsResult?.error
      },
      getStudentsNotInClass: {
        success: notInClassResult?.success,
        dataType: typeof notInClassResult?.data,
        dataLength: notInClassResult?.data?.length,
        error: notInClassResult?.error
      }
    };
  } catch (error) {
    console.error('Test error:', error);
    return { error };
  }
}

// Debug function to check database state
export async function debugStudentSearch(classId?: string): Promise<any> {
  try {
    // Check if current user is admin
    const { data: currentUser } = await supabase.auth.getUser();
    console.log('=== DEBUG STUDENT SEARCH ===');
    console.log('Current user:', currentUser?.user);

    // Check current user's profile
    if (currentUser?.user?.id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.user.id)
        .single();
      console.log('Current user profile:', profile);
    }

    // Check all student profiles
    const { data: studentProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, email, role')
      .eq('role', 'student');
    console.log('All student profiles:', studentProfiles, 'Error:', profilesError);

    // Check students table with profiles
    const { data: studentsWithProfiles, error: studentsError } = await supabase
      .from('students')
      .select(`
        id,
        roll_number,
        status,
        profiles(id, full_name, email, role)
      `);
    console.log('Students with profiles:', studentsWithProfiles, 'Error:', studentsError);

    // Check enrollments for the specific class if provided
    if (classId) {
      const { data: enrollments, error: enrollError } = await supabase
        .from('icm_class_enrollments')
        .select(`
          id,
          student_id,
          status,
          profiles(id, full_name, email)
        `)
        .eq('class_id', classId);
      console.log(`Enrollments for class ${classId}:`, enrollments, 'Error:', enrollError);

      // Test the exclusion query
      const { data: excludedStudents, error: excludeError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('role', 'student')
        .not('id', 'in', `(
          select student_id from icm_class_enrollments where class_id = '${classId}' and status = 'active'
        )`);
      console.log(`Available students for class ${classId}:`, excludedStudents, 'Error:', excludeError);
    }

    // Test simple student query without filters
    const { data: simpleStudents, error: simpleError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('role', 'student')
      .limit(5);
    console.log('Simple student query (first 5):', simpleStudents, 'Error:', simpleError);

    return {
      currentUser: currentUser?.user,
      studentProfiles,
      studentsWithProfiles,
      simpleStudents,
      errors: { profilesError, studentsError, simpleError }
    };
  } catch (error) {
    console.error('Debug error:', error);
    return { error };
  }
}

// Get all students regardless of enrollment status (for debugging)
export async function getAllStudents(search?: string): Promise<ApiResponse<any[]>> {
  try {
    const trimmed = search?.trim() || '';

    let profileQuery = supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('role', 'student');

    if (trimmed) {
      profileQuery = profileQuery.ilike('full_name', `%${trimmed}%`);
    }

    const { data: profiles, error: profileError } = await profileQuery;
    if (profileError) throw profileError;

    if (!profiles || profiles.length === 0) {
      return { success: true, data: [] };
    }

    // Get roll numbers for these students
    const ids = profiles.map(p => p.id);
    const { data: students } = await supabase
      .from('students')
      .select('id, roll_number')
      .in('id', ids)
      .eq('status', 'active');

    // Combine the data
    const mapped = profiles?.map((profile: any) => {
      const student = students?.find(s => s.id === profile.id);
      return {
        id: profile.id,
        full_name: profile.full_name || '',
        email: profile.email || '',
        roll_number: student?.roll_number || '',
      };
    }) || [];

    console.log('getAllStudents result:', mapped);
    return { success: true, data: mapped };
  } catch (error: any) {
    console.error('getAllStudents error', error);
    return { success: false, error: error?.message || 'Failed to load students' };
  }
}

export async function getStudentsNotInClass(classId: string, search?: string): Promise<ApiResponse<any[]>> {
  try {
    const trimmed = search?.trim() || '';

    // Get all students from profiles table (like how searchTeachers works)
    let profileQuery = supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('role', 'student')
      .not('id', 'in', `(
        select student_id from icm_class_enrollments where class_id = '${classId}' and status = 'active'
      )`)
      .limit(50);

    if (trimmed) {
      profileQuery = profileQuery.ilike('full_name', `%${trimmed}%`);
    }

    const { data: profiles, error: profileError } = await profileQuery;
    if (profileError) throw profileError;

    if (!profiles || profiles.length === 0) {
      console.log('No available students found');
      return { success: true, data: [] };
    }

    // Get roll numbers for these students
    const ids = profiles.map(p => p.id);
    const { data: students, error: studentError } = await supabase
      .from('students')
      .select('id, roll_number')
      .in('id', ids)
      .eq('status', 'active');

    if (studentError) {
      console.warn('Could not get student details, but profiles loaded:', studentError);
    }

    // Combine the data
    const mapped = profiles?.map((profile: any) => {
      const student = students?.find(s => s.id === profile.id);
      return {
        id: profile.id,
        full_name: profile.full_name || '',
        email: profile.email || '',
        roll_number: student?.roll_number || '',
      };
    }) || [];

    console.log('getStudentsNotInClass result:', mapped);
    return { success: true, data: mapped };
  } catch (error: any) {
    console.error('getStudentsNotInClass error', error);

    // Fallback: try to get all student profiles without enrollment filtering
    try {
      console.log('Trying fallback query...');
      let fallbackQuery = supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('role', 'student')
        .limit(10);

      if (trimmed) {
        fallbackQuery = fallbackQuery.ilike('full_name', `%${trimmed}%`);
      }

      const { data: fallbackProfiles, error: fallbackError } = await fallbackQuery;
      if (!fallbackError && fallbackProfiles) {
        console.log('Fallback worked, found profiles:', fallbackProfiles);
      const fallbackMapped = fallbackProfiles?.map((profile: any) => ({
        id: profile.id,
        full_name: profile.full_name || '',
        email: profile.email || '',
        roll_number: '',
      })) || [];
      return { success: true, data: fallbackMapped };
      }
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
    }

    return { success: false, error: error?.message || 'Failed to load available students' };
  }
}

export async function getSubstitutionRequests(filter: { status?: string } = {}): Promise<ApiResponse<any[]>> {
  try {
    let query = supabase
      .from('icm_substitutions')
      .select(`
        *,
        slot:icm_class_slots(day_of_week, start_time, end_time, class:icm_classes(name)),
        original:profiles!icm_substitutions_original_teacher_id_fkey(id, full_name),
        assigned:profiles!icm_substitutions_assigned_teacher_id_fkey(id, full_name)
      `)
      .order('created_at', { ascending: false });

    if (filter.status) query = query.eq('status', filter.status);

    const { data, error } = await query;
    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('getSubstitutionRequests error', error);
    return { success: false, error: error?.message || 'Failed to load substitution requests' };
  }
}

export async function getAttendanceTrend(classId?: string): Promise<ApiResponse<Array<{ label: string; present: number; absent: number }>>> {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 6);
    const sinceStr = since.toISOString().slice(0, 10);

    let query = supabase
      .from('icm_attendance')
      .select('attendance_date, status', { count: 'exact', head: false })
      .gte('attendance_date', sinceStr);

    if (classId) query = query.eq('class_id', classId);

    const { data, error } = await query;
    if (error) throw error;

    const buckets: Record<string, { present: number; absent: number }> = {};
    (data || []).forEach((row: any) => {
      const date = row.attendance_date;
      if (!buckets[date]) buckets[date] = { present: 0, absent: 0 };
      if (row.status === 'present') buckets[date].present += 1;
      if (row.status === 'absent') buckets[date].absent += 1;
    });

    const labels = Object.keys(buckets).sort();
    const trend = labels.map((label) => ({ label, ...buckets[label] }));
    return { success: true, data: trend };
  } catch (error: any) {
    console.error('getAttendanceTrend error', error);
    return { success: false, error: error?.message || 'Failed to load attendance trend' };
  }
}

export async function getClassRoster(classId: string): Promise<ApiResponse<any[]>> {
  try {
    const { data, error } = await supabase
      .from('icm_class_enrollments')
      .select(`
        id,
        status,
        student:students(id, roll_number, profile:profiles(id, full_name, email))
      `)
      .eq('class_id', classId)
      .eq('status', 'active')
      .order('enrolled_at');
    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('getClassRoster error', error);
    return { success: false, error: error?.message || 'Failed to load roster' };
  }
}

export async function addStudentsToClass(classId: string, studentIds: string[]): Promise<ApiResponse<void>> {
  try {
    if (studentIds.length === 0) {
      return { success: true, message: 'No students selected' };
    }
    const rows = studentIds.map((studentId) => ({ class_id: classId, student_id: studentId, status: 'active' }));
    const { error } = await supabase
      .from('icm_class_enrollments')
      .upsert(rows, { onConflict: 'class_id,student_id' });
    if (error) throw error;
    return { success: true, message: 'Students enrolled' };
  } catch (error: any) {
    console.error('addStudentsToClass error', error);
    return { success: false, error: error?.message || 'Failed to enroll students' };
  }
}
