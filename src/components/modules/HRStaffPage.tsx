import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { UserPlus, Search, Users, ShieldCheck, GraduationCap } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, createUser } from '../../lib/api/users';
import { toast } from 'sonner';
import { Skeleton } from '../ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { useApp } from '../../context/AppContext';

// PART 11: Only admin and teacher roles allowed in HR
const staffFormSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  role: z.enum(['admin', 'teacher']),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
});

type StaffFormData = z.infer<typeof staffFormSchema>;

export function HRStaffPage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);

  // Fetch all users
  const { data: allUsers, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const result = await getUsers();
      if (!result.success) throw new Error(result.error);
      return result.data || [];
    },
  });

  // Filter to staff only (teachers + admins + owner/super_admin)
  const staff = (allUsers || []).filter(
    (u) => u.role === 'teacher' || u.role === 'admin' || u.role === 'owner' || u.role === 'super_admin'
  );

  const filteredStaff = staff.filter((u) => {
    const name = (u.full_name || '').toLowerCase();
    const email = u.email.toLowerCase();
    return name.includes(searchQuery.toLowerCase()) || email.includes(searchQuery.toLowerCase());
  });

  const teachers = staff.filter((u) => u.role === 'teacher');
  const admins = staff.filter((u) => u.role === 'admin' || u.role === 'owner' || u.role === 'super_admin');

  const staffForm = useForm<StaffFormData>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: {
      full_name: '',
      email: '',
      role: 'teacher',
      password: '',
      phone: '',
    },
  });

  // Create staff mutation
  const createStaffMutation = useMutation({
    mutationFn: async (data: StaffFormData) => {
      // PART 15: Prevent using own email
      if (currentUser?.email && data.email.toLowerCase() === currentUser.email.toLowerCase()) {
        throw new Error('Cannot create a new account with your own email address.');
      }
      // PART 15: Check for duplicate email
      const existingUsers = allUsers || [];
      const duplicate = existingUsers.find(
        (u) => u.email.toLowerCase() === data.email.toLowerCase()
      );
      if (duplicate) {
        throw new Error('A user with this email already exists.');
      }
      const result = await createUser(data);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      toast.success('Staff member added successfully!');
      setIsAddStaffOpen(false);
      staffForm.reset();
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add staff member');
    },
  });

  const handleAddStaff = staffForm.handleSubmit((data) => {
    createStaffMutation.mutate(data);
  });

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-module-hr">
            <Users className="w-7 h-7 sm:w-8 sm:h-8" />
            HR & Staff Management
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Manage admin and teaching staff</p>
        </div>
        <Dialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen}>
          <DialogTrigger asChild>
            <Button className="bg-module-hr hover:bg-module-hr/90 w-full sm:w-auto">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Staff
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
              <DialogDescription>
                Create a new teacher or administrator account.
              </DialogDescription>
            </DialogHeader>
            <Form {...staffForm}>
              <form onSubmit={handleAddStaff} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={staffForm.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" autoComplete="off" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={staffForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          {/* PART 14: neutral placeholder, no owner email autofill */}
                          <Input placeholder="user@example.com" type="email" autoComplete="off" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={staffForm.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        {/* PART 11: Only admin and teacher */}
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="admin">Administrator</SelectItem>
                            <SelectItem value="teacher">Teacher</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={staffForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Min. 6 characters" autoComplete="new-password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={staffForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone (Optional)</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="+1 234 567 8900" autoComplete="off" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddStaffOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createStaffMutation.isPending}>
                    {createStaffMutation.isPending ? 'Adding...' : 'Add Staff'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards — Staff only */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {isLoading ? (
          <>
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : error ? (
          <div className="col-span-3 flex items-center justify-center p-6 text-destructive">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>Failed to load data</span>
          </div>
        ) : (
          <>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Staff</p>
                    <h2 className="mt-2 text-2xl font-bold">{staff.length}</h2>
                    <Badge variant="secondary" className="mt-2">All Staff</Badge>
                  </div>
                  <div className="bg-module-hr p-3 rounded-lg text-white">
                    <Users className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Teachers</p>
                    <h2 className="mt-2 text-2xl font-bold">{teachers.length}</h2>
                    <Badge variant="secondary" className="mt-2">Teaching Staff</Badge>
                  </div>
                  <div className="bg-role-teacher p-3 rounded-lg text-white">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Administrators</p>
                    <h2 className="mt-2 text-2xl font-bold">{admins.length}</h2>
                    <Badge variant="secondary" className="mt-2">Admin Staff</Badge>
                  </div>
                  <div className="bg-primary p-3 rounded-lg text-primary-foreground">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Staff Directory — Single table, no tabs */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle>Staff Directory</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search staff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No staff members found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStaff.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.full_name || user.email}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="uppercase">{user.role}</Badge>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone || '—'}</TableCell>
                      <TableCell>
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-sap-positive text-white">Active</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
