import { supabase } from '../supabaseClient';
import type { LeaveRequest } from '../../types';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

const LEAVE_TYPES = ['sick', 'casual', 'emergency', 'vacation', 'other'] as const;
export type LeaveType = typeof LEAVE_TYPES[number];

export async function getMyLeaveRequests(userId: string): Promise<ApiResponse<LeaveRequest[]>> {
  try {
    const { data, error } = await supabase
      .from('leave_requests')
      .select(`
        *,
        user:profiles!leave_requests_user_id_fkey(id, full_name, role),
        reviewer:profiles!leave_requests_reviewed_by_fkey(id, full_name)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const mapped: LeaveRequest[] = (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      userName: row.user?.full_name || 'Unknown',
      userRole: row.user?.role,
      leaveType: row.leave_type,
      startDate: row.start_date,
      endDate: row.end_date,
      days: row.days,
      reason: row.reason,
      status: row.status,
      appliedAt: row.applied_at,
      reviewedBy: row.reviewer?.full_name || undefined,
      reviewedAt: row.reviewed_at || undefined,
      reviewComments: row.review_comments || undefined,
    }));

    return { success: true, data: mapped };
  } catch (error: any) {
    console.error('getMyLeaveRequests error', error);
    return { success: false, error: error?.message || 'Failed to fetch leave requests' };
  }
}

export async function getParentLeaveRequests(parentId: string): Promise<ApiResponse<LeaveRequest[]>> {
  try {
    const { data: children, error: childErr } = await supabase
      .from('students')
      .select('id')
      .eq('parent_id', parentId)
      .eq('status', 'active');
    if (childErr) throw childErr;

    const childIds = (children || []).map((c: any) => c.id).filter(Boolean);
    if (childIds.length === 0) return { success: true, data: [] };

    const { data, error } = await supabase
      .from('leave_requests')
      .select(`
        *,
        user:profiles!leave_requests_user_id_fkey(id, full_name, role),
        reviewer:profiles!leave_requests_reviewed_by_fkey(id, full_name)
      `)
      .in('user_id', childIds)
      .order('created_at', { ascending: false });
    if (error) throw error;

    const mapped: LeaveRequest[] = (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      userName: row.user?.full_name || 'Unknown',
      userRole: row.user?.role,
      leaveType: row.leave_type,
      startDate: row.start_date,
      endDate: row.end_date,
      days: row.days,
      reason: row.reason,
      status: row.status,
      appliedAt: row.applied_at,
      reviewedBy: row.reviewer?.full_name || undefined,
      reviewedAt: row.reviewed_at || undefined,
      reviewComments: row.review_comments || undefined,
    }));

    return { success: true, data: mapped };
  } catch (error: any) {
    console.error('getParentLeaveRequests error', error);
    return { success: false, error: error?.message || 'Failed to fetch leave requests' };
  }
}

export async function submitLeaveRequest(payload: {
  userId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
}): Promise<ApiResponse<LeaveRequest>> {
  try {
    const { data, error } = await supabase
      .from('leave_requests')
      .insert({
        user_id: payload.userId,
        leave_type: payload.leaveType,
        start_date: payload.startDate,
        end_date: payload.endDate,
        reason: payload.reason,
        status: 'pending',
      })
      .select(`
        *,
        user:profiles!leave_requests_user_id_fkey(id, full_name, role)
      `)
      .single();

    if (error) throw error;

    const mapped: LeaveRequest = {
      id: data.id,
      userId: data.user_id,
      userName: data.user?.full_name || 'Unknown',
      userRole: data.user?.role || 'student',
      leaveType: data.leave_type,
      startDate: data.start_date,
      endDate: data.end_date,
      days: data.days,
      reason: data.reason,
      status: data.status,
      appliedAt: data.applied_at,
    };

    return { success: true, data: mapped, message: 'Leave request submitted' };
  } catch (error: any) {
    console.error('submitLeaveRequest error', error);
    return { success: false, error: error?.message || 'Failed to submit leave request' };
  }
}

export async function cancelLeaveRequest(leaveId: string, userId: string): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase
      .from('leave_requests')
      .delete()
      .eq('id', leaveId)
      .eq('user_id', userId)
      .eq('status', 'pending');

    if (error) throw error;

    return { success: true, message: 'Leave request cancelled' };
  } catch (error: any) {
    console.error('cancelLeaveRequest error', error);
    return { success: false, error: error?.message || 'Failed to cancel leave request' };
  }
}

export async function getPendingLeaveRequests(): Promise<ApiResponse<LeaveRequest[]>> {
  try {
    const { data, error } = await supabase
      .from('leave_requests')
      .select(`
        *,
        user:profiles!leave_requests_user_id_fkey(id, full_name, role)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) throw error;

    const mapped: LeaveRequest[] = (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      userName: row.user?.full_name || 'Unknown',
      userRole: row.user?.role || 'student',
      leaveType: row.leave_type,
      startDate: row.start_date,
      endDate: row.end_date,
      days: row.days,
      reason: row.reason,
      status: row.status,
      appliedAt: row.applied_at,
    }));

    return { success: true, data: mapped };
  } catch (error: any) {
    console.error('getPendingLeaveRequests error', error);
    return { success: false, error: error?.message || 'Failed to fetch pending requests' };
  }
}

export async function reviewLeaveRequest(payload: {
  leaveId: string;
  status: 'approved' | 'rejected';
  reviewerId: string;
  reviewComments?: string;
}): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase
      .from('leave_requests')
      .update({
        status: payload.status,
        reviewed_by: payload.reviewerId,
        reviewed_at: new Date().toISOString(),
        review_comments: payload.reviewComments || null,
      })
      .eq('id', payload.leaveId);

    if (error) throw error;

    return { success: true, message: 'Leave request updated' };
  } catch (error: any) {
    console.error('reviewLeaveRequest error', error);
    return { success: false, error: error?.message || 'Failed to update request' };
  }
}

export { LEAVE_TYPES };

export async function getLeaveStats(): Promise<ApiResponse<{
  pendingCount: number;
  approvedToday: number;
  rejectedToday: number;
  requestsThisMonth: number;
}>> {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const pending = await supabase
      .from('leave_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    const approved = await supabase
      .from('leave_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')
      .gte('reviewed_at', startOfToday.toISOString());

    const rejected = await supabase
      .from('leave_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'rejected')
      .gte('reviewed_at', startOfToday.toISOString());

    const month = await supabase
      .from('leave_requests')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString());

    return {
      success: true,
      data: {
        pendingCount: pending.count || 0,
        approvedToday: approved.count || 0,
        rejectedToday: rejected.count || 0,
        requestsThisMonth: month.count || 0,
      },
    };
  } catch (error: any) {
    console.error('getLeaveStats error', error);
    return {
      success: false,
      error: error?.message || 'Failed to fetch leave statistics',
    };
  }
}
