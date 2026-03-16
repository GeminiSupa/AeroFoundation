import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../lib/api/fees';
import { toast } from 'sonner';

export function useFeeStructures() {
  return useQuery({
    queryKey: ['feeStructures'],
    queryFn: api.getFeeStructures,
  });
}

export function useFeePayments(studentId?: string) {
  return useQuery({
    queryKey: ['feePayments', studentId],
    queryFn: () => api.getFeePayments(studentId),
  });
}

export function useCreateFeeStructure() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createFeeStructure,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeStructures'] });
      toast.success('Fee structure created successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to create fee structure: ' + error.message);
    },
  });
}

export function useCreateFeePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createFeePayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feePayments'] });
      toast.success('Fee payment recorded successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to record payment: ' + error.message);
    },
  });
}

export function useUpdateFeePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<api.FeePayment> }) =>
      api.updateFeePayment(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feePayments'] });
      toast.success('Payment updated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to update payment: ' + error.message);
    },
  });
}

