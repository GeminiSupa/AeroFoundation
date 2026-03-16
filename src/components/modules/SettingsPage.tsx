import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Settings, Shield, Palette, Plug, BookOpen, Plus, Edit, Trash2, Loader2, User, Sun, Moon } from 'lucide-react';
import { Badge } from '../ui/badge';
import { useApp } from '../../context/AppContext';
import { getCurrentUserProfile } from '../../lib/api/auth';
import { updateUser } from '../../lib/api/users';
import { supabase } from '../../lib/supabaseClient';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSubjects, createSubject, updateSubject, deleteSubject } from '../../lib/api/subjects';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Skeleton } from '../ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { getSchoolLogoUrl, setSchoolLogoUrl } from '../../utils/schoolBranding';

const subjectSchema = z.object({
  name: z.string().min(1, 'Subject name is required'),
  code: z.string().optional(),
  department: z.string().optional(),
});

type SubjectFormData = z.infer<typeof subjectSchema>;

export function SettingsPage() {
  const queryClient = useQueryClient();
  const { user, setUser, theme, setTheme } = useApp();
  const [isSubjectDialogOpen, setIsSubjectDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<any>(null);
  const [deleteSubjectId, setDeleteSubjectId] = useState<string | null>(null);
  const [profileName, setProfileName] = useState(user?.name ?? '');
  const [passwordNew, setPasswordNew] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [logoUrl, setLogoUrl] = useState(getSchoolLogoUrl());
  const [logoUploading, setLogoUploading] = useState(false);

  useEffect(() => {
    setProfileName(user?.name ?? '');
  }, [user?.name]);

  const form = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: '',
      code: '',
      department: '',
    },
  });

  // Fetch subjects
  const { data: subjects, isLoading, error } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const res = await getSubjects();
      if (!res.success) throw new Error(res.error);
      return res.data || [];
    },
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (data: SubjectFormData) => {
      const res = await createSubject(data);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('Subject created successfully!');
      setIsSubjectDialogOpen(false);
      form.reset();
      setEditingSubject(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create subject');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: SubjectFormData }) => {
      const res = await updateSubject(id, data);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('Subject updated successfully!');
      setIsSubjectDialogOpen(false);
      form.reset();
      setEditingSubject(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update subject');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteSubject(id);
      if (!res.success) throw new Error(res.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('Subject deleted successfully!');
      setDeleteSubjectId(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete subject');
    },
  });

  const handleEditSubject = (subject: any) => {
    setEditingSubject(subject);
    form.reset({
      name: subject.name,
      code: subject.code || '',
      department: subject.department || '',
    });
    setIsSubjectDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsSubjectDialogOpen(false);
    form.reset();
    setEditingSubject(null);
  };

  const onSubmit = (data: SubjectFormData) => {
    if (editingSubject) {
      updateMutation.mutate({ id: editingSubject.id, data });
    } else {
      createMutation.mutate(data);
    }
  };


  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-module-settings">
          <Settings className="w-7 h-7 sm:w-8 sm:h-8" />
          Settings
        </h1>
        <p className="text-muted-foreground">Manage system settings and preferences</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="subjects">
            <BookOpen className="w-4 h-4 mr-2" />
            Subjects
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="branding">
            <Palette className="w-4 h-4 mr-2" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <Plug className="w-4 h-4 mr-2" />
            Integrations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Display name</CardTitle>
                <CardDescription>This name is shown across the app</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Your display name"
                  />
                </div>
                <Button
                  disabled={profileSaving || !user?.id}
                  onClick={async () => {
                    if (!user?.id) return;
                    setProfileSaving(true);
                    try {
                      const res = await updateUser(user.id, { full_name: profileName });
                      if (!res.success) {
                        toast.error(res.error || 'Failed to update name');
                        return;
                      }
                      const profile = await getCurrentUserProfile();
                      if (profile.success && profile.data) {
                        setUser({
                          id: profile.data.id,
                          name: profile.data.name,
                          email: profile.data.email,
                          role: profile.data.role as any,
                          avatar: profile.data.avatar,
                          class: profile.data.class,
                        } as any);
                        toast.success('Profile updated');
                      }
                    } finally {
                      setProfileSaving(false);
                    }
                  }}
                >
                  {profileSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save name
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Theme</CardTitle>
                <CardDescription>Choose light or dark appearance (saved in this browser)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    variant={theme === 'light' ? 'default' : 'outline'}
                    onClick={() => setTheme('light')}
                  >
                    <Sun className="w-4 h-4 mr-2" />
                    Light
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    onClick={() => setTheme('dark')}
                  >
                    <Moon className="w-4 h-4 mr-2" />
                    Dark
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="subjects">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Subjects & Academics</CardTitle>
                  <CardDescription>Manage all subjects offered at the school</CardDescription>
                </div>
                <Button onClick={() => setIsSubjectDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Subject
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : error ? (
                <div className="flex items-center justify-center py-12 text-destructive">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <span>Failed to load subjects</span>
                </div>
              ) : subjects?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No subjects yet</p>
                  <Button onClick={() => setIsSubjectDialogOpen(true)} className="mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Subject
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject Name</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subjects?.map((subject: any) => (
                        <TableRow key={subject.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-primary">
                                <BookOpen className="w-5 h-5" />
                              </div>
                              <span className="font-medium">{subject.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{subject.code || '-'}</TableCell>
                          <TableCell>{subject.department || '-'}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditSubject(subject)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteSubjectId(subject.id)}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add/Edit Subject Dialog */}
          <Dialog open={isSubjectDialogOpen} onOpenChange={handleDialogClose}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingSubject ? 'Edit Subject' : 'Add New Subject'}</DialogTitle>
                <DialogDescription>
                  {editingSubject ? 'Update subject details' : 'Create a new subject for the curriculum'}
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject Name *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Mathematics" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject Code</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., MATH101" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Sciences" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleDialogClose}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                      {(createMutation.isPending || updateMutation.isPending) && (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      {editingSubject ? 'Update Subject' : 'Create Subject'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={!!deleteSubjectId} onOpenChange={() => setDeleteSubjectId(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Subject?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. The subject will be permanently removed from the system.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    if (deleteSubjectId) {
                      deleteMutation.mutate(deleteSubjectId);
                    }
                  }}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TabsContent>

        <TabsContent value="security">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>Add an extra layer of security to your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label>Enable 2FA</Label>
                    <p className="text-sm text-muted-foreground">Require verification code for login</p>
                  </div>
                  <Switch />
                </div>
                <Button variant="outline">Configure 2FA</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>Change your account password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input
                    type="password"
                    placeholder="Enter new password"
                    value={passwordNew}
                    onChange={(e) => setPasswordNew(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <Input
                    type="password"
                    placeholder="Confirm new password"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                  />
                </div>
                <Button
                  disabled={passwordSaving || !passwordNew || passwordNew !== passwordConfirm || passwordNew.length < 6}
                  onClick={async () => {
                    if (passwordNew !== passwordConfirm) {
                      toast.error('Passwords do not match');
                      return;
                    }
                    if (passwordNew.length < 6) {
                      toast.error('Password must be at least 6 characters');
                      return;
                    }
                    setPasswordSaving(true);
                    try {
                      const { error } = await supabase.auth.updateUser({ password: passwordNew });
                      if (error) {
                        toast.error(error.message || 'Failed to update password');
                        return;
                      }
                      toast.success('Password updated');
                      setPasswordNew('');
                      setPasswordConfirm('');
                    } finally {
                      setPasswordSaving(false);
                    }
                  }}
                >
                  {passwordSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Update Password
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Retention & Compliance</CardTitle>
                <CardDescription>GDPR and data management settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label>GDPR Compliance Mode</Label>
                    <p className="text-sm text-muted-foreground">Enforce EU data protection regulations</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label>Data Retention (12 months)</Label>
                    <p className="text-sm text-muted-foreground">Automatically archive old records</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Button variant="outline">View Audit Log</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle>School Branding</CardTitle>
              <CardDescription>Customize the appearance of your school portal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>School Name</Label>
                <Input placeholder="Enter school name" defaultValue="AI School Management System" />
              </div>
              <div className="space-y-2">
                <Label>School Logo</Label>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                    {logoUrl ? (
                      <img src={logoUrl} alt="School logo" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-muted-foreground text-sm">Logo</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Input
                      placeholder="Logo URL (paste and save)"
                      value={logoUrl ?? ''}
                      onChange={(e) => setLogoUrl(e.target.value || null)}
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        disabled={logoUploading}
                        onClick={async () => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = async (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (!file) return;
                            setLogoUploading(true);
                            try {
                              const { data: up, error } = await supabase.storage
                                .from('branding')
                                .upload(`logo-${Date.now()}.${file.name.split('.').pop() || 'png'}`, file, { upsert: false });
                              if (error) {
                                toast.error(error.message || 'Upload failed. Create a storage bucket named "branding" in Supabase.');
                                return;
                              }
                              const { data: { publicUrl } } = supabase.storage.from('branding').getPublicUrl(up.path);
                              setSchoolLogoUrl(publicUrl);
                              setLogoUrl(publicUrl);
                              toast.success('Logo uploaded');
                            } catch (err: any) {
                              toast.error(err?.message || 'Upload failed');
                            } finally {
                              setLogoUploading(false);
                            }
                          };
                          input.click();
                        }}
                      >
                        {logoUploading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Upload Logo
                      </Button>
                      <Button onClick={() => { setSchoolLogoUrl(logoUrl || null); toast.success('Logo URL saved'); }}>
                        Save logo URL
                      </Button>
                      {logoUrl && (
                        <Button variant="ghost" onClick={() => { setLogoUrl(null); setSchoolLogoUrl(null); toast.success('Logo cleared'); }}>
                          Clear
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Primary Color</Label>
                <div className="flex items-center gap-4">
                  <Input type="color" defaultValue="#0D6EFD" className="w-20 h-10" />
                  <span className="text-sm text-muted-foreground">#0D6EFD</span>
                </div>
              </div>
              <Button>Save Branding</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Google Workspace</CardTitle>
                    <CardDescription>Calendar and email integration</CardDescription>
                  </div>
                  <Badge>Connected</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Sync calendars, import contacts, and enable single sign-on.
                </p>
                <Button variant="outline">Configure</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Microsoft 365</CardTitle>
                    <CardDescription>Teams and Office integration</CardDescription>
                  </div>
                  <Badge variant="secondary">Not Connected</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect with Microsoft Teams and Office apps.
                </p>
                <Button>Connect</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Zoom</CardTitle>
                    <CardDescription>Video conferencing</CardDescription>
                  </div>
                  <Badge variant="secondary">Not Connected</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Enable virtual classrooms and meetings.
                </p>
                <Button>Connect</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Stripe</CardTitle>
                    <CardDescription>Payment processing</CardDescription>
                  </div>
                  <Badge>Connected</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Accept online payments for tuition and fees.
                </p>
                <Button variant="outline">Configure</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
