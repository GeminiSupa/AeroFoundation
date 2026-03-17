 'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { TrendingUp, BookOpen, ClipboardList } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useRouter } from 'next/navigation';
import { Progress } from '../ui/progress';
import { useQuery } from '@tanstack/react-query';
import { getStudentDashboardStats, getStudentAverageGrade } from '../../lib/api/dashboard';
import { getStudentAssignments } from '../../lib/api/assignments';
import { getStudent } from '../../lib/api/students';
import { getTimetableEntries } from '../../lib/api/timetable';

export function StudentDashboard() {
  const { user } = useApp();
  const router = useRouter();

  const studentStats = useQuery({
    queryKey: ['student-dashboard-stats', user?.id],
    queryFn: async () => {
      const r = await getStudentDashboardStats(user!.id);
      if (!r.success) throw new Error(r.error || 'Failed to load dashboard stats');
      return r.data!;
    },
    enabled: !!user?.id,
  });

  const averageGrade = useQuery({
    queryKey: ['student-average-grade', user?.id],
    queryFn: async () => {
      const r = await getStudentAverageGrade(user!.id);
      if (!r.success) throw new Error(r.error || 'Failed to load average grade');
      return r.data ?? 0;
    },
    enabled: !!user?.id,
  });

  const assignmentsQuery = useQuery({
    queryKey: ['student-assignments', user?.id],
    queryFn: async () => {
      const r = await getStudentAssignments(user!.id);
      if (!r.success) throw new Error(r.error || 'Failed to load assignments');
      return r.data || [];
    },
    enabled: !!user?.id,
  });

  const todaySchedule = useQuery({
    queryKey: ['student-today-schedule', user?.id],
    queryFn: async () => {
      const studentRes = await getStudent(user!.id);
      if (!studentRes.success) {
        const err = (studentRes as { success: false; error: string }).error;
        throw new Error(err || 'Failed to load student record');
      }
      const classId = studentRes.data?.class_id as string | undefined;
      if (!classId) return [];

      // timetable_entries uses 0=Monday..6=Sunday, JS is 0=Sunday..6=Saturday
      const dayOfWeek = (new Date().getDay() + 6) % 7;
      const r = await getTimetableEntries({ classId, dayOfWeek });
      if (!r.success) throw new Error(r.error || 'Failed to load timetable');
      return r.data || [];
    },
    enabled: !!user?.id,
  });

  const schedule = (todaySchedule.data || []).map((e: any) => ({
    id: e.id,
    subject: e.subject_name || e.class_name || 'Class',
    teacher: e.teacher_name || 'Teacher',
    room: e.room || '—',
    time: e.start_time && e.end_time ? `${e.start_time} - ${e.end_time}` : (e.start_time || e.end_time || ''),
  }));

  const assignments = (assignmentsQuery.data || [])
    .filter((a: any) => !a.dueDate || new Date(a.dueDate).getTime() >= Date.now())
    .slice(0, 6)
    .map((a: any) => ({
      id: a.id,
      title: a.title,
      subject: a.subject || a.className,
      dueDate: a.dueDate ? new Date(a.dueDate).toLocaleDateString() : 'No due date',
      status: 'pending',
    }));

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-role-student">Welcome back, {user?.name}</h1>
        <p className="text-muted-foreground text-sm sm:text-base mt-1">Class {user?.class} • Ready to learn today?</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/student-attendance')}>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Attendance</p>
                <p className="text-2xl font-semibold mt-1">
                  {studentStats.isLoading ? '—' : `${studentStats.data?.attendancePercentage ?? 0}%`}
                </p>
                <div className="mt-2">
                  <Progress value={studentStats.data?.attendancePercentage ?? 0} />
                </div>
              </div>
              <div className="bg-blue-500 p-3 rounded-lg text-white">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/student-grades')}>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Grades</p>
                <p className="text-2xl font-semibold mt-1">
                  {averageGrade.isLoading ? '—' : `${averageGrade.data ?? 0}%`}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Average (graded items)
                </p>
              </div>
              <div className="bg-green-500 p-3 rounded-lg text-white">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/student-todo')}>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Assignments & To‑Do</p>
                <p className="text-2xl font-semibold mt-1">
                  {studentStats.isLoading ? '—' : (studentStats.data?.pendingAssignments ?? 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Pending assignments</p>
              </div>
              <div className="bg-orange-500 p-3 rounded-lg text-white">
                <ClipboardList className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="schedule">
        <TabsList>
          <TabsTrigger value="schedule">Today's Schedule</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle>Today's Classes</CardTitle>
                  <CardDescription>Your schedule for today</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="w-full sm:w-auto min-h-[44px] sm:min-h-0 touch-manipulation" onClick={() => router.push('/student-schedule')}>View full schedule</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todaySchedule.isLoading ? (
                  <p className="text-sm text-muted-foreground">Loading today&apos;s schedule…</p>
                ) : schedule.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No schedule items to show yet. Once your timetable is configured, today&apos;s classes will appear here.
                  </p>
                ) : schedule.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-500 p-3 rounded-lg text-white shrink-0">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h4>{item.subject}</h4>
                        <p className="text-sm text-muted-foreground">{item.teacher} • {item.room}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="self-start sm:self-auto">
                      {item.time}
                    </Badge>
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
                {assignmentsQuery.isLoading ? (
                  <p className="text-sm text-muted-foreground">Loading assignments…</p>
                ) : assignments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No assignments to show yet. New assignments will appear here when created.
                  </p>
                ) : assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg"
                  >
                    <div className="min-w-0">
                      <h4>{assignment.title}</h4>
                      <p className="text-sm text-muted-foreground">{assignment.subject} • Due: {assignment.dueDate}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={assignment.status === 'pending' ? 'destructive' : 'default'}>
                        {assignment.status}
                      </Badge>
                      {assignment.status === 'pending' && (
                        <Button size="sm" className="whitespace-nowrap">
                          Submit
                        </Button>
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
              <CardTitle>Insights</CardTitle>
              <CardDescription>Insights have been removed.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No AI insights are shown.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}