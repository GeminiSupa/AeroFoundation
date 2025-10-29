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

const attendanceData = [
  { month: 'Jan', attendance: 92 },
  { month: 'Feb', attendance: 88 },
  { month: 'Mar', attendance: 94 },
  { month: 'Apr', attendance: 91 },
  { month: 'May', attendance: 89 },
  { month: 'Jun', attendance: 95 },
];

const gradeData = [
  { subject: 'Math', average: 85 },
  { subject: 'Physics', average: 78 },
  { subject: 'Chemistry', average: 82 },
  { subject: 'English', average: 88 },
  { subject: 'History', average: 86 },
];

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
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2">
            <FileText className="w-8 h-8" />
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground">Generate and export comprehensive reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button>Generate Report</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Reports</p>
                <h2 className="mt-2">156</h2>
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
                <h2 className="mt-2">42</h2>
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
                <h2 className="mt-2">12.5K</h2>
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
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[80, 100]} />
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Grades by Subject</CardTitle>
            <CardDescription>Performance comparison across subjects</CardDescription>
          </CardHeader>
          <CardContent>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4 bg-orange-50 dark:bg-orange-950">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-orange-500 mt-1" />
                <div>
                  <h4>Attendance Observation</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Grade 10 attendance shows a 12% improvement this semester. Main factors: Better schedule 
                    optimization and reduced conflicts.
                  </p>
                  <Badge className="mt-2" variant="secondary">Positive Trend</Badge>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950">
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-blue-500 mt-1" />
                <div>
                  <h4>Grade Performance</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Science grades declining by 8% in Grade 9. AI recommends additional lab sessions and 
                    peer tutoring programs.
                  </p>
                  <Badge className="mt-2" variant="destructive">Needs Attention</Badge>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950">
              <div className="flex items-start gap-3">
                <Bot className="w-5 h-5 text-green-500 mt-1" />
                <div>
                  <h4>Resource Utilization</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Library usage increased by 25% after AI recommendations. Most popular: STEM resources 
                    and digital learning materials.
                  </p>
                  <Badge className="mt-2">Success</Badge>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-purple-50 dark:bg-purple-950">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-purple-500 mt-1" />
                <div>
                  <h4>Teacher Workload</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    AI detected workload imbalance. Recommendation: Redistribute 3 classes to balance 
                    teaching hours across staff.
                  </p>
                  <Badge className="mt-2" variant="secondary">Optimization Available</Badge>
                </div>
              </div>
            </div>
          </div>
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
