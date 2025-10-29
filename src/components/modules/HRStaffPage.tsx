import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { UserPlus, Search, Filter, AlertTriangle, CheckCircle, Calendar, FileText, Download, Bell } from 'lucide-react';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  joinDate: string;
  status: 'active' | 'onLeave' | 'inactive';
  credentials: Credential[];
}

interface Credential {
  id: string;
  type: string;
  name: string;
  issueDate: string;
  expiryDate: string;
  status: 'valid' | 'expiring' | 'expired';
  documentUrl: string;
}

export function HRStaffPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);

  // Mock data
  const staffMembers: StaffMember[] = [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      role: 'Principal',
      department: 'Administration',
      email: 'sarah.j@school.edu',
      phone: '+1 234-567-8901',
      joinDate: '2018-08-15',
      status: 'active',
      credentials: [
        { id: 'c1', type: 'Teaching License', name: 'State Teaching Certificate', issueDate: '2018-01-01', expiryDate: '2026-01-01', status: 'valid', documentUrl: '#' },
        { id: 'c2', type: 'Admin Certificate', name: 'Principal Leadership', issueDate: '2019-06-01', expiryDate: '2025-12-01', status: 'expiring', documentUrl: '#' },
      ]
    },
    {
      id: '2',
      name: 'Michael Chen',
      role: 'Math Teacher',
      department: 'Mathematics',
      email: 'michael.c@school.edu',
      phone: '+1 234-567-8902',
      joinDate: '2020-09-01',
      status: 'active',
      credentials: [
        { id: 'c3', type: 'Teaching License', name: 'Mathematics Certification', issueDate: '2020-01-01', expiryDate: '2024-12-31', status: 'expiring', documentUrl: '#' },
        { id: 'c4', type: 'CPR', name: 'CPR & First Aid', issueDate: '2023-03-15', expiryDate: '2025-03-15', status: 'valid', documentUrl: '#' },
      ]
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      role: 'Science Teacher',
      department: 'Science',
      email: 'emily.r@school.edu',
      phone: '+1 234-567-8903',
      joinDate: '2019-01-10',
      status: 'active',
      credentials: [
        { id: 'c5', type: 'Teaching License', name: 'Science Education Certificate', issueDate: '2019-01-01', expiryDate: '2027-01-01', status: 'valid', documentUrl: '#' },
        { id: 'c6', type: 'Background Check', name: 'Background Clearance', issueDate: '2023-01-01', expiryDate: '2024-11-01', status: 'expiring', documentUrl: '#' },
      ]
    },
    {
      id: '4',
      name: 'James Wilson',
      role: 'Librarian',
      department: 'Library',
      email: 'james.w@school.edu',
      phone: '+1 234-567-8904',
      joinDate: '2021-06-01',
      status: 'onLeave',
      credentials: [
        { id: 'c7', type: 'Library Certificate', name: 'Media Specialist License', issueDate: '2021-01-01', expiryDate: '2026-01-01', status: 'valid', documentUrl: '#' },
      ]
    },
  ];

  const expiringCredentials = staffMembers.flatMap(staff => 
    staff.credentials
      .filter(c => c.status === 'expiring' || c.status === 'expired')
      .map(c => ({ ...c, staffName: staff.name, staffId: staff.id }))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-500';
      case 'onLeave': return 'bg-yellow-500/10 text-yellow-500';
      case 'inactive': return 'bg-gray-500/10 text-gray-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getCredentialStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'bg-green-500/10 text-green-500';
      case 'expiring': return 'bg-yellow-500/10 text-yellow-500';
      case 'expired': return 'bg-red-500/10 text-red-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  const filteredStaff = staffMembers.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         staff.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || staff.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-white">HR & Staff Management</h1>
          <p className="text-gray-400 mt-1">Manage staff, credentials, and compliance tracking</p>
        </div>
        <Dialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Staff Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-gray-800 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Add New Staff Member</DialogTitle>
              <DialogDescription className="text-gray-400">
                Enter staff member details and credentials
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="staffName" className="text-gray-300">Full Name</Label>
                  <Input id="staffName" className="bg-gray-700 border-gray-600 text-white" />
                </div>
                <div>
                  <Label htmlFor="staffRole" className="text-gray-300">Role</Label>
                  <Input id="staffRole" className="bg-gray-700 border-gray-600 text-white" />
                </div>
                <div>
                  <Label htmlFor="staffEmail" className="text-gray-300">Email</Label>
                  <Input id="staffEmail" type="email" className="bg-gray-700 border-gray-600 text-white" />
                </div>
                <div>
                  <Label htmlFor="staffPhone" className="text-gray-300">Phone</Label>
                  <Input id="staffPhone" className="bg-gray-700 border-gray-600 text-white" />
                </div>
                <div>
                  <Label htmlFor="department" className="text-gray-300">Department</Label>
                  <Select>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="admin">Administration</SelectItem>
                      <SelectItem value="math">Mathematics</SelectItem>
                      <SelectItem value="science">Science</SelectItem>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="library">Library</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="joinDate" className="text-gray-300">Join Date</Label>
                  <Input id="joinDate" type="date" className="bg-gray-700 border-gray-600 text-white" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddStaffOpen(false)} className="border-gray-600 text-gray-300">
                  Cancel
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">Add Staff Member</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alert for expiring credentials */}
      {expiringCredentials.length > 0 && (
        <Alert className="border-yellow-500/50 bg-yellow-500/10">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <AlertDescription className="text-yellow-200">
            <strong>{expiringCredentials.length} credentials</strong> are expiring soon or have expired. Review the Compliance Tracker tab.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400">Total Staff</CardDescription>
            <CardTitle className="text-white text-3xl">{staffMembers.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-green-500">+2 this month</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400">Active</CardDescription>
            <CardTitle className="text-white text-3xl">
              {staffMembers.filter(s => s.status === 'active').length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={75} className="h-2" />
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400">On Leave</CardDescription>
            <CardTitle className="text-white text-3xl">
              {staffMembers.filter(s => s.status === 'onLeave').length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400">Current period</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400">Credentials Expiring</CardDescription>
            <CardTitle className="text-white text-3xl text-yellow-500">
              {expiringCredentials.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-yellow-400">Action required</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="staff" className="space-y-4">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="staff" className="data-[state=active]:bg-blue-600">Staff Directory</TabsTrigger>
          <TabsTrigger value="credentials" className="data-[state=active]:bg-blue-600">Compliance Tracker</TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-blue-600">Performance Reviews</TabsTrigger>
        </TabsList>

        {/* Staff Directory Tab */}
        <TabsContent value="staff" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Staff Directory</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search staff..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-gray-700 border-gray-600 text-white w-64"
                    />
                  </div>
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger className="w-48 bg-gray-700 border-gray-600 text-white">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="all">All Departments</SelectItem>
                      <SelectItem value="Administration">Administration</SelectItem>
                      <SelectItem value="Mathematics">Mathematics</SelectItem>
                      <SelectItem value="Science">Science</SelectItem>
                      <SelectItem value="Library">Library</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Name</TableHead>
                    <TableHead className="text-gray-300">Role</TableHead>
                    <TableHead className="text-gray-300">Department</TableHead>
                    <TableHead className="text-gray-300">Contact</TableHead>
                    <TableHead className="text-gray-300">Join Date</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStaff.map((staff) => (
                    <TableRow key={staff.id} className="border-gray-700">
                      <TableCell className="text-white">{staff.name}</TableCell>
                      <TableCell className="text-gray-300">{staff.role}</TableCell>
                      <TableCell className="text-gray-300">{staff.department}</TableCell>
                      <TableCell className="text-gray-300">
                        <div className="text-sm">
                          <div>{staff.email}</div>
                          <div className="text-gray-500">{staff.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-300">{staff.joinDate}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(staff.status)}>
                          {staff.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tracker Tab */}
        <TabsContent value="credentials" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Credential & Certification Tracker</CardTitle>
              <CardDescription className="text-gray-400">
                Monitor staff credentials with automated expiry warnings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Staff Member</TableHead>
                    <TableHead className="text-gray-300">Credential Type</TableHead>
                    <TableHead className="text-gray-300">Name</TableHead>
                    <TableHead className="text-gray-300">Issue Date</TableHead>
                    <TableHead className="text-gray-300">Expiry Date</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staffMembers.flatMap(staff =>
                    staff.credentials.map(credential => (
                      <TableRow key={credential.id} className="border-gray-700">
                        <TableCell className="text-white">{staff.name}</TableCell>
                        <TableCell className="text-gray-300">{credential.type}</TableCell>
                        <TableCell className="text-gray-300">{credential.name}</TableCell>
                        <TableCell className="text-gray-300">{credential.issueDate}</TableCell>
                        <TableCell className="text-gray-300">
                          <div className="flex items-center gap-2">
                            {credential.expiryDate}
                            {credential.status === 'expiring' && (
                              <Bell className="h-4 w-4 text-yellow-500" />
                            )}
                            {credential.status === 'expired' && (
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getCredentialStatusColor(credential.status)}>
                            {credential.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-green-400 hover:text-green-300">
                              Renew
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Reviews Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Performance Reviews</CardTitle>
              <CardDescription className="text-gray-400">
                Schedule and track staff performance evaluations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Review Cycle
                </Button>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">Staff Member</TableHead>
                      <TableHead className="text-gray-300">Last Review</TableHead>
                      <TableHead className="text-gray-300">Next Review</TableHead>
                      <TableHead className="text-gray-300">Rating</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffMembers.map((staff) => (
                      <TableRow key={staff.id} className="border-gray-700">
                        <TableCell className="text-white">{staff.name}</TableCell>
                        <TableCell className="text-gray-300">2024-06-15</TableCell>
                        <TableCell className="text-gray-300">2025-06-15</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={85} className="w-20 h-2" />
                            <span className="text-sm text-gray-300">4.2/5</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                            <FileText className="h-4 w-4 mr-2" />
                            View Report
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
