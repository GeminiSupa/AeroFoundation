import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { BookOpen, ClipboardCheck, FileText, Calendar, AlertCircle, User } from 'lucide-react';
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
import { useQuery } from '@tanstack/react-query';
import { getTeacherDashboardStats, getTeacherTodayClasses, TeacherTodayClass } from '../../lib/api/dashboard';
import { Skeleton } from '../ui/skeleton';

export function TeacherDashboard() {
  const { user } = useApp();
  const navigate = useNavigate();

  // Fetch teacher dashboard stats
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['teacherDashboardStats', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      const result = await getTeacherDashboardStats(user.id);
      if (!result.success) throw new Error(result.error);
      return result.data!;
    },
    enabled: !!user?.id,
  });

  // Fetch today's classes for detailed list
  const { data: todayClasses = [], isLoading: classesLoading } = useQuery({
    queryKey: ['teacherTodayClasses', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await getTeacherTodayClasses(user.id);
      if (!res.success) return [];
      return (res.data || []) as TeacherTodayClass[];
    },
    enabled: !!user?.id,
  });

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-role-teacher">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-role-teacher text-white">
              <User className="w-5 h-5" />
            </span>
            <span>Good Morning, {user?.name}</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base mt-1">
            {stats ? `You have ${stats.todaysClasses || 0} class${(stats.todaysClasses || 0) === 1 ? '' : 'es'} today` : 'Loading your teaching summary...'}
          </p>
        </div>
        <Button
          onClick={() => navigate('/teacher-leave')}
          className="min-h-[44px] touch-manipulation w-full sm:w-auto bg-role-teacher hover:bg-role-teacher/90"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Apply for Leave
        </Button>
      </div>

      <AIInsights role="teacher" />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        {statsLoading ? (
          <>
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : statsError ? (
          <div className="col-span-3 flex items-center justify-center p-6 text-destructive">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>Failed to load dashboard statistics</span>
          </div>
        ) : (
          <>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Today's Classes</p>
                    <h2 className="mt-2">{stats?.todaysClasses || 0}</h2>
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
                    <h2 className="mt-2">{stats?.pendingGrading || 0}</h2>
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
                    <h2 className="mt-2">{stats?.activeAssignments || 0}</h2>
                  </div>
                  <div className="bg-green-500 p-3 rounded-lg text-white">
                    <FileText className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today's Schedule</CardTitle>
          <CardDescription>Your classes for today</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {classesLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : todayClasses.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No classes scheduled for today.
              </p>
            ) : (
              todayClasses.map((c) => (
                <div
                  key={c.id}
                  className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-500 p-3 rounded-lg text-white shrink-0">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h4>{c.classLabel}</h4>
                      <p className="text-sm text-muted-foreground">{c.timeRange}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {c.room && <Badge variant="outline">{c.room}</Badge>}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/teacher-learning-hub')}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))
            )}
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
              <p className="text-sm text-muted-foreground">
                This section will show real assignments once they&apos;re created in the Assignments / Learning Hub modules.
              </p>
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