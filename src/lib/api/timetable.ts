import { supabase } from '../supabaseClient';

export interface TimetableEntry {
  id: string;
  class_id: string;
  class_name?: string;
  subject_id: string;
  subject_name?: string;
  teacher_id: string;
  teacher_name?: string;
  day_of_week: number; // 0=Monday, 6=Sunday (matches DB schema)
  start_time: string;
  end_time: string;
  room?: string | null;
  academic_year: string;
  term?: string | null;
  status?: 'active' | 'archived';
  created_at: string;
  updated_at: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export async function getTimetableEntries(filters?: {
  classId?: string;
  teacherId?: string;
  dayOfWeek?: number;
}): Promise<ApiResponse<TimetableEntry[]>> {
  try {
    let query = supabase
      .from('timetable_entries')
      .select(`
        *,
        class:classes(id, section_code, room_number, subject:subjects(name, code)),
        subject:subjects(id, name, code)
      `);

    if (filters?.classId) {
      query = query.eq('class_id', filters.classId);
    }

    if (filters?.teacherId) {
      query = query.eq('teacher_id', filters.teacherId);
    }

    if (filters?.dayOfWeek !== undefined) {
      query = query.eq('day_of_week', filters.dayOfWeek);
    }

    const { data, error } = await query.order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) throw error;

    // Fetch teacher names separately since we need to join through profiles
    const teacherIds = [...new Set(data?.map((item: any) => item.teacher_id).filter(Boolean))];
    const teacherProfiles = teacherIds.length > 0 ? await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', teacherIds) : null;

    const teacherMap = new Map(
      teacherProfiles?.data?.map((t: any) => [t.id, t.full_name]) || []
    );

    const entries = data?.map((item: any) => {
      const classLabel = item.class
        ? [item.class.subject?.name || item.class.subject?.code, item.class.section_code].filter(Boolean).join(' ')
        : 'Unknown';
      return {
        ...item,
        class_name: classLabel || 'Unknown',
        subject_name: item.subject?.name || 'Unknown',
        teacher_name: teacherMap.get(item.teacher_id) || 'Unknown',
      };
    }) || [];

    return { success: true, data: entries };
  } catch (error: any) {
    console.error('Error fetching timetable entries:', error);
    return {
      success: false,
      error: error?.message || 'Failed to fetch timetable entries',
    };
  }
}

// Helper function to detect time overlaps
function checkTimeOverlap(
  start1: string, end1: string,
  start2: string, end2: string
): boolean {
  const s1 = start1.split(':').map(Number);
  const e1 = end1.split(':').map(Number);
  const s2 = start2.split(':').map(Number);
  const e2 = end2.split(':').map(Number);
  
  const start1_min = s1[0] * 60 + s1[1];
  const end1_min = e1[0] * 60 + e1[1];
  const start2_min = s2[0] * 60 + s2[1];
  const end2_min = e2[0] * 60 + e2[1];
  
  return !(end1_min <= start2_min || end2_min <= start1_min);
}

// Check for conflicts before creating/updating
export async function checkScheduleConflicts(
  dayOfWeek: number,
  startTime: string,
  endTime: string,
  teacherId?: string,
  classId?: string,
  room?: string,
  excludeId?: string
): Promise<ApiResponse<{ hasConflict: boolean; conflicts: any[] }>> {
  try {
    let query = supabase
      .from('timetable_entries')
      .select('id, teacher_id, class_id, start_time, end_time, room, day_of_week');

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    query = query.eq('day_of_week', dayOfWeek);

    const { data, error } = await query;

    if (error) throw error;

    const conflicts: any[] = [];

    data?.forEach((entry: any) => {
      if (checkTimeOverlap(startTime, endTime, entry.start_time, entry.end_time)) {
        // Check teacher conflict
        if (teacherId && entry.teacher_id === teacherId) {
          conflicts.push({ type: 'teacher', entry });
        }
        // Check class conflict
        if (classId && entry.class_id === classId) {
          conflicts.push({ type: 'class', entry });
        }
        // Check room conflict
        if (room && entry.room === room) {
          conflicts.push({ type: 'room', entry });
        }
      }
    });

    return {
      success: true,
      data: {
        hasConflict: conflicts.length > 0,
        conflicts,
      },
    };
  } catch (error: any) {
    console.error('Error checking conflicts:', error);
    return {
      success: false,
      error: error?.message || 'Failed to check conflicts',
    };
  }
}

