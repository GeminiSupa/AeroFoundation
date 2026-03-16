import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Package, Search, QrCode, Plus, AlertTriangle, CheckCircle, Calendar as CalendarIcon, MapPin, Download, Loader2, Boxes, CheckCircle2, Wrench, Info, RefreshCw, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAssets, createAsset, updateAsset, getFacilityBookings, createFacilityBooking, reviewFacilityRequest, cancelFacilityRequest } from '../../lib/api/inventory';
import { getUsers } from '../../lib/api/users';
import { useApp } from '../../context/AppContext';

interface Asset {
  id: string;
  name: string;
  category: string;
  barcode: string;
  status: 'available' | 'in-use' | 'maintenance' | 'damaged';
  location: string;
  assignedTo?: string;
  purchaseDate: string;
  condition: string;
  value: number;
}

interface FacilityBooking {
  id: string;
  facility: string;
  bookedBy: string;
  date: string;
  timeSlot: string;
  purpose: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

export function InventoryPage() {
  const { user } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
  const [isScanBarcodeOpen, setIsScanBarcodeOpen] = useState(false);
  const [isBookFacilityOpen, setIsBookFacilityOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedFacility, setSelectedFacility] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [hasConflict, setHasConflict] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  
  // Form state for adding assets
  const [assetForm, setAssetForm] = useState({
    name: '',
    category: 'Electronics',
    barcode: '',
    location: '',
    purchaseDate: '',
    value: '',
    assignedTo: '',
    status: 'available' as 'available' | 'in-use' | 'maintenance' | 'damaged',
  });
  
  // Form state for editing assets
  const [editForm, setEditForm] = useState({
    name: '',
    category: 'Electronics',
    barcode: '',
    location: '',
    purchaseDate: '',
    value: '',
    assignedTo: '',
    status: 'available' as 'available' | 'in-use' | 'maintenance' | 'damaged',
    condition: 'Good',
  });

  // Form state for reviewing bookings
  const [reviewForm, setReviewForm] = useState({
    action: 'approved' as 'approved' | 'rejected' | 'requested_info',
    notes: '',
    modifiedDate: '',
    modifiedTimeSlot: '',
  });

  // Live data: assets
  const queryClient = useQueryClient();
  const { data: assetsData, isLoading: assetsLoading, error: assetsError } = useQuery({
    queryKey: ['assets', { searchQuery, selectedCategory }],
    queryFn: async () => {
      const res = await getAssets({
        search: searchQuery,
        category: selectedCategory,
      });
      if (!res.success) throw new Error(res.error);
      return res.data || [];
    },
  });

  // Live data: facility bookings
  const { data: bookingsData, isLoading: bookingsLoading, error: bookingsError } = useQuery({
    queryKey: ['facilityBookings'],
    queryFn: async () => {
      const res = await getFacilityBookings();
      if (!res.success) throw new Error(res.error);
      return res.data || [];
    },
  });

  // Live data: users (for assignment dropdown)
  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await getUsers();
      if (!res.success) return [];
      return res.data || [];
    },
    enabled: isAddAssetOpen || isEditDialogOpen, // Only fetch when dialog is open
  });

  // Normalize bookings to component's expected shape
  const facilityBookings = useMemo(() => {
    const rows = bookingsData || [];
    return rows.map((r: any) => ({
      id: r.id,
      facility: r.facility,
      bookedBy: r.booked_by,
      date: r.date,
      timeSlot: r.time_slot,
      purpose: r.purpose,
      status: r.status,
    }));
  }, [bookingsData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500/10 text-green-500';
      case 'in-use': return 'bg-blue-500/10 text-blue-500';
      case 'maintenance': return 'bg-yellow-500/10 text-yellow-500';
      case 'damaged': return 'bg-red-500/10 text-red-500';
      case 'confirmed': return 'bg-green-500/10 text-green-500';
      case 'pending': return 'bg-yellow-500/10 text-yellow-500';
      case 'cancelled': return 'bg-red-500/10 text-red-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  // Normalize assets to component's expected shape
  const assets = useMemo(() => {
    const rows = assetsData || [];
    return rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      category: r.category,
      barcode: r.barcode,
      status: r.status,
      location: r.location,
      assignedTo: r.assigned_to,
      purchaseDate: r.purchase_date,
      condition: r.condition,
      value: r.value,
    }));
  }, [assetsData]);
  
  const filteredAssets = useMemo(() => assets, [assets]);
  const totalValue = assets.reduce((sum: number, asset: any) => sum + Number(asset.value || 0), 0);
  const availableAssets = assets.filter((a: any) => a.status === 'available').length;
  const inUseAssets = assets.filter((a: any) => a.status === 'in-use').length;
  const maintenanceAssets = assets.filter((a: any) => a.status === 'maintenance').length;

  const checkConflict = (facility: string, date: Date | undefined, timeSlot: string) => {
    if (!facility || !date || !timeSlot) {
      setHasConflict(false);
      return;
    }

    const dateStr = date.toISOString().split('T')[0];
    const conflict = facilityBookings.some(
      booking => 
        booking.facility === facility && 
        booking.date === dateStr && 
        booking.timeSlot === timeSlot &&
        booking.status !== 'cancelled'
    );
    setHasConflict(conflict);
  };

  const handleFacilityChange = (value: string) => {
    setSelectedFacility(value);
    checkConflict(value, selectedDate, selectedTimeSlot);
  };

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
    checkConflict(selectedFacility, date, selectedTimeSlot);
  };

  const handleTimeSlotChange = (value: string) => {
    setSelectedTimeSlot(value);
    checkConflict(selectedFacility, selectedDate, value);
  };

  const createBookingMutation = useMutation({
    mutationFn: createFacilityBooking,
    onSuccess: () => {
      toast.success('Booking Confirmed ✅');
      queryClient.invalidateQueries({ queryKey: ['facilityBookings'] });
      setIsBookFacilityOpen(false);
      setSelectedFacility('');
      setSelectedDate(undefined);
      setSelectedTimeSlot('');
      setHasConflict(false);
    },
    onError: (e: any) => {
      toast.error(e.message || 'Failed to create booking');
    },
  });

  const handleConfirmBooking = () => {
    if (hasConflict) {
      toast.error('⚠ Conflict Detected', {
        description: 'This facility is already booked for the selected time slot.'
      });
      return;
    }

    createBookingMutation.mutate({
      facility: selectedFacility,
      booked_by: 'Admin',
      date: selectedDate!.toISOString().split('T')[0],
      time_slot: selectedTimeSlot,
      purpose: (document.getElementById('purpose') as HTMLInputElement)?.value || '',
      status: 'confirmed',
    });
  };

  const handleScanBarcode = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      toast.success('Asset Scanned Successfully', {
        description: 'Asset LAP-2024-001 checked out.'
      });
      setIsScanBarcodeOpen(false);
    }, 1500);
  };

  const createAssetMutation = useMutation({
    mutationFn: createAsset,
    onSuccess: (response) => {
      if (response.success) {
        toast.success('Asset Added Successfully ✅');
        queryClient.invalidateQueries({ queryKey: ['assets'] });
        setIsAddAssetOpen(false);
        // Reset form
        setAssetForm({
          name: '',
          category: 'Electronics',
          barcode: '',
          location: '',
          purchaseDate: '',
          value: '',
          assignedTo: '',
          status: 'available',
        });
      } else {
        toast.error(response.error || 'Failed to add asset');
      }
    },
    onError: (e: any) => {
      console.error('Asset creation error:', e);
      toast.error(e.message || 'Failed to add asset');
    },
  });

  const handleAddAsset = () => {
    if (!assetForm.name || !assetForm.barcode || !assetForm.location || !assetForm.purchaseDate) {
      toast.error('Please fill all required fields');
      return;
    }

    createAssetMutation.mutate({
      name: assetForm.name,
      category: assetForm.category,
      barcode: assetForm.barcode,
      location: assetForm.location,
      purchase_date: assetForm.purchaseDate,
      value: Number(assetForm.value || '0'),
      assigned_to: assetForm.assignedTo || null,
      condition: 'Good',
      status: assetForm.status,
    } as any);
  };

  const updateAssetMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Asset> }) => updateAsset(id, updates),
    onSuccess: (response) => {
      if (response.success) {
        toast.success('Asset Updated Successfully ✅');
        queryClient.invalidateQueries({ queryKey: ['assets'] });
        setIsDetailsDialogOpen(false);
        setIsEditDialogOpen(false);
      } else {
        toast.error(response.error || 'Failed to update asset');
      }
    },
    onError: (e: any) => {
      console.error('Asset update error:', e);
      toast.error(e.message || 'Failed to update asset');
    },
  });

  const reviewBookingMutation = useMutation({
    mutationFn: reviewFacilityRequest,
    onSuccess: (response) => {
      if (response.success) {
        toast.success('Booking Reviewed Successfully ✅');
        queryClient.invalidateQueries({ queryKey: ['facilityBookings'] });
        setIsReviewDialogOpen(false);
      } else {
        toast.error(response.error || 'Failed to review booking');
      }
    },
    onError: (e: any) => {
      console.error('Review booking error:', e);
      toast.error(e.message || 'Failed to review booking');
    },
  });

  const cancelBookingMutation = useMutation({
    mutationFn: (bookingId: string) => cancelFacilityRequest(bookingId, user?.id || ''),
    onSuccess: (response) => {
      if (response.success) {
        toast.success('Booking Cancelled Successfully ✅');
        queryClient.invalidateQueries({ queryKey: ['facilityBookings'] });
      } else {
        toast.error(response.error || 'Failed to cancel booking');
      }
    },
    onError: (e: any) => {
      console.error('Cancel booking error:', e);
      toast.error(e.message || 'Failed to cancel booking');
    },
  });

  const handleUpdateStatus = (id: string, newStatus: string) => {
    updateAssetMutation.mutate({
      id,
      updates: { status: newStatus as any }
    });
  };

  const handleEditAsset = (asset: any) => {
    setSelectedAsset(asset);
    setEditForm({
      name: asset.name || '',
      category: asset.category || 'Electronics',
      barcode: asset.barcode || '',
      location: asset.location || '',
      purchaseDate: asset.purchaseDate || '',
      value: asset.value?.toString() || '',
      assignedTo: asset.assignedTo || '',
      status: asset.status || 'available',
      condition: asset.condition || 'Good',
    });
    setIsEditDialogOpen(true);
  };

  const handleReviewBooking = () => {
    if (!selectedBooking || !user?.id) return;
    
    if (reviewForm.action === 'rejected' && !reviewForm.notes.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    reviewBookingMutation.mutate({
      request_id: selectedBooking.id,
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

  const handleSaveEdit = () => {
    if (!selectedAsset || !editForm.name || !editForm.barcode || !editForm.location || !editForm.purchaseDate) {
      toast.error('Please fill all required fields');
      return;
    }

    updateAssetMutation.mutate({
      id: selectedAsset.id,
      updates: {
        name: editForm.name,
        category: editForm.category,
        barcode: editForm.barcode,
        location: editForm.location,
        purchase_date: editForm.purchaseDate,
        value: Number(editForm.value || '0'),
        assigned_to: editForm.assignedTo || null,
        condition: editForm.condition,
        status: editForm.status,
      } as any
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-module-inventory">
            <Package className="w-8 h-8" />
            Inventory & Resources
          </h1>
          <p className="text-muted-foreground mt-1">Manage assets, equipment, and facility bookings</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isScanBarcodeOpen} onOpenChange={setIsScanBarcodeOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <QrCode className="mr-2 h-4 w-4" />
                Scan Barcode
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Scan Asset Barcode</DialogTitle>
                <DialogDescription>
                  Check in/out assets using barcode scanner
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="bg-muted rounded-lg p-8 flex items-center justify-center">
                  <div className="text-center">
                    <QrCode className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Position barcode in scanner view</p>
                    <p className="text-sm text-muted-foreground mt-2">or enter manually below</p>
                  </div>
                </div>
                <div>
                  <Label htmlFor="barcodeInput">Barcode Number</Label>
                  <Input
                    id="barcodeInput"
                    placeholder="Enter or scan barcode"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsScanBarcodeOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleScanBarcode} disabled={isScanning} className="bg-module-inventory hover:bg-module-inventory/90">
                    {isScanning ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Scanning...
                      </>
                    ) : (
                      'Check In/Out'
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isAddAssetOpen} onOpenChange={setIsAddAssetOpen}>
            <DialogTrigger asChild>
              <Button className="bg-module-inventory hover:bg-module-inventory/90">
                <Plus className="mr-2 h-4 w-4" />
                Add Asset
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Asset</DialogTitle>
                <DialogDescription>
                  Register a new asset in the inventory system
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="assetName">Asset Name *</Label>
                    <Input 
                      id="assetName"
                      value={assetForm.name}
                      onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select 
                      value={assetForm.category}
                      onValueChange={(value) => setAssetForm({ ...assetForm, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Electronics">Electronics</SelectItem>
                        <SelectItem value="Classroom Equipment">Classroom Equipment</SelectItem>
                        <SelectItem value="Lab Equipment">Lab Equipment</SelectItem>
                        <SelectItem value="Photography">Photography</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="barcode">Barcode/Serial Number *</Label>
                    <Input 
                      id="barcode"
                      value={assetForm.barcode}
                      onChange={(e) => setAssetForm({ ...assetForm, barcode: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Input 
                      id="location"
                      value={assetForm.location}
                      onChange={(e) => setAssetForm({ ...assetForm, location: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="purchaseDate">Purchase Date *</Label>
                    <Input 
                      id="purchaseDate"
                      type="date"
                      value={assetForm.purchaseDate}
                      onChange={(e) => setAssetForm({ ...assetForm, purchaseDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="value">Value ($)</Label>
                    <Input 
                      id="value"
                      type="number"
                      value={assetForm.value}
                      onChange={(e) => setAssetForm({ ...assetForm, value: e.target.value })}
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="assignedTo">Assign To (Optional)</Label>
                      {assetForm.assignedTo && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setAssetForm({ ...assetForm, assignedTo: '' })}
                          className="h-6 px-2 text-xs"
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                    <Select 
                      value={assetForm.assignedTo || undefined}
                      onValueChange={(value) => setAssetForm({ ...assetForm, assignedTo: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="None (Available)" />
                      </SelectTrigger>
                      <SelectContent>
                        {usersData?.map((user: any) => (
                          <SelectItem key={user.id} value={user.email}>
                            {user.full_name || user.email} ({user.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={assetForm.status}
                      onValueChange={(value: any) => setAssetForm({ ...assetForm, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="in-use">In Use</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="damaged">Damaged</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddAssetOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddAsset} disabled={createAssetMutation.isPending} className="bg-module-inventory hover:bg-module-inventory/90">
                    {createAssetMutation.isPending ? 'Adding...' : 'Add Asset'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Assets</p>
                <h2 className="mt-2">{assets.length}</h2>
                <p className="text-xs text-muted-foreground mt-1">Total Value: ${totalValue.toLocaleString()}</p>
              </div>
              <div className="bg-module-inventory p-3 rounded-lg text-white">
                <Boxes className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <h2 className="mt-2">{availableAssets}</h2>
                <p className="text-xs text-muted-foreground mt-1">Ready for use</p>
              </div>
              <div className="bg-sap-positive p-3 rounded-lg text-white">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Use</p>
                <h2 className="mt-2">{inUseAssets}</h2>
                <p className="text-xs text-muted-foreground mt-1">Currently assigned</p>
              </div>
              <div className="bg-module-classes p-3 rounded-lg text-white">
                <Package className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Maintenance</p>
                <h2 className="mt-2">{maintenanceAssets}</h2>
                <p className="text-xs text-muted-foreground mt-1">Needs attention</p>
              </div>
              <div className="bg-sap-critical p-3 rounded-lg text-white">
                <Wrench className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="assets" className="space-y-4">
        <TabsList className="">
          <TabsTrigger value="assets">Asset Management</TabsTrigger>
          <TabsTrigger value="facilities">Facility Booking</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Asset Management Tab */}
        <TabsContent value="assets" className="space-y-4">
          <Card className="">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="">Asset Inventory</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search assets..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="">
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Electronics">Electronics</SelectItem>
                      <SelectItem value="Classroom Equipment">Classroom Equipment</SelectItem>
                      <SelectItem value="Lab Equipment">Lab Equipment</SelectItem>
                      <SelectItem value="Photography">Photography</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="">
                    <TableHead className="">Asset Name</TableHead>
                    <TableHead className="">Barcode</TableHead>
                    <TableHead className="">Category</TableHead>
                    <TableHead className="">Location</TableHead>
                    <TableHead className="">Status</TableHead>
                    <TableHead className="">Assigned To</TableHead>
                    <TableHead className="">Value</TableHead>
                    <TableHead className="">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assetsLoading ? (
                    <TableRow><TableCell colSpan={8}>Loading...</TableCell></TableRow>
                  ) : assetsError ? (
                    <TableRow><TableCell colSpan={8} className="text-red-400">Failed to load assets</TableCell></TableRow>
                  ) : filteredAssets.length === 0 ? (
                    <TableRow><TableCell colSpan={8} className="text-muted-foreground">No assets found</TableCell></TableRow>
                  ) : filteredAssets.map((asset: any) => (
                    <TableRow key={asset.id} className="">
                      <TableCell className="">{asset.name}</TableCell>
                      <TableCell className="font-mono text-sm">{asset.barcode}</TableCell>
                      <TableCell className="">{asset.category}</TableCell>
                      <TableCell className="">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {asset.location}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(asset.status)}>
                          {asset.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="">{asset.assignedTo || '-'}</TableCell>
                      <TableCell className="">${asset.value}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-primary"
                            onClick={() => {
                              setSelectedAsset(asset);
                              setIsDetailsDialogOpen(true);
                            }}
                          >
                            Details
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEditAsset(asset)}
                          >
                            <Edit className="w-4 h-4" />
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

        {/* Facility Booking Tab */}
        <TabsContent value="facilities" className="space-y-4">
          <Card className="">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="">Facility Bookings</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Reserve shared spaces with conflict detection
                  </CardDescription>
                </div>
                <Dialog open={isBookFacilityOpen} onOpenChange={setIsBookFacilityOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-module-inventory hover:bg-module-inventory/90">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      Book Facility
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="">Book a Facility</DialogTitle>
                      <DialogDescription className="text-muted-foreground">
                        Reserve a facility for your event or class
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="facility" className="">Facility *</Label>
                          <Select value={selectedFacility} onValueChange={handleFacilityChange}>
                            <SelectTrigger className="">
                              <SelectValue placeholder="Select facility" />
                            </SelectTrigger>
                            <SelectContent className="">
                              <SelectItem value="Gymnasium">Gymnasium</SelectItem>
                              <SelectItem value="Science Lab A">Science Lab A</SelectItem>
                              <SelectItem value="Science Lab B">Science Lab B</SelectItem>
                              <SelectItem value="Auditorium">Auditorium</SelectItem>
                              <SelectItem value="Computer Lab B">Computer Lab B</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="">Date *</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-start">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {selectedDate ? selectedDate.toLocaleDateString() : 'Pick a date'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="">
                              <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={handleDateChange}
                                className=""
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div>
                          <Label htmlFor="timeSlot" className="">Time Slot *</Label>
                          <Select value={selectedTimeSlot} onValueChange={handleTimeSlotChange}>
                            <SelectTrigger className="">
                              <SelectValue placeholder="Select time" />
                            </SelectTrigger>
                            <SelectContent className="">
                              <SelectItem value="08:00 - 10:00">08:00 - 10:00</SelectItem>
                              <SelectItem value="10:00 - 12:00">10:00 - 12:00</SelectItem>
                              <SelectItem value="13:00 - 15:00">13:00 - 15:00</SelectItem>
                              <SelectItem value="14:00 - 16:00">14:00 - 16:00</SelectItem>
                              <SelectItem value="15:00 - 17:00">15:00 - 17:00</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="purpose" className="">Purpose</Label>
                          <Input id="purpose" className="" placeholder="e.g., Basketball Practice" />
                        </div>
                      </div>
                      {selectedFacility && selectedDate && selectedTimeSlot && (
                        <Alert className={hasConflict ? "border-red-500/50 bg-red-500/10" : "border-green-500/50 bg-green-500/10"}>
                          {hasConflict ? (
                            <>
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                              <AlertDescription className="text-red-200">
                                ⚠ Conflict Detected: This facility is already booked for the selected time slot
                              </AlertDescription>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <AlertDescription className="text-green-200">
                                ✓ No conflicts detected - this time slot is available
                              </AlertDescription>
                            </>
                          )}
                        </Alert>
                      )}
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => {
                          setIsBookFacilityOpen(false);
                          setSelectedFacility('');
                          setSelectedDate(undefined);
                          setSelectedTimeSlot('');
                          setHasConflict(false);
                        }} className="">
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleConfirmBooking}
                          disabled={!selectedFacility || !selectedDate || !selectedTimeSlot}
                          className="bg-module-inventory hover:bg-module-inventory/90"
                        >
                          Confirm Booking
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="">
                    <TableHead className="">Facility</TableHead>
                    <TableHead className="">Booked By</TableHead>
                    <TableHead className="">Date</TableHead>
                    <TableHead className="">Time Slot</TableHead>
                    <TableHead className="">Purpose</TableHead>
                    <TableHead className="">Status</TableHead>
                    <TableHead className="">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookingsLoading ? (
                    <TableRow><TableCell colSpan={7}>Loading...</TableCell></TableRow>
                  ) : bookingsError ? (
                    <TableRow><TableCell colSpan={7} className="text-red-400">Failed to load bookings</TableCell></TableRow>
                  ) : facilityBookings.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-muted-foreground">No bookings found</TableCell></TableRow>
                  ) : facilityBookings.map((booking) => (
                    <TableRow key={booking.id} className="">
                      <TableCell className="">{booking.facility}</TableCell>
                      <TableCell className="">{booking.bookedBy}</TableCell>
                      <TableCell className="">{booking.date}</TableCell>
                      <TableCell className="">{booking.timeSlot}</TableCell>
                      <TableCell className="">{booking.purpose}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {booking.status === 'pending' && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-primary"
                              onClick={() => {
                                setSelectedBooking(booking);
                                setIsReviewDialogOpen(true);
                              }}
                            >
                              Review
                            </Button>
                          )}
                          {(booking.status === 'pending' || booking.status === 'approved') && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-400 hover:text-red-300"
                              onClick={() => {
                                if (confirm('Are you sure you want to cancel this booking?')) {
                                  cancelBookingMutation.mutate(booking.id);
                                }
                              }}
                              disabled={cancelBookingMutation.isPending}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card className="">
            <CardHeader>
              <CardTitle className="">Inventory Reports</CardTitle>
              <CardDescription className="text-muted-foreground">
                Generate and export inventory reports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-24 flex-col">
                  <Download className="h-6 w-6 mb-2" />
                  Asset Utilization Report
                </Button>
                <Button variant="outline" className="h-24 flex-col">
                  <Download className="h-6 w-6 mb-2" />
                  Maintenance Log
                </Button>
                <Button variant="outline" className="h-24 flex-col">
                  <Download className="h-6 w-6 mb-2" />
                  Depreciation Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Asset Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Asset Details</DialogTitle>
            <DialogDescription>
              View and update asset information
            </DialogDescription>
          </DialogHeader>
          {selectedAsset && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Asset Name</Label>
                  <p className="text-sm font-medium">{selectedAsset.name}</p>
                </div>
                <div>
                  <Label>Barcode</Label>
                  <p className="text-sm font-mono">{selectedAsset.barcode}</p>
                </div>
                <div>
                  <Label>Category</Label>
                  <p className="text-sm">{selectedAsset.category}</p>
                </div>
                <div>
                  <Label>Location</Label>
                  <p className="text-sm">{selectedAsset.location}</p>
                </div>
                <div>
                  <Label>Condition</Label>
                  <p className="text-sm">{selectedAsset.condition || 'Good'}</p>
                </div>
                <div>
                  <Label>Value</Label>
                  <p className="text-sm font-semibold">${selectedAsset.value?.toLocaleString()}</p>
                </div>
                <div>
                  <Label>Assigned To</Label>
                  <p className="text-sm">{selectedAsset.assignedTo || 'Not assigned'}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge className={getStatusColor(selectedAsset.status)}>
                    {selectedAsset.status}
                  </Badge>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <Label className="text-base font-semibold mb-2 block">Change Status</Label>
                <div className="flex gap-2 flex-wrap">
                  {['available', 'in-use', 'maintenance', 'damaged'].map((status) => (
                    <Button
                      key={status}
                      variant={selectedAsset.status === status ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleUpdateStatus(selectedAsset.id, status)}
                      disabled={updateAssetMutation.isPending}
                      className={
                        selectedAsset.status === status 
                          ? 'bg-module-inventory hover:bg-module-inventory/90' 
                          : ''
                      }
                    >
                      {updateAssetMutation.isPending ? (
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-2" />
                      )}
                      {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Asset Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Asset</DialogTitle>
            <DialogDescription>
              Update asset information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editName">Asset Name *</Label>
                <Input 
                  id="editName"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="editCategory">Category *</Label>
                <Select 
                  value={editForm.category}
                  onValueChange={(value) => setEditForm({ ...editForm, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Classroom Equipment">Classroom Equipment</SelectItem>
                    <SelectItem value="Lab Equipment">Lab Equipment</SelectItem>
                    <SelectItem value="Photography">Photography</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editBarcode">Barcode/Serial Number *</Label>
                <Input 
                  id="editBarcode"
                  value={editForm.barcode}
                  onChange={(e) => setEditForm({ ...editForm, barcode: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="editLocation">Location *</Label>
                <Input 
                  id="editLocation"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="editPurchaseDate">Purchase Date *</Label>
                <Input 
                  id="editPurchaseDate"
                  type="date"
                  value={editForm.purchaseDate}
                  onChange={(e) => setEditForm({ ...editForm, purchaseDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="editValue">Value ($)</Label>
                <Input 
                  id="editValue"
                  type="number"
                  value={editForm.value}
                  onChange={(e) => setEditForm({ ...editForm, value: e.target.value })}
                />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="editAssignedTo">Assign To (Optional)</Label>
                  {editForm.assignedTo && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditForm({ ...editForm, assignedTo: '' })}
                      className="h-6 px-2 text-xs"
                    >
                      Clear
                    </Button>
                  )}
                </div>
                <Select 
                  value={editForm.assignedTo || undefined}
                  onValueChange={(value) => setEditForm({ ...editForm, assignedTo: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="None (Available)" />
                  </SelectTrigger>
                  <SelectContent>
                    {usersData?.map((user: any) => (
                      <SelectItem key={user.id} value={user.email}>
                        {user.full_name || user.email} ({user.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editStatus">Status</Label>
                <Select 
                  value={editForm.status}
                  onValueChange={(value: any) => setEditForm({ ...editForm, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="in-use">In Use</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="damaged">Damaged</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editCondition">Condition</Label>
                <Select 
                  value={editForm.condition}
                  onValueChange={(value) => setEditForm({ ...editForm, condition: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Excellent">Excellent</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Fair">Fair</SelectItem>
                    <SelectItem value="Poor">Poor</SelectItem>
                    <SelectItem value="Damaged">Damaged</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} disabled={updateAssetMutation.isPending} className="bg-module-inventory hover:bg-module-inventory/90">
                {updateAssetMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Review Booking Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Facility Request</DialogTitle>
            <DialogDescription>
              Approve, reject, or request more information
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-muted/50">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Facility:</span> {selectedBooking.facility}
                  </div>
                  <div>
                    <span className="font-medium">Date:</span> {selectedBooking.date}
                  </div>
                  <div>
                    <span className="font-medium">Time:</span> {selectedBooking.timeSlot}
                  </div>
                  <div>
                    <span className="font-medium">Booked By:</span> {selectedBooking.bookedBy}
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium">Purpose:</span> {selectedBooking.purpose}
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

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleReviewBooking}
                  disabled={reviewBookingMutation.isPending}
                  className="bg-module-inventory hover:bg-module-inventory/90"
                >
                  {reviewBookingMutation.isPending ? 'Processing...' : 'Submit Review'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
