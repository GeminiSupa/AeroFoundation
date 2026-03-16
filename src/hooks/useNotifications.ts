import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../lib/api/notifications';
import { toast } from 'sonner';

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: api.getNotifications,
  });
}

export function useCreateNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Announcement published successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to publish announcement: ' + error.message);
    },
  });
}

export function useUpdateNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<api.Notification> }) =>
      api.updateNotification(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Announcement updated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to update announcement: ' + error.message);
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Announcement deleted successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to delete announcement: ' + error.message);
    },
  });
}

