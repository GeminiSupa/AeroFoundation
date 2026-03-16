import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Building2, Plus, Calendar as CalendarIcon, Clock, CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFacilityBookings, submitFacilityRequest, reviewFacilityRequest, getFacilityRequestLogs, getFacilityNotifications, cancelFacilityRequest } from '../../lib/api/inventory';
import { useApp } from '../../context/AppContext';
import { isElevatedRole } from '../../utils/roles';
import { Textarea } from '../ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

interface RequestStatus {
  pending: number;
  approved: number;
  rejected: number;
  confirmed: number;
}

export function FacilityBookingPage() {
  const { user } = useApp();
  const queryClient = useQueryClient();
  const [isBookDialogOpen, setIsBookDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();
  
  // Form state
  const [requestForm, setRequestForm] = useState({
    facility: '',
    date: '',
    timeSlot: '',
    purpose: '',
    numberOfStudents: '',
  });

  // Review form state (for teachers/admins)
  const [reviewForm, setReviewForm] = useState({
    action: 'approved' as 'approved' | 'rejected' | 'requested_info',
    notes: '',
    modifiedDate: '',
    modifiedTimeSlot: '',
  });

  // Fetch user's facility requests
  const { data: myRequests, isLoading: requestsLoading } = useQuery({
    queryKey: ['myFacilityRequests', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await getFacilityBookings();
      if (!res.success) return [];
      // Filter by requester_id if role is student/teacher
      const requests = res.data || [];
      if (user?.role === 'student' || user?.role === 'teacher') {
        return requests.filter((r: any) => r.requester_id === user.id);
      }
      // Admin/owner/super_admin see all pending requests
      if (isElevatedRole(user?.role)) {
        return requests.filter((r: any) => r.status === 'pending');
      }
      return requests;
    },
    enabled: !!user?.id,
  });

  // Fetch pending requests for teachers (requests routed to them)
  const { data: pendingApprovals } = useQuery({
    queryKey: ['pendingFacilityApprovals', user?.id],
    queryFn: async () => {
      if (!user?.id || user?.role !== 'teacher') return [];
      const res = await getFacilityBookings();
      if (!res.success) return [];
      return (res.data || []).filter((r: any) => 
        r.status === 'pending' && r.current_approver_id === user.id
      );
    },
    enabled: !!user?.id && user?.role === 'teacher',
  });

  // Fetch notifications
  const { data: notifications } = useQuery({
    queryKey: ['facilityNotifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await getFacilityNotifications(user.id);
      return res.success ? (res.data || []) : [];
    },
    enabled: !!user?.id,
  });

  // Calculate stats
  const stats = useMemo(() => {
    const s: RequestStatus = {
      pending: 0,
      approved: 0,
      rejected: 0,
      confirmed: 0,
    };
    myRequests?.forEach((r: any) => {
      if (s.hasOwnProperty(r.status)) {
        s[r.status as keyof RequestStatus]++;
      }
    });
    return s;
  }, [myRequests]);

  const submitRequestMutation = useMutation({
    mutationFn: submitFacilityRequest,
    onSuccess: (response) => {
      if (response.success) {
        toast.success('Request Submitted Successfully ✅');
        queryClient.invalidateQueries({ queryKey: ['myFacilityRequests'] });
        queryClient.invalidateQueries({ queryKey: ['facilityBookings'] });
        setIsBookDialogOpen(false);
        setRequestForm({
          facility: '',
          date: '',
          timeSlot: '',
          purpose: '',
          numberOfStudents: '',
        });
        setSelectedDate(undefined);
      } else {
        toast.error(response.error || 'Failed to submit request');
      }
    },
    onError: (e: any) => {
      console.error('Submit request error:', e);
      toast.error(e.message || 'Failed to submit request');
    },
  });

  const reviewRequestMutation = useMutation({
    mutationFn: reviewFacilityRequest,
    onSuccess: (response) => {
      if (response.success) {
        toast.success('Request Reviewed Successfully ✅');
        queryClient.invalidateQueries({ queryKey: ['myFacilityRequests'] });
        queryClient.invalidateQueries({ queryKey: ['pendingFacilityApprovals'] });
        queryClient.invalidateQueries({ queryKey: ['facilityNotifications'] });
        setIsReviewDialogOpen(false);
      } else {
        toast.error(response.error || 'Failed to review request');
      }
    },
    onError: (e: any) => {
      console.error('Review request error:', e);
      toast.error(e.message || 'Failed to review request');
    },
  });

  const cancelRequestMutation = useMutation({
    mutationFn: (requestId: string) => cancelFacilityRequest(requestId, user?.id || ''),
    onSuccess: (response) => {
      if (response.success) {
        toast.success('Request Cancelled Successfully ✅');
        queryClient.invalidateQueries({ queryKey: ['myFacilityRequests'] });
        queryClient.invalidateQueries({ queryKey: ['pendingFacilityApprovals'] });
      } else {
        toast.error(response.error || 'Failed to cancel request');
      }
    },
    onError: (e: any) => {
      console.error('Cancel request error:', e);
      toast.error(e.message || 'Failed to cancel request');
    },
  });

  const handleSubmitRequest = () => {
    if (!requestForm.facility || !requestForm.date || !requestForm.timeSlot || !requestForm.purpose) {
      toast.error('Please fill all required fields');
      return;
    }

    if (!user?.id || !user?.email) {
      toast.error('User authentication error');
      return;
    }

    submitRequestMutation.mutate({
      facility: requestForm.facility,
      booked_by: user.email,
      requester_id: user.id,
      requester_role: user.role as 'student' | 'teacher' | 'admin',
      date: requestForm.date,
      time_slot: requestForm.timeSlot,
      purpose: requestForm.purpose,
      number_of_students: requestForm.numberOfStudents ? Number(requestForm.numberOfStudents) : undefined,
    });
  };

  const handleReviewRequest = () => {
    if (!selectedRequest || !user?.id) return;
    
    if (reviewForm.action === 'rejected' && !reviewForm.notes.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    reviewRequestMutation.mutate({
      request_id: selectedRequest.id,
      actor_id: user.id,
      actor_role: user.role,
      action: reviewForm.action,
      notes: reviewForm.notes || undefined,
      modifications: (reviewForm.modifiedDate || reviewForm.modifiedTimeSlot) ? {
        date: reviewForm.modifiedDate || undefined,
        time_slot: reviewForm.modifiedTimeSlot || undefined,
      } : undefined,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Rejected</Badge>;
      case 'confirmed':
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Confirmed</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-500/10 text-gray-600 border-gray-500/20">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-module-inventory">
            <Building2 className="w-8 h-8" />
            Facility Booking
          </h1>
          <p className="text-muted-foreground mt-1">
            Request access to school facilities with approval workflow
          </p>
        </div>
        {(user?.role === 'student' || user?.role === 'teacher') && (
          <Button 
            onClick={() => setIsBookDialogOpen(true)}
            className="bg-module-inventory hover:bg-module-inventory/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Request
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <h2 className="mt-2">{stats.pending}</h2>
              </div>
              <div className="bg-yellow-500 p-3 rounded-lg text-white">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <h2 className="mt-2">{stats.approved}</h2>
              </div>
              <div className="bg-green-500 p-3 rounded-lg text-white">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <h2 className="mt-2">{stats.rejected}</h2>
              </div>
              <div className="bg-red-500 p-3 rounded-lg text-white">
                <XCircle className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Confirmed</p>
                <h2 className="mt-2">{stats.confirmed}</h2>
              </div>
              <div className="bg-blue-500 p-3 rounded-lg text-white">
                <Building2 className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals (Teachers) */}
      {user?.role === 'teacher' && pendingApprovals && pendingApprovals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              Pending Approvals ({pendingApprovals.length})
            </CardTitle>
            <CardDescription>
              Requests awaiting your recommendation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Facility</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingApprovals.map((request: any) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.facility}</TableCell>
                    <TableCell>{new Date(request.date).toLocaleDateString()}</TableCell>
                    <TableCell>{request.time_slot}</TableCell>
                    <TableCell className="max-w-xs truncate">{request.purpose}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(request);
                          setIsReviewDialogOpen(true);
                        }}
                      >
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* My Requests */}
      <Card>
        <CardHeader>
          <CardTitle>My Facility Requests</CardTitle>
          <CardDescription>
            Track the status of all your booking requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {requestsLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : !myRequests || myRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No facility requests yet. Click "New Request" to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Facility</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myRequests.map((request: any) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.facility}</TableCell>
                    <TableCell>{new Date(request.date).toLocaleDateString()}</TableCell>
                    <TableCell>{request.time_slot}</TableCell>
                    <TableCell className="max-w-xs truncate">{request.purpose}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            setIsDetailsDialogOpen(true);
                          }}
                        >
                          Details
                        </Button>
                        {(request.status === 'pending' || request.status === 'approved') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm('Are you sure you want to cancel this request?')) {
                                cancelRequestMutation.mutate(request.id);
                              }
                            }}
                            disabled={cancelRequestMutation.isPending}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* New Request Dialog */}
      <Dialog open={isBookDialogOpen} onOpenChange={setIsBookDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Facility Request</DialogTitle>
            <DialogDescription>
              Submit a request to book a school facility
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="facility">Facility *</Label>
              <Select 
                value={requestForm.facility}
                onValueChange={(value) => setRequestForm({ ...requestForm, facility: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select facility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Gymnasium">Gymnasium</SelectItem>
                  <SelectItem value="Science Lab A">Science Lab A</SelectItem>
                  <SelectItem value="Science Lab B">Science Lab B</SelectItem>
                  <SelectItem value="Auditorium">Auditorium</SelectItem>
                  <SelectItem value="Computer Lab A">Computer Lab A</SelectItem>
                  <SelectItem value="Computer Lab B">Computer Lab B</SelectItem>
                  <SelectItem value="Library">Library</SelectItem>
                  <SelectItem value="Playground">Playground</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? selectedDate.toLocaleDateString() : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      setRequestForm({ 
                        ...requestForm, 
                        date: date ? date.toISOString().split('T')[0] : '' 
                      });
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="timeSlot">Time Slot *</Label>
              <Select 
                value={requestForm.timeSlot}
                onValueChange={(value) => setRequestForm({ ...requestForm, timeSlot: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="08:00 - 10:00">08:00 - 10:00</SelectItem>
                  <SelectItem value="10:00 - 12:00">10:00 - 12:00</SelectItem>
                  <SelectItem value="12:00 - 14:00">12:00 - 14:00</SelectItem>
                  <SelectItem value="14:00 - 16:00">14:00 - 16:00</SelectItem>
                  <SelectItem value="16:00 - 18:00">16:00 - 18:00</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="numberOfStudents">Number of Students (Optional)</Label>
              <Input
                id="numberOfStudents"
                type="number"
                value={requestForm.numberOfStudents}
                onChange={(e) => setRequestForm({ ...requestForm, numberOfStudents: e.target.value })}
                placeholder="e.g., 25"
              />
            </div>
            <div>
              <Label htmlFor="purpose">Purpose *</Label>
              <Textarea
                id="purpose"
                value={requestForm.purpose}
                onChange={(e) => setRequestForm({ ...requestForm, purpose: e.target.value })}
                placeholder="Describe the purpose of this facility booking (e.g., Sports practice, Science experiment, Event)"
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsBookDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitRequest}
                disabled={submitRequestMutation.isPending}
                className="bg-module-inventory hover:bg-module-inventory/90"
              >
                {submitRequestMutation.isPending ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Facility</Label>
                  <p className="text-sm font-medium">{selectedRequest.facility}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <div>{getStatusBadge(selectedRequest.status)}</div>
                </div>
                <div>
                  <Label>Date</Label>
                  <p className="text-sm">{new Date(selectedRequest.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label>Time</Label>
                  <p className="text-sm">{selectedRequest.time_slot}</p>
                </div>
                {selectedRequest.number_of_students && (
                  <div>
                    <Label>Students</Label>
                    <p className="text-sm">{selectedRequest.number_of_students}</p>
                  </div>
                )}
                <div>
                  <Label>Purpose</Label>
                  <p className="text-sm">{selectedRequest.purpose}</p>
                </div>
              </div>
              {selectedRequest.rejection_reason && (
                <div className="border-t pt-4">
                  <Label className="text-red-600">Rejection Reason</Label>
                  <p className="text-sm">{selectedRequest.rejection_reason}</p>
                </div>
              )}
              {(selectedRequest.hod_notes || selectedRequest.admin_notes) && (
                <div className="border-t pt-4">
                  <Label>Notes</Label>
                  <p className="text-sm">
                    {selectedRequest.admin_notes || selectedRequest.hod_notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Review Dialog (Teachers) */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Facility Request</DialogTitle>
            <DialogDescription>
              Approve, reject, or request more information
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-muted/50">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Facility:</span> {selectedRequest.facility}
                  </div>
                  <div>
                    <span className="font-medium">Date:</span> {new Date(selectedRequest.date).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium">Time:</span> {selectedRequest.time_slot}
                  </div>
                  <div>
                    <span className="font-medium">Students:</span> {selectedRequest.number_of_students || 'N/A'}
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium">Purpose:</span> {selectedRequest.purpose}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="reviewAction">Action *</Label>
                <Select 
                  value={reviewForm.action}
                  onValueChange={(value: any) => setReviewForm({ ...reviewForm, action: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">Approve & Forward</SelectItem>
                    <SelectItem value="rejected">Reject</SelectItem>
                    <SelectItem value="requested_info">Request More Info</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="reviewNotes">Notes/Comments *</Label>
                <Textarea
                  id="reviewNotes"
                  value={reviewForm.notes}
                  onChange={(e) => setReviewForm({ ...reviewForm, notes: e.target.value })}
                  placeholder={
                    reviewForm.action === 'rejected' 
                      ? 'Please provide a reason for rejection'
                      : reviewForm.action === 'requested_info'
                      ? 'What additional information do you need?'
                      : 'Optional notes for the requester'
                  }
                  rows={4}
                />
              </div>

              {reviewForm.action === 'approved' && (
                <div className="border-t pt-4">
                  <Label className="text-base font-semibold">Optional Modifications</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Adjust date or time if the requested slot is unavailable
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="modifiedDate">Modified Date (Optional)</Label>
                      <Input
                        id="modifiedDate"
                        type="date"
                        value={reviewForm.modifiedDate}
                        onChange={(e) => setReviewForm({ ...reviewForm, modifiedDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="modifiedTime">Modified Time (Optional)</Label>
                      <Select 
                        value={reviewForm.modifiedTimeSlot}
                        onValueChange={(value) => setReviewForm({ ...reviewForm, modifiedTimeSlot: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="08:00 - 10:00">08:00 - 10:00</SelectItem>
                          <SelectItem value="10:00 - 12:00">10:00 - 12:00</SelectItem>
                          <SelectItem value="12:00 - 14:00">12:00 - 14:00</SelectItem>
                          <SelectItem value="14:00 - 16:00">14:00 - 16:00</SelectItem>
                          <SelectItem value="16:00 - 18:00">16:00 - 18:00</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleReviewRequest}
                  disabled={reviewRequestMutation.isPending}
                  className="bg-module-inventory hover:bg-module-inventory/90"
                >
                  {reviewRequestMutation.isPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Submit Review'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

