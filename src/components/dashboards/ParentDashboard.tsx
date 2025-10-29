import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { User, TrendingUp, Calendar, DollarSign, Bot } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { AIInsights } from '../AIInsights';
import { useNavigate } from 'react-router-dom';

export function ParentDashboard() {
  const { user } = useApp();
  const navigate = useNavigate();

  const invoices = [
    { id: 1, child: 'Sarah Smith', description: 'Tuition Fee - October', amount: '$500', status: 'unpaid', dueDate: 'Oct 25' },
    { id: 2, child: 'Michael Smith', description: 'Tuition Fee - October', amount: '$500', status: 'unpaid', dueDate: 'Oct 25' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>Welcome, {user?.name}</h1>
        <p className="text-muted-foreground">Monitor your children's academic progress and activities</p>
      </div>

      {/* Children Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {user?.children?.map((child) => (
          <Card key={child.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle>{child.name}</CardTitle>
                    <CardDescription>Class {child.class}</CardDescription>
                  </div>
                </div>
                <Badge>Active</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Attendance</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={child.attendance} className="flex-1" />
                    <span className="text-sm">{child.attendance}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Average Grade</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={child.averageGrade} className="flex-1" />
                    <span className="text-sm">{child.averageGrade}%</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View Grades
                </Button>
                <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate('/parent-leave')}>
                  Request Leave
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Attendance
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AIInsights role="parent" />

      <Tabs defaultValue="payments">
        <TabsList>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Payment Overview</CardTitle>
                  <CardDescription>Manage tuition and fees</CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Pending</p>
                  <h2 className="text-red-600">$1,000</h2>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="bg-orange-500 p-3 rounded-lg text-white">
                        <DollarSign className="w-5 h-5" />
                      </div>
                      <div>
                        <h4>{invoice.description}</h4>
                        <p className="text-sm text-muted-foreground">{invoice.child} • Due: {invoice.dueDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p>{invoice.amount}</p>
                        <Badge variant="destructive">{invoice.status}</Badge>
                      </div>
                      <Button size="sm" onClick={() => navigate('/parent-fees')}>Pay Now</Button>
                    </div>
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