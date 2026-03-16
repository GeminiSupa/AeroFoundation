import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import { getPendingLeaveRequests, reviewLeaveRequest, getLeaveStats } from '../../lib/api/leaves';
import { useApp } from '../../context/AppContext';
import { CalendarDays, UserCircle } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  approved: 'bg-green-500/10 text-green-500 border-green-500/20',
  pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
  cancelled: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

export function LeaveAdminPage() {
  const { user } = useApp();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<any>(null);
  const [decision, setDecision] = useState<'approved' | 'rejected'>('approved');
  const [notes, setNotes] = useState('');

  const { data: pending, isLoading } = useQuery({
    queryKey: ['pendingLeaveRequests'],
    queryFn: async () => {
      const res = await getPendingLeaveRequests();
      if (!res.success) throw new Error(res.error);
      return res.data || [];
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['leaveStats'],
    queryFn: async () => {
      const res = await getLeaveStats();
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
  });

  const reviewMutation = useMutation({
    mutationFn: reviewLeaveRequest,
    onSuccess: () => {
      toast.success('Leave request updated');
      queryClient.invalidateQueries({ queryKey: ['pendingLeaveRequests'] });
      if (selected?.requesterId) {
        queryClient.invalidateQueries({ queryKey: ['leaveRequests', selected.requesterId] });
      }
      if (selected?.targetUserId) {
        queryClient.invalidateQueries({ queryKey: ['leaveRequests', selected.targetUserId] });
      }
      setSelected(null);
      setNotes('');
    },
    onError: (error: any) => toast.error(error?.message || 'Failed to update request'),
  });

  const handleReview = () => {
    if (!user?.id || !selected) return;
    reviewMutation.mutate({
      leaveId: selected.id,
      status: decision,
      reviewerId: user.id,
      reviewComments: notes.trim() || undefined,
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-none bg-module-leave/10 shadow-[0_6px_0_rgba(10,110,209,0.35)] hover:-translate-y-1 transition-transform duration-200">
          <CardContent className="pt-6">
            <p className="text-sm text-module-leave/80">Pending Requests</p>
            <h3 className="text-3xl font-semibold text-module-leave">
              {stats?.pendingCount ?? '—'}
            </h3>
            <p className="text-xs text-module-leave/60 mt-1">Awaiting review</p>
          </CardContent>
        </Card>

        <Card className="border-none bg-white shadow-[0_6px_0_rgba(16,126,62,0.25)] hover:-translate-y-1 transition-transform duration-200">
          <CardContent className="pt-6">
            <p className="text-sm text-sap-positive">Approved Today</p>
            <h3 className="text-3xl font-semibold text-sap-positive">
              {stats?.approvedToday ?? '—'}
            </h3>
            <p className="text-xs text-sap-positive/70 mt-1">Processed since midnight</p>
          </CardContent>
        </Card>

        <Card className="border-none bg-white shadow-[0_6px_0_rgba(233,115,12,0.25)] hover:-translate-y-1 transition-transform duration-200">
          <CardContent className="pt-6">
            <p className="text-sm text-[#E9730C]">Rejected Today</p>
            <h3 className="text-3xl font-semibold text-[#E9730C]">
              {stats?.rejectedToday ?? '—'}
            </h3>
            <p className="text-xs text-[#E9730C]/70 mt-1">Requires follow-up</p>
          </CardContent>
        </Card>

        <Card className="border-none bg-white shadow-[0_6px_0_rgba(108,117,125,0.2)] hover:-translate-y-1 transition-transform duration-200">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Requests This Month</p>
            <h3 className="text-3xl font-semibold text-foreground">
              {stats?.requestsThisMonth ?? '—'}
            </h3>
            <p className="text-xs text-muted-foreground/80 mt-1">Since {formatMonth()}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Leave Requests</CardTitle>
          <CardDescription>Approve or reject pending requests across the institution</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee/Student</TableHead>
                <TableHead>Requested For</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7}>Loading...</TableCell>
                </TableRow>
              ) : !pending?.length ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-muted-foreground">
                    No pending leave requests
                  </TableCell>
                </TableRow>
              ) : (
                pending.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <UserCircle className="w-4 h-4" />
                        {item.requesterName}
                      </div>
                    </TableCell>
                    <TableCell>{item.targetName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4" />
                        {item.startDate} - {item.endDate}
                      </div>
                    </TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell className="max-w-xs truncate" title={item.reason}>{item.reason}</TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[item.status] || STATUS_COLORS.pending}>{item.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => setSelected(item)}>
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(open) => !open && (setSelected(null), setNotes(''))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Leave Request</DialogTitle>
            <DialogDescription>
              Approve or reject this leave request
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="space-y-1 text-sm">
                <p><strong>Requested By:</strong> {selected.requesterName} ({selected.requesterRole})</p>
                <p><strong>For:</strong> {selected.targetName} ({selected.targetRole})</p>
                <p><strong>Dates:</strong> {selected.startDate} - {selected.endDate}</p>
                <p><strong>Type:</strong> {selected.type}</p>
                <p><strong>Reason:</strong> {selected.reason}</p>
              </div>

              <div className="space-y-2">
                <Label>Decision</Label>
                <div className="flex gap-2">
                  <Button
                    variant={decision === 'approved' ? 'default' : 'outline'}
                    onClick={() => setDecision('approved')}
                    className={decision === 'approved' ? 'bg-module-leave hover:bg-module-leave/90' : ''}
                  >
                    Approve
                  </Button>
                  <Button
                    variant={decision === 'rejected' ? 'default' : 'outline'}
                    onClick={() => setDecision('rejected')}
                    className={decision === 'rejected' ? 'bg-red-500 hover:bg-red-600 text-white' : ''}
                  >
                    Reject
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  placeholder="Optional notes for the requester"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelected(null)}>Cancel</Button>
                <Button onClick={handleReview} disabled={reviewMutation.isPending} className="bg-module-leave hover:bg-module-leave/90">
                  {reviewMutation.isPending ? 'Saving...' : 'Submit Decision'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function formatMonth() {
  const now = new Date();
  return now.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}