export async function createTimetableEntry(
  entry: Partial<TimetableEntry>
): Promise<ApiResponse<TimetableEntry>> {
  try {
    // Check for conflicts first
    const conflictCheck = await checkScheduleConflicts(
      entry.day_of_week!,
      entry.start_time!,
      entry.end_time!,
      entry.teacher_id,
      entry.class_id,
      entry.room || undefined
    );

    if (!conflictCheck.success) {
      console.error('Conflict check failed:', conflictCheck.error);
      return conflictCheck as any;
    }

    if (conflictCheck.data?.hasConflict) {
      const conflictTypes = [...new Set(conflictCheck.data.conflicts.map((c: any) => c.type))];
      return {
        success: false,
        error: `Schedule conflict detected: ${conflictTypes.join(', ')} already booked for this time slot`,
      };
    }

    const { data, error } = await supabase
      .from('timetable_entries')
      .insert(entry)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
      message: 'Timetable entry created successfully',
    };
  } catch (error) {
    console.error('Error creating timetable entry:', error);
    return {
      success: false,
      error: 'Failed to create timetable entry',
    };
  }
}

export async function updateTimetableEntry(
  id: string,
  updates: Partial<TimetableEntry>
): Promise<ApiResponse<TimetableEntry>> {
  try {
    // Check for conflicts if time/day is being updated
    if (updates.day_of_week !== undefined || updates.start_time !== undefined || updates.end_time !== undefined) {
      const conflictCheck = await checkScheduleConflicts(
        updates.day_of_week || 0,
        updates.start_time || '',
        updates.end_time || '',
        updates.teacher_id,
        updates.class_id,
        updates.room || undefined,
        id
      );

      if (!conflictCheck.success) {
        return conflictCheck as any;
      }

      if (conflictCheck.data?.hasConflict) {
        const conflictTypes = [...new Set(conflictCheck.data.conflicts.map((c: any) => c.type))];
        return {
          success: false,
          error: `Schedule conflict detected: ${conflictTypes.join(', ')} already booked for this time slot`,
        };
      }
    }

    const { data, error } = await supabase
      .from('timetable_entries')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
      message: 'Timetable entry updated successfully',
    };
  } catch (error) {
    console.error('Error updating timetable entry:', error);
    return {
      success: false,
      error: 'Failed to update timetable entry',
    };
  }
}

export async function deleteTimetableEntry(id: string): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase
      .from('timetable_entries')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return {
      success: true,
      message: 'Timetable entry deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting timetable entry:', error);
    return {
      success: false,
      error: 'Failed to delete timetable entry',
    };
  }
}

export async function getWeeklySchedule(teacherId: string): Promise<ApiResponse<TimetableEntry[]>> {
  return getTimetableEntries({ teacherId });
}

export async function getClassSchedule(classId: string): Promise<ApiResponse<TimetableEntry[]>> {
  return getTimetableEntries({ classId });
}

// Helper functions to fetch classes, subjects, teachers for dropdowns
// classes table has: id, subject_id, academic_session_id, section_code, teacher_id, room_number (no name/section/grade)
export async function getClasses(): Promise<ApiResponse<any[]>> {
  try {
    const { data, error } = await supabase
      .from('classes')
      .select('id, section_code, subject_id, room_number, subject:subjects(name, code)')
      .order('section_code', { ascending: true });

    if (error) throw error;

    const list = data?.map((c: any) => {
      const label = [c.subject?.name || c.subject?.code, c.section_code].filter(Boolean).join(' ');
      return {
        ...c,
        name: c.subject?.name,
        section: c.section_code,
        displayName: label || c.section_code || c.id,
      };
    }) || [];
    return { success: true, data: list };
  } catch (error) {
    console.error('Error fetching classes:', error);
    return {
      success: false,
      error: 'Failed to fetch classes',
    };
  }
}

export async function getSubjects(): Promise<ApiResponse<any[]>> {
  try {
    const { data, error } = await supabase
      .from('subjects')
      .select('id, name, code')
      .order('name', { ascending: true });

    if (error) throw error;

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return {
      success: false,
      error: 'Failed to fetch subjects',
    };
  }
}

export async function getTeachers(): Promise<ApiResponse<any[]>> {
  try {
    // Query profiles table directly for all users with role = 'teacher'
    // This is the single source of truth for teacher data
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('role', 'teacher')
      .order('full_name', { ascending: true });

    if (error) throw error;

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return {
      success: false,
      error: 'Failed to fetch teachers',
    };
  }
}

// Get all students with their profiles
export async function getAllStudents(): Promise<ApiResponse<any[]>> {
  try {
    const { data, error } = await supabase
      .from('students')
      .select(`
        id,
        roll_number,
        class_id,
        section,
        profile:profiles(id, full_name, email)
      `)
      .eq('status', 'active')
      .order('roll_number', { ascending: true });

    if (error) throw error;

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    console.error('Error fetching students:', error);
    return {
      success: false,
      error: 'Failed to fetch students',
    };
  }
}

// Assign student to class and section
export async function assignStudentToClass(
  studentId: string,
  classId: string,
  section: string
): Promise<ApiResponse<any>> {
  try {
    const { data, error } = await supabase
      .from('students')
      .update({ class_id: classId, section })
      .eq('id', studentId)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
      message: 'Student assigned successfully',
    };
  } catch (error: any) {
    console.error('Error assigning student:', error);
    return {
      success: false,
      error: error?.message || 'Failed to assign student',
    };
  }
}

