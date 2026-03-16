import { supabase } from '../supabaseClient';

export interface LibraryBook {
  id: string;
  isbn: string | null;
  title: string;
  author: string;
  publisher: string | null;
  publication_year: number | null;
  category: string | null;
  edition: string | null;
  total_copies: number;
  available_copies: number;
  location: string | null;
  description: string | null;
  cover_image_url: string | null;
  status: 'available' | 'maintenance' | 'lost' | 'removed';
  created_at: string;
  updated_at: string;
}

export interface BookCheckout {
  id: string;
  book_id: string;
  book_title?: string;
  borrower_id: string;
  borrower_name?: string;
  checkout_date: string;
  due_date: string;
  return_date: string | null;
  status: 'checked_out' | 'returned' | 'overdue' | 'lost';
  fine_amount: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ==================== Books ====================

export async function getLibraryBooks(filters?: {
  search?: string;
  category?: string;
  status?: string;
}): Promise<ApiResponse<LibraryBook[]>> {
  try {
    let query = supabase
      .from('library_books')
      .select('*')
      .order('title', { ascending: true });

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,author.ilike.%${filters.search}%`);
    }

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error fetching library books:', error);
    return {
      success: false,
      error: 'Failed to fetch library books',
    };
  }
}

export async function createBook(book: Partial<LibraryBook>): Promise<ApiResponse<LibraryBook>> {
  try {
    const { data, error } = await supabase
      .from('library_books')
      .insert(book)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
      message: 'Book added successfully',
    };
  } catch (error) {
    console.error('Error creating book:', error);
    return {
      success: false,
      error: 'Failed to add book',
    };
  }
}

export async function updateBook(
  id: string,
  updates: Partial<LibraryBook>
): Promise<ApiResponse<LibraryBook>> {
  try {
    const { data, error } = await supabase
      .from('library_books')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
      message: 'Book updated successfully',
    };
  } catch (error) {
    console.error('Error updating book:', error);
    return {
      success: false,
      error: 'Failed to update book',
    };
  }
}

export async function deleteBook(id: string): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase
      .from('library_books')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return {
      success: true,
      message: 'Book deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting book:', error);
    return {
      success: false,
      error: 'Failed to delete book',
    };
  }
}

// ==================== Checkouts ====================

export async function getCheckouts(filters?: {
  borrowerId?: string;
  status?: string;
}): Promise<ApiResponse<BookCheckout[]>> {
  try {
    let query = supabase
      .from('book_checkouts')
      .select(`
        *,
        book:library_books(title),
        borrower:profiles(full_name)
      `)
      .order('checkout_date', { ascending: false });

    if (filters?.borrowerId) {
      query = query.eq('borrower_id', filters.borrowerId);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;

    if (error) throw error;

    const checkouts = data?.map((item: any) => ({
      ...item,
      book_title: item.book?.title || 'Unknown',
      borrower_name: item.borrower?.full_name || 'Unknown',
    })) || [];

    return { success: true, data: checkouts };
  } catch (error) {
    console.error('Error fetching checkouts:', error);
    return {
      success: false,
      error: 'Failed to fetch checkouts',
    };
  }
}

export async function checkoutBook(
  checkout: Partial<BookCheckout>
): Promise<ApiResponse<BookCheckout>> {
  try {
    const { data, error } = await supabase
      .from('book_checkouts')
      .insert(checkout)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
      message: 'Book checked out successfully',
    };
  } catch (error) {
    console.error('Error checking out book:', error);
    return {
      success: false,
      error: 'Failed to checkout book',
    };
  }
}

export async function returnBook(
  id: string,
  updates: Partial<BookCheckout>
): Promise<ApiResponse<BookCheckout>> {
  try {
    const { data, error } = await supabase
      .from('book_checkouts')
      .update({
        ...updates,
        return_date: new Date().toISOString().split('T')[0],
        status: 'returned',
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
      message: 'Book returned successfully',
    };
  } catch (error) {
    console.error('Error returning book:', error);
    return {
      success: false,
      error: 'Failed to return book',
    };
  }
}

