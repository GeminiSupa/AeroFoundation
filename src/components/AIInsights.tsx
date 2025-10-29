import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Brain,
  Target,
  Lightbulb,
  ArrowRight,
  Activity
} from 'lucide-react';

interface AIInsight {
  id: string;
  type: 'success' | 'warning' | 'info' | 'prediction';
  title: string;
  description: string;
  confidence?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  trend?: 'up' | 'down' | 'stable';
}

interface AIInsightsProps {
  role: 'admin' | 'teacher' | 'student' | 'parent';
}

export function AIInsights({ role }: AIInsightsProps) {
  const getInsightsByRole = (): AIInsight[] => {
    switch (role) {
      case 'teacher':
        return [
          {
            id: '1',
            type: 'warning',
            title: 'Lesson Plan Suggestion',
            description: 'Based on recent quiz results, 60% of students struggled with quadratic equations. AI recommends additional practice session.',
            confidence: 87,
            action: {
              label: 'Generate AI Lesson Plan',
              onClick: () => console.log('Generate lesson plan')
            },
            trend: 'down'
          },
          {
            id: '2',
            type: 'success',
            title: 'Grading Complete',
            description: 'AI auto-graded 24 essays with 91% confidence. 3 require manual review.',
            confidence: 91,
            action: {
              label: 'Review Grades',
              onClick: () => console.log('Review grades')
            }
          },
          {
            id: '3',
            type: 'info',
            title: 'Student Performance Alert',
            description: 'Sarah Johnson shows declining engagement in last 3 classes. Consider one-on-one check-in.',
            confidence: 78,
            trend: 'down'
          },
          {
            id: '4',
            type: 'prediction',
            title: 'Class Performance Prediction',
            description: 'With current pace, 85% of students will master chapter objectives by deadline. Top performers ready for advanced material.',
            confidence: 82,
            trend: 'up'
          }
        ];

      case 'student':
        return [
          {
            id: '1',
            type: 'info',
            title: 'Study Recommendation',
            description: 'Based on your recent test scores, focus on Chapters 4-6 this week. AI suggests 2 hours of practice.',
            confidence: 89,
            action: {
              label: 'View Study Plan',
              onClick: () => console.log('View study plan')
            }
          },
          {
            id: '2',
            type: 'success',
            title: 'Performance Prediction',
            description: 'Your grades are trending upward! Keep current study habits to reach 90+ average by semester end.',
            confidence: 85,
            trend: 'up'
          },
          {
            id: '3',
            type: 'warning',
            title: 'Assignment Alert',
            description: 'You have 3 assignments due in next 48 hours. AI recommends prioritizing Math homework (estimated 90 min).',
            confidence: 92,
            action: {
              label: 'View To-Do List',
              onClick: () => console.log('View todo')
            }
          },
          {
            id: '4',
            type: 'prediction',
            title: 'Strength Analysis',
            description: 'Your strongest subjects are Science (92%) and English (88%). Consider advanced placement courses next semester.',
            confidence: 94,
            trend: 'up'
          }
        ];

      case 'parent':
        return [
          {
            id: '1',
            type: 'success',
            title: 'Child Progress Update',
            description: 'Emma\'s overall performance improved by 12% this month. Mathematics and Science showing strongest gains.',
            confidence: 88,
            trend: 'up'
          },
          {
            id: '2',
            type: 'warning',
            title: 'Attention Needed',
            description: 'Attendance dropped to 85% this week. AI detects possible health or engagement issues. Consider contacting teacher.',
            confidence: 76,
            action: {
              label: 'Schedule Meeting',
              onClick: () => console.log('Schedule meeting')
            },
            trend: 'down'
          },
          {
            id: '3',
            type: 'info',
            title: 'Learning Pattern Insight',
            description: 'Emma performs best in morning classes. Her engagement is 30% higher in first three periods.',
            confidence: 91
          },
          {
            id: '4',
            type: 'prediction',
            title: 'Semester Forecast',
            description: 'Based on current trajectory, Emma is on track to achieve Honor Roll status. Keep supporting current study routine.',
            confidence: 83,
            trend: 'up'
          }
        ];

      case 'admin':
        return [
          {
            id: '1',
            type: 'prediction',
            title: 'Enrollment Forecast',
            description: 'AI predicts 15% increase in enrollments for next semester. Consider hiring 2 additional teachers for Science and Math.',
            confidence: 79,
            action: {
              label: 'View Hiring Plan',
              onClick: () => console.log('View hiring')
            },
            trend: 'up'
          },
          {
            id: '2',
            type: 'warning',
            title: 'Teacher Performance Alert',
            description: '3 teachers showing signs of burnout (high workload, low engagement). AI recommends workload redistribution.',
            confidence: 84,
            action: {
              label: 'Review Staff Workload',
              onClick: () => console.log('Review workload')
            },
            trend: 'down'
          },
          {
            id: '3',
            type: 'success',
            title: 'Financial Health',
            description: 'Revenue collection up 8% this quarter. Fee payment compliance improved with automated reminders.',
            confidence: 95,
            trend: 'up'
          },
          {
            id: '4',
            type: 'info',
            title: 'Facility Optimization',
            description: 'Room 304 underutilized (40% capacity). AI suggests relocating Grade 9A class to optimize space usage.',
            confidence: 87,
            action: {
              label: 'View Recommendations',
              onClick: () => console.log('View recommendations')
            }
          }
        ];

      default:
        return [];
    }
  };

  const insights = getInsightsByRole();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Lightbulb className="w-5 h-5 text-blue-500" />;
      case 'prediction':
        return <Target className="w-5 h-5 text-purple-500" />;
      default:
        return <Brain className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-500/10 border-green-500/20';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/20';
      case 'info':
        return 'bg-blue-500/10 border-blue-500/20';
      case 'prediction':
        return 'bg-purple-500/10 border-purple-500/20';
      default:
        return 'bg-gray-500/10 border-gray-500/20';
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getRoleTitle = () => {
    switch (role) {
      case 'teacher':
        return 'AI Teaching Assistant';
      case 'student':
        return 'AI Learning Assistant';
      case 'parent':
        return 'AI Parent Advisor';
      case 'admin':
        return 'AI School Analytics';
      default:
        return 'AI Co-Pilot';
    }
  };

  return (
    <Card className="border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-transparent">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-500 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                {getRoleTitle()}
                <Badge className="bg-orange-500 hover:bg-orange-600">AI</Badge>
              </CardTitle>
              <CardDescription>
                Intelligent insights powered by machine learning
              </CardDescription>
            </div>
          </div>
          <Activity className="w-5 h-5 text-orange-500 animate-pulse" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`p-4 rounded-lg border ${getTypeColor(insight.type)} transition-all hover:shadow-md`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{getTypeIcon(insight.type)}</div>
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium">{insight.title}</h4>
                      {insight.trend && (
                        <span className="flex items-center gap-1">
                          {getTrendIcon(insight.trend)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {insight.description}
                    </p>
                  </div>
                  {insight.confidence && (
                    <Badge variant="outline" className="text-xs">
                      {insight.confidence}% confidence
                    </Badge>
                  )}
                </div>
                {insight.action && (
                  <Button
                    size="sm"
                    onClick={insight.action.onClick}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    {insight.action.label}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
