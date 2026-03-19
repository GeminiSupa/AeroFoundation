import { supabase } from '../supabaseClient';
import { writeAuditLog } from './auditlogs';
import { formatSupabaseError } from './errorFormat';

export interface FeeStructure {
  id: string;
  class_id: string | null;
  class_name?: string;
  fee_type: string;
  amount: number;
  frequency: 'monthly' | 'quarterly' | 'yearly' | 'one-time';
  due_day: number | null;
  academic_year: string;
  status: 'active' | 'archived';
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface FeePayment {
  id: string;
  student_id: string;
  student_name?: string;
  fee_structure_id: string;
  fee_type?: string;
  amount: number;
  due_date: string;
  payment_date: string | null;
  payment_method: 'cash' | 'card' | 'bank_transfer' | 'cheque' | 'online' | null;
  transaction_id: string | null;
  status: 'unpaid' | 'paid' | 'pending' | 'overdue' | 'partial';
  receipt_url: string | null;
  notes: string | null;
  paid_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PayrollRecord {
  id: string;
  employee_id: string;
  employee_name?: string;
  salary_amount: number;
  deductions: number;
  net_salary: number;
  pay_period_start: string;
  pay_period_end: string;
  payment_date: string;
  payment_method: string;
  transaction_id: string | null;
  status: 'pending' | 'paid' | 'failed';
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

// ==================== Fee Structures ====================

export async function getFeeStructures(classId?: string): Promise<ApiResponse<FeeStructure[]>> {
  try {
    let query = supabase
      .from('fee_structures')
      .select(`
        *,
        class:classes(id, section_code, subject:subjects(name, code))
      `)
      .order('created_at', { ascending: false });

    if (classId) {
      query = query.eq('class_id', classId);
    }

    const { data, error } = await query;

    if (error) throw error;

    const structures = data?.map((item: any) => {
      const classLabel = item.class
        ? [item.class.subject?.name || item.class.subject?.code, item.class.section_code].filter(Boolean).join(' ')
        : 'All Classes';
      return {
        ...item,
        class_name: classLabel,
      };
    }) || [];

    return { success: true, data: structures };
  } catch (error) {
    console.error('Error fetching fee structures:', error);
    return {
      success: false,
      error: 'Failed to fetch fee structures',
    };
  }
}

export async function createFeeStructure(structure: Partial<FeeStructure>): Promise<ApiResponse<FeeStructure>> {
  try {
    const { data, error } = await supabase
      .from('fee_structures')
      .insert(structure)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
      message: 'Fee structure created successfully',
    };
  } catch (error) {
    console.error('Error creating fee structure:', error);
    return {
      success: false,
      error: 'Failed to create fee structure',
    };
  }
}

export async function updateFeeStructure(
  id: string,
  updates: Partial<FeeStructure>
): Promise<ApiResponse<FeeStructure>> {
  try {
    const { data, error } = await supabase
      .from('fee_structures')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
      message: 'Fee structure updated successfully',
    };
  } catch (error) {
    console.error('Error updating fee structure:', error);
    return {
      success: false,
      error: 'Failed to update fee structure',
    };
  }
}

export async function deleteFeeStructure(id: string): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase
      .from('fee_structures')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return {
      success: true,
      message: 'Fee structure deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting fee structure:', error);
    return {
      success: false,
      error: 'Failed to delete fee structure',
    };
  }
}

// ==================== Fee Payments ====================

export async function getFeePayments(filters?: {
  studentId?: string;
  status?: string;
  parentId?: string;
}): Promise<ApiResponse<FeePayment[]>> {
  try {
    // If we need parent scoping, resolve the parent's student ids first (Supabase cannot filter via nested select alias).
    let parentStudentIds: string[] | null = null;
    if (filters?.parentId) {
      const { data: children, error: childErr } = await supabase
        .from('students')
        .select('id')
        .eq('parent_id', filters.parentId)
        .eq('status', 'active');
      if (childErr) throw childErr;
      parentStudentIds = (children || []).map((c: any) => c.id).filter(Boolean);
    }

    let query = supabase
      .from('fee_payments')
      .select(`
        *,
        student:students(id, parent_id, profiles(full_name, email)),
        fee_structure:fee_structures(fee_type)
      `)
      .order('created_at', { ascending: false });

    if (filters?.studentId) {
      query = query.eq('student_id', filters.studentId);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (parentStudentIds) {
      if (parentStudentIds.length === 0) return { success: true, data: [] };
      query = query.in('student_id', parentStudentIds);
    }

    const { data, error } = await query;

    if (error) throw error;

    const payments = data?.map((item: any) => {
      const studentProfile = item.student?.profiles ?? item.student?.profile;
      return {
        ...item,
        student_name: studentProfile?.full_name || 'Unknown',
        fee_type: item.fee_structure?.fee_type || 'N/A',
      };
    }) || [];

    return { success: true, data: payments };
  } catch (error) {
    console.error('Error fetching fee payments:', formatSupabaseError(error));
    return {
      success: false,
      error: 'Failed to fetch fee payments',
    };
  }
}

/**
 * Get fee payments for a parent (all children), grouped by student.
 * Thin wrapper around getFeePayments to clarify intent for parent views.
 */
export async function getParentFeeList(parentId: string): Promise<ApiResponse<FeePayment[]>> {
  return getFeePayments({ parentId });
}

export async function getOutstandingFees(studentId?: string): Promise<ApiResponse<FeePayment[]>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    let query = supabase
      .from('fee_payments')
      .select(`
        *,
        student:students!inner(id, parent_id, profiles(full_name, email)),
        fee_structure:fee_structures(fee_type, amount)
      `)
      .in('status', ['unpaid', 'overdue', 'partial'])
      .order('due_date', { ascending: true });

    if (studentId) {
      query = query.eq('student_id', studentId);
    }

    const { data, error } = await query;

    if (error) throw error;

    const payments = data?.map((item: any) => {
      const p = item.student?.profiles ?? item.student?.profile;
      return {
        ...item,
        student_name: p?.full_name || 'Unknown',
        fee_type: item.fee_structure?.fee_type || 'N/A',
      };
    }) || [];

    return { success: true, data: payments };
  } catch (error) {
    console.error('Error fetching outstanding fees:', error);
    return {
      success: false,
      error: 'Failed to fetch outstanding fees',
    };
  }
}

