import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { BookOpen, ClipboardCheck, FileText, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { AIInsights } from '../AIInsights';

export function TeacherDashboard() {
  const { user } = useApp();
  const navigate = useNavigate();

  const todayClasses = [
    { id: 1, class: '10A', subject: 'Mathematics', time: '9:00 AM - 10:00 AM', room: 'Room 201' },
    { id: 2, class: '10B', subject: 'Mathematics', time: '11:00 AM - 12:00 PM', room: 'Room 201' },
    { id: 3, class: '9A', subject: 'Algebra', time: '2:00 PM - 3:00 PM', room: 'Room 105' },
  ];

  const assignments = [
    { id: 1, title: 'Calculus Problem Set', class: '10A', due: 'Oct 22', submitted: 28, total: 32, status: 'pending' },
    { id: 2, title: 'Linear Equations Quiz', class: '10B', due: 'Oct 20', submitted: 30, total: 30, status: 'grading' },
    { id: 3, title: 'Geometry Project', class: '9A', due: 'Oct 25', submitted: 15, total: 25, status: 'open' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Good Morning, {user?.name}</h1>
          <p className="text-muted-foreground">You have 3 classes scheduled today</p>
        </div>
        <Button onClick={() => navigate('/teacher-leave')}>
          <Calendar className="w-4 h-4 mr-2" />
          Apply for Leave
        </Button>
      </div>

      <AIInsights role="teacher" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Classes</p>
                <h2 className="mt-2">3</h2>
              </div>
              <div className="bg-blue-500 p-3 rounded-lg text-white">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Grading</p>
                <h2 className="mt-2">15</h2>
              </div>
              <div className="bg-orange-500 p-3 rounded-lg text-white">
                <ClipboardCheck className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Assignments</p>
                <h2 className="mt-2">8</h2>
              </div>
              <div className="bg-green-500 p-3 rounded-lg text-white">
                <FileText className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today's Schedule</CardTitle>
          <CardDescription>Your classes for today</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {todayClasses.map((classItem) => (
              <div key={classItem.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-500 p-3 rounded-lg text-white">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h4>{classItem.subject} - {classItem.class}</h4>
                    <p className="text-sm text-muted-foreground">{classItem.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{classItem.room}</Badge>
                  <Button variant="outline" size="sm" onClick={() => navigate('/teacher-classes')}>
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="assignments">
        <TabsList>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="assignments">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Assignments</CardTitle>
                <Button>Create New</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Assignment</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell>{assignment.title}</TableCell>
                      <TableCell>{assignment.class}</TableCell>
                      <TableCell>{assignment.due}</TableCell>
                      <TableCell>{assignment.submitted}/{assignment.total}</TableCell>
                      <TableCell>
                        <Badge variant={assignment.status === 'pending' ? 'destructive' : assignment.status === 'grading' ? 'default' : 'secondary'}>
                          {assignment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>Mark Attendance</CardTitle>
              <CardDescription>Select a class to mark attendance</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Select a class from today's schedule to mark attendance.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}