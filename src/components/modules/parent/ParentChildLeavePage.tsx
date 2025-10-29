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

export function ParentChildLeavePage() {
  const { user } = useApp();
  const [isApplying, setIsApplying] = useState(false);

  // Parent can ONLY apply for their own child's leave
  const childData = {
    name: 'Emma Johnson',
    class: '10A',
    rollNo: 'S-2024-045'
  };

  const childLeaveApplications = [
    {
      id: 1,
      type: 'Sick Leave',
      startDate: 'Oct 22, 2025',
      endDate: 'Oct 23, 2025',
      days: 2,
      reason: 'Fever and flu symptoms',
      status: 'approved',
      appliedOn: 'Oct 21, 2025',
      appliedBy: user?.name || 'Parent',
      reviewedBy: 'Ms. Johnson (Class Teacher)',
      reviewDate: 'Oct 21, 2025'
    },
    {
      id: 2,
      type: 'Family Event',
      startDate: 'Nov 5, 2025',
      endDate: 'Nov 5, 2025',
      days: 1,
      reason: 'Attending family wedding',
      status: 'pending',
      appliedOn: 'Oct 18, 2025',
      appliedBy: user?.name || 'Parent',
      reviewedBy: null,
      reviewDate: null
    },
  ];

  const leaveBalance = {
    total: 12,
    used: 2,
    remaining: 10
  };

  const handleApplyLeave = () => {
    toast.success('Leave Application Submitted!', {
      description: `Leave request for ${childData.name} has been sent for approval.`
    });
    setIsApplying(false);
  };

  const pendingCount = childLeaveApplications.filter(l => l.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Leave Management - {childData.name}
          </h2>
          <p className="text-muted-foreground">Apply for leave on behalf of your child</p>
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
              <DialogTitle>Apply Leave for {childData.name}</DialogTitle>
              <DialogDescription>
                Fill in the details for your child's leave request
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Student:</span>
                  <span className="font-medium">{childData.name}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm text-muted-foreground">Class:</span>
                  <span className="font-medium">{childData.class}</span>
                </div>
              </div>

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
                    <SelectItem value="vacation">Family Vacation</SelectItem>
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
                  placeholder="Please provide a detailed reason for the leave request..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactNumber">Emergency Contact Number</Label>
                <Input 
                  id="contactNumber" 
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm">
                  <strong>Leave Balance:</strong> {leaveBalance.remaining} days remaining out of {leaveBalance.total}
                </p>
              </div>

              <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-200 dark:border-orange-800">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> For medical leave exceeding 2 days, please submit a medical certificate 
                  to the school office when your child returns.
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
          <CardTitle>Leave Applications for {childData.name}</CardTitle>
          <CardDescription>History of leave requests</CardDescription>
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
              {childLeaveApplications.map((leave) => (
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
                  <TableCell>
                    <div>
                      <p className="text-sm">{leave.appliedOn}</p>
                      <p className="text-xs text-muted-foreground">by {leave.appliedBy}</p>
                    </div>
                  </TableCell>
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
                          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-muted-foreground">Student:</span>
                              <span className="font-medium">{childData.name}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Class:</span>
                              <span className="font-medium">{childData.class}</span>
                            </div>
                          </div>

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
                            <p className="text-sm text-muted-foreground">by {leave.appliedBy}</p>
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
          <CardTitle>Leave Application Guidelines for Parents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                1
              </div>
              <p>Apply for leave at least 1 day in advance (except for medical emergencies)</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                2
              </div>
              <p>Provide a valid reason and your emergency contact number</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                3
              </div>
              <p>For medical leave beyond 2 days, submit a medical certificate upon return</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                4
              </div>
              <p>Students must maintain at least 75% attendance for exam eligibility</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                5
              </div>
              <p>In case of emergency, you may inform the school office via phone and submit the application later</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Notice */}
      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-muted-foreground">
          🔒 Privacy Protected: You can only apply for and view leave applications for your own child.
        </p>
      </div>
    </div>
  );
}