export async function createFeePayment(
  payment: Partial<FeePayment>
): Promise<ApiResponse<FeePayment>> {
  try {
    const { data, error } = await supabase
      .from('fee_payments')
      .insert(payment)
      .select()
      .single();

    if (error) throw error;

    const actor = (await supabase.auth.getUser()).data.user;
    writeAuditLog({
      actor_id: actor?.id || null,
      actor_name: actor?.email || null,
      action: 'create_fee_payment',
      entity: 'fee_payment',
      entity_id: data?.id || null,
      details: { amount: data?.amount, status: data?.status },
    } as any);

    return {
      success: true,
      data,
      message: 'Fee payment recorded successfully',
    };
  } catch (error) {
    console.error('Error creating fee payment:', error);
    return {
      success: false,
      error: 'Failed to record fee payment',
    };
  }
}

export async function updateFeePayment(
  id: string,
  updates: Partial<FeePayment>
): Promise<ApiResponse<FeePayment>> {
  try {
    const { data, error } = await supabase
      .from('fee_payments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
      message: 'Fee payment updated successfully',
    };
  } catch (error) {
    console.error('Error updating fee payment:', error);
    return {
      success: false,
      error: 'Failed to update fee payment',
    };
  }
}

// ==================== Payroll ====================

export async function getPayrollRecords(filters?: {
  employeeId?: string;
  status?: string;
}): Promise<ApiResponse<PayrollRecord[]>> {
  try {
    let query = supabase
      .from('payroll')
      .select(`
        *,
        employee:profiles(full_name, email)
      `)
      .order('payment_date', { ascending: false });

    if (filters?.employeeId) {
      query = query.eq('employee_id', filters.employeeId);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;

    if (error) throw error;

    const records = data?.map((item: any) => ({
      ...item,
      employee_name: item.employee?.full_name || 'Unknown',
    })) || [];

    return { success: true, data: records };
  } catch (error) {
    console.error('Error fetching payroll records:', formatSupabaseError(error));
    return {
      success: false,
      error: 'Failed to fetch payroll records',
    };
  }
}

export async function createPayrollRecord(
  record: Partial<PayrollRecord>
): Promise<ApiResponse<PayrollRecord>> {
  try {
    const { data, error } = await supabase
      .from('payroll')
      .insert(record)
      .select()
      .single();

    if (error) throw error;

    const actor = (await supabase.auth.getUser()).data.user;
    writeAuditLog({
      actor_id: actor?.id || null,
      actor_name: actor?.email || null,
      action: 'create_payroll',
      entity: 'payroll',
      entity_id: data?.id || null,
      details: { employee_id: data?.employee_id, net_salary: data?.net_salary },
    } as any);

    return {
      success: true,
      data,
      message: 'Payroll record created successfully',
    };
  } catch (error) {
    console.error('Error creating payroll record:', error);
    return {
      success: false,
      error: 'Failed to create payroll record',
    };
  }
}

export async function updatePayrollRecord(
  id: string,
  updates: Partial<PayrollRecord>
): Promise<ApiResponse<PayrollRecord>> {
  try {
    const { data, error } = await supabase
      .from('payroll')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    const actor = (await supabase.auth.getUser()).data.user;
    writeAuditLog({
      actor_id: actor?.id || null,
      actor_name: actor?.email || null,
      action: 'update_payroll',
      entity: 'payroll',
      entity_id: id,
      details: updates,
    } as any);

    return {
      success: true,
      data,
      message: 'Payroll record updated successfully',
    };
  } catch (error) {
    console.error('Error updating payroll record:', error);
    return {
      success: false,
      error: 'Failed to update payroll record',
    };
  }
}

// ==================== Financial Analytics ====================

export async function getFeeCollectionStats(
  startDate?: string,
  endDate?: string
): Promise<ApiResponse<{
  totalCollected: number;
  totalPending: number;
  totalOverdue: number;
  collectionRate: number;
}>> {
  try {
    const { data, error } = await supabase
      .from('fee_payments')
      .select('amount, status');

    if (error) throw error;

    const totalCollected = data
      ?.filter((p) => p.status === 'paid')
      .reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0;

    const totalPending = data
      ?.filter((p) => p.status === 'pending')
      .reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0;

    const totalOverdue = data
      ?.filter((p) => p.status === 'overdue')
      .reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0;

    const totalExpected = totalCollected + totalPending + totalOverdue;
    const collectionRate = totalExpected > 0 
      ? (totalCollected / totalExpected) * 100 
      : 0;

    return {
      success: true,
      data: {
        totalCollected,
        totalPending,
        totalOverdue,
        collectionRate: Math.round(collectionRate * 10) / 10,
      },
    };
  } catch (error) {
    console.error('Error fetching fee collection stats:', formatSupabaseError(error));
    return {
      success: false,
      error: 'Failed to fetch fee collection statistics',
    };
  }
}

