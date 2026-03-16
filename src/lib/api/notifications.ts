import { supabase } from '../supabaseClient';

export interface Notification {
  id: string;
  title: string;
  content: string;
  author_id: string;
  target_roles: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  publish_date: string;
  expiry_date?: string;
  status: 'draft' | 'published' | 'expired';
  attachments?: string[];
  created_at: string;
}

export async function getNotifications() {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('status', 'published')
    .order('publish_date', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createNotification(notification: Partial<Notification>) {
  const { data, error } = await supabase
    .from('notifications')
    .insert(notification)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateNotification(id: string, updates: Partial<Notification>) {
  const { data, error } = await supabase
    .from('notifications')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteNotification(id: string) {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

