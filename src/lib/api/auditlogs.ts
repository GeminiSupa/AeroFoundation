import { supabase } from '../supabaseClient';

export interface AuditLog {
  id: string;
  actor_id: string | null;
  actor_name: string | null;
  action: string;
  entity: string | null;
  entity_id: string | null;
  details: any | null;
  created_at: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export async function writeAuditLog(entry: Omit<AuditLog, 'id' | 'created_at'>): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase.from('audit_logs').insert(entry as any);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to write audit log' };
  }
}

export async function getAuditLogs(filters?: {
  action?: string;
  entity?: string;
  actorId?: string;
}): Promise<ApiResponse<AuditLog[]>> {
  try {
    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false });
    if (filters?.action) query = query.ilike('action', `%${filters.action}%`);
    if (filters?.entity) query = query.eq('entity', filters.entity);
    if (filters?.actorId) query = query.eq('actor_id', filters.actorId);
    const { data, error } = await query;
    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    return { success: false, error: 'Failed to fetch audit logs' };
  }
}


