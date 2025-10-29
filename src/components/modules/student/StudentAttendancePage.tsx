import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Calendar } from '../../ui/calendar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import { ClipboardCheck, TrendingUp, AlertCircle, Calendar as CalendarIcon } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

export function StudentAttendancePage() {
  const { user } = useApp();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Student's personal attendance - ONLY their own data
  const myAttendance = {
    overall: 94,
    monthly: [
      { month: 'September', present: 20, absent: 1, late: 1, total: 22 },
      { month: 'October', present: 16, absent: 0, late: 1, total: 17 },
    ],
    recentRecords: [
      { date: 'Oct 18, 2025', status: 'Present', subject: 'All Classes' },
      { date: 'Oct 17, 2025', status: 'Present', subject: 'All Classes' },
      { date: 'Oct 16, 2025', status: 'Late', subject: 'Mathematics' },
      { date: 'Oct 15, 2025', status: 'Present', subject: 'All Classes' },
      { date: 'Oct 14, 2025', status: 'Present', subject: 'All Classes' },
    ],
    subjectWise: [
      { subject: 'Mathematics', present: 36, total: 38, percentage: 95 },
      { subject: 'Science', present: 35, total: 38, percentage: 92 },
      { subject: 'English', present: 37, total: 38, percentage: 97 },
      { subject: 'History', present: 36, total: 38, percentage: 95 },
    ]
  };

  const totalPresent = myAttendance.monthly.reduce((sum, m) => sum + m.present, 0);
  const totalAbsent = myAttendance.monthly.reduce((sum, m) => sum + m.absent, 0);
  const totalLate = myAttendance.monthly.reduce((sum, m) => sum + m.late, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2">
          <ClipboardCheck className="w-6 h-6" />
          My Attendance
        </h2>
        <p className="text-muted-foreground">Track your attendance record</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Overall Attendance</p>
            <h2 className="mt-2 text-green-600">{myAttendance.overall}%</h2>
            <div className="flex items-center gap-1 text-green-600 text-sm mt-2">
              <TrendingUp className="w-4 h-4" />
              <span>Excellent</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Days Present</p>
            <h2 className="mt-2">{totalPresent}</h2>
            <p className="text-sm text-muted-foreground mt-2">This semester</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Days Absent</p>
            <h2 className="mt-2 text-red-600">{totalAbsent}</h2>
            <p className="text-sm text-muted-foreground mt-2">This semester</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Times Late</p>
            <h2 className="mt-2 text-orange-600">{totalLate}</h2>
            <p className="text-sm text-muted-foreground mt-2">This semester</p>
          </CardContent>
        </Card>
      </div>

      {/* Warning Alert if attendance is low */}
      {myAttendance.overall < 75 && (
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-1" />
              <div>
                <h4 className="text-red-600">Attendance Warning</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Your attendance is below 75%. This may affect your eligibility for exams. 
                  Please contact your class teacher or apply for leave if needed.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <Card>
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>View attendance by date</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>Present</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>Absent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span>Late</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Records */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Attendance</CardTitle>
            <CardDescription>Your attendance history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myAttendance.recentRecords.map((record, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{record.date}</p>
                      <p className="text-sm text-muted-foreground">{record.subject}</p>
                    </div>
                  </div>
                  <Badge 
                    variant={
                      record.status === 'Present' ? 'default' :
                      record.status === 'Late' ? 'secondary' :
                      'destructive'
                    }
                  >
                    {record.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Breakdown</CardTitle>
          <CardDescription>Attendance statistics by month</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead>Present</TableHead>
                <TableHead>Absent</TableHead>
                <TableHead>Late</TableHead>
                <TableHead>Total Days</TableHead>
                <TableHead>Percentage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myAttendance.monthly.map((month, index) => {
                const percentage = Math.round((month.present / month.total) * 100);
                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{month.month}</TableCell>
                    <TableCell>
                      <Badge variant="default">{month.present}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive">{month.absent}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{month.late}</Badge>
                    </TableCell>
                    <TableCell>{month.total}</TableCell>
                    <TableCell>
                      <Badge variant={percentage >= 90 ? 'default' : percentage >= 75 ? 'secondary' : 'destructive'}>
                        {percentage}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Subject-wise Attendance */}
      <Card>
        <CardHeader>
          <CardTitle>Subject-wise Attendance</CardTitle>
          <CardDescription>Your attendance per subject</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Present</TableHead>
                <TableHead>Total Classes</TableHead>
                <TableHead>Percentage</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myAttendance.subjectWise.map((subject, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{subject.subject}</TableCell>
                  <TableCell>{subject.present}</TableCell>
                  <TableCell>{subject.total}</TableCell>
                  <TableCell>
                    <Badge variant={subject.percentage >= 90 ? 'default' : 'secondary'}>
                      {subject.percentage}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {subject.percentage >= 90 ? (
                      <span className="text-green-600 text-sm">Excellent</span>
                    ) : subject.percentage >= 75 ? (
                      <span className="text-orange-600 text-sm">Good</span>
                    ) : (
                      <span className="text-red-600 text-sm">Needs Improvement</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Privacy Notice */}
      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-muted-foreground">
          🔒 Privacy Protected: You can only view your own attendance record. This data is private and not shared with other students.
        </p>
      </div>
    </div>
  );
}
