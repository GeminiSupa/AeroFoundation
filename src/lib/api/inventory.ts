import { supabase } from '../supabaseClient';

export interface Asset {
  id: string;
  name: string;
  category: string;
  barcode: string;
  status: 'available' | 'in-use' | 'maintenance' | 'damaged';
  location: string;
  assigned_to?: string | null;
  purchase_date: string;
  condition: string;
  value: number;
  created_at: string;
  updated_at: string;
}

export interface FacilityBooking {
  id: string;
  facility: string;
  booked_by: string;
  requester_id?: string;
  requester_role?: 'student' | 'teacher' | 'admin';
  date: string; // YYYY-MM-DD
  time_slot: string; // e.g. "10:00 - 12:00"
  purpose: string;
  number_of_students?: number;
  status: 'pending' | 'approved' | 'rejected' | 'confirmed' | 'cancelled';
  current_approver_id?: string;
  requested_at?: string;
  approved_at?: string;
  rejected_at?: string;
  rejection_reason?: string;
  admin_notes?: string;
  hod_notes?: string;
  modified_date?: string;
  modified_time_slot?: string;
  created_at: string;
  updated_at: string;
}

export interface FacilityRequestLog {
  id: string;
  request_id: string;
  action: 'created' | 'forwarded' | 'approved' | 'rejected' | 'modified' | 'requested_info' | 'cancelled';
  actor_id: string;
  actor_role: string;
  notes?: string;
  modifications?: any;
  created_at: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ============== Assets ==============
export async function getAssets(filters?: {
  search?: string;
  category?: string;
  status?: string;
}): Promise<ApiResponse<Asset[]>> {
  try {
    let query = supabase
      .from('assets')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.search) {
      const term = filters.search;
      query = query.or(`name.ilike.%${term}%,barcode.ilike.%${term}%`);
    }

    if (filters?.category && filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    return { success: false, error: 'Failed to fetch assets' };
  }
}

export async function createAsset(asset: Partial<Asset>): Promise<ApiResponse<Asset>> {
  try {
    const { data, error } = await supabase
      .from('assets')
      .insert(asset)
      .select()
      .single();
    if (error) {
      console.error('Supabase error:', error);
      return { success: false, error: error.message || 'Failed to add asset' };
    }
    return { success: true, data, message: 'Asset added successfully' };
  } catch (error: any) {
    console.error('Create asset error:', error);
    return { success: false, error: error?.message || 'Failed to add asset' };
  }
}

export async function updateAsset(id: string, updates: Partial<Asset>): Promise<ApiResponse<Asset>> {
  try {
    const { data, error } = await supabase
      .from('assets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      console.error('Supabase error:', error);
      return { success: false, error: error.message || 'Failed to update asset' };
    }
    return { success: true, data, message: 'Asset updated successfully' };
  } catch (error: any) {
    console.error('Update asset error:', error);
    return { success: false, error: error?.message || 'Failed to update asset' };
  }
}

// ============== Facilities ==============
export async function getFacilityBookings(filters?: {
  facility?: string;
  date?: string;
}): Promise<ApiResponse<FacilityBooking[]>> {
  try {
    let query = supabase
      .from('facility_bookings')
      .select('*')
      .order('date', { ascending: true })
      .order('time_slot', { ascending: true });

    if (filters?.facility) query = query.eq('facility', filters.facility);
    if (filters?.date) query = query.eq('date', filters.date);

    const { data, error } = await query;
    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    return { success: false, error: 'Failed to fetch facility bookings' };
  }
}

export async function createFacilityBooking(booking: Partial<FacilityBooking>): Promise<ApiResponse<FacilityBooking>> {
  try {
    // conflict detection: same facility, same date, overlapping slot string
    const { data: conflicts } = await supabase
      .from('facility_bookings')
      .select('id')
      .eq('facility', booking.facility)
      .eq('date', booking.date)
      .eq('time_slot', booking.time_slot)
      .neq('status', 'cancelled');

    if (conflicts && conflicts.length > 0) {
      return { success: false, error: 'Conflict: facility already booked for this time slot' };
    }

    const { data, error } = await supabase
      .from('facility_bookings')
      .insert(booking)
      .select()
      .single();
    if (error) throw error;
    return { success: true, data, message: 'Booking confirmed' };
  } catch (error) {
    return { success: false, error: 'Failed to create facility booking' };
  }
}

export async function getFacilityRequestLogs(requestId: string): Promise<ApiResponse<FacilityRequestLog[]>> {
  try {
    const { data, error } = await supabase
      .from('facility_request_logs')
      .select('*')
      .eq('request_id', requestId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    return { success: false, error: 'Failed to fetch request logs' };
  }
}

export async function submitFacilityRequest(request: {
  facility: string;
  booked_by: string;
  requester_id: string;
  requester_role: 'student' | 'teacher' | 'admin';
  date: string;
  time_slot: string;
  purpose: string;
  number_of_students?: number;
}): Promise<ApiResponse<FacilityBooking>> {
  try {
    const { data, error } = await supabase
      .rpc('create_facility_request', {
        p_facility: request.facility,
        p_booked_by: request.booked_by,
        p_requester_id: request.requester_id,
        p_requester_role: request.requester_role,
        p_date: request.date,
        p_time_slot: request.time_slot,
        p_purpose: request.purpose,
        p_number_of_students: request.number_of_students || null,
      });
    if (error) throw error;
    
    const { data: booking } = await supabase
      .from('facility_bookings')
      .select('*')
      .eq('id', data)
      .single();
    
    return { success: true, data: booking, message: 'Request submitted successfully' };
  } catch (error: any) {
    console.error('Submit request error:', error);
    return { success: false, error: error?.message || 'Failed to submit facility request' };
  }
}

export async function reviewFacilityRequest(review: {
  request_id: string;
  actor_id: string;
  actor_role: string;
  action: 'approved' | 'rejected' | 'forwarded' | 'requested_info' | 'modified';
  notes?: string;
  modifications?: any;
  new_approver_id?: string;
}): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase
      .rpc('update_facility_request_status', {
        p_request_id: review.request_id,
        p_actor_id: review.actor_id,
        p_actor_role: review.actor_role,
        p_action: review.action,
        p_notes: review.notes || null,
        p_modifications: review.modifications || null,
        p_new_approver_id: review.new_approver_id || null,
      });
    if (error) throw error;
    return { success: true, message: 'Request reviewed successfully' };
  } catch (error: any) {
    console.error('Review request error:', error);
    return { success: false, error: error?.message || 'Failed to review facility request' };
  }
}

