import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { TrendingUp, BookOpen, ClipboardList, Bot } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Progress } from '../ui/progress';
import { AIInsights } from '../AIInsights';

export function StudentDashboard() {
  const { user } = useApp();

  const schedule = [
    { id: 1, subject: 'Mathematics', time: '9:00 AM', room: 'Room 201', teacher: 'Ms. Khan' },
    { id: 2, subject: 'Physics', time: '10:00 AM', room: 'Room 305', teacher: 'Mr. Smith' },
    { id: 3, subject: 'English', time: '11:00 AM', room: 'Room 102', teacher: 'Mrs. Brown' },
    { id: 4, subject: 'Chemistry', time: '2:00 PM', room: 'Room 306', teacher: 'Dr. Lee' },
  ];

  const assignments = [
    { id: 1, title: 'Calculus Problem Set', subject: 'Mathematics', dueDate: 'Oct 22', status: 'pending' },
    { id: 2, title: 'Physics Lab Report', subject: 'Physics', dueDate: 'Oct 20', status: 'submitted' },
    { id: 3, title: 'Essay on Shakespeare', subject: 'English', dueDate: 'Oct 25', status: 'pending' },
  ];

  const aiInsights = [
    { subject: 'Mathematics', performance: 85, trend: 'up', suggestion: 'Great progress! Focus on calculus for even better results.' },
    { subject: 'Physics', performance: 78, trend: 'stable', suggestion: 'Consider reviewing mechanics concepts.' },
    { subject: 'Chemistry', performance: 92, trend: 'up', suggestion: 'Excellent work! Keep up the momentum.' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>Welcome back, {user?.name}</h1>
        <p className="text-muted-foreground">Class {user?.class} • Ready to learn today?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Attendance</p>
                <h2 className="mt-2">92%</h2>
                <Progress value={92} className="mt-2" />
              </div>
              <div className="bg-blue-500 p-3 rounded-lg text-white">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Grade</p>
                <h2 className="mt-2">85%</h2>
                <Badge className="mt-2" variant="secondary">+3% this month</Badge>
              </div>
              <div className="bg-green-500 p-3 rounded-lg text-white">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Assignments Due</p>
                <h2 className="mt-2">2</h2>
                <Badge className="mt-2" variant="destructive">Due this week</Badge>
              </div>
              <div className="bg-orange-500 p-3 rounded-lg text-white">
                <ClipboardList className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <AIInsights role="student" />

      <Tabs defaultValue="schedule">
        <TabsList>
          <TabsTrigger value="schedule">Today's Schedule</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Today's Classes</CardTitle>
              <CardDescription>Your schedule for today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {schedule.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-500 p-3 rounded-lg text-white">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h4>{item.subject}</h4>
                        <p className="text-sm text-muted-foreground">{item.teacher} • {item.room}</p>
                      </div>
                    </div>
                    <Badge variant="outline">{item.time}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments">
          <Card>
            <CardHeader>
              <CardTitle>Pending Assignments</CardTitle>
              <CardDescription>Your upcoming assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {assignments.map((assignment) => (
                  <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4>{assignment.title}</h4>
                      <p className="text-sm text-muted-foreground">{assignment.subject} • Due: {assignment.dueDate}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={assignment.status === 'pending' ? 'destructive' : 'default'}>
                        {assignment.status}
                      </Badge>
                      {assignment.status === 'pending' && (
                        <Button size="sm">Submit</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-insights">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-orange-500" />
                AI Performance Insights
              </CardTitle>
              <CardDescription>Personalized recommendations based on your performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {aiInsights.map((insight, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gradient-to-r from-orange-50 to-transparent dark:from-orange-950">
                    <div className="flex items-center justify-between mb-2">
                      <h4>{insight.subject}</h4>
                      <Badge variant={insight.trend === 'up' ? 'default' : 'secondary'}>
                        {insight.performance}%
                      </Badge>
                    </div>
                    <Progress value={insight.performance} className="mb-2" />
                    <p className="text-sm text-muted-foreground flex items-start gap-2">
                      <Bot className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      {insight.suggestion}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}