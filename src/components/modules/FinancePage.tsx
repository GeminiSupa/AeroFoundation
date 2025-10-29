import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { DollarSign, TrendingUp, Bot, Send } from 'lucide-react';
import { Progress } from '../ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

export function FinancePage() {
  const feeStatus = [
    { id: 1, student: 'John Doe', class: '10A', amount: '$500', dueDate: 'Oct 25, 2025', status: 'paid' },
    { id: 2, student: 'Sarah Smith', class: '8B', amount: '$500', dueDate: 'Oct 25, 2025', status: 'pending' },
    { id: 3, student: 'Michael Brown', class: '9A', amount: '$500', dueDate: 'Oct 25, 2025', status: 'overdue' },
    { id: 4, student: 'Emily Davis', class: '10B', amount: '$500', dueDate: 'Oct 25, 2025', status: 'paid' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2">
            <DollarSign className="w-8 h-8" />
            Finance Management
          </h1>
          <p className="text-muted-foreground">Track tuition fees and payments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Send className="w-4 h-4 mr-2" />
            Send Reminders
          </Button>
          <Button>Generate Invoice</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <h2 className="mt-2">$248K</h2>
                <Badge className="mt-2">This Year</Badge>
              </div>
              <div className="bg-green-500 p-3 rounded-lg text-white">
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
                <h2 className="mt-2 text-orange-500">$32K</h2>
                <Badge className="mt-2" variant="destructive">Outstanding</Badge>
              </div>
              <div className="bg-orange-500 p-3 rounded-lg text-white">
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
                <h2 className="mt-2">88.6%</h2>
                <Progress value={88.6} className="mt-2" />
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
                <p className="text-sm text-muted-foreground">Overdue</p>
                <h2 className="mt-2 text-red-600">$8K</h2>
                <Badge className="mt-2" variant="destructive">12 Students</Badge>
              </div>
              <div className="bg-red-500 p-3 rounded-lg text-white">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fee Status by Student</CardTitle>
          <CardDescription>Track payment status across all students</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feeStatus.map((fee) => (
                <TableRow key={fee.id}>
                  <TableCell>{fee.student}</TableCell>
                  <TableCell>{fee.class}</TableCell>
                  <TableCell>{fee.amount}</TableCell>
                  <TableCell>{fee.dueDate}</TableCell>
                  <TableCell>
                    <Badge variant={
                      fee.status === 'paid' ? 'default' :
                      fee.status === 'pending' ? 'secondary' : 'destructive'
                    }>
                      {fee.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {fee.status !== 'paid' && (
                        <>
                          <Button size="sm" variant="outline">Send Reminder</Button>
                          <Button size="sm">Record Payment</Button>
                        </>
                      )}
                      {fee.status === 'paid' && (
                        <Button size="sm" variant="outline">View Receipt</Button>
                      )}
                    </div>
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
                    Expected collection for next month: $42K (92% of total fees)
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
