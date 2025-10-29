import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { ClipboardList, Filter, CheckCircle, XCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { toast } from 'sonner';

export function LeaveManagementPage() {
  const [selectedLeave, setSelectedLeave] = useState<any>(null);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const teacherLeaves = [
    { id: 1, applicant: 'Ms. Khan', dates: 'Oct 20-22, 2025', reason: 'Medical', status: 'pending' },
    { id: 2, applicant: 'Mr. Smith', dates: 'Oct 25, 2025', reason: 'Personal', status: 'approved' },
    { id: 3, applicant: 'Mrs. Brown', dates: 'Nov 1-3, 2025', reason: 'Conference', status: 'pending' },
  ];

  const studentLeaves = [
    { id: 1, applicant: 'John Doe', class: '10A', dates: 'Oct 21, 2025', reason: 'Sick', status: 'approved' },
    { id: 2, applicant: 'Sarah Smith', class: '8B', dates: 'Oct 23-24, 2025', reason: 'Family Event', status: 'pending' },
    { id: 3, applicant: 'Michael Brown', class: '9A', dates: 'Oct 27, 2025', reason: 'Medical Appointment', status: 'rejected' },
  ];

  const handleApprove = (leave: any) => {
    setSelectedLeave(leave);
    setIsApproveOpen(true);
  };

  const confirmApproval = () => {
    toast.success('Leave Approved ✅', {
      description: `Leave request for ${selectedLeave.applicant} has been approved.`
    });
    setIsApproveOpen(false);
    setSelectedLeave(null);
  };

  const handleReject = (leave: any) => {
    setSelectedLeave(leave);
    setIsRejectOpen(true);
  };

  const confirmRejection = () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    toast.success('Leave Rejected', {
      description: `Leave request for ${selectedLeave.applicant} has been rejected.`
    });
    setIsRejectOpen(false);
    setSelectedLeave(null);
    setRejectionReason('');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white flex items-center gap-2">
            <ClipboardList className="w-8 h-8" />
            Leave Management
          </h1>
          <p className="text-gray-400 mt-1">Manage leave requests and approvals</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <p className="text-sm text-gray-400">Pending Approvals</p>
            <h2 className="mt-2 text-white text-3xl">5</h2>
            <Badge className="mt-2 bg-red-500/10 text-red-400">Needs Review</Badge>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <p className="text-sm text-gray-400">Approved This Week</p>
            <h2 className="mt-2 text-white text-3xl">12</h2>
            <Badge className="mt-2 bg-green-500/10 text-green-400">Active</Badge>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <p className="text-sm text-gray-400">Rejected</p>
            <h2 className="mt-2 text-white text-3xl">2</h2>
            <Badge className="mt-2 bg-gray-500/10 text-gray-400">This Month</Badge>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="teacher-leaves" className="space-y-4">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="teacher-leaves" className="data-[state=active]:bg-blue-600">Teacher Leaves</TabsTrigger>
          <TabsTrigger value="student-leaves" className="data-[state=active]:bg-blue-600">Student Leaves</TabsTrigger>
        </TabsList>

        <TabsContent value="teacher-leaves">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Teacher Leave Requests</CardTitle>
              <CardDescription className="text-gray-400">Review and manage teacher leave applications</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Applicant</TableHead>
                    <TableHead className="text-gray-300">Dates</TableHead>
                    <TableHead className="text-gray-300">Reason</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teacherLeaves.map((leave) => (
                    <TableRow key={leave.id} className="border-gray-700">
                      <TableCell className="text-white">{leave.applicant}</TableCell>
                      <TableCell className="text-gray-300">{leave.dates}</TableCell>
                      <TableCell className="text-gray-300">{leave.reason}</TableCell>
                      <TableCell>
                        <Badge className={
                          leave.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                          leave.status === 'approved' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                        }>
                          {leave.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {leave.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleApprove(leave)} className="bg-green-600 hover:bg-green-700">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button size="sm" onClick={() => handleReject(leave)} className="bg-red-600 hover:bg-red-700">
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                        {leave.status !== 'pending' && (
                          <Button size="sm" variant="outline" className="border-gray-600 text-gray-300">View</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="student-leaves">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Student Leave Requests</CardTitle>
              <CardDescription className="text-gray-400">Review and manage student leave applications</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Student</TableHead>
                    <TableHead className="text-gray-300">Class</TableHead>
                    <TableHead className="text-gray-300">Dates</TableHead>
                    <TableHead className="text-gray-300">Reason</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentLeaves.map((leave) => (
                    <TableRow key={leave.id} className="border-gray-700">
                      <TableCell className="text-white">{leave.applicant}</TableCell>
                      <TableCell className="text-gray-300">{leave.class}</TableCell>
                      <TableCell className="text-gray-300">{leave.dates}</TableCell>
                      <TableCell className="text-gray-300">{leave.reason}</TableCell>
                      <TableCell>
                        <Badge className={
                          leave.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                          leave.status === 'approved' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                        }>
                          {leave.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {leave.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleApprove(leave)} className="bg-green-600 hover:bg-green-700">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button size="sm" onClick={() => handleReject(leave)} className="bg-red-600 hover:bg-red-700">
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                        {leave.status !== 'pending' && (
                          <Button size="sm" variant="outline" className="border-gray-600 text-gray-300">View</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Approve Dialog */}
      <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Approve Leave Request
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedLeave && `Approve leave request for ${selectedLeave.applicant}?`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-400">Dates: <span className="text-white">{selectedLeave?.dates}</span></p>
              <p className="text-sm text-gray-400 mt-1">Reason: <span className="text-white">{selectedLeave?.reason}</span></p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsApproveOpen(false)} className="border-gray-600 text-gray-300">
                Cancel
              </Button>
              <Button onClick={confirmApproval} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm Approval
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              Reject Leave Request
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedLeave && `Provide a reason for rejecting ${selectedLeave.applicant}'s leave request`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-400">Dates: <span className="text-white">{selectedLeave?.dates}</span></p>
              <p className="text-sm text-gray-400 mt-1">Reason: <span className="text-white">{selectedLeave?.reason}</span></p>
            </div>
            <div>
              <Label htmlFor="rejectionReason" className="text-gray-300">Rejection Reason *</Label>
              <Textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this request is being rejected..."
                className="bg-gray-700 border-gray-600 text-white mt-2"
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setIsRejectOpen(false);
                setRejectionReason('');
              }} className="border-gray-600 text-gray-300">
                Cancel
              </Button>
              <Button onClick={confirmRejection} className="bg-red-600 hover:bg-red-700">
                <XCircle className="h-4 w-4 mr-2" />
                Confirm Rejection
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
