import { supabase } from '../supabaseClient';

export interface TransportRoute {
  id: string;
  route_name: string;
  route_number: string;
  driver_name: string | null;
  driver_contact: string | null;
  vehicle_number: string | null;
  vehicle_type: 'bus' | 'van' | 'car';
  capacity: number;
  start_location: string;
  end_location: string;
  stops: any[] | null;
  fee_amount: number | null;
  status: 'active' | 'inactive' | 'maintenance';
  created_at: string;
  updated_at: string;
}

export interface TransportAssignment {
  id: string;
  student_id: string;
  student_name?: string;
  route_id: string;
  route_name?: string;
  pickup_location: string | null;
  dropoff_location: string | null;
  status: 'active' | 'suspended' | 'cancelled';
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export async function getRoutes(): Promise<ApiResponse<TransportRoute[]>> {
  try {
    const { data, error } = await supabase
      .from('transport_routes')
      .select('*')
      .order('route_name', { ascending: true });

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error fetching routes:', error);
    return {
      success: false,
      error: 'Failed to fetch routes',
    };
  }
}

export async function createRoute(
  route: Partial<TransportRoute>
): Promise<ApiResponse<TransportRoute>> {
  try {
    const { data, error } = await supabase
      .from('transport_routes')
      .insert(route)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
      message: 'Route created successfully',
    };
  } catch (error) {
    console.error('Error creating route:', error);
    return {
      success: false,
      error: 'Failed to create route',
    };
  }
}

export async function updateRoute(
  id: string,
  updates: Partial<TransportRoute>
): Promise<ApiResponse<TransportRoute>> {
  try {
    const { data, error } = await supabase
      .from('transport_routes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
      message: 'Route updated successfully',
    };
  } catch (error) {
    console.error('Error updating route:', error);
    return {
      success: false,
      error: 'Failed to update route',
    };
  }
}

export async function deleteRoute(id: string): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase
      .from('transport_routes')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return {
      success: true,
      message: 'Route deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting route:', error);
    return {
      success: false,
      error: 'Failed to delete route',
    };
  }
}

export async function getAssignments(
  filters?: { studentId?: string; routeId?: string }
): Promise<ApiResponse<TransportAssignment[]>> {
  try {
    let query = supabase
      .from('transport_assignments')
      .select(`
        *,
        student:students(
          profile:profiles(full_name)
        ),
        route:transport_routes(route_name)
      `)
      .order('created_at', { ascending: false });

    if (filters?.studentId) {
      query = query.eq('student_id', filters.studentId);
    }

    if (filters?.routeId) {
      query = query.eq('route_id', filters.routeId);
    }

    const { data, error } = await query;

    if (error) throw error;

    const assignments = data?.map((item: any) => ({
      ...item,
      student_name: item.student?.profile?.full_name || 'Unknown',
      route_name: item.route?.route_name || 'Unknown',
    })) || [];

    return { success: true, data: assignments };
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return {
      success: false,
      error: 'Failed to fetch assignments',
    };
  }
}

export async function createTransportAssignment(
  assignment: Partial<TransportAssignment>
): Promise<ApiResponse<TransportAssignment>> {
  try {
    const { data, error } = await supabase
      .from('transport_assignments')
      .insert(assignment)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
      message: 'Assignment created successfully',
    };
  } catch (error) {
    console.error('Error creating assignment:', error);
    return {
      success: false,
      error: 'Failed to create assignment',
    };
  }
}

export async function updateTransportAssignment(
  id: string,
  updates: Partial<TransportAssignment>
): Promise<ApiResponse<TransportAssignment>> {
  try {
    const { data, error } = await supabase
      .from('transport_assignments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
      message: 'Assignment updated successfully',
    };
  } catch (error) {
    console.error('Error updating assignment:', error);
    return {
      success: false,
      error: 'Failed to update assignment',
    };
  }
}

