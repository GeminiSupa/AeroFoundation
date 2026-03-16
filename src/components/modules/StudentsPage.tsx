import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { GraduationCap, Search, Eye, Pencil, Loader2, AlertCircle, Upload, Trash2, Plus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStudents, getStudent, updateStudent, upsertStudent, deleteStudent } from '../../lib/api/students';
import { getClasses } from '../../lib/api/timetable';
import { getUsers, getParents, createUser } from '../../lib/api/users';
import { useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { Skeleton } from '../ui/skeleton';

function formatDate(val: string | null | undefined): string {
  if (!val) return '—';
  try {
    const d = new Date(val);
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
  } catch {
    return '—';
  }
}

function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/^["']|["']$/g, ''));
  const rows: string[][] = [];
  for (let i = 1; i < lines.length; i++) {
    const row: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let j = 0; j < lines[i].length; j++) {
      const c = lines[i][j];
      if (c === '"') inQuotes = !inQuotes;
      else if ((c === ',' && !inQuotes) || (c === '\n' && !inQuotes)) {
        row.push(cur.trim());
        cur = '';
      } else cur += c;
    }
    row.push(cur.trim());
    rows.push(row);
  }
  return { headers, rows };
}

export function StudentsPage() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewId, setViewId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null);
  const [addForm, setAddForm] = useState({
    full_name: '',
    email: '',
    password: '',
    roll_number: '',
    date_of_birth: '',
    class_id: '',
    section: '',
    gender: 'male',
    parent_id: '',
  });

  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setAddOpen(true);
      setSearchParams(new URLSearchParams());
    }
  }, [searchParams, setSearchParams]);

  const [editForm, setEditForm] = useState<{
    roll_number: string;
    class_id: string;
    section: string;
    date_of_birth: string;
    gender: string;
    parent_id: string;
    status: string;
  }>({
    roll_number: '',
    class_id: '',
    section: '',
    date_of_birth: '',
    gender: '',
    parent_id: '',
    status: 'active',
  });

  const { data: students = [], isLoading, error } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const r = await getStudents();
      return r.success ? r.data : [];
    },
  });

  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const r = await getClasses();
      return r.success ? r.data : [];
    },
    enabled: !!editId || addOpen,
  });

  const { data: parents = [] } = useQuery({
    queryKey: ['parents'],
    queryFn: async () => {
      const r = await getParents();
      return r.success ? (r.data || []) : [];
    },
    enabled: !!editId || addOpen,
  });

  const { data: selectedStudent } = useQuery({
    queryKey: ['student', viewId ?? editId],
    queryFn: async () => {
      const id = viewId ?? editId;
      if (!id) return null;
      const r = await getStudent(id);
      return r.success ? r.data : null;
    },
    enabled: !!(viewId || editId),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Record<string, unknown> }) =>
      updateStudent(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['student', editId] });
      toast.success('Student updated');
      setEditId(null);
    },
    onError: (e: any) => toast.error(e?.message || 'Failed to update student'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteStudent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student deleted');
      setDeleteId(null);
    },
    onError: (e: any) => toast.error(e?.message || 'Failed to delete student'),
  });

  const addMutation = useMutation({
    mutationFn: async (data: typeof addForm) => {
      const res = await createUser({
        email: data.email,
        password: data.password,
        full_name: data.full_name,
        role: 'student',
        additional_data: {
          roll_number: data.roll_number,
          date_of_birth: data.date_of_birth || undefined,
          gender: data.gender || undefined,
          class_id: data.class_id || undefined,
          section: data.section || undefined,
          parent_id: data.parent_id || undefined,
        }
      });
      if (!res.success) throw new Error(res.error);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student added successfully');
      setAddOpen(false);
      setAddForm({ full_name: '', email: '', password: '', roll_number: '', date_of_birth: '', gender: 'male', class_id: '', section: '', parent_id: '' });
    },
    onError: (e: any) => toast.error(e?.message || 'Failed to add student'),
  });

  const filtered = students.filter((s: any) => {
    const name = (s.profile?.full_name ?? '').toLowerCase();
    const email = (s.profile?.email ?? '').toLowerCase();
    const roll = (s.roll_number ?? '').toLowerCase();
    const q = searchQuery.toLowerCase();
    return !q || name.includes(q) || email.includes(q) || roll.includes(q);
  });

  const openView = (row: any) => {
    setViewId(row.id);
    setEditId(null);
  };

  const openEdit = (row: any) => {
    setEditId(row.id);
    setViewId(null);
    setEditForm({
      roll_number: row.roll_number ?? '',
      class_id: row.class_id ?? '',
      section: row.section ?? '',
      date_of_birth: row.date_of_birth ? row.date_of_birth.slice(0, 10) : '',
      gender: row.gender ?? '',
      parent_id: row.parent_id ?? '',
      status: row.status ?? 'active',
    });
  };

  const handleSaveEdit = () => {
    if (!editId) return;
    const updates: Record<string, unknown> = {
      roll_number: editForm.roll_number || undefined,
      class_id: editForm.class_id || null,
      section: editForm.section || null,
      date_of_birth: editForm.date_of_birth || null,
      gender: editForm.gender || null,
      parent_id: editForm.parent_id || null,
      status: editForm.status || 'active',
    };
    updateMutation.mutate({ id: editId, updates });
  };

  const runImport = async (file: File) => {
    const text = await file.text();
    const { headers, rows } = parseCSV(text);
    const emailIdx = headers.findIndex((h) => h === 'email');
    if (emailIdx === -1) {
      toast.error('CSV must have an "email" column');
      return;
    }
    const rollIdx = headers.findIndex((h) => h === 'roll_number' || h === 'roll');
    const dobIdx = headers.findIndex((h) => h === 'date_of_birth' || h === 'dob');
    const genderIdx = headers.findIndex((h) => h === 'gender');
    const sectionIdx = headers.findIndex((h) => h === 'section');
    const classIdx = headers.findIndex((h) => h === 'class' || h === 'class_id');
    const parentEmailIdx = headers.findIndex((h) => h === 'parent_email' || h === 'parent');

    const [usersRes, classesRes, parentsRes] = await Promise.all([
      getUsers(),
      getClasses(),
      getParents(),
    ]);
    const allUsers = usersRes.success ? usersRes.data || [] : [];
    const studentByEmail = new Map<string, any>(
      allUsers.filter((u: any) => u.role === 'student').map((u: any) => [u.email?.toLowerCase(), u])
    );
    const classesList = classesRes.success ? classesRes.data || [] : [];
    const classByDisplay = new Map(classesList.map((c: any) => [(c.displayName || c.name || '').toLowerCase(), c]));
    const parentsList = parentsRes.success ? parentsRes.data || [] : [];
    const parentByEmail = new Map(parentsList.map((p: any) => [p.email?.toLowerCase(), p]));

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const email = (row[emailIdx] ?? '').trim().toLowerCase();
      if (!email) {
        skipped++;
        continue;
      }
      const profile = studentByEmail.get(email);
      if (!profile) {
        errors.push(`Row ${i + 2}: No student user found for email ${email}`);
        skipped++;
        continue;
      }
      const roll = rollIdx >= 0 ? (row[rollIdx] ?? '').trim() : profile.id.slice(0, 8);
      const classVal = classIdx >= 0 ? (row[classIdx] ?? '').trim() : '';
      const classId = classVal ? (classByDisplay.get(classVal.toLowerCase())?.id ?? null) : null;
      const parentEmail = parentEmailIdx >= 0 ? (row[parentEmailIdx] ?? '').trim().toLowerCase() : '';
      const parentId = parentEmail ? (parentByEmail.get(parentEmail)?.id ?? null) : null;
      const res = await upsertStudent({
        id: profile.id,
        roll_number: roll || String(profile.id).slice(0, 8),
        class_id: classId || undefined,
        section: sectionIdx >= 0 ? (row[sectionIdx] ?? '').trim() || undefined : undefined,
        date_of_birth: dobIdx >= 0 && row[dobIdx] ? row[dobIdx].trim() : undefined,
        gender: (genderIdx >= 0 && row[genderIdx] ? row[genderIdx].trim() : undefined) as any,
        parent_id: parentId || undefined,
        status: 'active',
        admission_date: new Date().toISOString(),
      });
      if (res.success) imported++;
      else {
        const err = (res as { success: false; error: string }).error;
        errors.push(`Row ${i + 2}: ${err}`);
        skipped++;
      }
    }
    setImportResult({ imported, skipped, errors: errors.slice(0, 20) });
    queryClient.invalidateQueries({ queryKey: ['students'] });
    if (imported > 0) toast.success(`Imported ${imported} student(s)`);
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-role-student">
          <GraduationCap className="w-7 h-7 sm:w-8 sm:h-8" />
          Students
        </h1>
        <p className="text-muted-foreground">View and edit student records</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email or roll number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <input
                type="file"
                accept=".csv"
                className="hidden"
                id="students-csv-input"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setImportResult(null);
                    runImport(f);
                    setImportOpen(true);
                    e.target.value = '';
                  }
                }}
              />
              <Button variant="outline" onClick={() => document.getElementById('students-csv-input')?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                Import CSV
              </Button>
              <Button onClick={() => setAddOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Student
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12 text-destructive">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>Failed to load students</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Roll #</TableHead>
                    <TableHead>DOB</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Parent</TableHead>
                    <TableHead>Parent Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((row: any) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">
                        {row.profile?.full_name ?? '—'}
                      </TableCell>
                      <TableCell>{row.profile?.email ?? '—'}</TableCell>
                      <TableCell>{row.roll_number ?? '—'}</TableCell>
                      <TableCell>{formatDate(row.date_of_birth)}</TableCell>
                      <TableCell>{row.gender ?? '—'}</TableCell>
                      <TableCell>{row.class_name ?? '—'}</TableCell>
                      <TableCell>{row.parent_name ?? '—'}</TableCell>
                      <TableCell>{row.parent_phone ?? '—'}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            row.status === 'active'
                              ? 'default'
                              : row.status === 'graduated'
                              ? 'secondary'
                              : 'outline'
                          }
                        >
                          {row.status ?? 'active'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openView(row)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEdit(row)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteId(row.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {!isLoading && !error && filtered.length === 0 && (
            <p className="text-center py-8 text-muted-foreground">No students found</p>
          )}
        </CardContent>
      </Card>

      {/* View dialog */}
      <Dialog open={!!viewId} onOpenChange={() => setViewId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Student details</DialogTitle>
            <DialogDescription>View student record</DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-3 text-sm">
              <p><span className="text-muted-foreground">Name:</span> {selectedStudent.profile?.full_name ?? '—'}</p>
              <p><span className="text-muted-foreground">Email:</span> {selectedStudent.profile?.email ?? '—'}</p>
              <p><span className="text-muted-foreground">Roll number:</span> {selectedStudent.roll_number ?? '—'}</p>
              <p><span className="text-muted-foreground">DOB:</span> {formatDate(selectedStudent.date_of_birth)}</p>
              <p><span className="text-muted-foreground">Gender:</span> {selectedStudent.gender ?? '—'}</p>
              <p><span className="text-muted-foreground">Section:</span> {selectedStudent.section ?? '—'}</p>
              <p><span className="text-muted-foreground">Admission date:</span> {formatDate(selectedStudent.admission_date)}</p>
              <p><span className="text-muted-foreground">Status:</span> {selectedStudent.status ?? 'active'}</p>
              {selectedStudent.parent && (
                <div className="border-t pt-2 mt-2">
                  <p className="font-medium text-sm mb-1">Parent Info</p>
                  <p><span className="text-muted-foreground">Parent:</span> {selectedStudent.parent?.full_name ?? '—'}</p>
                  <p><span className="text-muted-foreground">Parent Email:</span> {selectedStudent.parent?.email ?? '—'}</p>
                </div>
              )}
              <Button variant="outline" size="sm" onClick={() => { setViewId(null); openEdit(selectedStudent); }}>
                Edit
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editId} onOpenChange={() => setEditId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit student</DialogTitle>
            <DialogDescription>Update student record</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Roll number</Label>
              <Input
                value={editForm.roll_number}
                onChange={(e) => setEditForm((f) => ({ ...f, roll_number: e.target.value }))}
                placeholder="Roll number"
              />
            </div>
            <div className="space-y-2">
              <Label>Class</Label>
              <Select
                value={editForm.class_id || '_none'}
                onValueChange={(v) => setEditForm((f) => ({ ...f, class_id: v === '_none' ? '' : v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">— None —</SelectItem>
                  {classes.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>{c.displayName ?? c.name ?? c.id}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Section</Label>
              <Input
                value={editForm.section}
                onChange={(e) => setEditForm((f) => ({ ...f, section: e.target.value }))}
                placeholder="Section"
              />
            </div>
            <div className="space-y-2">
              <Label>Date of birth</Label>
              <Input
                type="date"
                value={editForm.date_of_birth}
                onChange={(e) => setEditForm((f) => ({ ...f, date_of_birth: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select
                value={editForm.gender || '_none'}
                onValueChange={(v) => setEditForm((f) => ({ ...f, gender: v === '_none' ? '' : v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">— None —</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Parent</Label>
              <Select
                value={editForm.parent_id || '_none'}
                onValueChange={(v) => setEditForm((f) => ({ ...f, parent_id: v === '_none' ? '' : v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select parent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">— None —</SelectItem>
                  {parents.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>{p.full_name ?? p.email ?? p.id}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {editForm.parent_id ? (
                <p className="text-xs text-muted-foreground">
                  Parent phone:{' '}
                  {parents.find((p: any) => p.id === editForm.parent_id)?.phone ||
                    parents.find((p: any) => p.id === editForm.parent_id)?.profile?.phone ||
                    '—'}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={editForm.status}
                onValueChange={(v) => setEditForm((f) => ({ ...f, status: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="graduated">Graduated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setEditId(null)}>Cancel</Button>
              <Button
                onClick={handleSaveEdit}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import result dialog */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>CSV import result</DialogTitle>
            <DialogDescription>
              Import students from CSV. CSV must include an &quot;email&quot; column (student user must already exist). Optional: roll_number, date_of_birth, gender, section, class, parent_email.
            </DialogDescription>
          </DialogHeader>
          {importResult && (
            <div className="space-y-2 text-sm">
              <p><strong>Imported:</strong> {importResult.imported}</p>
              <p><strong>Skipped / errors:</strong> {importResult.skipped}</p>
              {importResult.errors.length > 0 && (
                <div className="max-h-32 overflow-y-auto text-destructive">
                  {importResult.errors.map((e, i) => <div key={i}>{e}</div>)}
                </div>
               )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete student</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this student? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              {deleteMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
            <DialogDescription>Fill in the details to create a new student account.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input
                value={addForm.full_name}
                onChange={(e) => setAddForm((f) => ({ ...f, full_name: e.target.value }))}
                placeholder="Student Name"
              />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={addForm.email}
                onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="student@example.com"
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label>Password *</Label>
              <Input
                type="password"
                value={addForm.password}
                onChange={(e) => setAddForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="Secure password"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Roll Number *</Label>
                <Input
                  value={addForm.roll_number}
                  onChange={(e) => setAddForm((f) => ({ ...f, roll_number: e.target.value }))}
                  placeholder="e.g. 101"
                />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select
                  value={addForm.gender}
                  onValueChange={(v) => setAddForm((f) => ({ ...f, gender: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Date of Birth</Label>
              <Input
                type="date"
                value={addForm.date_of_birth}
                onChange={(e) => setAddForm((f) => ({ ...f, date_of_birth: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Class</Label>
                <Select
                  value={addForm.class_id || '_none'}
                  onValueChange={(v) => setAddForm((f) => ({ ...f, class_id: v === '_none' ? '' : v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">— None —</SelectItem>
                    {classes.map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>{c.displayName ?? c.name ?? c.id}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Section</Label>
                <Input
                  value={addForm.section}
                  onChange={(e) => setAddForm((f) => ({ ...f, section: e.target.value }))}
                  placeholder="e.g. A"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Parent</Label>
              <Select
                value={addForm.parent_id || '_none'}
                onValueChange={(v) => setAddForm((f) => ({ ...f, parent_id: v === '_none' ? '' : v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Assign a parent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">— None —</SelectItem>
                  {parents.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>{p.full_name ?? p.email ?? p.id}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {addForm.parent_id ? (
                <p className="text-xs text-muted-foreground">
                  Parent phone:{' '}
                  {parents.find((p: any) => p.id === addForm.parent_id)?.phone ||
                    parents.find((p: any) => p.id === addForm.parent_id)?.profile?.phone ||
                    '—'}
                </p>
              ) : null}
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button
                disabled={addMutation.isPending || !addForm.full_name || !addForm.email || !addForm.password || !addForm.roll_number}
                onClick={() => addMutation.mutate(addForm)}
              >
                {addMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Add
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
