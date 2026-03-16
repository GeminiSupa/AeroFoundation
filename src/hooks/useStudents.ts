import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../lib/api/students';
import { toast } from 'sonner';

export function useStudents() {
  return useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const r = await api.getStudents();
      if (!r.success) {
        const err = (r as { success: false; error: string }).error;
        throw new Error(err);
      }
      return r.data;
    },
  });
}

export function useStudent(id: string) {
  return useQuery({
    queryKey: ['student', id],
    queryFn: async () => {
      const r = await api.getStudent(id);
      if (!r.success) {
        const err = (r as { success: false; error: string }).error;
        throw new Error(err);
      }
      return r.data;
    },
    enabled: !!id,
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student added successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to add student: ' + error.message);
    },
  });
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<api.StudentData> }) =>
      api.updateStudent(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student updated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to update student: ' + error.message);
    },
  });
}

export function useDeleteStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.deleteStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student deleted successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to delete student: ' + error.message);
    },
  });
}

