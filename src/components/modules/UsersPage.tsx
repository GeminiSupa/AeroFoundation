import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Switch } from '../ui/switch';
import { Users, Plus, Search, Shield, Edit, Trash2, Key } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { toast } from 'sonner';

export function UsersPage() {
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditPermissionsOpen, setIsEditPermissionsOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    password: ''
  });
  const [permissions, setPermissions] = useState({
    dashboard: true,
    users: false,
    aiTools: false,
    classes: false,
    scheduling: false,
    finance: false,
    reports: false,
    settings: false
  });

  const admins = [
    { id: 1, name: 'Admin User', email: 'admin@school.com', role: 'Super Admin', status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane@school.com', role: 'Admin', status: 'active' },
  ];

  const teachers = [
    { id: 1, name: 'Ms. Khan', email: 'khan@school.com', subject: 'Mathematics', classes: 5, status: 'active' },
    { id: 2, name: 'Mr. Smith', email: 'smith@school.com', subject: 'Physics', classes: 4, status: 'active' },
    { id: 3, name: 'Mrs. Brown', email: 'brown@school.com', subject: 'English', classes: 6, status: 'leave' },
  ];

  const students = [
    { id: 1, name: 'John Doe', email: 'john@student.com', class: '10A', attendance: 92, status: 'active' },
    { id: 2, name: 'Sarah Smith', email: 'sarah@student.com', class: '8B', attendance: 95, status: 'active' },
    { id: 3, name: 'Michael Brown', email: 'michael@student.com', class: '9A', attendance: 88, status: 'active' },
  ];

  const handleAddUser = () => {
    if (!formData.name || !formData.email || !formData.role || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    toast.success('User Added Successfully! ✅', {
      description: `${formData.name} has been added as a ${formData.role}.`
    });
    
    setIsAddUserOpen(false);
    setFormData({ name: '', email: '', role: '', password: '' });
  };

  const handleSavePermissions = () => {
    toast.success('Permissions Updated ✅', {
      description: 'User permissions have been successfully updated.'
    });
    setIsEditPermissionsOpen(false);
  };

  const handleDeleteUser = () => {
    toast.success('User Deleted', {
      description: 'The user account has been removed from the system.'
    });
    setDeleteUserId(null);
  };

  const handleEditPermissions = (user: any) => {
    setSelectedUser(user);
    // Set default permissions based on role
    setPermissions({
      dashboard: true,
      users: user.role === 'Super Admin' || user.role === 'Admin',
      aiTools: user.role === 'Super Admin' || user.role === 'Admin',
      classes: true,
      scheduling: user.role === 'Super Admin' || user.role === 'Admin',
      finance: user.role === 'Super Admin' || user.role === 'Admin',
      reports: user.role === 'Super Admin' || user.role === 'Admin',
      settings: user.role === 'Super Admin' || user.role === 'Admin'
    });
    setIsEditPermissionsOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white flex items-center gap-2">
            <Users className="w-8 h-8" />
            User Management
          </h1>
          <p className="text-gray-400 mt-1">Manage users, roles, and permissions</p>
        </div>
        <Button onClick={() => setIsAddUserOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <p className="text-sm text-gray-400">Total Users</p>
            <h2 className="mt-2 text-white text-3xl">1,323</h2>
            <Badge className="mt-2 bg-green-500/10 text-green-400">Active</Badge>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <p className="text-sm text-gray-400">Students</p>
            <h2 className="mt-2 text-white text-3xl">1,234</h2>
            <Badge className="mt-2 bg-blue-500/10 text-blue-400">Enrolled</Badge>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <p className="text-sm text-gray-400">Teachers</p>
            <h2 className="mt-2 text-white text-3xl">87</h2>
            <Badge className="mt-2 bg-purple-500/10 text-purple-400">Staff</Badge>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <p className="text-sm text-gray-400">Admins</p>
            <h2 className="mt-2 text-white text-3xl">2</h2>
            <Badge className="mt-2 bg-orange-500/10 text-orange-400">Management</Badge>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Search Users</CardTitle>
          <CardDescription className="text-gray-400">Find users by name, email, or role</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input placeholder="Search users..." className="pl-9 bg-gray-700 border-gray-600 text-white" />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="students" className="space-y-4">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="students" className="data-[state=active]:bg-blue-600">Students</TabsTrigger>
          <TabsTrigger value="teachers" className="data-[state=active]:bg-blue-600">Teachers</TabsTrigger>
          <TabsTrigger value="admins" className="data-[state=active]:bg-blue-600">Admins</TabsTrigger>
          <TabsTrigger value="permissions" className="data-[state=active]:bg-blue-600">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="students">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Students</CardTitle>
                  <CardDescription>Manage student accounts</CardDescription>
                </div>
                <Button size="sm">Import Students</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Attendance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.email}`} />
                            <AvatarFallback>{student.name.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                          {student.name}
                        </div>
                      </TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.class}</TableCell>
                      <TableCell>{student.attendance}%</TableCell>
                      <TableCell>
                        <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                          {student.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">Edit</Button>
                          <Button size="sm" variant="destructive">Delete</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teachers">
          <Card>
            <CardHeader>
              <CardTitle>Teachers</CardTitle>
              <CardDescription>Manage teacher accounts and assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Classes</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teachers.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${teacher.email}`} />
                            <AvatarFallback>{teacher.name.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                          {teacher.name}
                        </div>
                      </TableCell>
                      <TableCell>{teacher.email}</TableCell>
                      <TableCell>{teacher.subject}</TableCell>
                      <TableCell>{teacher.classes} classes</TableCell>
                      <TableCell>
                        <Badge variant={teacher.status === 'active' ? 'default' : 'secondary'}>
                          {teacher.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">Edit</Button>
                          <Button size="sm" variant="destructive">Delete</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admins">
          <Card>
            <CardHeader>
              <CardTitle>Administrators</CardTitle>
              <CardDescription>Manage admin accounts and privileges</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${admin.email}`} />
                            <AvatarFallback>{admin.name.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                          {admin.name}
                        </div>
                      </TableCell>
                      <TableCell>{admin.email}</TableCell>
                      <TableCell>
                        <Badge variant="default">{admin.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">{admin.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditPermissions(admin)}
                            className="border-gray-600 text-gray-300"
                          >
                            <Shield className="h-4 w-4 mr-1" />
                            Permissions
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Role-Based Access Control
              </CardTitle>
              <CardDescription>Configure permissions for each user role</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h4>Admin Permissions</h4>
                  <p className="text-sm text-muted-foreground mt-1">Full access to all modules and features</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge>Dashboard</Badge>
                    <Badge>Users</Badge>
                    <Badge>AI Tools</Badge>
                    <Badge>Scheduling</Badge>
                    <Badge>Finance</Badge>
                    <Badge>Reports</Badge>
                    <Badge>Settings</Badge>
                    <Badge>Library</Badge>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h4>Teacher Permissions</h4>
                  <p className="text-sm text-muted-foreground mt-1">Access to classes, students, and assignments</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge variant="secondary">Dashboard</Badge>
                    <Badge variant="secondary">Classes</Badge>
                    <Badge variant="secondary">Leave Management</Badge>
                    <Badge variant="secondary">Library</Badge>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h4>Student Permissions</h4>
                  <p className="text-sm text-muted-foreground mt-1">View only access to personal data</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge variant="outline">Dashboard</Badge>
                    <Badge variant="outline">Assignments</Badge>
                    <Badge variant="outline">Grades (Read-only)</Badge>
                    <Badge variant="outline">Library</Badge>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h4>Parent Permissions</h4>
                  <p className="text-sm text-muted-foreground mt-1">View children's data and manage payments</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge variant="outline">Dashboard</Badge>
                    <Badge variant="outline">Child Performance</Badge>
                    <Badge variant="outline">Finance</Badge>
                    <Badge variant="outline">Leave Requests</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add User Dialog */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Add New User</DialogTitle>
            <DialogDescription className="text-gray-400">
              Create a new user account with role and permissions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-gray-300">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter full name"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-gray-300">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="user@school.com"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="role" className="text-gray-300">Role *</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="password" className="text-gray-300">Temporary Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter temporary password"
                className="bg-gray-700 border-gray-600 text-white"
              />
              <p className="text-xs text-gray-500 mt-1">User will be prompted to change on first login</p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddUserOpen(false);
                  setFormData({ name: '', email: '', role: '', password: '' });
                }}
                className="border-gray-600 text-gray-300"
              >
                Cancel
              </Button>
              <Button onClick={handleAddUser} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Permissions Dialog */}
      <Dialog open={isEditPermissionsOpen} onOpenChange={setIsEditPermissionsOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-400" />
              Edit Permissions
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedUser && `Configure module access for ${selectedUser.name}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Dashboard</Label>
                <p className="text-xs text-gray-500">View dashboard and analytics</p>
              </div>
              <Switch
                checked={permissions.dashboard}
                onCheckedChange={(checked) => setPermissions({ ...permissions, dashboard: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">User Management</Label>
                <p className="text-xs text-gray-500">Manage users and roles</p>
              </div>
              <Switch
                checked={permissions.users}
                onCheckedChange={(checked) => setPermissions({ ...permissions, users: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">AI Tools</Label>
                <p className="text-xs text-gray-500">Access AI features</p>
              </div>
              <Switch
                checked={permissions.aiTools}
                onCheckedChange={(checked) => setPermissions({ ...permissions, aiTools: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Classes</Label>
                <p className="text-xs text-gray-500">Manage classes and students</p>
              </div>
              <Switch
                checked={permissions.classes}
                onCheckedChange={(checked) => setPermissions({ ...permissions, classes: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Scheduling</Label>
                <p className="text-xs text-gray-500">Manage schedules and timetables</p>
              </div>
              <Switch
                checked={permissions.scheduling}
                onCheckedChange={(checked) => setPermissions({ ...permissions, scheduling: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Finance</Label>
                <p className="text-xs text-gray-500">Access financial data</p>
              </div>
              <Switch
                checked={permissions.finance}
                onCheckedChange={(checked) => setPermissions({ ...permissions, finance: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Reports</Label>
                <p className="text-xs text-gray-500">Generate and view reports</p>
              </div>
              <Switch
                checked={permissions.reports}
                onCheckedChange={(checked) => setPermissions({ ...permissions, reports: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Settings</Label>
                <p className="text-xs text-gray-500">Modify system settings</p>
              </div>
              <Switch
                checked={permissions.settings}
                onCheckedChange={(checked) => setPermissions({ ...permissions, settings: checked })}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsEditPermissionsOpen(false)}
                className="border-gray-600 text-gray-300"
              >
                Cancel
              </Button>
              <Button onClick={handleSavePermissions} className="bg-blue-600 hover:bg-blue-700">
                <Key className="h-4 w-4 mr-2" />
                Save Permissions
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent className="bg-gray-800 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete User Account?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This action cannot be undone. The user will lose access to the system and all associated data will be archived.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-600 text-gray-300">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