export async function getFacilityNotifications(userId: string): Promise<ApiResponse<any[]>> {
  try {
    const { data, error } = await supabase
      .from('facility_notifications')
      .select('*')
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    return { success: false, error: 'Failed to fetch notifications' };
  }
}

export async function markFacilityNotificationRead(notificationId: string): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase
      .from('facility_notifications')
      .update({ read: true })
      .eq('id', notificationId);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to mark notification as read' };
  }
}

export async function cancelFacilityRequest(requestId: string, cancelledBy: string): Promise<ApiResponse<void>> {
  try {
    // Update status to cancelled
    const { error: updateError } = await supabase
      .from('facility_bookings')
      .update({ 
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId);
    
    if (updateError) throw updateError;

    // Log the cancellation
    const { error: logError } = await supabase
      .from('facility_request_logs')
      .insert({
        request_id: requestId,
        action: 'cancelled',
        actor_id: cancelledBy,
        actor_role: 'system',
        notes: 'Request cancelled by requester',
      });
    
    if (logError) {
      console.warn('Failed to log cancellation:', logError);
      // Don't fail the whole operation if logging fails
    }

    return { success: true, message: 'Request cancelled successfully' };
  } catch (error: any) {
    console.error('Cancel request error:', error);
    return { success: false, error: error?.message || 'Failed to cancel request' };
  }
}

