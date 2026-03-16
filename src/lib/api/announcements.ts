import { supabase } from '../supabaseClient';

export interface Announcement {
  id: string;
  title: string;
  body: string;
  audience: string[];
  author_id: string | null;
  author_name: string | null;
  published: boolean;
  created_at: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export async function getAnnouncements(): Promise<ApiResponse<Announcement[]>> {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    return { success: false, error: 'Failed to fetch announcements' };
  }
}

export async function createAnnouncement(payload: Partial<Announcement>): Promise<ApiResponse<Announcement>> {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return { success: true, data, message: 'Announcement created' };
  } catch (error) {
    return { success: false, error: 'Failed to create announcement' };
  }
}

export async function updateAnnouncement(id: string, updates: Partial<Announcement>): Promise<ApiResponse<Announcement>> {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return { success: true, data, message: 'Announcement updated' };
  } catch (error) {
    return { success: false, error: 'Failed to update announcement' };
  }
}

export async function deleteAnnouncement(id: string): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { success: true, message: 'Announcement deleted' };
  } catch (error) {
    return { success: false, error: 'Failed to delete announcement' };
  }
}


