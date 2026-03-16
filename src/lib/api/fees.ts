import { supabase } from '../supabaseClient';

export interface FeeStructure {
  id: string;
  class_id?: string;
  fee_type: string;
  amount: number;
  description?: string;
  academic_year: string;
}

export interface FeePayment {
  id: string;
  student_id: string;
  fee_structure_id?: string;
  amount: number;
  due_date: string;
  paid_date?: string;
  payment_method?: 'cash' | 'card' | 'bank-transfer' | 'online' | 'cheque';
  transaction_id?: string;
  status: 'pending' | 'paid' | 'overdue' | 'waived';
}

export async function getFeeStructures() {
  const { data, error } = await supabase
    .from('fee_structures')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createFeeStructure(fee: Partial<FeeStructure>) {
  const { data, error } = await supabase
    .from('fee_structures')
    .insert(fee)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getFeePayments(studentId?: string) {
  let query = supabase
    .from('fee_payments')
    .select('*')
    .order('due_date', { ascending: false });

  if (studentId) {
    query = query.eq('student_id', studentId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

export async function createFeePayment(payment: Partial<FeePayment>) {
  const { data, error } = await supabase
    .from('fee_payments')
    .insert(payment)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateFeePayment(id: string, updates: Partial<FeePayment>) {
  const { data, error } = await supabase
    .from('fee_payments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

