import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Bot, TrendingUp, Calendar, AlertTriangle, Brain, Sparkles } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';

export function AIToolsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="flex items-center gap-2">
          <Bot className="w-8 h-8 text-orange-500" />
          AI Tools & Insights
        </h1>
        <p className="text-muted-foreground">Leverage artificial intelligence to optimize school operations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">AI Prediction Accuracy</p>
                <h2 className="mt-2">94.2%</h2>
                <Progress value={94} className="mt-2" />
              </div>
              <div className="bg-orange-500 p-3 rounded-lg text-white">
                <Brain className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active AI Insights</p>
                <h2 className="mt-2">23</h2>
                <Badge className="mt-2">+5 today</Badge>
              </div>
              <div className="bg-blue-500 p-3 rounded-lg text-white">
                <Sparkles className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Optimizations Applied</p>
                <h2 className="mt-2">156</h2>
                <Badge className="mt-2" variant="secondary">This month</Badge>
              </div>
              <div className="bg-green-500 p-3 rounded-lg text-white">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="schedule-optimizer">
        <TabsList>
          <TabsTrigger value="schedule-optimizer">Schedule Optimizer</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="privacy">Privacy Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule-optimizer">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-500" />
                AI Schedule Optimizer
              </CardTitle>
              <CardDescription>Generate optimal schedules using artificial intelligence</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h4>Current Schedule Efficiency</h4>
                  <Progress value={65} className="mt-2" />
                  <p className="text-sm text-muted-foreground mt-2">65% - Room for improvement</p>
                </div>

                <div className="border rounded-lg p-4">
                  <h4>Predicted Efficiency</h4>
                  <Progress value={87} className="mt-2" />
                  <p className="text-sm text-muted-foreground mt-2">87% - After AI optimization</p>
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-orange-50 dark:bg-orange-950">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-500 mt-1" />
                  <div className="flex-1">
                    <h4>Detected Issues</h4>
                    <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                      <li>3 scheduling conflicts detected for next week</li>
                      <li>Physics lab overbooked on Wednesday</li>
                      <li>Teacher workload imbalance in Grade 10</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950">
                <div className="flex items-start gap-3">
                  <Bot className="w-5 h-5 text-blue-500 mt-1" />
                  <div className="flex-1">
                    <h4>AI Recommendations</h4>
                    <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                      <li>Move Math 10A from 9AM to 10AM for better performance</li>
                      <li>Swap Room 201 and 305 to reduce conflicts</li>
                      <li>Distribute teacher load more evenly across the week</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="bg-orange-500 hover:bg-orange-600">
                  <Bot className="w-4 h-4 mr-2" />
                  Generate AI Schedule
                </Button>
                <Button variant="outline">Preview Changes</Button>
                <Button variant="outline">View Details</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Predictions</CardTitle>
                <CardDescription>AI-powered attendance forecasting</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm">Class 10A</h4>
                      <Badge variant="destructive">⚠️ Alert</Badge>
                    </div>
                    <Progress value={78} className="mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Predicted attendance: 78% next week (8% drop expected)
                    </p>
                  </div>

                  <div className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm">Class 9B</h4>
                      <Badge>Normal</Badge>
                    </div>
                    <Progress value={92} className="mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Predicted attendance: 92% next week (stable)
                    </p>
                  </div>

                  <div className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm">Class 8A</h4>
                      <Badge variant="secondary">Good</Badge>
                    </div>
                    <Progress value={95} className="mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Predicted attendance: 95% next week (improving)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>Grade predictions and analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-3 bg-green-50 dark:bg-green-950">
                    <h4 className="text-sm">Mathematics - Grade 10</h4>
                    <p className="text-sm text-muted-foreground mt-2">
                      <Bot className="w-4 h-4 inline mr-1 text-green-500" />
                      Average grade predicted to increase by 4% with current trajectory
                    </p>
                  </div>

                  <div className="border rounded-lg p-3 bg-orange-50 dark:bg-orange-950">
                    <h4 className="text-sm">Science - Grade 9</h4>
                    <p className="text-sm text-muted-foreground mt-2">
                      <Bot className="w-4 h-4 inline mr-1 text-orange-500" />
                      Grade trend declining by 3%. Recommend additional support sessions.
                    </p>
                  </div>

                  <div className="border rounded-lg p-3 bg-blue-50 dark:bg-blue-950">
                    <h4 className="text-sm">English - Grade 8</h4>
                    <p className="text-sm text-muted-foreground mt-2">
                      <Bot className="w-4 h-4 inline mr-1 text-blue-500" />
                      Stable performance. Students responding well to current curriculum.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Bias Detection & Model Quality</CardTitle>
                <CardDescription>Ensuring fair and accurate AI predictions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="text-sm text-muted-foreground">Bias Score</h4>
                    <h2 className="mt-2">Low</h2>
                    <Progress value={15} className="mt-2" />
                    <p className="text-xs text-muted-foreground mt-1">Model shows minimal bias</p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="text-sm text-muted-foreground">Accuracy Score</h4>
                    <h2 className="mt-2">94.2%</h2>
                    <Progress value={94} className="mt-2" />
                    <p className="text-xs text-muted-foreground mt-1">High prediction accuracy</p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="text-sm text-muted-foreground">Data Quality</h4>
                    <h2 className="mt-2">Excellent</h2>
                    <Progress value={96} className="mt-2" />
                    <p className="text-xs text-muted-foreground mt-1">Clean, diverse dataset</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>AI Privacy & Data Controls</CardTitle>
              <CardDescription>Manage how AI uses student and school data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label>Enable AI Features</Label>
                    <p className="text-sm text-muted-foreground">Allow AI to analyze school data for insights</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label>Student Data Anonymization</Label>
                    <p className="text-sm text-muted-foreground">Remove personal identifiers before AI analysis</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label>Share Insights with Teachers</Label>
                    <p className="text-sm text-muted-foreground">Allow teachers to view AI recommendations</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label>Parent Access to AI Insights</Label>
                    <p className="text-sm text-muted-foreground">Let parents see AI-generated reports</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label>External Data Sharing</Label>
                    <p className="text-sm text-muted-foreground">Share anonymized data with educational research</p>
                  </div>
                  <Switch />
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950">
                <h4>Data Retention Policy</h4>
                <p className="text-sm text-muted-foreground mt-2">
                  AI training data is retained for 12 months and then anonymized. Personal identifiers are removed after 6 months. 
                  All data handling complies with GDPR and local educational privacy laws.
                </p>
                <Button variant="outline" size="sm" className="mt-3">
                  View Full Privacy Policy
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
