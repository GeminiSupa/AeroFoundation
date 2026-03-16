import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Bot, TrendingUp, Calendar, AlertTriangle, Brain, Sparkles } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { useQuery } from '@tanstack/react-query';
import { getAIToolsDashboardData } from '../../lib/api/ai';
import { Skeleton } from '../ui/skeleton';

export function AIToolsPage() {
  const { data: aiData, isLoading } = useQuery({
    queryKey: ['aiToolsDashboardData'],
    queryFn: async () => {
      const res = await getAIToolsDashboardData();
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
  });

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-xl sm:text-2xl font-bold">
          <Bot className="w-7 h-7 sm:w-8 sm:h-8 text-orange-500" />
          AI Tools & Insights
        </h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">Leverage artificial intelligence to optimize school operations</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">AI Prediction Accuracy</p>
                {isLoading ? <Skeleton className="h-8 w-16 mt-2" /> : <h2 className="mt-2">{aiData?.predictionAccuracy ?? 0}%</h2>}
                <Progress value={aiData?.predictionAccuracy ?? 0} className="mt-2" />
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
                {isLoading ? <Skeleton className="h-8 w-16 mt-2" /> : <h2 className="mt-2">{aiData?.activeInsights ?? 0}</h2>}
                <Badge className="mt-2">+{(aiData?.activeInsights ?? 0) > 0 ? 1 : 0} today</Badge>
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
                {isLoading ? <Skeleton className="h-8 w-16 mt-2" /> : <h2 className="mt-2">{aiData?.optimizationsApplied ?? 0}</h2>}
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
                  <Progress value={aiData?.scheduleEfficiencyCurrent ?? 0} className="mt-2" />
                  <p className="text-sm text-muted-foreground mt-2">{aiData?.scheduleEfficiencyCurrent ?? 0}% - Room for improvement</p>
                </div>

                <div className="border rounded-lg p-4">
                  <h4>Predicted Efficiency</h4>
                  <Progress value={aiData?.scheduleEfficiencyPredicted ?? 0} className="mt-2" />
                  <p className="text-sm text-muted-foreground mt-2">{aiData?.scheduleEfficiencyPredicted ?? 0}% - After AI optimization</p>
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-orange-50 dark:bg-orange-950">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-500 mt-1" />
                  <div className="flex-1">
                    <h4>Schedule Analysis</h4>
                    {isLoading ? (
                      <p className="text-sm text-muted-foreground mt-2">Analyzing...</p>
                    ) : !aiData?.hasRealData ? (
                      <p className="text-sm text-muted-foreground mt-2">No data yet — add students and teachers to generate AI schedule insights.</p>
                    ) : (
                      <p className="text-sm text-muted-foreground mt-2">
                        AI detected <strong>{Math.max(0, Math.floor((100 - (aiData?.scheduleEfficiencyCurrent ?? 0)) / 10))}</strong> scheduling optimization opportunities based on current data.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950">
                <div className="flex items-start gap-3">
                  <Bot className="w-5 h-5 text-blue-500 mt-1" />
                  <div className="flex-1">
                    <h4>AI Recommendations</h4>
                    {isLoading ? (
                      <p className="text-sm text-muted-foreground mt-2">Loading...</p>
                    ) : !aiData?.hasRealData ? (
                      <p className="text-sm text-muted-foreground mt-2">Add school data to receive AI-powered schedule recommendations.</p>
                    ) : (
                      <p className="text-sm text-muted-foreground mt-2">
                        Predicted efficiency improves from <strong>{aiData?.scheduleEfficiencyCurrent}%</strong> to <strong>{aiData?.scheduleEfficiencyPredicted}%</strong> with AI-optimized scheduling.
                      </p>
                    )}
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
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {aiData?.attendancePredictions?.map((pred, i) => (
                      <div key={i} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm">{pred.name}</h4>
                          <Badge variant={pred.trend === 'drop' ? 'destructive' : pred.trend === 'improving' ? 'secondary' : 'default'}>
                            {pred.trend === 'drop' ? '⚠️ Alert' : pred.trend === 'improving' ? 'Good' : 'Normal'}
                          </Badge>
                        </div>
                        <Progress value={pred.value} className="mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Predicted attendance: {pred.value}% next week ({pred.trend})
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>Grade averages from real student data</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : !aiData?.hasRealData || aiData.performanceTrends.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <Bot className="w-10 h-10 text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">No grade data yet — add grades to see performance trends.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {aiData.performanceTrends.map((pt, i) => (
                      <div key={i} className={`border rounded-lg p-3 ${pt.color}`}>
                        <h4 className="text-sm font-medium">{pt.subject}</h4>
                        <p className="text-sm text-muted-foreground mt-2">
                          <Bot className="w-4 h-4 inline mr-1" style={{ color: pt.trend === 'up' ? '#22c55e' : pt.trend === 'down' ? '#ef4444' : '#3b82f6' }} />
                          Average: <strong>{pt.average}%</strong> —{' '}
                          {pt.trend === 'up' ? 'Performing well' : pt.trend === 'down' ? 'Needs attention' : 'Stable performance'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Bias Detection & Model Quality</CardTitle>
                <CardDescription>AI model quality derived from your actual data richness</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4">
                      <h4 className="text-sm text-muted-foreground">Bias Score</h4>
                      <h2 className="mt-2">{(aiData?.modelQuality?.biasScore ?? 0) < 10 ? 'Low' : (aiData?.modelQuality?.biasScore ?? 0) < 20 ? 'Moderate' : 'High'}</h2>
                      <Progress value={aiData?.modelQuality?.biasScore ?? 0} className="mt-2" />
                      <p className="text-xs text-muted-foreground mt-1">{aiData?.hasRealData ? 'Calculated from school data' : 'Add data to calculate'}</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="text-sm text-muted-foreground">Accuracy Score</h4>
                      <h2 className="mt-2">{aiData?.modelQuality?.accuracyScore ?? 0}%</h2>
                      <Progress value={aiData?.modelQuality?.accuracyScore ?? 0} className="mt-2" />
                      <p className="text-xs text-muted-foreground mt-1">{aiData?.hasRealData ? 'Scales as you add more data' : 'No data yet'}</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="text-sm text-muted-foreground">Data Quality</h4>
                      <h2 className="mt-2">{aiData?.modelQuality?.dataQualityLabel ?? '—'}</h2>
                      <Progress value={aiData?.modelQuality?.dataQuality ?? 0} className="mt-2" />
                      <p className="text-xs text-muted-foreground mt-1">{aiData?.hasRealData ? 'Based on data completeness' : 'Add students & grades to begin'}</p>
                    </div>
                  </div>
                )}
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
