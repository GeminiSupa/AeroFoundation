import { supabase } from '../supabaseClient';

export interface PortfolioItem {
  id: string;
  student_id: string;
  student_name?: string;
  title: string;
  description: string | null;
  project_type: 'project' | 'achievement' | 'certificate' | 'artwork' | 'competition';
  attachments: string[] | null;
  external_link: string | null;
  tags: string[] | null;
  featured: boolean;
  visibility: 'private' | 'public' | 'school';
  created_at: string;
  updated_at: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export async function getStudentPortfolio(
  studentId: string
): Promise<ApiResponse<PortfolioItem[]>> {
  try {
    const { data, error } = await supabase
      .from('student_portfolios')
      .select(`
        *,
        student:students(
          profile:profiles(full_name)
        )
      `)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const items = data?.map((item: any) => ({
      ...item,
      student_name: item.student?.profile?.full_name || 'Unknown',
      attachments: item.attachments || [],
      tags: item.tags || [],
    })) || [];

    return { success: true, data: items };
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return {
      success: false,
      error: 'Failed to fetch portfolio',
    };
  }
}

export async function getPublicPortfolios(): Promise<ApiResponse<PortfolioItem[]>> {
  try {
    const { data, error } = await supabase
      .from('student_portfolios')
      .select(`
        *,
        student:students(
          profile:profiles(full_name, avatar_url)
        )
      `)
      .eq('visibility', 'public')
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;

    const items = data?.map((item: any) => ({
      ...item,
      student_name: item.student?.profile?.full_name || 'Unknown',
      attachments: item.attachments || [],
      tags: item.tags || [],
    })) || [];

    return { success: true, data: items };
  } catch (error) {
    console.error('Error fetching public portfolios:', error);
    return {
      success: false,
      error: 'Failed to fetch public portfolios',
    };
  }
}

export async function createPortfolioItem(
  item: Partial<PortfolioItem>
): Promise<ApiResponse<PortfolioItem>> {
  try {
    const { data, error } = await supabase
      .from('student_portfolios')
      .insert(item)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
      message: 'Portfolio item created successfully',
    };
  } catch (error) {
    console.error('Error creating portfolio item:', error);
    return {
      success: false,
      error: 'Failed to create portfolio item',
    };
  }
}

export async function updatePortfolioItem(
  id: string,
  updates: Partial<PortfolioItem>
): Promise<ApiResponse<PortfolioItem>> {
  try {
    const { data, error } = await supabase
      .from('student_portfolios')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
      message: 'Portfolio item updated successfully',
    };
  } catch (error) {
    console.error('Error updating portfolio item:', error);
    return {
      success: false,
      error: 'Failed to update portfolio item',
    };
  }
}

export async function deletePortfolioItem(id: string): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase
      .from('student_portfolios')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return {
      success: true,
      message: 'Portfolio item deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting portfolio item:', error);
    return {
      success: false,
      error: 'Failed to delete portfolio item',
    };
  }
}

export async function uploadPortfolioFile(
  file: File,
  studentId: string,
  bucket = 'portfolios'
): Promise<ApiResponse<string>> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${studentId}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return {
      success: true,
      data: publicUrl,
      message: 'File uploaded successfully',
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    return {
      success: false,
      error: 'Failed to upload file',
    };
  }
}

