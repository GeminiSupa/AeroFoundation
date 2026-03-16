import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../lib/api/users';
import { toast } from 'sonner';

export function useUsers(role?: string) {
  return useQuery({
    queryKey: ['users', role],
    queryFn: async () => {
      const result = await api.getUsers(role);
      return result.success ? result.data : [];
    },
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      const result = await api.getUser(id);
      return result.success ? result.data : null;
    },
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User created successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to create user: ' + error.message);
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<api.UserProfile> }) => {
      const result = await api.updateUser(id, updates);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User updated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to update user: ' + error.message);
    },
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await api.deactivateUser(id);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deactivated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to deactivate user: ' + error.message);
    },
  });
}

