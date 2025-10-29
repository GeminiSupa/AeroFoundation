import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Users, GraduationCap, TrendingUp, Bot, Calendar, UserPlus, Clock } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { useApp } from '../../context/AppContext';
import { AIInsights } from '../AIInsights';
import { useNavigate } from 'react-router-dom';

export function AdminDashboard() {
  const { user } = useApp();
  const navigate = useNavigate();

  const stats = [
    { icon: <Users className="w-6 h-6" />, label: 'Total Students', value: '1,234', change: '+12%', color: 'bg-blue-500' },
    { icon: <GraduationCap className="w-6 h-6" />, label: 'Total Teachers', value: '87', change: '+3', color: 'bg-green-500' },
    { icon: <TrendingUp className="w-6 h-6" />, label: 'Attendance Rate', value: '94.2%', change: '+2.1%', color: 'bg-orange-500' },
    { icon: <Bot className="w-6 h-6" />, label: 'AI Insights', value: '23', change: 'New', color: 'bg-purple-500' },
  ];

  const alerts = [
    { id: 1, type: 'warning', message: 'Class 10B has low attendance this week (78%)', time: '10 minutes ago' },
    { id: 2, type: 'info', message: 'AI detected scheduling conflict for Math class', time: '1 hour ago' },
    { id: 3, type: 'success', message: 'New teacher onboarding completed successfully', time: '2 hours ago' },
  ];

  const quickActions = [
    { icon: <Calendar className="w-5 h-5" />, label: 'Create Schedule', page: 'admin-scheduling', color: 'bg-blue-500' },
    { icon: <UserPlus className="w-5 h-5" />, label: 'Add User', page: 'admin-users', color: 'bg-green-500' },
    { icon: <Bot className="w-5 h-5" />, label: 'AI Optimize', page: 'admin-ai-tools', color: 'bg-orange-500' },
  ];

  const upcomingEvents = [
    { title: 'Parent-Teacher Meeting', date: 'Oct 20, 2025', time: '10:00 AM' },
    { title: 'Science Fair', date: 'Oct 25, 2025', time: '9:00 AM' },
    { title: 'Staff Training', date: 'Oct 28, 2025', time: '2:00 PM' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>Welcome back, {user?.name}</h1>
        <p className="text-muted-foreground">Here's what's happening with your school today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <h2 className="mt-2">{stat.value}</h2>
                  <Badge variant="secondary" className="mt-2">{stat.change}</Badge>
                </div>
                <div className={`${stat.color} p-3 rounded-lg text-white`}>
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
            {alerts.map((alert) => (
              <div key={alert.id} className="border-l-4 border-orange-500 pl-3 py-2">
                <Badge variant={alert.type === 'warning' ? 'destructive' : alert.type === 'success' ? 'default' : 'secondary'}>
                  {alert.type}
                </Badge>
                <p className="text-sm mt-1">{alert.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Calendar overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="flex items-start gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer">
                <div className="bg-blue-500 p-2 rounded-lg text-white">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm">{event.title}</p>
                  <p className="text-xs text-muted-foreground">{event.date} at {event.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-orange-500" />
                AI Insights & Recommendations
              </CardTitle>
              <CardDescription>Data-driven insights for better decision making</CardDescription>
            </div>
            <Button onClick={() => navigate('/admin-ai-tools')}>View All</Button>
          </div>
        </CardHeader>
        <CardContent>
          <AIInsights role="admin" />
        </CardContent>
      </Card>
    </div>
  );
}