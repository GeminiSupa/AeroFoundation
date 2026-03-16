import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarDays, Clock, Users, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { useApp } from '../../context/AppContext';
import { toast } from 'sonner';
import { getChildrenForParent } from '../../lib/api/students';
import { getMyLeaveRequests, getParentLeaveRequests, submitLeaveRequest, cancelLeaveRequest, LEAVE_TYPES } from '../../lib/api/leaves';

const STATUS_COLORS: Record<string, string> = {
  approved: 'bg-green-500/10 text-green-500 border-green-500/20',
  pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
  cancelled: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

export function LeavePortalPage() {
  const { user } = useApp();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<{ start?: Date; end?: Date }>({});
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [reason, setReason] = useState('');
  const [leaveType, setLeaveType] = useState<string>('sick');

  const isParent = user?.role === 'parent';

  const { data: children } = useQuery({
    queryKey: ['parentChildren', user?.id],
    queryFn: async () => {
      if (!user?.id || !isParent) return [];
      const list = await getChildrenForParent(user.id);
      return list || [];
    },
    enabled: isParent && !!user?.id,
  });

  const { data: myLeaves, isLoading } = useQuery({
    queryKey: ['leaveRequests', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = isParent ? await getParentLeaveRequests(user.id) : await getMyLeaveRequests(user.id);
      if (!res.success) throw new Error(res.error);
      return res.data || [];
    },
    enabled: !!user?.id,
  });

  const submitMutation = useMutation({
    mutationFn: submitLeaveRequest,
    onSuccess: () => {
      toast.success('Leave request submitted');
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ['leaveRequests', user.id] });
      }
      queryClient.invalidateQueries({ queryKey: ['pendingLeaveRequests'] });
      setIsDialogOpen(false);
      setSelectedDateRange({});
      setLeaveType('sick');
      setReason('');
      setSelectedChild('');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to submit leave request');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, targetUserId }: { id: string; targetUserId: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      return cancelLeaveRequest(id, targetUserId);
    },
    onSuccess: () => {
      toast.success('Leave request cancelled');
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ['leaveRequests', user.id] });
      }
      queryClient.invalidateQueries({ queryKey: ['pendingLeaveRequests'] });
    },
    onError: (error: any) => toast.error(error?.message || 'Failed to cancel request'),
  });

  const handleSubmit = () => {
    if (!user?.id) {
      toast.error('Not authenticated');
      return;
    }

    if (!selectedDateRange.start || !selectedDateRange.end) {
      toast.error('Please select start and end dates');
      return;
    }

    if (!reason.trim()) {
      toast.error('Please provide a reason');
      return;
    }

    const targetId = isParent ? selectedChild : user.id;
    if (!targetId) {
      toast.error('Select a child to submit leave');
      return;
    }

    submitMutation.mutate({
      userId: targetId,
      leaveType: leaveType as any,
      startDate: format(selectedDateRange.start, 'yyyy-MM-dd'),
      endDate: format(selectedDateRange.end, 'yyyy-MM-dd'),
      reason: reason.trim(),
    });
  };

  const totalPending = myLeaves?.filter((leave: any) => leave.status === 'pending').length || 0;
  const totalApproved = myLeaves?.filter((leave: any) => leave.status === 'approved').length || 0;
  const totalRejected = myLeaves?.filter((leave: any) => leave.status === 'rejected').length || 0;
  const upcoming = myLeaves?.filter((leave: any) => new Date(leave.startDate) >= new Date()).length || 0;

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-none bg-module-leave/10 shadow-[0_6px_0_rgba(10,110,209,0.35)] hover:-translate-y-1 transition-transform duration-200">
          <CardContent className="pt-6">
            <p className="text-sm text-module-leave/80">Pending</p>
            <h3 className="text-3xl font-semibold text-module-leave">{totalPending}</h3>
            <p className="text-xs text-module-leave/60 mt-1">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card className="border-none bg-white shadow-[0_6px_0_rgba(16,126,62,0.25)] hover:-translate-y-1 transition-transform duration-200">
          <CardContent className="pt-6">
            <p className="text-sm text-sap-positive">Approved</p>
            <h3 className="text-3xl font-semibold text-sap-positive">{totalApproved}</h3>
            <p className="text-xs text-sap-positive/70 mt-1">Green-lit requests</p>
          </CardContent>
        </Card>

        <Card className="border-none bg-white shadow-[0_6px_0_rgba(233,115,12,0.25)] hover:-translate-y-1 transition-transform duration-200">
          <CardContent className="pt-6">
            <p className="text-sm text-[#E9730C]">Upcoming</p>
            <h3 className="text-3xl font-semibold text-[#E9730C]">{upcoming}</h3>
            <p className="text-xs text-[#E9730C]/70 mt-1">Starting today or later</p>
          </CardContent>
        </Card>

        <Card className="border-none bg-white shadow-[0_6px_0_rgba(220,53,69,0.25)] hover:-translate-y-1 transition-transform duration-200">
          <CardContent className="pt-6">
            <p className="text-sm text-red-500">Rejected</p>
            <h3 className="text-3xl font-semibold text-red-500">{totalRejected}</h3>
            <p className="text-xs text-red-500/70 mt-1">Needs revision</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-module-leave flex items-center gap-2">
            <CalendarDays className="w-6 h-6" />
            Leave Requests
          </h1>
          <p className="text-muted-foreground">Submit and track leave requests</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-module-leave hover:bg-module-leave/90">
              <Plus className="mr-2 h-4 w-4" />
              New Leave Request
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>New Leave Request</DialogTitle>
              <DialogDescription>
                Fill in the details to request leave
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {isParent && (
                <div className="space-y-2">
                  <Label>Child *</Label>
                  <Select value={selectedChild} onValueChange={setSelectedChild}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select child" />
                    </SelectTrigger>
                    <SelectContent>
                      {children?.length ? (
                        children.map((child: any) => (
                          <SelectItem key={child.id} value={child.id}>
                            {child.profile?.full_name || child.id}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="">No linked children</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Leave Type *</Label>
                <Select value={leaveType} onValueChange={setLeaveType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAVE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        {selectedDateRange.start ? format(selectedDateRange.start, 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDateRange.start}
                        onSelect={(date) => setSelectedDateRange((prev) => ({ ...prev, start: date || undefined }))}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>End Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        {selectedDateRange.end ? format(selectedDateRange.end, 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDateRange.end}
                        onSelect={(date) => setSelectedDateRange((prev) => ({ ...prev, end: date || undefined }))}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Reason *</Label>
                <Textarea
                  placeholder="Provide details..."
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={submitMutation.isPending} className="bg-module-leave hover:bg-module-leave/90">
                  {submitMutation.isPending ? 'Submitting...' : 'Submit Request'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Leave Requests</CardTitle>
          <CardDescription>Track the status of your recent leave requests</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {isParent && <TableHead>Child</TableHead>}
                <TableHead>Dates</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reviewed By</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={isParent ? 6 : 5}>Loading...</TableCell>
                </TableRow>
              ) : !myLeaves?.length ? (
                <TableRow>
                  <TableCell colSpan={isParent ? 6 : 5} className="text-muted-foreground">
                    No leave requests yet
                  </TableCell>
                </TableRow>
              ) : (
                myLeaves.map((leave: any) => (
                  <TableRow key={leave.id}>
                    {isParent && <TableCell>{leave.targetName}</TableCell>}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4" />
                        {leave.startDate} - {leave.endDate}
                      </div>
                    </TableCell>
                    <TableCell>{leave.type}</TableCell>
                    <TableCell className="max-w-xs truncate" title={leave.reason}>
                      {leave.reason}
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[leave.status] || STATUS_COLORS.pending}>
                        {leave.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{leave.reviewedBy || '-'}</TableCell>
                    <TableCell>
                      {leave.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => cancelMutation.mutate({ id: leave.id, targetUserId: leave.userId })}
                          disabled={cancelMutation.isPending}
                          className="text-red-500"
                        >
                          Cancel
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
