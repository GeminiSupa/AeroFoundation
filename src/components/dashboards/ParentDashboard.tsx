 'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { User, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getParentDashboardStats } from '../../lib/api/dashboard';
import { getParentFeeList } from '../../lib/api/finance';

export function ParentDashboard() {
  const { user } = useApp();
  const router = useRouter();
  const { data: stats } = useQuery({
    queryKey: ['parentDashboardStats', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');
      const res = await getParentDashboardStats(user.id);
      if (!res.success) throw new Error(res.error);
      return res.data!;
    },
    enabled: !!user?.id,
  });

  const { data: parentFees = [] } = useQuery({
    queryKey: ['parentFeeList', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await getParentFeeList(user.id);
      if (!res.success) return [];
      return res.data || [];
    },
    enabled: !!user?.id,
  });

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-role-parent">Welcome, {user?.name}</h1>
        <p className="text-muted-foreground text-sm sm:text-base mt-1">
          {stats
            ? `You have ${stats.childrenCount || 0} child${(stats.childrenCount || 0) === 1 ? '' : 'ren'} linked and ${stats.unpaidFees || 0} unpaid fee${(stats.unpaidFees || 0) === 1 ? '' : 's'}.`
            : 'Monitor your children&apos;s academic progress and activities.'}
        </p>
      </div>

      {/* Children Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
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

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="flex-1 min-w-[100px]" onClick={() => router.push('/parent-progress')}>
                  View Grades
                </Button>
                <Button variant="outline" size="sm" className="flex-1 min-w-[100px]" onClick={() => router.push('/parent-leave')}>
                  Request Leave
                </Button>
                <Button variant="outline" size="sm" className="flex-1 min-w-[100px]" onClick={() => router.push('/parent-progress')}>
                  Attendance
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
                  <p className="text-sm text-muted-foreground">Unpaid fees</p>
                  <h2 className="text-red-600">
                    {stats ? `${stats.unpaidFees || 0} invoice${(stats.unpaidFees || 0) === 1 ? '' : 's'}` : '—'}
                  </h2>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {parentFees.length === 0 ? (
                <>
                  <p className="text-sm text-muted-foreground mb-3">
                    You have no unpaid invoices right now.
                  </p>
                <Button size="sm" onClick={() => router.push('/parent-fees')}>
                    View Fees
                  </Button>
                </>
              ) : (
                <div className="space-y-3">
                  {parentFees.slice(0, 5).map((fee: any) => (
                    <div
                      key={fee.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-orange-500 p-2 rounded-lg text-white">
                          <DollarSign className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm">
                            {fee.fee_type || 'Fee'} • {fee.student_name}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Due: {fee.due_date || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">
                          ${Number(fee.amount || 0).toFixed(2)}
                        </p>
                        <Badge
                          variant={
                            fee.status === 'unpaid'
                              ? 'destructive'
                              : fee.status === 'overdue'
                              ? 'destructive'
                              : 'secondary'
                          }
                          className="mt-1"
                        >
                          {fee.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => router.push('/parent-fees')}
                  >
                    View & Pay All Fees
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}