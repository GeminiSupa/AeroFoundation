import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Users, GraduationCap, TrendingUp, Bot, Calendar, UserPlus, Clock } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { useApp } from '../../context/AppContext';
import { AIInsights } from '../AIInsights';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAdminDashboardStats } from '../../lib/api/dashboard';
import { AlertCircle } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

export function AdminDashboard() {
  const { user } = useApp();
  const navigate = useNavigate();

  // Fetch dashboard stats using TanStack Query
  const { data: statsData, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['adminDashboardStats'],
    queryFn: async () => {
      const result = await getAdminDashboardStats();
      if (!result.success) throw new Error(result.error);
      return result.data!;
    },
  });

  const stats = statsLoading ? [
    { icon: <Users className="w-6 h-6" />, label: 'Total Students', value: '...', change: '', color: 'bg-blue-500' },
    { icon: <GraduationCap className="w-6 h-6" />, label: 'Total Teachers', value: '...', change: '', color: 'bg-green-500' },
    { icon: <TrendingUp className="w-6 h-6" />, label: 'Attendance Rate', value: '...', change: '', color: 'bg-orange-500' },
    { icon: <Bot className="w-6 h-6" />, label: 'AI Insights', value: '...', change: '', color: 'bg-purple-500' },
  ] : statsData ? [
    { icon: <Users className="w-6 h-6" />, label: 'Total Students', value: statsData.totalStudents.toString(), change: '', color: 'bg-blue-500' },
    { icon: <GraduationCap className="w-6 h-6" />, label: 'Total Teachers', value: statsData.totalTeachers.toString(), change: '', color: 'bg-green-500' },
    { icon: <TrendingUp className="w-6 h-6" />, label: 'Attendance Rate', value: `${statsData.attendanceRate}%`, change: '', color: 'bg-orange-500' },
    { icon: <Bot className="w-6 h-6" />, label: 'AI Insights', value: statsData.aiInsights.toString(), change: 'New', color: 'bg-purple-500' },
  ] : [];

  const alerts: any[] = [];

  const quickActions = [
    { icon: <Calendar className="w-5 h-5" />, label: 'Learning Hub & Schedule', page: 'admin-learning-hub', color: 'bg-blue-500' },
    { icon: <UserPlus className="w-5 h-5" />, label: 'Add Student', page: 'admin-students?action=add', color: 'bg-indigo-500' },
    { icon: <Users className="w-5 h-5" />, label: 'Manage Students', page: 'admin-students', color: 'bg-green-500' },
    { icon: <Bot className="w-5 h-5" />, label: 'AI Optimize', page: 'admin-ai-tools', color: 'bg-orange-500' },
  ];

  const upcomingEvents: any[] = [];

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold">Welcome back, {user?.name}</h1>
        <p className="text-muted-foreground text-sm sm:text-base mt-1">Here's what's happening with your school today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statsLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : statsError ? (
          <div className="col-span-4 flex items-center justify-center p-6 text-destructive">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>Failed to load dashboard statistics</span>
          </div>
        ) : (
          stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <h2 className="mt-2">{stat.value}</h2>
                    {stat.change && <Badge variant="secondary" className="mt-2">{stat.change}</Badge>}
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg text-white`}>
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate(`/${action.page}`)}
              >
                <div className={`${action.color} p-2 rounded-lg text-white mr-3`}>
                  {action.icon}
                </div>
                {action.label}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Active Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Active Alerts</CardTitle>
            <CardDescription>Important notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No alerts yet. As real data comes in, important notifications will appear here.
              </p>
            ) : (
              alerts.map((alert) => (
                <div key={alert.id} className="border-l-4 border-orange-500 pl-3 py-2">
                  <Badge variant={alert.type === 'warning' ? 'destructive' : alert.type === 'success' ? 'default' : 'secondary'}>
                    {alert.type}
                  </Badge>
                  <p className="text-sm mt-1">{alert.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Calendar overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No events scheduled yet.</p>
            ) : (
              upcomingEvents.map((event, index) => (
                <div key={index} className="flex items-start gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer">
                  <div className="bg-blue-500 p-2 rounded-lg text-white">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{event.date} at {event.time}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Insights section removed */}
    </div>
  );
}