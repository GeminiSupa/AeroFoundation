import { supabase } from '../supabaseClient';

export interface InternalMessage {
  id: string;
  sender_id: string;
  sender_name?: string;
  recipient_id: string;
  recipient_name?: string;
  subject: string;
  message: string;
  is_read: boolean;
  read_at: string | null;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  attachments: string[] | null;
  parent_message_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ParentTeacherMeeting {
  id: string;
  teacher_id: string;
  teacher_name?: string;
  parent_id: string;
  parent_name?: string;
  student_id: string;
  student_name?: string;
  meeting_date: string;
  meeting_time: string;
  duration_minutes: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  agenda: string | null;
  notes: string | null;
  feedback: string | null;
  created_at: string;
  updated_at: string;
}

export interface TeacherAvailability {
  id: string;
  teacher_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ==================== Messages ====================

export async function getMessages(
  filters?: { recipientId?: string; senderId?: string; isRead?: boolean }
): Promise<ApiResponse<InternalMessage[]>> {
  try {
    let query = supabase
      .from('internal_messages')
      .select(`
        *,
        sender:profiles!sender_id(full_name, avatar_url),
        recipient:profiles!recipient_id(full_name, avatar_url)
      `)
      .order('created_at', { ascending: false });

    if (filters?.recipientId) {
      query = query.eq('recipient_id', filters.recipientId);
    }

    if (filters?.senderId) {
      query = query.eq('sender_id', filters.senderId);
    }

    if (filters?.isRead !== undefined) {
      query = query.eq('read', filters.isRead);
    }

    const { data, error } = await query;

    if (error) throw error;

    const messages = data?.map((item: any) => ({
      ...item,
      sender_name: item.sender?.full_name || 'Unknown',
      recipient_name: item.recipient?.full_name || 'Unknown',
      is_read: item.read || false,
      attachments: item.attachments || [],
    })) || [];

    return { success: true, data: messages };
  } catch (error) {
    console.error('Error fetching messages:', error);
    return {
      success: false,
      error: 'Failed to fetch messages',
    };
  }
}

export async function sendMessage(
  message: Partial<InternalMessage>
): Promise<ApiResponse<InternalMessage>> {
  try {
    // Map the message to database schema
    const dbMessage: any = {
      sender_id: message.sender_id,
      recipient_id: message.recipient_id,
      subject: message.subject || '',
      message: message.message,
    };
    
    const { data, error } = await supabase
      .from('internal_messages')
      .insert(dbMessage)
      .select()
      .single();

    if (error) throw error;

    // Map back to API schema
    const apiMessage = {
      ...data,
      is_read: data.read || false,
    };

    return {
      success: true,
      data: apiMessage,
      message: 'Message sent successfully',
    };
  } catch (error) {
    console.error('Error sending message:', error);
    return {
      success: false,
      error: 'Failed to send message',
    };
  }
}

export async function markMessageAsRead(id: string): Promise<ApiResponse<InternalMessage>> {
  try {
    const { data, error } = await supabase
      .from('internal_messages')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
      message: 'Message marked as read',
    };
  } catch (error) {
    console.error('Error marking message as read:', error);
    return {
      success: false,
      error: 'Failed to mark message as read',
    };
  }
}

export async function getEligibleRecipients(userId: string, userRole: string): Promise<ApiResponse<any[]>> {
  try {
    let query = supabase
      .from('profiles')
      .select('id, full_name, email, role')
      .neq('id', userId); // Don't allow messaging yourself

    // Role-based filtering
    if (userRole === 'admin') {
      // Admin can message anyone
      // No additional filter needed
    } else if (userRole === 'teacher') {
      // Teachers can message: students, parents, teachers, admins
      // No filter needed - already can message all
    } else if (userRole === 'student') {
      // Students can only message their teachers and admin
      query = query.in('role', ['teacher', 'admin']);
    } else if (userRole === 'parent') {
      // Parents can only message teachers and admin
      query = query.in('role', ['teacher', 'admin']);
    }

    const { data, error } = await query.order('full_name', { ascending: true });

    if (error) throw error;

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    console.error('Error fetching recipients:', error);
    return {
      success: false,
      error: 'Failed to fetch recipients',
    };
  }
}

export async function getUnreadCount(userId: string): Promise<ApiResponse<number>> {
  try {
    const { count, error } = await supabase
      .from('internal_messages')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', userId)
      .eq('read', false);

    if (error) throw error;

    return {
      success: true,
      data: count || 0,
    };
  } catch (error) {
    console.error('Error getting unread count:', error);
    return {
      success: false,
      error: 'Failed to get unread count',
    };
  }
}

// ==================== Parent-Teacher Meetings ====================

export async function getMeetings(
  filters?: { teacherId?: string; parentId?: string; studentId?: string }
): Promise<ApiResponse<ParentTeacherMeeting[]>> {
  try {
    let query = supabase
      .from('parent_teacher_meetings')
      .select(`
        *,
        teacher:profiles!teacher_id(full_name, email),
        parent:profiles!parent_id(full_name, email),
        student:students(
          profile:profiles(full_name)
        )
      `)
      .order('meeting_date', { ascending: true })
      .order('meeting_time', { ascending: true });

    if (filters?.teacherId) {
      query = query.eq('teacher_id', filters.teacherId);
    }

    if (filters?.parentId) {
      query = query.eq('parent_id', filters.parentId);
    }

    if (filters?.studentId) {
      query = query.eq('student_id', filters.studentId);
    }

    const { data, error } = await query;

    if (error) throw error;

    const meetings = data?.map((item: any) => ({
      ...item,
      teacher_name: item.teacher?.full_name || 'Unknown',
      parent_name: item.parent?.full_name || 'Unknown',
      student_name: item.student?.profile?.full_name || 'Unknown',
    })) || [];

    return { success: true, data: meetings };
  } catch (error) {
    console.error('Error fetching meetings:', error);
    return {
      success: false,
      error: 'Failed to fetch meetings',
    };
  }
}

export async function createMeeting(
  meeting: Partial<ParentTeacherMeeting>
): Promise<ApiResponse<ParentTeacherMeeting>> {
  try {
    const { data, error } = await supabase
      .from('parent_teacher_meetings')
      .insert(meeting)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
      message: 'Meeting scheduled successfully',
    };
  } catch (error) {
    console.error('Error creating meeting:', error);
    return {
      success: false,
      error: 'Failed to schedule meeting',
    };
  }
}

