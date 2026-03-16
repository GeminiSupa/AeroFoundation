import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Badge } from '../../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '../../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import { DollarSign, CreditCard, Download, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../../../context/AppContext';

export function ParentFeePaymentPage() {
  const { user } = useApp();
  const [isPayingFee, setIsPayingFee] = useState(false);
  const [selectedFee, setSelectedFee] = useState<any>(null);

  // Parent can ONLY see and pay their own child's fees
  const childFeeData = {
    studentName: 'Emma Johnson',
    class: '10A',
    rollNo: 'S-2024-045',
    pendingFees: [
      {
        id: 1,
        type: 'Tuition Fee',
        term: 'Q2 2025',
        amount: 1500,
        dueDate: 'Oct 30, 2025',
        status: 'pending',
        description: 'Quarter 2 tuition fees'
      },
      {
        id: 2,
        type: 'Lab Fee',
        term: 'Annual',
        amount: 300,
        dueDate: 'Nov 15, 2025',
        status: 'pending',
        description: 'Science lab materials and equipment'
      },
    ],
    paidFees: [
      {
        id: 3,
        type: 'Tuition Fee',
        term: 'Q1 2025',
        amount: 1500,
        paidDate: 'Jul 15, 2025',
        paymentMethod: 'Credit Card',
        receiptNo: 'RCP-2025-001234'
      },
      {
        id: 4,
        type: 'Activity Fee',
        term: 'Annual',
        amount: 200,
        paidDate: 'Jul 15, 2025',
        paymentMethod: 'Credit Card',
        receiptNo: 'RCP-2025-001235'
      },
    ],
    totalPending: 1800,
    totalPaid: 1700,
    upcomingDue: {
      amount: 1500,
      dueDate: 'Oct 30, 2025',
      type: 'Tuition Fee'
    }
  };

  const handlePayFee = () => {
    toast.success('Payment Successful!', {
      description: `Payment of $${selectedFee.amount} processed successfully. Receipt sent to your email.`
    });
    setIsPayingFee(false);
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-role-parent">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-role-parent text-white">
            <DollarSign className="w-5 h-5" />
          </span>
          <span>Fee Payment - {childFeeData.studentName}</span>
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">Manage and pay your child's school fees</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total Pending</p>
            <h2 className="mt-2 text-red-600">${childFeeData.totalPending.toLocaleString()}</h2>
            <p className="text-sm text-muted-foreground mt-2">
              {childFeeData.pendingFees.length} pending payment{childFeeData.pendingFees.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total Paid</p>
            <h2 className="mt-2 text-green-600">${childFeeData.totalPaid.toLocaleString()}</h2>
            <p className="text-sm text-muted-foreground mt-2">This year</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 dark:border-orange-800">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Next Due</p>
            <h2 className="mt-2">${childFeeData.upcomingDue.amount.toLocaleString()}</h2>
            <p className="text-sm text-muted-foreground mt-2">Due: {childFeeData.upcomingDue.dueDate}</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Payment Reminder */}
      <Card className="border-orange-200 dark:border-orange-800">
        <CardHeader className="bg-orange-50 dark:bg-orange-900/10">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-500" />
            AI Payment Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5" />
              <div>
                <p className="font-medium">Upcoming Payment Reminder</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your tuition fee of ${childFeeData.upcomingDue.amount} is due in 12 days ({childFeeData.upcomingDue.dueDate}). 
                  Pay early to avoid late fees.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
              <Sparkles className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium text-blue-600">Payment Plan Suggestion</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Based on your payment history, we recommend setting up auto-pay to avoid missing due dates. 
                  This can save you 5% on late fees.
                </p>
                <Button size="sm" className="mt-2" variant="outline">
                  Set Up Auto-Pay
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Payments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Pending Payments</CardTitle>
              <CardDescription>Fees that need to be paid</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fee Type</TableHead>
                <TableHead>Term/Period</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {childFeeData.pendingFees.map((fee) => {
                const dueDate = new Date(fee.dueDate);
                const today = new Date();
                const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                const isOverdue = daysUntilDue < 0;
                const isDueSoon = daysUntilDue <= 7 && daysUntilDue >= 0;

                return (
                  <TableRow key={fee.id}>
                    <TableCell className="font-medium">{fee.type}</TableCell>
                    <TableCell>{fee.term}</TableCell>
                    <TableCell className="font-medium">${fee.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <div>
                        <p>{fee.dueDate}</p>
                        {isOverdue && (
                          <Badge variant="destructive" className="mt-1">Overdue</Badge>
                        )}
                        {isDueSoon && !isOverdue && (
                          <Badge variant="secondary" className="mt-1">Due Soon</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive">Pending</Badge>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" onClick={() => setSelectedFee(fee)} className="bg-role-parent hover:bg-role-parent/90">
                            Pay Now
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Pay Fee</DialogTitle>
                            <DialogDescription>
                              Complete payment for {fee.type}
                            </DialogDescription>
                          </DialogHeader>

                          <div className="space-y-4 py-4">
                            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-muted-foreground">Student:</span>
                                <span className="font-medium">{childFeeData.studentName}</span>
                              </div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-muted-foreground">Fee Type:</span>
                                <span className="font-medium">{fee.type}</span>
                              </div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-muted-foreground">Term:</span>
                                <span className="font-medium">{fee.term}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Amount:</span>
                                <span className="font-medium text-lg">${fee.amount.toLocaleString()}</span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="paymentMethod">Payment Method</Label>
                              <Select defaultValue="card">
                                <SelectTrigger id="paymentMethod">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="card">Credit/Debit Card</SelectItem>
                                  <SelectItem value="bank">Bank Transfer</SelectItem>
                                  <SelectItem value="upi">UPI</SelectItem>
                                  <SelectItem value="wallet">Digital Wallet</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="cardNumber">Card Number</Label>
                              <Input 
                                id="cardNumber" 
                                placeholder="1234 5678 9012 3456"
                                type="text"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="expiry">Expiry Date</Label>
                                <Input id="expiry" placeholder="MM/YY" />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="cvv">CVV</Label>
                                <Input id="cvv" placeholder="123" type="password" maxLength={3} />
                              </div>
                            </div>

                            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
                              <div className="flex items-center gap-2 text-sm text-blue-600">
                                <CreditCard className="w-4 h-4" />
                                <span>Secure payment powered by Stripe</span>
                              </div>
                            </div>
                          </div>

                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsPayingFee(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handlePayFee} className="bg-role-parent hover:bg-role-parent/90">
                              <CreditCard className="w-4 h-4 mr-2" />
                              Pay ${fee.amount.toLocaleString()}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>Previously paid fees</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download All Receipts
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fee Type</TableHead>
                <TableHead>Term/Period</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Paid On</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Receipt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {childFeeData.paidFees.map((fee) => (
                <TableRow key={fee.id}>
                  <TableCell className="font-medium">{fee.type}</TableCell>
                  <TableCell>{fee.term}</TableCell>
                  <TableCell className="font-medium">${fee.amount.toLocaleString()}</TableCell>
                  <TableCell>{fee.paidDate}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{fee.paymentMethod}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-1" />
                      {fee.receiptNo}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payment Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                1
              </div>
              <p>All fees should be paid before the due date to avoid late fees (10% penalty)</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                2
              </div>
              <p>Payment receipts will be sent to your registered email address</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                3
              </div>
              <p>For payment issues, contact the finance office at finance@school.edu</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                4
              </div>
              <p>Installment plans are available - contact administration for details</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Notice */}
      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-muted-foreground">
          🔒 Privacy Protected: You can only view and pay fees for your own child. Other students' fee information is not accessible.
        </p>
      </div>
    </div>
  );
}
