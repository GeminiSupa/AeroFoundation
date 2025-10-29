import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Calendar, Bot, Plus, Users } from 'lucide-react';
import { Badge } from '../ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

export function SchedulingPage() {
  const schedule = [
    { time: '9:00 AM', monday: { class: 'Math 10A', teacher: 'Ms. Khan', room: '201' }, tuesday: { class: 'Physics 9B', teacher: 'Mr. Smith', room: '305' } },
    { time: '10:00 AM', monday: { class: 'English 9A', teacher: 'Mrs. Brown', room: '102' }, tuesday: { class: 'Math 10B', teacher: 'Ms. Khan', room: '201' } },
    { time: '11:00 AM', monday: { class: 'Chemistry 10A', teacher: 'Dr. Lee', room: '306' }, tuesday: { class: 'History 8A', teacher: 'Mr. Davis', room: '104' } },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2">
            <Calendar className="w-8 h-8" />
            Scheduling Management
          </h1>
          <p className="text-muted-foreground">Create and manage class schedules</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Bot className="w-4 h-4 mr-2 text-orange-500" />
            AI Optimize
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Schedule
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total Classes</p>
            <h2 className="mt-2">156</h2>
            <Badge className="mt-2" variant="secondary">Active</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Schedule Conflicts</p>
            <h2 className="mt-2 text-orange-500">3</h2>
            <Badge className="mt-2" variant="destructive">Needs attention</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Efficiency Score</p>
            <h2 className="mt-2">87%</h2>
            <Badge className="mt-2">Good</Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Weekly Schedule</CardTitle>
              <CardDescription>Current class schedule overview</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Users className="w-4 h-4 mr-2" />
                Assign Teacher
              </Button>
              <Button variant="outline" size="sm">
                <Users className="w-4 h-4 mr-2" />
                Assign Students
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Time</TableHead>
                  <TableHead>Monday</TableHead>
                  <TableHead>Tuesday</TableHead>
                  <TableHead>Wednesday</TableHead>
                  <TableHead>Thursday</TableHead>
                  <TableHead>Friday</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedule.map((slot, index) => (
                  <TableRow key={index}>
                    <TableCell>{slot.time}</TableCell>
                    <TableCell>
                      {slot.monday && (
                        <div className="border rounded-lg p-2 bg-blue-50 dark:bg-blue-950">
                          <p className="text-sm">{slot.monday.class}</p>
                          <p className="text-xs text-muted-foreground">{slot.monday.teacher}</p>
                          <Badge variant="outline" className="mt-1 text-xs">Room {slot.monday.room}</Badge>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {slot.tuesday && (
                        <div className="border rounded-lg p-2 bg-green-50 dark:bg-green-950">
                          <p className="text-sm">{slot.tuesday.class}</p>
                          <p className="text-xs text-muted-foreground">{slot.tuesday.teacher}</p>
                          <Badge variant="outline" className="mt-1 text-xs">Room {slot.tuesday.room}</Badge>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>-</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-orange-500" />
            AI Scheduling Assistant
          </CardTitle>
          <CardDescription>Intelligent recommendations for your schedule</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="border rounded-lg p-4 bg-orange-50 dark:bg-orange-950">
              <div className="flex items-start gap-3">
                <Bot className="w-5 h-5 text-orange-500 mt-1" />
                <div>
                  <h4>Conflict Detected</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Physics and Chemistry classes overlap on Wednesday. AI suggests moving Chemistry to 2PM.
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm">Accept Suggestion</Button>
                    <Button size="sm" variant="outline">View Details</Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950">
              <div className="flex items-start gap-3">
                <Bot className="w-5 h-5 text-blue-500 mt-1" />
                <div>
                  <h4>Optimization Opportunity</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Moving Math 10A from 9AM to 10AM could improve student performance by 12% based on historical data.
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm">Accept Suggestion</Button>
                    <Button size="sm" variant="outline">Dismiss</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
