import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { FileText, Download, Bot, TrendingUp, Users } from 'lucide-react';
import { Badge } from '../ui/badge';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '../ui/chart';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { getReportsData } from '../../lib/api/reports';
import { Skeleton } from '../ui/skeleton';


const chartConfig = {
  attendance: {
    label: "Attendance %",
    color: "#0D6EFD",
  },
  average: {
    label: "Average Grade",
    color: "#28A745",
  },
} satisfies ChartConfig;

export function ReportsPage() {
  const { data: reportsData, isLoading } = useQuery({
    queryKey: ['reportsData'],
    queryFn: async () => {
      const res = await getReportsData();
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
  });

  const attendanceData = reportsData?.attendanceData || [];
  const gradeData = reportsData?.gradeData || [];

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-module-reports">
            <FileText className="w-7 h-7 sm:w-8 sm:h-8" />
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Generate and export comprehensive reports</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" className="w-full sm:w-auto">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button className="w-full sm:w-auto bg-module-reports hover:bg-module-reports/90">Generate Report</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Reports</p>
                {isLoading ? <Skeleton className="h-8 w-16 mt-2" /> : <h2 className="mt-2 text-2xl font-bold">{reportsData?.totalReports || 0}</h2>}
                <Badge className="mt-2" variant="secondary">Generated</Badge>
              </div>
              <div className="bg-blue-500 p-3 rounded-lg text-white">
                <FileText className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">AI Insights</p>
                {isLoading ? <Skeleton className="h-8 w-16 mt-2" /> : <h2 className="mt-2 text-2xl font-bold">{reportsData?.aiInsights || 0}</h2>}
                <Badge className="mt-2">Active</Badge>
              </div>
              <div className="bg-orange-500 p-3 rounded-lg text-white">
                <Bot className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Data Points</p>
                {isLoading ? <Skeleton className="h-8 w-16 mt-2" /> : <h2 className="mt-2 text-2xl font-bold">{reportsData?.dataPoints || 0}</h2>}
                <Badge className="mt-2" variant="secondary">Analyzed</Badge>
              </div>
              <div className="bg-green-500 p-3 rounded-lg text-white">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Attendance Trends</CardTitle>
            <CardDescription>Monthly attendance percentage over time</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : attendanceData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 100]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="attendance"
                      stroke="var(--color-attendance)"
                      strokeWidth={2}
                      dot={{ fill: "var(--color-attendance)" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">No attendance data available</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Grades by Subject</CardTitle>
            <CardDescription>Performance comparison across subjects</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : gradeData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gradeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="subject" />
                    <YAxis domain={[0, 100]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="average" fill="var(--color-average)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">No grades data available</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-orange-500" />
            AI-Generated Insights
          </CardTitle>
          <CardDescription>Data-driven observations and recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            AI-generated insights have been removed.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Report Builder</CardTitle>
          <CardDescription>Create custom reports with drag-and-drop metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h4 className="mb-2">Build Your Custom Report</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Drag metrics from the sidebar to create your personalized analytics dashboard
            </p>
            <div className="flex gap-2 justify-center flex-wrap">
              <Badge variant="outline">Attendance</Badge>
              <Badge variant="outline">Grades</Badge>
              <Badge variant="outline">Finance</Badge>
              <Badge variant="outline">Performance</Badge>
              <Badge variant="outline">Demographics</Badge>
            </div>
            <Button className="mt-4">Start Building</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
