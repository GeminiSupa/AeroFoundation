import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Badge } from '../../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Calendar, Plus, Clock, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface LeaveRequest {
  id: string;
  startDate: string;
  endDate: string;
  type: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedOn: string;
  reviewedBy?: string;
  reviewNotes?: string;
}

export function TeacherLeavePage() {
  const [isApplyLeaveOpen, setIsApplyLeaveOpen] = useState(false);

  // Mock data - Teacher's own leave requests only
  const myLeaveRequests: LeaveRequest[] = [
    {
      id: '1',
      startDate: '2025-10-25',
      endDate: '2025-10-25',
      type: 'Personal',
      reason: 'Family commitment',
      status: 'approved',
      appliedOn: '2025-10-15',
      reviewedBy: 'Dr. Sarah Johnson',
      reviewNotes: 'Approved - substitute teacher arranged'
    },
    {
      id: '2',
      startDate: '2025-11-05',
      endDate: '2025-11-06',
      type: 'Medical',
      reason: 'Doctor appointment',
      status: 'pending',
      appliedOn: '2025-10-18'
    },
    {
      id: '3',
      startDate: '2025-09-12',
      endDate: '2025-09-12',
      type: 'Conference',
      reason: 'Professional development workshop',
      status: 'approved',
      appliedOn: '2025-09-01',
      reviewedBy: 'Dr. Sarah Johnson'
    }
  ];

  const handleApplyLeave = () => {
    toast.success('Leave request submitted successfully!', {
      description: 'Your request has been sent to the administration for approval.'
    });
    setIsApplyLeaveOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500/10 text-green-500';
      case 'pending': return 'bg-yellow-500/10 text-yellow-500';
      case 'rejected': return 'bg-red-500/10 text-red-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  const pendingRequests = myLeaveRequests.filter(r => r.status === 'pending').length;
  const approvedRequests = myLeaveRequests.filter(r => r.status === 'approved').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-white">My Leave Requests</h1>
          <p className="text-gray-400 mt-1">Apply for leave and track your requests</p>
        </div>
        <Dialog open={isApplyLeaveOpen} onOpenChange={setIsApplyLeaveOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Apply Leave
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Apply for Leave</DialogTitle>
              <DialogDescription className="text-gray-400">
                Submit a leave request for review
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate" className="text-gray-300">Start Date</Label>
                  <Input id="startDate" type="date" className="bg-gray-700 border-gray-600 text-white" />
                </div>
                <div>
                  <Label htmlFor="endDate" className="text-gray-300">End Date</Label>
                  <Input id="endDate" type="date" className="bg-gray-700 border-gray-600 text-white" />
                </div>
              </div>
              <div>
                <Label htmlFor="leaveType" className="text-gray-300">Leave Type</Label>
                <Select>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="medical">Medical</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="conference">Conference/Training</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="reason" className="text-gray-300">Reason</Label>
                <Textarea
                  id="reason"
                  placeholder="Provide details for your leave request..."
                  className="bg-gray-700 border-gray-600 text-white"
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsApplyLeaveOpen(false)} className="border-gray-600 text-gray-300">
                  Cancel
                </Button>
                <Button onClick={handleApplyLeave} className="bg-blue-600 hover:bg-blue-700">
                  Submit Request
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400">Total Requests</CardDescription>
            <CardTitle className="text-white text-3xl">{myLeaveRequests.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400">This academic year</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400">Pending</CardDescription>
            <CardTitle className="text-white text-3xl text-yellow-500">{pendingRequests}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-yellow-400">Awaiting approval</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400">Approved</CardDescription>
            <CardTitle className="text-white text-3xl text-green-500">{approvedRequests}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400">This year</p>
          </CardContent>
        </Card>
      </div>

      {/* Leave Requests Table */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">My Leave History</CardTitle>
          <CardDescription className="text-gray-400">
            Track all your leave requests and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-300">Applied On</TableHead>
                <TableHead className="text-gray-300">Leave Period</TableHead>
                <TableHead className="text-gray-300">Type</TableHead>
                <TableHead className="text-gray-300">Reason</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-gray-300">Reviewed By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myLeaveRequests.map((leave) => (
                <TableRow key={leave.id} className="border-gray-700">
                  <TableCell className="text-gray-300">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      {leave.appliedOn}
                    </div>
                  </TableCell>
                  <TableCell className="text-white">
                    {leave.startDate === leave.endDate 
                      ? leave.startDate 
                      : `${leave.startDate} to ${leave.endDate}`}
                  </TableCell>
                  <TableCell className="text-gray-300">{leave.type}</TableCell>
                  <TableCell className="text-gray-400 max-w-xs truncate">{leave.reason}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(leave.status)}>
                      {leave.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {leave.reviewedBy || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Leave Balance Info */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Leave Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
              <div>
                <p className="text-sm text-gray-400">Annual Leave</p>
                <p className="text-2xl text-white mt-1">12 days</p>
              </div>
              <Clock className="h-8 w-8 text-blue-400" />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
              <div>
                <p className="text-sm text-gray-400">Sick Leave</p>
                <p className="text-2xl text-white mt-1">8 days</p>
              </div>
              <FileText className="h-8 w-8 text-green-400" />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
              <div>
                <p className="text-sm text-gray-400">Used This Year</p>
                <p className="text-2xl text-white mt-1">3 days</p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
