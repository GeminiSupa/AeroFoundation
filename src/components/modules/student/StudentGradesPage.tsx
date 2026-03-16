import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Progress } from '../../ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import { BookOpen, Download, TrendingUp, Sparkles, FileText } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

export function StudentGradesPage() {
  const { user } = useApp();

  // Student's personal grades - ONLY their own data
  const myGrades = [
    {
      id: 1,
      subject: 'Mathematics',
      assignments: [
        { name: 'Quiz 1', score: 85, maxScore: 100, date: 'Oct 5' },
        { name: 'Homework 2', score: 92, maxScore: 100, date: 'Oct 10' },
        { name: 'Midterm', score: 88, maxScore: 100, date: 'Oct 15' },
      ],
      average: 88,
      grade: 'B+',
      trend: 'up'
    },
    {
      id: 2,
      subject: 'Science',
      assignments: [
        { name: 'Lab Report 1', score: 95, maxScore: 100, date: 'Oct 3' },
        { name: 'Quiz 2', score: 90, maxScore: 100, date: 'Oct 12' },
      ],
      average: 92,
      grade: 'A',
      trend: 'up'
    },
    {
      id: 3,
      subject: 'English',
      assignments: [
        { name: 'Essay 1', score: 78, maxScore: 100, date: 'Oct 8' },
        { name: 'Reading Quiz', score: 82, maxScore: 100, date: 'Oct 14' },
      ],
      average: 80,
      grade: 'B',
      trend: 'up'
    },
  ];

  const overallAverage = Math.round(
    myGrades.reduce((sum, subject) => sum + subject.average, 0) / myGrades.length
  );

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-role-student">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-role-student text-white">
            <BookOpen className="w-5 h-5" />
          </span>
          <span>My Grades</span>
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">View your academic performance</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Overall Average</p>
            <h2 className="mt-2">{overallAverage}%</h2>
            <div className="flex items-center gap-1 text-green-600 text-sm mt-2">
              <TrendingUp className="w-4 h-4" />
              <span>+3% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total Subjects</p>
            <h2 className="mt-2">{myGrades.length}</h2>
            <Badge className="mt-2">All Active</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Assignments Completed</p>
            <h2 className="mt-2">
              {myGrades.reduce((sum, subject) => sum + subject.assignments.length, 0)}
            </h2>
            <p className="text-sm text-muted-foreground mt-2">This semester</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Class Rank</p>
            <h2 className="mt-2">8th</h2>
            <p className="text-sm text-muted-foreground mt-2">Out of 32 students</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card className="border-orange-200 dark:border-orange-800">
        <CardHeader className="bg-orange-50 dark:bg-orange-900/10">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-500" />
            AI Study Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            <div className="p-4 border rounded-lg bg-white dark:bg-gray-900">
              <div className="flex items-start gap-3">
                <div className="bg-orange-100 dark:bg-orange-900/20 p-2 rounded">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Focus on English Writing</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your essay scores are below your average. AI recommends 30 minutes of daily writing practice.
                  </p>
                  <Button size="sm" className="mt-2" variant="outline">
                    View Study Resources
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg bg-white dark:bg-gray-900">
              <div className="flex items-start gap-3">
                <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Excellent Progress in Science</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    You're excelling in Science! Consider exploring advanced topics or science competitions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subject-wise Grades */}
      {myGrades.map((subject) => (
        <Card key={subject.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{subject.subject}</CardTitle>
                <CardDescription>Current Grade: {subject.grade}</CardDescription>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Average:</span>
                  <Badge variant={subject.average >= 90 ? 'default' : 'secondary'}>
                    {subject.average}%
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Progress to A grade</span>
                  <span className="text-sm">{subject.average}%</span>
                </div>
                <Progress value={subject.average} className="h-2" />
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Assignment</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subject.assignments.map((assignment, index) => (
                    <TableRow key={index}>
                      <TableCell>{assignment.name}</TableCell>
                      <TableCell>{assignment.date}</TableCell>
                      <TableCell>
                        {assignment.score}/{assignment.maxScore}
                      </TableCell>
                      <TableCell>
                        <Badge variant={assignment.score >= 90 ? 'default' : 'secondary'}>
                          {Math.round((assignment.score / assignment.maxScore) * 100)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Download Report */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4>Download Grade Report</h4>
              <p className="text-sm text-muted-foreground">
                Get a detailed PDF report of your academic performance
              </p>
            </div>
            <Button className="w-full sm:w-auto bg-role-student hover:bg-role-student/90">
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Notice */}
      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-muted-foreground">
          🔒 Privacy Protected: You can only view your own grades. This data is private and not shared with other students.
        </p>
      </div>
    </div>
  );
}
