import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Badge } from '../../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '../../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import { Calendar, Plus, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../../../context/AppContext';

export function StudentLeavePage() {
  const { user } = useApp();
  const [isApplying, setIsApplying] = useState(false);

  // Student's personal leave applications - ONLY their own data
  const myLeaveApplications = [
    {
      id: 1,
      type: 'Sick Leave',
      startDate: 'Oct 20, 2025',
      endDate: 'Oct 21, 2025',
      days: 2,
      reason: 'Fever and cold',
      status: 'approved',
      appliedOn: 'Oct 19, 2025',
      reviewedBy: 'Ms. Johnson',
      reviewDate: 'Oct 19, 2025'
    },
    {
      id: 2,
      type: 'Family Event',
      startDate: 'Oct 25, 2025',
      endDate: 'Oct 25, 2025',
      days: 1,
      reason: 'Sister\'s wedding',
      status: 'pending',
      appliedOn: 'Oct 18, 2025',
      reviewedBy: null,
      reviewDate: null
    },
    {
      id: 3,
      type: 'Medical',
      startDate: 'Sep 15, 2025',
      endDate: 'Sep 16, 2025',
      days: 2,
      reason: 'Doctor appointment',
      status: 'rejected',
      appliedOn: 'Sep 14, 2025',
      reviewedBy: 'Principal Anderson',
      reviewDate: 'Sep 14, 2025',
      rejectionReason: 'Please schedule appointments after school hours'
    },
  ];

  const leaveBalance = {
    total: 12,
    used: 4,
    remaining: 8
  };

  const handleApplyLeave = () => {
    toast.success('Leave Application Submitted!', {
      description: 'Your leave request has been sent to the admin for approval.'
    });
    setIsApplying(false);
  };

  const pendingCount = myLeaveApplications.filter(l => l.status === 'pending').length;
  const approvedCount = myLeaveApplications.filter(l => l.status === 'approved').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            My Leave Applications
          </h2>
          <p className="text-muted-foreground">Apply for and track your leave requests</p>
        </div>
        <Dialog open={isApplying} onOpenChange={setIsApplying}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Apply for Leave
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Apply for Leave</DialogTitle>
              <DialogDescription>
                Fill in the details for your leave request
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="leaveType">Leave Type</Label>
                <Select>
                  <SelectTrigger id="leaveType">
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sick">Sick Leave</SelectItem>
                    <SelectItem value="medical">Medical Appointment</SelectItem>
                    <SelectItem value="family">Family Event</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input id="endDate" type="date" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Leave</Label>
                <Textarea
                  id="reason"
                  placeholder="Please provide a detailed reason for your leave..."
                  rows={4}
                />
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm">
                  <strong>Leave Balance:</strong> {leaveBalance.remaining} days remaining out of {leaveBalance.total}
                </p>
              </div>

              <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-200 dark:border-orange-800">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> For medical leave, you may need to submit a medical certificate upon return to school.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsApplying(false)}>
                Cancel
              </Button>
              <Button onClick={handleApplyLeave}>
                Submit Application
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Leave Balance */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total Leave Days</p>
            <h2 className="mt-2">{leaveBalance.total}</h2>
            <p className="text-sm text-muted-foreground mt-2">Per year</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Days Used</p>
            <h2 className="mt-2 text-orange-600">{leaveBalance.used}</h2>
            <p className="text-sm text-muted-foreground mt-2">This year</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Days Remaining</p>
            <h2 className="mt-2 text-green-600">{leaveBalance.remaining}</h2>
            <p className="text-sm text-muted-foreground mt-2">Available</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Pending Requests</p>
            <h2 className="mt-2">{pendingCount}</h2>
            <p className="text-sm text-muted-foreground mt-2">Awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      {/* Leave Applications */}
      <Card>
        <CardHeader>
          <CardTitle>My Leave Requests</CardTitle>
          <CardDescription>History of your leave applications</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Applied On</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myLeaveApplications.map((leave) => (
                <TableRow key={leave.id}>
                  <TableCell>
                    <Badge variant="outline">{leave.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{leave.startDate}</p>
                      {leave.days > 1 && (
                        <p className="text-xs text-muted-foreground">to {leave.endDate}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{leave.days} day{leave.days > 1 ? 's' : ''}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{leave.reason}</TableCell>
                  <TableCell>{leave.appliedOn}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        leave.status === 'approved' ? 'default' :
                        leave.status === 'pending' ? 'secondary' :
                        'destructive'
                      }
                      className="flex items-center gap-1 w-fit"
                    >
                      {leave.status === 'approved' && <CheckCircle className="w-3 h-3" />}
                      {leave.status === 'pending' && <Clock className="w-3 h-3" />}
                      {leave.status === 'rejected' && <XCircle className="w-3 h-3" />}
                      {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Leave Application Details</DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Leave Type</p>
                              <p className="font-medium">{leave.type}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Duration</p>
                              <p className="font-medium">{leave.days} day{leave.days > 1 ? 's' : ''}</p>
                            </div>
                          </div>

                          <div>
                            <p className="text-sm text-muted-foreground">Dates</p>
                            <p className="font-medium">
                              {leave.startDate} {leave.days > 1 ? `to ${leave.endDate}` : ''}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm text-muted-foreground">Reason</p>
                            <p className="font-medium">{leave.reason}</p>
                          </div>

                          <div>
                            <p className="text-sm text-muted-foreground">Applied On</p>
                            <p className="font-medium">{leave.appliedOn}</p>
                          </div>

                          <div>
                            <p className="text-sm text-muted-foreground">Status</p>
                            <Badge 
                              variant={
                                leave.status === 'approved' ? 'default' :
                                leave.status === 'pending' ? 'secondary' :
                                'destructive'
                              }
                            >
                              {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                            </Badge>
                          </div>

                          {leave.reviewedBy && (
                            <div>
                              <p className="text-sm text-muted-foreground">Reviewed By</p>
                              <p className="font-medium">{leave.reviewedBy}</p>
                              {leave.reviewDate && (
                                <p className="text-sm text-muted-foreground">on {leave.reviewDate}</p>
                              )}
                            </div>
                          )}

                          {leave.status === 'rejected' && leave.rejectionReason && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800">
                              <p className="text-sm text-muted-foreground mb-1">Rejection Reason</p>
                              <p className="text-sm text-red-600">{leave.rejectionReason}</p>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Leave Application Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                1
              </div>
              <p>Apply for leave at least 1 day in advance (except for emergencies)</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                2
              </div>
              <p>Provide a valid reason and supporting documents if required</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                3
              </div>
              <p>Wait for approval before taking leave (except in emergencies)</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                4
              </div>
              <p>For medical leave beyond 2 days, a medical certificate is required</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                5
              </div>
              <p>Maintain at least 75% attendance for exam eligibility</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Notice */}
      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-muted-foreground">
          🔒 Privacy Protected: You can only view and manage your own leave applications.
        </p>
      </div>
    </div>
  );
}
