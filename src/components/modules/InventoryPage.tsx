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
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Package, Search, QrCode, Plus, AlertTriangle, CheckCircle, Calendar as CalendarIcon, MapPin, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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

  // Mock data
  const assets: Asset[] = [
    {
      id: '1',
      name: 'Dell Laptop - XPS 15',
      category: 'Electronics',
      barcode: 'LAP-2024-001',
      status: 'in-use',
      location: 'Computer Lab A',
      assignedTo: 'Michael Chen',
      purchaseDate: '2023-09-15',
      condition: 'Good',
      value: 1299
    },
    {
      id: '2',
      name: 'Canon DSLR Camera',
      category: 'Photography',
      barcode: 'CAM-2024-015',
      status: 'available',
      location: 'Media Room',
      purchaseDate: '2024-01-10',
      condition: 'Excellent',
      value: 899
    },
    {
      id: '3',
      name: 'Smart Board - 75"',
      category: 'Classroom Equipment',
      barcode: 'SBD-2024-007',
      status: 'in-use',
      location: 'Room 305',
      assignedTo: 'Room 305',
      purchaseDate: '2023-06-20',
      condition: 'Good',
      value: 3500
    },
    {
      id: '4',
      name: 'Projector - Epson',
      category: 'Electronics',
      barcode: 'PRJ-2024-023',
      status: 'maintenance',
      location: 'AV Storage',
      purchaseDate: '2022-11-05',
      condition: 'Fair',
      value: 750
    },
    {
      id: '5',
      name: 'Science Lab Microscopes (Set of 10)',
      category: 'Lab Equipment',
      barcode: 'LAB-2024-032',
      status: 'available',
      location: 'Science Lab B',
      purchaseDate: '2024-02-15',
      condition: 'Excellent',
      value: 2500
    },
  ];

  const facilityBookings: FacilityBooking[] = [
    {
      id: '1',
      facility: 'Gymnasium',
      bookedBy: 'Sarah Johnson',
      date: '2025-10-22',
      timeSlot: '14:00 - 16:00',
      purpose: 'Basketball Practice',
      status: 'confirmed'
    },
    {
      id: '2',
      facility: 'Science Lab A',
      bookedBy: 'Emily Rodriguez',
      date: '2025-10-21',
      timeSlot: '10:00 - 12:00',
      purpose: 'Chemistry Experiment',
      status: 'confirmed'
    },
    {
      id: '3',
      facility: 'Auditorium',
      bookedBy: 'Michael Chen',
      date: '2025-10-25',
      timeSlot: '13:00 - 15:00',
      purpose: 'Math Competition',
      status: 'pending'
    },
    {
      id: '4',
      facility: 'Computer Lab B',
      bookedBy: 'James Wilson',
      date: '2025-10-21',
      timeSlot: '14:00 - 16:00',
      purpose: 'Coding Workshop',
      status: 'confirmed'
    },
  ];

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

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         asset.barcode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || asset.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
  const availableAssets = assets.filter(a => a.status === 'available').length;
  const inUseAssets = assets.filter(a => a.status === 'in-use').length;
  const maintenanceAssets = assets.filter(a => a.status === 'maintenance').length;

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

  const handleConfirmBooking = () => {
    if (hasConflict) {
      toast.error('⚠ Conflict Detected', {
        description: 'This facility is already booked for the selected time slot.'
      });
      return;
    }

    toast.success('Booking Confirmed ✅', {
      description: 'The facility has been successfully booked.'
    });
    setIsBookFacilityOpen(false);
    setSelectedFacility('');
    setSelectedDate(undefined);
    setSelectedTimeSlot('');
    setHasConflict(false);
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

  const handleAddAsset = () => {
    toast.success('Asset Added Successfully ✅', {
      description: 'The new asset has been registered in the inventory.'
    });
    setIsAddAssetOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-white">Inventory & Resources</h1>
          <p className="text-gray-400 mt-1">Manage assets, equipment, and facility bookings</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isScanBarcodeOpen} onOpenChange={setIsScanBarcodeOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-gray-600 text-gray-300">
                <QrCode className="mr-2 h-4 w-4" />
                Scan Barcode
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">Scan Asset Barcode</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Check in/out assets using barcode scanner
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="bg-gray-700 rounded-lg p-8 flex items-center justify-center">
                  <div className="text-center">
                    <QrCode className="h-24 w-24 mx-auto text-gray-500 mb-4" />
                    <p className="text-gray-400">Position barcode in scanner view</p>
                    <p className="text-sm text-gray-500 mt-2">or enter manually below</p>
                  </div>
                </div>
                <div>
                  <Label htmlFor="barcodeInput" className="text-gray-300">Barcode Number</Label>
                  <Input
                    id="barcodeInput"
                    placeholder="Enter or scan barcode"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsScanBarcodeOpen(false)} className="border-gray-600 text-gray-300">
                    Cancel
                  </Button>
                  <Button onClick={handleScanBarcode} disabled={isScanning} className="bg-blue-600 hover:bg-blue-700">
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
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Add Asset
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-gray-800 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">Add New Asset</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Register a new asset in the inventory system
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="assetName" className="text-gray-300">Asset Name</Label>
                    <Input id="assetName" className="bg-gray-700 border-gray-600 text-white" />
                  </div>
                  <div>
                    <Label htmlFor="category" className="text-gray-300">Category</Label>
                    <Select>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="electronics">Electronics</SelectItem>
                        <SelectItem value="classroom">Classroom Equipment</SelectItem>
                        <SelectItem value="lab">Lab Equipment</SelectItem>
                        <SelectItem value="photography">Photography</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="barcode" className="text-gray-300">Barcode/Serial Number</Label>
                    <Input id="barcode" className="bg-gray-700 border-gray-600 text-white" />
                  </div>
                  <div>
                    <Label htmlFor="location" className="text-gray-300">Location</Label>
                    <Input id="location" className="bg-gray-700 border-gray-600 text-white" />
                  </div>
                  <div>
                    <Label htmlFor="purchaseDate" className="text-gray-300">Purchase Date</Label>
                    <Input id="purchaseDate" type="date" className="bg-gray-700 border-gray-600 text-white" />
                  </div>
                  <div>
                    <Label htmlFor="value" className="text-gray-300">Value ($)</Label>
                    <Input id="value" type="number" className="bg-gray-700 border-gray-600 text-white" />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddAssetOpen(false)} className="border-gray-600 text-gray-300">
                    Cancel
                  </Button>
                  <Button onClick={handleAddAsset} className="bg-blue-600 hover:bg-blue-700">Add Asset</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400">Total Assets</CardDescription>
            <CardTitle className="text-white text-3xl">{assets.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400">Total Value: ${totalValue.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400">Available</CardDescription>
            <CardTitle className="text-white text-3xl text-green-500">{availableAssets}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400">Ready for use</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400">In Use</CardDescription>
            <CardTitle className="text-white text-3xl text-blue-500">{inUseAssets}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400">Currently assigned</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400">Maintenance</CardDescription>
            <CardTitle className="text-white text-3xl text-yellow-500">{maintenanceAssets}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-yellow-400">Needs attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="assets" className="space-y-4">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="assets" className="data-[state=active]:bg-blue-600">Asset Management</TabsTrigger>
          <TabsTrigger value="facilities" className="data-[state=active]:bg-blue-600">Facility Booking</TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-blue-600">Reports</TabsTrigger>
        </TabsList>

        {/* Asset Management Tab */}
        <TabsContent value="assets" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Asset Inventory</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search assets..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-gray-700 border-gray-600 text-white w-64"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48 bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
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
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Asset Name</TableHead>
                    <TableHead className="text-gray-300">Barcode</TableHead>
                    <TableHead className="text-gray-300">Category</TableHead>
                    <TableHead className="text-gray-300">Location</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Assigned To</TableHead>
                    <TableHead className="text-gray-300">Value</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssets.map((asset) => (
                    <TableRow key={asset.id} className="border-gray-700">
                      <TableCell className="text-white">{asset.name}</TableCell>
                      <TableCell className="text-gray-300 font-mono text-sm">{asset.barcode}</TableCell>
                      <TableCell className="text-gray-300">{asset.category}</TableCell>
                      <TableCell className="text-gray-300">
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
                      <TableCell className="text-gray-300">{asset.assignedTo || '-'}</TableCell>
                      <TableCell className="text-gray-300">${asset.value}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                          Details
                        </Button>
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
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">Facility Bookings</CardTitle>
                  <CardDescription className="text-gray-400">
                    Reserve shared spaces with conflict detection
                  </CardDescription>
                </div>
                <Dialog open={isBookFacilityOpen} onOpenChange={setIsBookFacilityOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      Book Facility
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl bg-gray-800 border-gray-700">
                    <DialogHeader>
                      <DialogTitle className="text-white">Book a Facility</DialogTitle>
                      <DialogDescription className="text-gray-400">
                        Reserve a facility for your event or class
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="facility" className="text-gray-300">Facility *</Label>
                          <Select value={selectedFacility} onValueChange={handleFacilityChange}>
                            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                              <SelectValue placeholder="Select facility" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-700 border-gray-600">
                              <SelectItem value="Gymnasium">Gymnasium</SelectItem>
                              <SelectItem value="Science Lab A">Science Lab A</SelectItem>
                              <SelectItem value="Science Lab B">Science Lab B</SelectItem>
                              <SelectItem value="Auditorium">Auditorium</SelectItem>
                              <SelectItem value="Computer Lab B">Computer Lab B</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-gray-300">Date *</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full bg-gray-700 border-gray-600 text-white justify-start">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {selectedDate ? selectedDate.toLocaleDateString() : 'Pick a date'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="bg-gray-800 border-gray-700">
                              <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={handleDateChange}
                                className="text-white"
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div>
                          <Label htmlFor="timeSlot" className="text-gray-300">Time Slot *</Label>
                          <Select value={selectedTimeSlot} onValueChange={handleTimeSlotChange}>
                            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                              <SelectValue placeholder="Select time" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-700 border-gray-600">
                              <SelectItem value="08:00 - 10:00">08:00 - 10:00</SelectItem>
                              <SelectItem value="10:00 - 12:00">10:00 - 12:00</SelectItem>
                              <SelectItem value="13:00 - 15:00">13:00 - 15:00</SelectItem>
                              <SelectItem value="14:00 - 16:00">14:00 - 16:00</SelectItem>
                              <SelectItem value="15:00 - 17:00">15:00 - 17:00</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="purpose" className="text-gray-300">Purpose</Label>
                          <Input id="purpose" className="bg-gray-700 border-gray-600 text-white" placeholder="e.g., Basketball Practice" />
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
                        }} className="border-gray-600 text-gray-300">
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleConfirmBooking}
                          disabled={!selectedFacility || !selectedDate || !selectedTimeSlot}
                          className="bg-blue-600 hover:bg-blue-700"
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
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Facility</TableHead>
                    <TableHead className="text-gray-300">Booked By</TableHead>
                    <TableHead className="text-gray-300">Date</TableHead>
                    <TableHead className="text-gray-300">Time Slot</TableHead>
                    <TableHead className="text-gray-300">Purpose</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {facilityBookings.map((booking) => (
                    <TableRow key={booking.id} className="border-gray-700">
                      <TableCell className="text-white">{booking.facility}</TableCell>
                      <TableCell className="text-gray-300">{booking.bookedBy}</TableCell>
                      <TableCell className="text-gray-300">{booking.date}</TableCell>
                      <TableCell className="text-gray-300">{booking.timeSlot}</TableCell>
                      <TableCell className="text-gray-300">{booking.purpose}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                            Cancel
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

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Inventory Reports</CardTitle>
              <CardDescription className="text-gray-400">
                Generate and export inventory reports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-24 flex-col border-gray-600 text-gray-300">
                  <Download className="h-6 w-6 mb-2" />
                  Asset Utilization Report
                </Button>
                <Button variant="outline" className="h-24 flex-col border-gray-600 text-gray-300">
                  <Download className="h-6 w-6 mb-2" />
                  Maintenance Log
                </Button>
                <Button variant="outline" className="h-24 flex-col border-gray-600 text-gray-300">
                  <Download className="h-6 w-6 mb-2" />
                  Depreciation Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
