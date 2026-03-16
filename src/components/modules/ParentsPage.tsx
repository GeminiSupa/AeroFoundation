import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../ui/dialog';
import { UserCheck, Search, Plus, Pencil, Trash2, Users, Link as LinkIcon, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, getParents, createUser, deleteUser, updateUser } from '../../lib/api/users';
import { getStudents, linkParentToStudent } from '../../lib/api/students';
import { toast } from 'sonner';
import { Skeleton } from '../ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { Label } from '../ui/label';
import { useApp } from '../../context/AppContext';

export function ParentsPage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState<any>(null);

  const [addForm, setAddForm] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    selectedStudentIds: [] as string[],
  });

  const [editForm, setEditForm] = useState({
    full_name: '',
    phone: '',
    address: '',
    selectedStudentIds: [] as string[],
  });

  const [linkForm, setLinkForm] = useState({ parentId: '', studentId: '' });

  // Fetch parents
  const { data: parents = [], isLoading, error } = useQuery({
    queryKey: ['parents'],
    queryFn: async () => {
      const result = await getParents();
      if (!result.success) throw new Error(result.error);
      return result.data || [];
    },
  });

  // Fetch all students for linking
  const { data: allStudents = [] } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const result = await getStudents();
      return result.success ? result.data || [] : [];
    },
  });

  // Fetch all users for duplicate check
  const { data: allUsers = [] } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const result = await getUsers();
      return result.success ? result.data || [] : [];
    },
  });

  // Build parent → children map
  const childrenByParent = new Map<string, any[]>();
  allStudents.forEach((s: any) => {
    if (s.parent_id) {
      const list = childrenByParent.get(s.parent_id) || [];
      list.push(s);
      childrenByParent.set(s.parent_id, list);
    }
  });

  const filteredParents = parents.filter((p: any) => {
    const name = (p.full_name || '').toLowerCase();
    const email = (p.email || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    return !q || name.includes(q) || email.includes(q);
  });

  // Create parent mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof addForm) => {
      // Validation
      if (currentUser?.email && data.email.toLowerCase() === currentUser.email.toLowerCase()) {
        throw new Error('Cannot create a new account with your own email address.');
      }
      const dup = allUsers.find((u: any) => u.email.toLowerCase() === data.email.toLowerCase());
      if (dup) throw new Error('A user with this email already exists.');

      const res = await createUser({
        email: data.email,
        password: data.password,
        full_name: data.full_name,
        role: 'parent',
        phone: data.phone || undefined,
        address: data.address || undefined,
      });
      if (!res.success) throw new Error(res.error);

      // Link selected students
      if (res.data?.id && data.selectedStudentIds.length > 0) {
        for (const sid of data.selectedStudentIds) {
          await linkParentToStudent(sid, res.data.id);
        }
      }

      return res.data;
    },
    onSuccess: () => {
      toast.success('Parent added successfully!');
      setIsAddOpen(false);
      setAddForm({ full_name: '', email: '', password: '', phone: '', address: '', selectedStudentIds: [] });
      queryClient.invalidateQueries({ queryKey: ['parents'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (e: any) => toast.error(e.message || 'Failed to add parent'),
  });

  // Update parent mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof editForm }) => {
      const res = await updateUser(id, {
        full_name: data.full_name || undefined,
        phone: data.phone || undefined,
        address: data.address || undefined,
      } as any);
      if (!res.success) throw new Error(res.error);

      // Re-link students: unlink all current, then link selected
      const currentChildren = childrenByParent.get(id) || [];
      for (const child of currentChildren) {
        if (!data.selectedStudentIds.includes(child.id)) {
          await linkParentToStudent(child.id, null); // unlink
        }
      }
      for (const sid of data.selectedStudentIds) {
        await linkParentToStudent(sid, id);
      }

      return res.data;
    },
    onSuccess: () => {
      toast.success('Parent updated successfully!');
      setIsEditOpen(false);
      setSelectedParent(null);
      queryClient.invalidateQueries({ queryKey: ['parents'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
    onError: (e: any) => toast.error(e.message || 'Failed to update parent'),
  });

  // Delete parent
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // Unlink children first so parent dashboards and student records remain consistent.
      const children = childrenByParent.get(id) || [];
      for (const child of children) {
        await linkParentToStudent(child.id, null);
      }
      const res = await deleteUser(id);
      if (!res.success) throw new Error(res.error);
    },
    onSuccess: () => {
      toast.success('Parent removed');
      setIsDeleteOpen(false);
      setSelectedParent(null);
      queryClient.invalidateQueries({ queryKey: ['parents'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
    onError: (e: any) => toast.error(e.message || 'Failed to delete parent'),
  });

  // Link parent-child mutation
  const linkMutation = useMutation({
    mutationFn: async () => {
      if (!linkForm.parentId || !linkForm.studentId) throw new Error('Select both parent and student');
      return await linkParentToStudent(linkForm.studentId, linkForm.parentId);
    },
    onSuccess: () => {
      toast.success('Parent linked to student!');
      setIsLinkOpen(false);
      setLinkForm({ parentId: '', studentId: '' });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['parents'] });
    },
    onError: (e: any) => toast.error(e.message || 'Failed to link'),
  });

  const openEdit = (parent: any) => {
    setSelectedParent(parent);
    const children = childrenByParent.get(parent.id) || [];
    setEditForm({
      full_name: parent.full_name || '',
      phone: parent.phone || '',
      address: parent.address || '',
      selectedStudentIds: children.map((c: any) => c.id),
    });
    setIsEditOpen(true);
  };

  const toggleStudentSelection = (
    studentId: string,
    form: typeof addForm | typeof editForm,
    setForm: React.Dispatch<React.SetStateAction<any>>
  ) => {
    setForm((f: any) => ({
      ...f,
      selectedStudentIds: f.selectedStudentIds.includes(studentId)
        ? f.selectedStudentIds.filter((id: string) => id !== studentId)
        : [...f.selectedStudentIds, studentId],
    }));
  };

  const linkedCount = allStudents.filter((s: any) => s.parent_id).length;

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl sm:text-2xl font-bold">
            <UserCheck className="w-7 h-7 sm:w-8 sm:h-8 text-role-parent" />
            Parents Management
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Manage parent accounts and student relationships</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Dialog open={isLinkOpen} onOpenChange={setIsLinkOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <LinkIcon className="mr-2 h-4 w-4" />
                Link Parent-Student
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Link Parent to Student</DialogTitle>
                <DialogDescription>Associate an existing parent with a student</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Parent</Label>
                  <select
                    className="w-full border rounded-md p-2 bg-background"
                    value={linkForm.parentId}
                    onChange={(e) => setLinkForm((f) => ({ ...f, parentId: e.target.value }))}
                  >
                    <option value="">Select parent...</option>
                    {parents.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.full_name || p.email}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Student</Label>
                  <select
                    className="w-full border rounded-md p-2 bg-background"
                    value={linkForm.studentId}
                    onChange={(e) => setLinkForm((f) => ({ ...f, studentId: e.target.value }))}
                  >
                    <option value="">Select student...</option>
                    {allStudents.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.profile?.full_name || s.profile?.email || s.id}</option>
                    ))}
                  </select>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsLinkOpen(false)}>Cancel</Button>
                  <Button onClick={() => linkMutation.mutate()} disabled={linkMutation.isPending}>
                    {linkMutation.isPending ? 'Linking...' : 'Link'}
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Parent
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Parent</DialogTitle>
                <DialogDescription>Create a parent account and optionally link students.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <Input
                      value={addForm.full_name}
                      onChange={(e) => setAddForm((f) => ({ ...f, full_name: e.target.value }))}
                      placeholder="Parent Name"
                      autoComplete="off"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={addForm.email}
                      onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder="parent@example.com"
                      autoComplete="off"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Password *</Label>
                    <Input
                      type="password"
                      value={addForm.password}
                      onChange={(e) => setAddForm((f) => ({ ...f, password: e.target.value }))}
                      placeholder="Min. 6 characters"
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      type="tel"
                      value={addForm.phone}
                      onChange={(e) => setAddForm((f) => ({ ...f, phone: e.target.value }))}
                      placeholder="+1 234 567 8900"
                      autoComplete="off"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input
                    value={addForm.address}
                    onChange={(e) => setAddForm((f) => ({ ...f, address: e.target.value }))}
                    placeholder="Home address"
                    autoComplete="off"
                  />
                </div>
                {/* Multi-select students */}
                <div className="space-y-2">
                  <Label>Link Students (select multiple)</Label>
                  <div className="border rounded-md max-h-40 overflow-y-auto p-2 space-y-1">
                    {allStudents.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-2 text-center">No students available</p>
                    ) : (
                      allStudents.map((s: any) => (
                        <label key={s.id} className="flex items-center gap-2 p-1.5 rounded hover:bg-accent cursor-pointer text-sm">
                          <input
                            type="checkbox"
                            className="rounded"
                            checked={addForm.selectedStudentIds.includes(s.id)}
                            onChange={() => toggleStudentSelection(s.id, addForm, setAddForm)}
                          />
                          <span>{s.profile?.full_name || s.profile?.email || 'Unnamed'}</span>
                          {s.class_name && <Badge variant="outline" className="text-xs ml-auto">{s.class_name}</Badge>}
                        </label>
                      ))
                    )}
                  </div>
                  {addForm.selectedStudentIds.length > 0 && (
                    <p className="text-xs text-muted-foreground">{addForm.selectedStudentIds.length} student(s) selected</p>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                  <Button
                    disabled={createMutation.isPending || !addForm.full_name || !addForm.email || !addForm.password}
                    onClick={() => createMutation.mutate(addForm)}
                  >
                    {createMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Add Parent
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Parents</p>
                <h2 className="mt-2 text-2xl font-bold">{parents.length}</h2>
                <Badge variant="secondary" className="mt-2">Registered</Badge>
              </div>
              <div className="bg-role-parent p-3 rounded-lg text-white">
                <UserCheck className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Linked Students</p>
                <h2 className="mt-2 text-2xl font-bold">{linkedCount}</h2>
                <Badge variant="secondary" className="mt-2">Connected</Badge>
              </div>
              <div className="bg-role-student p-3 rounded-lg text-white">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Parents Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle>Parent Directory</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search parents..."
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
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8 text-destructive">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>Failed to load parents</span>
            </div>
          ) : filteredParents.length === 0 ? (
            <div className="text-center py-12">
              <UserCheck className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No parents found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Linked Students</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredParents.map((parent: any) => {
                    const children = childrenByParent.get(parent.id) || [];
                    return (
                      <TableRow key={parent.id}>
                        <TableCell className="font-medium">{parent.full_name || '—'}</TableCell>
                        <TableCell>{parent.email}</TableCell>
                        <TableCell>{parent.phone || '—'}</TableCell>
                        <TableCell>{parent.address || '—'}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {children.length === 0 ? (
                              <span className="text-muted-foreground text-sm">None</span>
                            ) : (
                              children.map((c: any) => (
                                <Badge key={c.id} variant="secondary" className="text-xs">
                                  {c.profile?.full_name || 'Student'}
                                </Badge>
                              ))
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => openEdit(parent)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => { setSelectedParent(parent); setIsDeleteOpen(true); }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Parent</DialogTitle>
            <DialogDescription>Update parent details and student links.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={editForm.full_name}
                onChange={(e) => setEditForm((f) => ({ ...f, full_name: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input
                  value={editForm.address}
                  onChange={(e) => setEditForm((f) => ({ ...f, address: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Linked Students</Label>
              <div className="border rounded-md max-h-40 overflow-y-auto p-2 space-y-1">
                {allStudents.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2 text-center">No students</p>
                ) : (
                  allStudents.map((s: any) => (
                    <label key={s.id} className="flex items-center gap-2 p-1.5 rounded hover:bg-accent cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={editForm.selectedStudentIds.includes(s.id)}
                        onChange={() => toggleStudentSelection(s.id, editForm, setEditForm)}
                      />
                      <span>{s.profile?.full_name || s.profile?.email || 'Unnamed'}</span>
                      {s.class_name && <Badge variant="outline" className="text-xs ml-auto">{s.class_name}</Badge>}
                    </label>
                  ))
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button
                disabled={updateMutation.isPending}
                onClick={() => selectedParent && updateMutation.mutate({ id: selectedParent.id, data: editForm })}
              >
                {updateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Save
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Parent</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {selectedParent?.full_name || 'this parent'}? Linked students will be unlinked.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => selectedParent && deleteMutation.mutate(selectedParent.id)}
            >
              {deleteMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