export async function updateMeeting(
  id: string,
  updates: Partial<ParentTeacherMeeting>
): Promise<ApiResponse<ParentTeacherMeeting>> {
  try {
    const { data, error } = await supabase
      .from('parent_teacher_meetings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
      message: 'Meeting updated successfully',
    };
  } catch (error) {
    console.error('Error updating meeting:', error);
    return {
      success: false,
      error: 'Failed to update meeting',
    };
  }
}

// ==================== Teacher Availability ====================

export async function getTeacherAvailability(
  teacherId: string
): Promise<ApiResponse<TeacherAvailability[]>> {
  try {
    const { data, error } = await supabase
      .from('teacher_availability')
      .select('*')
      .eq('teacher_id', teacherId)
      .eq('is_available', true)
      .order('day_of_week', { ascending: true });

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error fetching teacher availability:', error);
    return {
      success: false,
      error: 'Failed to fetch availability',
    };
  }
}

export async function setTeacherAvailability(
  availability: Partial<TeacherAvailability>
): Promise<ApiResponse<TeacherAvailability>> {
  try {
    const { data, error } = await supabase
      .from('teacher_availability')
      .insert(availability)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
      message: 'Availability set successfully',
    };
  } catch (error) {
    console.error('Error setting availability:', error);
    return {
      success: false,
      error: 'Failed to set availability',
    };
  }
}

