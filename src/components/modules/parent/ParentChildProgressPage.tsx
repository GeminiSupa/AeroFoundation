import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import { BookOpen, TrendingUp, TrendingDown, Sparkles, Award, ClipboardCheck } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

export function ParentChildProgressPage() {
  const { user } = useApp();

  // Parent can ONLY see their own child's data
  const childData = {
    name: 'Emma Johnson',
    class: '10A',
    rollNo: 'S-2024-045',
    photo: null,
    attendance: {
      overall: 92,
      thisMonth: 95,
      lastMonth: 89
    },
    grades: {
      overall: 87,
      subjects: [
        { name: 'Mathematics', grade: 88, trend: 'up', teacher: 'Mr. Smith' },
        { name: 'Science', grade: 91, trend: 'up', teacher: 'Dr. Brown' },
        { name: 'English', grade: 85, trend: 'down', teacher: 'Ms. Davis' },
        { name: 'History', grade: 84, trend: 'up', teacher: 'Mr. Wilson' },
      ]
    },
    recentAssignments: [
      { subject: 'Mathematics', title: 'Algebra Quiz', dueDate: 'Oct 22', status: 'submitted', grade: 92 },
      { subject: 'Science', title: 'Lab Report', dueDate: 'Oct 20', status: 'graded', grade: 88 },
      { subject: 'English', title: 'Essay', dueDate: 'Oct 25', status: 'pending', grade: null },
    ],
    achievements: [
      { title: 'Perfect Attendance', date: 'September 2025', icon: Award },
      { title: 'Science Excellence Award', date: 'August 2025', icon: BookOpen },
    ],
    behaviorNotes: [
      { date: 'Oct 15', type: 'positive', note: 'Excellent participation in class discussion', teacher: 'Mr. Smith' },
      { date: 'Oct 10', type: 'positive', note: 'Helped classmates with difficult concepts', teacher: 'Dr. Brown' },
    ]
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2">
          <BookOpen className="w-6 h-6" />
          {childData.name}'s Progress
        </h2>
        <p className="text-muted-foreground">Monitor your child's academic performance and attendance</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Overall Grade</p>
            <h2 className="mt-2">{childData.grades.overall}%</h2>
            <Badge className="mt-2">B+</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Attendance</p>
            <h2 className="mt-2 text-green-600">{childData.attendance.overall}%</h2>
            <div className="flex items-center gap-1 text-green-600 text-sm mt-2">
              <TrendingUp className="w-4 h-4" />
              <span>Excellent</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Class</p>
            <h2 className="mt-2">{childData.class}</h2>
            <p className="text-sm text-muted-foreground mt-2">Roll: {childData.rollNo}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Class Rank</p>
            <h2 className="mt-2">5th</h2>
            <p className="text-sm text-muted-foreground mt-2">Out of 32</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights for Parents */}
      <Card className="border-orange-200 dark:border-orange-800">
        <CardHeader className="bg-orange-50 dark:bg-orange-900/10">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-500" />
            AI-Generated Progress Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Weekly Summary</h4>
              <p className="text-sm text-muted-foreground">
                Emma showed excellent progress this week with a <strong>95% attendance rate</strong> and 
                strong performance in Science. Her Mathematics scores improved by <strong>5%</strong> compared 
                to last month. However, English writing needs attention - consider encouraging 
                daily reading for 20 minutes.
              </p>
            </div>

            <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-900/10">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-600">Strengths Identified</h4>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                    <li>• Excellent problem-solving skills in Mathematics</li>
                    <li>• Strong understanding of scientific concepts</li>
                    <li>• Consistent class participation</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg bg-orange-50 dark:bg-orange-900/10">
              <div className="flex items-start gap-3">
                <ClipboardCheck className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-orange-600">Areas for Improvement</h4>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                    <li>• English essay writing - practice needed</li>
                    <li>• Time management for assignments</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Tabs */}
      <Tabs defaultValue="grades">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="grades">Grades</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="behavior">Behavior</TabsTrigger>
        </TabsList>

        <TabsContent value="grades">
          <Card>
            <CardHeader>
              <CardTitle>Subject-wise Performance</CardTitle>
              <CardDescription>Detailed grades for each subject</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {childData.grades.subjects.map((subject, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4>{subject.name}</h4>
                        <p className="text-sm text-muted-foreground">Teacher: {subject.teacher}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={subject.grade >= 90 ? 'default' : 'secondary'}>
                          {subject.grade}%
                        </Badge>
                        {subject.trend === 'up' ? (
                          <TrendingUp className="w-5 h-5 text-green-500" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    </div>
                    <Progress value={subject.grade} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Record</CardTitle>
              <CardDescription>Monthly attendance breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">This Month</p>
                      <h3 className="mt-1">{childData.attendance.thisMonth}%</h3>
                      <div className="flex items-center gap-1 text-green-600 text-sm mt-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>+6% from last month</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">Last Month</p>
                      <h3 className="mt-1">{childData.attendance.lastMonth}%</h3>
                    </CardContent>
                  </Card>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead>Present</TableHead>
                      <TableHead>Absent</TableHead>
                      <TableHead>Percentage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>October</TableCell>
                      <TableCell><Badge variant="default">17</Badge></TableCell>
                      <TableCell><Badge variant="destructive">1</Badge></TableCell>
                      <TableCell><Badge>95%</Badge></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>September</TableCell>
                      <TableCell><Badge variant="default">19</Badge></TableCell>
                      <TableCell><Badge variant="destructive">2</Badge></TableCell>
                      <TableCell><Badge>90%</Badge></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments">
          <Card>
            <CardHeader>
              <CardTitle>Recent Assignments</CardTitle>
              <CardDescription>Latest homework and test submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {childData.recentAssignments.map((assignment, index) => (
                    <TableRow key={index}>
                      <TableCell>{assignment.subject}</TableCell>
                      <TableCell>{assignment.title}</TableCell>
                      <TableCell>{assignment.dueDate}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            assignment.status === 'graded' ? 'default' :
                            assignment.status === 'submitted' ? 'secondary' :
                            'destructive'
                          }
                        >
                          {assignment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {assignment.grade ? (
                          <Badge>{assignment.grade}%</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="behavior">
          <Card>
            <CardHeader>
              <CardTitle>Behavior & Achievements</CardTitle>
              <CardDescription>Teacher feedback and awards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="mb-3">Recent Achievements</h4>
                  <div className="space-y-3">
                    {childData.achievements.map((achievement, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 border rounded-lg bg-green-50 dark:bg-green-900/10">
                        <div className="bg-green-500 text-white p-2 rounded">
                          <Award className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium">{achievement.title}</p>
                          <p className="text-sm text-muted-foreground">{achievement.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="mb-3">Teacher Notes</h4>
                  <div className="space-y-3">
                    {childData.behaviorNotes.map((note, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="default">Positive</Badge>
                          <span className="text-sm text-muted-foreground">{note.date}</span>
                        </div>
                        <p className="text-sm">{note.note}</p>
                        <p className="text-sm text-muted-foreground mt-1">- {note.teacher}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Privacy Notice */}
      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-muted-foreground">
          🔒 Privacy Protected: You can only view your own child's data. Other students' information is not accessible.
        </p>
      </div>
    </div>
  );
}
