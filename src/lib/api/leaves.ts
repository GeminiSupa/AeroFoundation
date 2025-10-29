import type { LeaveRequest, LeaveFormData, ApiResponse } from '../../types';

/**
 * Apply for leave (Student/Teacher/Parent)
 */
export async function applyForLeave(data: LeaveFormData & { userId: string; userName: string; userRole: string }): Promise<ApiResponse<LeaveRequest>> {
  try {
    // TODO: Replace with actual Supabase query
    
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const newLeaveRequest: LeaveRequest = {
      id: Date.now().toString(),
      userId: data.userId,
      userName: data.userName,
      userRole: data.userRole as any,
      leaveType: data.leaveType,
      startDate: data.startDate,
      endDate: data.endDate,
      days,
      reason: data.reason,
      status: 'pending',
      appliedAt: new Date().toISOString(),
    };

    return {
      success: true,
      data: newLeaveRequest,
      message: 'Leave request submitted successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to submit leave request',
    };
  }
}

/**
 * Get leave requests for a user
 */
export async function getUserLeaveRequests(userId: string): Promise<ApiResponse<LeaveRequest[]>> {
  try {
    // TODO: Replace with actual Supabase query
    
    const mockLeaveRequests: LeaveRequest[] = [
      {
        id: '1',
        userId,
        userName: 'User Name',
        userRole: 'student',
        leaveType: 'sick',
        startDate: '2025-10-25',
        endDate: '2025-10-27',
        days: 3,
        reason: 'Flu symptoms',
        status: 'pending',
        appliedAt: '2025-10-20T09:00:00',
      },
    ];

    return {
      success: true,
      data: mockLeaveRequests,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch leave requests',
    };
  }
}

/**
 * Get all pending leave requests (Admin only)
 */
export async function getPendingLeaveRequests(): Promise<ApiResponse<LeaveRequest[]>> {
  try {
    // TODO: Replace with actual Supabase query
    
    const mockLeaveRequests: LeaveRequest[] = [
      {
        id: '1',
        userId: 'user-1',
        userName: 'John Doe',
        userRole: 'student',
        leaveType: 'sick',
        startDate: '2025-10-25',
        endDate: '2025-10-27',
        days: 3,
        reason: 'Flu symptoms',
        status: 'pending',
        appliedAt: '2025-10-20T09:00:00',
      },
      {
        id: '2',
        userId: 'user-2',
        userName: 'Ms. Khan',
        userRole: 'teacher',
        leaveType: 'casual',
        startDate: '2025-10-28',
        endDate: '2025-10-28',
        days: 1,
        reason: 'Personal work',
        status: 'pending',
        appliedAt: '2025-10-21T10:00:00',
      },
    ];

    return {
      success: true,
      data: mockLeaveRequests,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch pending leave requests',
    };
  }
}

/**
 * Approve or reject leave request (Admin only)
 */
export async function reviewLeaveRequest(data: {
  leaveId: string;
  status: 'approved' | 'rejected';
  reviewerId: string;
  reviewerName: string;
  comments?: string;
}): Promise<ApiResponse<LeaveRequest>> {
  try {
    // TODO: Replace with actual Supabase query
    
    const updatedLeaveRequest: LeaveRequest = {
      id: data.leaveId,
      userId: 'user-id',
      userName: 'User Name',
      userRole: 'student',
      leaveType: 'sick',
      startDate: '2025-10-25',
      endDate: '2025-10-27',
      days: 3,
      reason: 'Flu symptoms',
      status: data.status,
      appliedAt: '2025-10-20T09:00:00',
      reviewedBy: data.reviewerName,
      reviewedAt: new Date().toISOString(),
      reviewComments: data.comments,
    };

    return {
      success: true,
      data: updatedLeaveRequest,
      message: `Leave request ${data.status} successfully`,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to review leave request',
    };
  }
}

/**
 * Cancel a leave request
 */
export async function cancelLeaveRequest(leaveId: string): Promise<ApiResponse<void>> {
  try {
    // TODO: Replace with actual Supabase query
    
    return {
      success: true,
      message: 'Leave request cancelled successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to cancel leave request',
    };
  }
}
