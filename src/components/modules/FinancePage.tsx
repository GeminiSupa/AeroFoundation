import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { DollarSign, TrendingUp, Bot, Send, Plus, AlertCircle as AlertIcon } from 'lucide-react';
import { Progress } from '../ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFeePayments, getFeeCollectionStats, createFeePayment, getPayrollRecords, createPayrollRecord } from '../../lib/api/finance';
import { getStudents } from '../../lib/api/students';
import { getUsers } from '../../lib/api/users';
import { useApp } from '../../context/AppContext';
import { isElevatedRole } from '../../utils/roles';
import { Skeleton } from '../ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { toast } from 'sonner';
import { useState } from 'react';

const feePaymentSchema = z.object({
  student_id: z.string().min(1, 'Student is required'),
  amount: z.string().min(1, 'Amount is required'),
  due_date: z.string().min(1, 'Due date is required'),
  payment_method: z.enum(['cash', 'card', 'bank_transfer', 'cheque', 'online']),
});

export function FinancePage() {
  const queryClient = useQueryClient();
  const { user } = useApp();
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [isAddPayrollOpen, setIsAddPayrollOpen] = useState(false);
  const [payrollForm, setPayrollForm] = useState({
    employeeId: '',
    salary: '',
    deductions: '',
    start: '',
    end: '',
    method: 'bank_transfer',
  });

  // Fetch fee payments
  const { data: feePayments, isLoading, error } = useQuery({
    queryKey: ['feePayments'],
    queryFn: async () => {
      const result = await getFeePayments();
      if (!result.success) throw new Error(result.error);
      return result.data || [];
    },
  });

  // Students for individual fee assignment
  const { data: studentsOptions = [] } = useQuery({
    queryKey: ['finance-students'],
    queryFn: async () => {
      const res = await getStudents();
      if (!res.success) return [];
      return (res.data || []).map((s: any) => ({
        id: s.id,
        name: s.profile?.full_name || 'Unnamed',
        email: s.profile?.email || '',
        className: s.class_name || '',
      }));
    },
  });

  // Fetch stats — gracefully handle RLS errors
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['feeCollectionStats'],
    queryFn: async () => {
      const result = await getFeeCollectionStats();
      if (!result.success) throw new Error(result.error);
      return result.data!;
    },
    retry: 1,
  });

  const form = useForm({
    resolver: zodResolver(feePaymentSchema),
    defaultValues: {
      amount: '',
      due_date: '',
      payment_method: 'online' as const,
    },
  });

  const createPaymentMutation = useMutation({
    mutationFn: async (data: any) => {
      const result = await createFeePayment(data);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feePayments'] });
      queryClient.invalidateQueries({ queryKey: ['feeCollectionStats'] });
      toast.success('Payment recorded successfully');
      setIsAddPaymentOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to record payment');
    },
  });

  const onSubmit = (data: z.infer<typeof feePaymentSchema>) => {
    createPaymentMutation.mutate({
      student_id: data.student_id,
      amount: parseFloat(data.amount),
      due_date: data.due_date,
      payment_method: data.payment_method,
      status: 'paid',
      payment_date: new Date().toISOString().split('T')[0],
    });
  };

  const feeStatus = feePayments || [];

  // Payroll
  const { data: payroll, isLoading: payrollLoading, error: payrollError } = useQuery({
    queryKey: ['payroll', user?.id, user?.role],
    queryFn: async () => {
      const filters: any = {};
      if (user?.role === 'teacher') filters.employeeId = user.id;
      const res = await getPayrollRecords(filters);
      if (!res.success) throw new Error(res.error);
      return res.data || [];
    },
    enabled: !!user,
    retry: 1,
  });

  // Employees (by name) for payroll dropdown
  const { data: employees = [] } = useQuery({
    queryKey: ['finance-employees'],
    queryFn: async () => {
      const res = await getUsers();
      if (!res.success) return [];
      const all = res.data || [];
      return all.filter((u: any) => u.role === 'teacher' || isElevatedRole(u.role));
    },
    enabled: isElevatedRole(user?.role),
  });

  const createPayrollMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await createPayrollRecord(payload);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      setIsAddPayrollOpen(false);
    },
    onError: (e: any) => toast.error(e.message || 'Failed to create payroll record'),
  });

  // Use fallback zero stats when there's an error
  const displayStats = stats ?? { totalCollected: 0, totalPending: 0, totalOverdue: 0, collectionRate: 0 };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1">
          <h1 className="flex items-center gap-2 text-xl sm:text-2xl font-semibold">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-module-finance text-white">
              <DollarSign className="w-5 h-5" />
            </span>
            <span>Finance Management</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Track tuition fees, collections, and payroll
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto">
            <Send className="w-4 h-4 mr-2" />
            Send Reminders
          </Button>
          <Button className="w-full sm:w-auto bg-module-finance hover:bg-module-finance/90">
            Generate Invoice
          </Button>
        </div>
      </div>

      {/* RLS warning banner */}
      {statsError && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Database permissions issue</p>
            <p className="mt-0.5">
              Run the <code className="px-1 py-0.5 bg-amber-100 dark:bg-amber-900 rounded text-xs">supabase_fix_rls_and_branding.sql</code>{' '}
              file in your Supabase SQL Editor to fix RLS policies. Until that is fixed, some statistics may appear incomplete or zero.
            </p>
          </div>
        </div>
      )}

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
        ) : (
          <>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Collected</p>
                    <h2 className="mt-2">PKR {(displayStats.totalCollected / 1000).toFixed(0)}K</h2>
                    <Badge variant="secondary" className="mt-2">This Year</Badge>
                  </div>
                  <div className="bg-primary p-3 rounded-lg text-primary-foreground">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Fees</p>
                    <h2 className="mt-2">PKR {(displayStats.totalPending / 1000).toFixed(0)}K</h2>
                    <Badge variant="secondary" className="mt-2">Outstanding</Badge>
                  </div>
                  <div className="bg-destructive p-3 rounded-lg text-destructive-foreground">
                    <DollarSign className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Collection Rate</p>
                    <h2 className="mt-2">{displayStats.collectionRate}%</h2>
                    <Progress value={displayStats.collectionRate} className="mt-2" />
                  </div>
                  <div className="bg-sap-positive p-3 rounded-lg text-white">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Overdue</p>
                    <h2 className="mt-2">PKR {(displayStats.totalOverdue / 1000).toFixed(0)}K</h2>
                    <Badge variant="secondary" className="mt-2">Overdue</Badge>
                  </div>
                  <div className="bg-sap-critical p-3 rounded-lg text-white">
                    <AlertIcon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Fee Status by Student</CardTitle>
              <CardDescription>Track payment status across all students</CardDescription>
            </div>
            <Dialog open={isAddPaymentOpen} onOpenChange={setIsAddPaymentOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Record Payment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Record Payment</DialogTitle>
                  <DialogDescription>Enter payment details</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="student_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Student</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select student" />
                              </SelectTrigger>
                              <SelectContent>
                                {studentsOptions.map((s: any) => (
                                  <SelectItem key={s.id} value={s.id}>
                                    {s.name} {s.className ? `• ${s.className}` : ''} {s.email ? `(${s.email})` : ''}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="0.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="due_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Due Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="payment_method"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Method</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="cash">Cash</SelectItem>
                              <SelectItem value="card">Card</SelectItem>
                              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                              <SelectItem value="cheque">Cheque</SelectItem>
                              <SelectItem value="online">Online</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsAddPaymentOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createPaymentMutation.isPending}>
                        {createPaymentMutation.isPending ? 'Recording...' : 'Record Payment'}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200 mb-4">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <p>Fee payments could not be loaded due to database permissions. Run <code className="px-1 py-0.5 bg-amber-100 dark:bg-amber-900 rounded text-xs">supabase_fix_rls_and_branding.sql</code> in your Supabase SQL Editor.</p>
            </div>
          )}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px]">Student</TableHead>
                    <TableHead className="min-w-[100px]">Amount</TableHead>
                    <TableHead className="min-w-[120px]">Due Date</TableHead>
                    <TableHead className="min-w-[100px]">Status</TableHead>
                    <TableHead className="min-w-[150px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feeStatus.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No fee payments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    feeStatus.map((fee: any) => (
                      <TableRow key={fee.id}>
                        <TableCell>{fee.student_name || 'Unknown'}</TableCell>
                        <TableCell>PKR {fee.amount?.toFixed(2) || '0.00'}</TableCell>
                        <TableCell>{fee.due_date || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant={
                            fee.status === 'paid' ? 'default' :
                            fee.status === 'pending' ? 'secondary' :
                            fee.status === 'overdue' ? 'destructive' : 'secondary'
                          }>
                            {fee.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {fee.status !== 'paid' && (
                              <Button size="sm" variant="outline">Remind</Button>
                            )}
                            {fee.status === 'paid' && (
                              <Button size="sm" variant="outline">Receipt</Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payroll */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payroll</CardTitle>
              <CardDescription>
                {user?.role === 'teacher' ? 'Your payroll records' : 'Run and review payroll records'}
              </CardDescription>
            </div>
            {isElevatedRole(user?.role) && (
              <Dialog open={isAddPayrollOpen} onOpenChange={setIsAddPayrollOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Payroll
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create Payroll Record</DialogTitle>
                    <DialogDescription>Enter salary details</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div>
                      <Label>Employee</Label>
                      <Select
                        value={payrollForm.employeeId}
                        onValueChange={(v) => setPayrollForm((f) => ({ ...f, employeeId: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select employee" />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map((e: any) => (
                            <SelectItem key={e.id} value={e.id}>
                              {e.full_name || e.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Salary Amount</Label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={payrollForm.salary}
                          onChange={(e) => setPayrollForm((f) => ({ ...f, salary: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label>Deductions</Label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={payrollForm.deductions}
                          onChange={(e) => setPayrollForm((f) => ({ ...f, deductions: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Period Start</Label>
                        <Input
                          type="date"
                          value={payrollForm.start}
                          onChange={(e) => setPayrollForm((f) => ({ ...f, start: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label>Period End</Label>
                        <Input
                          type="date"
                          value={payrollForm.end}
                          onChange={(e) => setPayrollForm((f) => ({ ...f, end: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Payment Method</Label>
                      <Input
                        placeholder="bank_transfer"
                        value={payrollForm.method}
                        onChange={(e) => setPayrollForm((f) => ({ ...f, method: e.target.value }))}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsAddPayrollOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={() => {
                          const salaryNum = Number(payrollForm.salary || 0);
                          const deductionsNum = Number(payrollForm.deductions || 0);
                          const payload = {
                            employee_id: payrollForm.employeeId,
                            salary_amount: salaryNum,
                            deductions: deductionsNum,
                            net_salary: Math.max(0, salaryNum - deductionsNum),
                            pay_period_start: payrollForm.start,
                            pay_period_end: payrollForm.end,
                            payment_date: new Date().toISOString().slice(0, 10),
                            payment_method: payrollForm.method || 'bank_transfer',
                            status: 'paid',
                          };
                          createPayrollMutation.mutate(payload);
                        }}
                        disabled={createPayrollMutation.isPending}
                      >
                        {createPayrollMutation.isPending ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Net Salary</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payrollLoading ? (
                <TableRow><TableCell colSpan={4}>Loading...</TableCell></TableRow>
              ) : payrollError ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8"><div className="flex items-start gap-2 justify-center rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200 inline-flex"><AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /><span>Payroll data unavailable — check database permissions</span></div></TableCell></TableRow>
              ) : (payroll || []).length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No payroll records yet</TableCell></TableRow>
              ) : (payroll as any[]).map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.employee_name || row.employee_id}</TableCell>
                  <TableCell>PKR {Number(row.net_salary || 0).toFixed(2)}</TableCell>
                  <TableCell>{row.pay_period_start} → {row.pay_period_end}</TableCell>
                  <TableCell>
                    <Badge variant={row.status === 'paid' ? 'default' : row.status === 'pending' ? 'secondary' : 'destructive'}>
                      {row.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-orange-500" />
            AI Payment Predictions
          </CardTitle>
          <CardDescription>Predictive analytics for fee collection</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4 bg-orange-50 dark:bg-orange-950">
              <div className="flex items-start gap-3">
                <Bot className="w-5 h-5 text-orange-500 mt-1" />
                <div>
                  <h4>Late Payment Risk</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    AI predicts 15 students may delay payment this month based on historical patterns.
                  </p>
                  <Button size="sm" variant="outline" className="mt-3">View List</Button>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-blue-500 mt-1" />
                <div>
                  <h4>Revenue Forecast</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Expected collection for next month: PKR 42K (92% of total fees)
                  </p>
                  <Progress value={92} className="mt-3" />
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950">
              <div className="flex items-start gap-3">
                <Bot className="w-5 h-5 text-green-500 mt-1" />
                <div>
                  <h4>Optimal Reminder Timing</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    AI suggests sending payment reminders 3 days before due date for highest response rate.
                  </p>
                  <Button size="sm" className="mt-3">Schedule Reminders</Button>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-purple-50 dark:bg-purple-950">
              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-purple-500 mt-1" />
                <div>
                  <h4>Payment Plan Recommendations</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    5 families may benefit from flexible payment plans based on payment history.
                  </p>
                  <Button size="sm" variant="outline" className="mt-3">Review</Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
