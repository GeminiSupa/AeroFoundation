import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '../ui/form';
import { useCreateNotification, useUpdateNotification } from '../../hooks/useNotifications';
import { Loader2 } from 'lucide-react';

const announcementSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().min(1, 'Content is required').max(2000),
  category: z.enum(['Academic', 'Events', 'Sports', 'Facilities', 'Technology', 'General']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  target_roles: z.array(z.string()).min(1, 'Select at least one audience'),
  expiry_date: z.string().optional(),
});

type AnnouncementFormData = z.infer<typeof announcementSchema>;

interface AnnouncementFormProps {
  editingAnnouncement?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AnnouncementForm({ editingAnnouncement, onSuccess, onCancel }: AnnouncementFormProps) {
  const createMutation = useCreateNotification();
  const updateMutation = useUpdateNotification();

  const form = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: editingAnnouncement?.title || '',
      content: editingAnnouncement?.content || '',
      category: editingAnnouncement?.category || 'General',
      priority: editingAnnouncement?.priority || 'medium',
      target_roles: editingAnnouncement?.target_roles || [],
      expiry_date: editingAnnouncement?.expiry_date || '',
    },
  });

  const onSubmit = (data: AnnouncementFormData) => {
    if (editingAnnouncement) {
      updateMutation.mutate(
        { id: editingAnnouncement.id, updates: data },
        { onSuccess }
      );
    } else {
      createMutation.mutate(
        { ...data, status: 'published', author_id: '' },
        { onSuccess }
      );
    }
  };

  const targetRoles = ['admin', 'teacher', 'student', 'parent'];
  const selectedRoles = form.watch('target_roles');

  const toggleRole = (role: string) => {
    const current = form.getValues('target_roles');
    const updated = current.includes(role)
      ? current.filter(r => r !== role)
      : [...current, role];
    form.setValue('target_roles', updated);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title *</FormLabel>
              <FormControl>
                <Input placeholder="Enter announcement title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Write your announcement..."
                  rows={5}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Academic">Academic</SelectItem>
                    <SelectItem value="Events">Events</SelectItem>
                    <SelectItem value="Sports">Sports</SelectItem>
                    <SelectItem value="Facilities">Facilities</SelectItem>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="General">General</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="target_roles"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Audience *</FormLabel>
                <FormDescription>
                  Select the roles that should see this announcement
                </FormDescription>
              </div>
              <div className="space-y-2">
                {targetRoles.map((role) => (
                  <div key={role} className="flex items-center space-x-2">
                    <Checkbox
                      checked={selectedRoles.includes(role)}
                      onCheckedChange={() => toggleRole(role)}
                    />
                    <Label className="text-sm font-normal capitalize">
                      {role}
                    </Label>
                  </div>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {(createMutation.isPending || updateMutation.isPending) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {editingAnnouncement ? 'Update' : 'Publish'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

