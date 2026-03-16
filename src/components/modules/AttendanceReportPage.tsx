import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Calendar, Download, Filter, AlertCircle, CheckCircle } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useQuery } from '@tanstack/react-query';
import { getAttendanceReport } from '../../lib/api/attendance';
import { getClasses } from '../../lib/api/timetable';
import { Skeleton } from '../ui/skeleton';
import { toast } from 'sonner';

export function AttendanceReportPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');

  // Fetch classes for filter
  const { data: classes } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const res = await getClasses();
      return res.success ? (res.data || []) : [];
    },
  });

  // Fetch attendance report with filters
  const { data: attendanceData, isLoading, error } = useQuery({
    queryKey: ['attendanceReport', startDate, endDate, selectedClassId],
    queryFn: async () => {
      const res = await getAttendanceReport({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        classId: selectedClassId || undefined,
      });
      if (!res.success) throw new Error(res.error);
      return res.data || [];
    },
    enabled: true,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge variant="positive">Present</Badge>;
      case 'absent':
        return <Badge variant="negative">Absent</Badge>;
      case 'late':
        return <Badge variant="critical">Late</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleExport = () => {
    if (!attendanceData || attendanceData.length === 0) {
      toast.error('No data to export');
      return;
    }

    // Convert to CSV
    const headers = ['Date', 'Student Name', 'Roll Number', 'Class', 'Status', 'Teacher', 'Notes'];
    const rows = attendanceData.map((row) => [
      row.attendance_date,
      row.student_name,
      row.roll_number,
      `${row.class_name} ${row.class_section || ''}`.trim(),
      row.status,
      row.teacher_name,
      row.notes || '',
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success('Attendance report exported successfully');
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-role-admin">
            <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-role-admin" />
            Attendance Report
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">View and analyze student attendance records</p>
        </div>
        <Button onClick={handleExport} variant="outline" className="w-full sm:w-auto">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
          <CardDescription>Filter attendance records by date range and class</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Class</Label>
              <Select value={selectedClassId || undefined} onValueChange={(val) => setSelectedClassId(val || '')}>
                <SelectTrigger>
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  {classes?.map((cls: any) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.displayName || cls.name}
                    </SelectItem>
                  ))}
                  {(!classes || classes.length === 0) && (
                    <SelectItem value="no-classes" disabled>No classes available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Attendance Records</CardTitle>
              <CardDescription>
                {attendanceData ? `${attendanceData.length} records found` : 'Loading...'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12 text-destructive">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>{(error as any).message || 'Failed to load attendance records'}</span>
            </div>
          ) : !attendanceData || attendanceData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No attendance records found</p>
              <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Roll Number</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceData.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        {new Date(record.attendance_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        {record.student_name}
                      </TableCell>
                      <TableCell>{record.roll_number}</TableCell>
                      <TableCell>
                        {record.class_name} {record.class_section ? `- ${record.class_section}` : ''}
                      </TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell>{record.teacher_name || '-'}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {record.notes || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

