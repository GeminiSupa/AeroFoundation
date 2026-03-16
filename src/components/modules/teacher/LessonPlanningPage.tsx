import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Badge } from '../../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Calendar, Plus, BookOpen, Target, Clock, Link2, Sparkles, FileText, Download, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '../../ui/alert';
import { toast } from 'sonner';
import { Checkbox } from '../../ui/checkbox';

interface LessonPlan {
  id: string;
  title: string;
  subject: string;
  grade: string;
  date: string;
  duration: string;
  objectives: string[];
  standards: string[];
  activities: string[];
  materials: string[];
  assessment: string;
  status: 'draft' | 'published' | 'completed';
  linkedAssignments: string[];
}

export function LessonPlanningPage() {
  const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);
  const [selectedView, setSelectedView] = useState<'week' | 'unit'>('week');
  const [isAIAssistOpen, setIsAIAssistOpen] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiGeneratedContent, setAIGeneratedContent] = useState<any>(null);
  const [selectedAssignments, setSelectedAssignments] = useState<string[]>([]);

  // Mock data
  const lessonPlans: LessonPlan[] = [
    {
      id: '1',
      title: 'Introduction to Quadratic Equations',
      subject: 'Mathematics',
      grade: 'Grade 10',
      date: '2025-10-20',
      duration: '50 minutes',
      objectives: [
        'Students will understand the standard form of quadratic equations',
        'Students will identify coefficients a, b, and c',
        'Students will graph simple quadratic functions'
      ],
      standards: ['CCSS.MATH.HSA.REI.B.4', 'CCSS.MATH.HSF.IF.C.7'],
      activities: [
        'Warm-up: Review of linear equations (10 min)',
        'Direct instruction: Quadratic equation introduction (15 min)',
        'Guided practice: Graph parabolas (15 min)',
        'Independent practice: Problem set (10 min)'
      ],
      materials: ['Graphing calculators', 'Worksheet packet', 'Desmos online tool'],
      assessment: 'Exit ticket: 3 problems on identifying quadratic components',
      status: 'published',
      linkedAssignments: ['Homework: Quadratic Basics', 'Quiz: Week 5']
    },
    {
      id: '2',
      title: 'Solving Quadratic Equations',
      subject: 'Mathematics',
      grade: 'Grade 10',
      date: '2025-10-22',
      duration: '50 minutes',
      objectives: [
        'Students will solve quadratic equations by factoring',
        'Students will apply the zero product property'
      ],
      standards: ['CCSS.MATH.HSA.REI.B.4'],
      activities: [
        'Review: Quadratic form (5 min)',
        'Teaching: Factoring method (20 min)',
        'Practice: Solve equations (20 min)',
        'Wrap-up: Q&A (5 min)'
      ],
      materials: ['Algebra tiles', 'Practice worksheet'],
      assessment: 'Formative: Whiteboard problems',
      status: 'draft',
      linkedAssignments: []
    },
    {
      id: '3',
      title: 'Real-World Applications of Quadratics',
      subject: 'Mathematics',
      grade: 'Grade 10',
      date: '2025-10-24',
      duration: '50 minutes',
      objectives: [
        'Students will model real-world scenarios using quadratic functions',
        'Students will interpret vertex and intercepts in context'
      ],
      standards: ['CCSS.MATH.HSA.CED.A.2', 'CCSS.MATH.HSF.IF.C.7'],
      activities: [
        'Hook: Projectile motion video (5 min)',
        'Group work: Design a problem (25 min)',
        'Presentations (15 min)',
        'Reflection (5 min)'
      ],
      materials: ['Video equipment', 'Poster paper', 'Markers'],
      assessment: 'Project: Create and solve a real-world quadratic problem',
      status: 'published',
      linkedAssignments: ['Project: Quadratic Applications']
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500/10 text-green-500';
      case 'draft': return 'bg-yellow-500/10 text-yellow-500';
      case 'completed': return 'bg-blue-500/10 text-blue-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  const handleGenerateAIPlan = () => {
    setIsGeneratingAI(true);
    // Simulate AI generation
    setTimeout(() => {
      setAIGeneratedContent({
        objectives: [
          'Understand the fundamental concepts of the topic',
          'Apply knowledge through practical examples',
          'Demonstrate mastery through assessments'
        ],
        activities: [
          'Introduction and warm-up (10 min)',
          'Direct instruction with examples (20 min)',
          'Guided practice activities (15 min)',
          'Independent work and assessment (5 min)'
        ],
        materials: ['Whiteboard and markers', 'Digital presentation', 'Student worksheets', 'Practice problems'],
        assessment: 'Exit ticket with 3-5 questions covering key concepts'
      });
      setIsGeneratingAI(false);
      toast.success('AI Lesson Plan Generated!', {
        description: 'Review the generated content and make adjustments as needed.'
      });
    }, 2000);
  };

  const handleSaveLessonDraft = () => {
    toast.info('Lesson Saved as Draft', {
      description: 'You can continue editing this lesson later.'
    });
    setIsAddLessonOpen(false);
  };

  const handlePublishLesson = () => {
    toast.success('Lesson Published Successfully! ✅', {
      description: 'Students can now access this lesson plan.'
    });
    setIsAddLessonOpen(false);
  };

  const handleUseAIContent = () => {
    toast.success('AI Content Applied', {
      description: 'The generated content has been added to your lesson plan.'
    });
    setIsAIAssistOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-role-teacher">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-role-teacher text-white">
              <BookOpen className="w-5 h-5" />
            </span>
            <span>Lesson Planning</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Create, organize, and manage your lesson plans</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAIAssistOpen} onOpenChange={setIsAIAssistOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-role-teacher text-role-teacher hover:bg-role-teacher/10">
                <Sparkles className="mr-2 h-4 w-4" />
                AI Lesson Assistant
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-gray-800 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-orange-400" />
                  AI Lesson Plan Generator
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  Generate comprehensive lesson plans using AI
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="aiTopic" className="text-gray-300">Topic/Concept</Label>
                    <Input id="aiTopic" placeholder="e.g., Quadratic Equations" className="bg-gray-700 border-gray-600 text-white" />
                  </div>
                  <div>
                    <Label htmlFor="aiGrade" className="text-gray-300">Grade Level</Label>
                    <Select>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="9">Grade 9</SelectItem>
                        <SelectItem value="10">Grade 10</SelectItem>
                        <SelectItem value="11">Grade 11</SelectItem>
                        <SelectItem value="12">Grade 12</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="aiDuration" className="text-gray-300">Duration (minutes)</Label>
                    <Input id="aiDuration" type="number" placeholder="50" className="bg-gray-700 border-gray-600 text-white" />
                  </div>
                  <div>
                    <Label htmlFor="aiStandards" className="text-gray-300">Curriculum Standards</Label>
                    <Input id="aiStandards" placeholder="e.g., CCSS.MATH..." className="bg-gray-700 border-gray-600 text-white" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="aiObjectives" className="text-gray-300">Learning Objectives (Optional)</Label>
                  <Textarea
                    id="aiObjectives"
                    placeholder="Describe what students should learn..."
                    className="bg-gray-700 border-gray-600 text-white"
                    rows={3}
                  />
                </div>
                {!aiGeneratedContent ? (
                  <Alert className="border-orange-500/50 bg-orange-500/10">
                    <Sparkles className="h-4 w-4 text-orange-500" />
                    <AlertDescription className="text-orange-200">
                      AI will generate objectives, activities, assessments, and material suggestions aligned with your standards
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-3 p-4 bg-gray-700 rounded-lg border border-orange-500/50">
                    <h4 className="text-white flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-orange-400" />
                      Generated Content Preview
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <Label className="text-gray-300">Objectives:</Label>
                        <ul className="list-disc list-inside ml-2 text-gray-400 text-sm">
                          {aiGeneratedContent.objectives.map((obj: string, idx: number) => (
                            <li key={idx}>{obj}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <Label className="text-gray-300">Activities:</Label>
                        <ul className="list-disc list-inside ml-2 text-gray-400 text-sm">
                          {aiGeneratedContent.activities.map((act: string, idx: number) => (
                            <li key={idx}>{act}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <Label className="text-gray-300">Materials:</Label>
                        <p className="text-gray-400 text-sm ml-2">{aiGeneratedContent.materials.join(', ')}</p>
                      </div>
                      <div>
                        <Label className="text-gray-300">Assessment:</Label>
                        <p className="text-gray-400 text-sm ml-2">{aiGeneratedContent.assessment}</p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => {
                    setIsAIAssistOpen(false);
                    setAIGeneratedContent(null);
                  }} className="border-gray-600 text-gray-300">
                    Cancel
                  </Button>
                  {!aiGeneratedContent ? (
                    <Button onClick={handleGenerateAIPlan} disabled={isGeneratingAI} className="bg-orange-500 hover:bg-orange-600">
                      {isGeneratingAI ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate Lesson Plan
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button onClick={handleUseAIContent} className="bg-orange-500 hover:bg-orange-600">
                      Use This Content
                    </Button>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isAddLessonOpen} onOpenChange={setIsAddLessonOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto bg-role-teacher hover:bg-role-teacher/90 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Create Lesson
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gray-800 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">Create New Lesson Plan</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Design a comprehensive lesson plan
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="title" className="text-gray-300">Lesson Title</Label>
                    <Input id="title" className="bg-gray-700 border-gray-600 text-white" />
                  </div>
                  <div>
                    <Label htmlFor="subject" className="text-gray-300">Subject</Label>
                    <Select>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="math">Mathematics</SelectItem>
                        <SelectItem value="science">Science</SelectItem>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="history">History</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="grade" className="text-gray-300">Grade</Label>
                    <Select>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="9">Grade 9</SelectItem>
                        <SelectItem value="10">Grade 10</SelectItem>
                        <SelectItem value="11">Grade 11</SelectItem>
                        <SelectItem value="12">Grade 12</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="date" className="text-gray-300">Date</Label>
                    <Input id="date" type="date" className="bg-gray-700 border-gray-600 text-white" />
                  </div>
                  <div>
                    <Label htmlFor="duration" className="text-gray-300">Duration</Label>
                    <Input id="duration" placeholder="e.g., 50 minutes" className="bg-gray-700 border-gray-600 text-white" />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="standards" className="text-gray-300">Curriculum Standards</Label>
                  <Input id="standards" placeholder="e.g., CCSS.MATH.HSA.REI.B.4" className="bg-gray-700 border-gray-600 text-white" />
                  <p className="text-xs text-gray-500 mt-1">Separate multiple standards with commas</p>
                </div>

                <div>
                  <Label htmlFor="objectives" className="text-gray-300">Learning Objectives</Label>
                  <Textarea
                    id="objectives"
                    placeholder="List what students will learn and be able to do..."
                    className="bg-gray-700 border-gray-600 text-white"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="activities" className="text-gray-300">Activities & Timeline</Label>
                  <Textarea
                    id="activities"
                    placeholder="Describe activities with time allocations..."
                    className="bg-gray-700 border-gray-600 text-white"
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="materials" className="text-gray-300">Materials Needed</Label>
                  <Input id="materials" placeholder="List required materials..." className="bg-gray-700 border-gray-600 text-white" />
                </div>

                <div>
                  <Label htmlFor="assessment" className="text-gray-300">Assessment Method</Label>
                  <Textarea
                    id="assessment"
                    placeholder="How will you measure student understanding?"
                    className="bg-gray-700 border-gray-600 text-white"
                    rows={2}
                  />
                </div>

                <div>
                  <Label className="text-gray-300 mb-2 block">Link Assignments (Optional)</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="hw1" 
                        checked={selectedAssignments.includes('hw1')}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedAssignments([...selectedAssignments, 'hw1']);
                          } else {
                            setSelectedAssignments(selectedAssignments.filter(a => a !== 'hw1'));
                          }
                        }}
                      />
                      <label htmlFor="hw1" className="text-sm text-gray-300 cursor-pointer">
                        Homework: Quadratic Basics
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="quiz1"
                        checked={selectedAssignments.includes('quiz1')}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedAssignments([...selectedAssignments, 'quiz1']);
                          } else {
                            setSelectedAssignments(selectedAssignments.filter(a => a !== 'quiz1'));
                          }
                        }}
                      />
                      <label htmlFor="quiz1" className="text-sm text-gray-300 cursor-pointer">
                        Quiz: Week 5
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="project1"
                        checked={selectedAssignments.includes('project1')}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedAssignments([...selectedAssignments, 'project1']);
                          } else {
                            setSelectedAssignments(selectedAssignments.filter(a => a !== 'project1'));
                          }
                        }}
                      />
                      <label htmlFor="project1" className="text-sm text-gray-300 cursor-pointer">
                        Project: Quadratic Applications
                      </label>
                    </div>
                  </div>
                  {selectedAssignments.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedAssignments.map((id) => (
                        <Badge key={id} className="bg-orange-500/10 text-orange-400">
                          <Link2 className="h-3 w-3 mr-1" />
                          {id === 'hw1' && 'Homework'}
                          {id === 'quiz1' && 'Quiz'}
                          {id === 'project1' && 'Project'}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddLessonOpen(false)} className="border-gray-600 text-gray-300">
                    Cancel
                  </Button>
                  <Button variant="outline" onClick={handleSaveLessonDraft} className="border-gray-600 text-gray-300">
                    Save as Draft
                  </Button>
                  <Button onClick={handlePublishLesson} className="bg-role-teacher hover:bg-role-teacher/90 text-white">Publish Lesson</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-4">
        <Label className="text-gray-300">View:</Label>
        <div className="flex gap-2">
          <Button
            variant={selectedView === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedView('week')}
            className={selectedView === 'week' ? 'bg-blue-600' : 'border-gray-600 text-gray-300'}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Weekly
          </Button>
          <Button
            variant={selectedView === 'unit' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedView('unit')}
            className={selectedView === 'unit' ? 'bg-blue-600' : 'border-gray-600 text-gray-300'}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Unit View
          </Button>
        </div>
      </div>

      {/* Lesson Plans Grid */}
      <div className="grid grid-cols-1 gap-4">
        {lessonPlans.map((lesson) => (
          <Card key={lesson.id} className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-white">{lesson.title}</CardTitle>
                    <Badge className={getStatusColor(lesson.status)}>
                      {lesson.status}
                    </Badge>
                  </div>
                  <CardDescription className="text-gray-400 mt-1">
                    {lesson.subject} • {lesson.grade} • {lesson.date}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-300">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Clock className="h-4 w-4" />
                {lesson.duration}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-blue-400" />
                  <span className="text-sm text-gray-300">Learning Objectives:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 ml-6">
                  {lesson.objectives.map((obj, idx) => (
                    <li key={idx} className="text-sm text-gray-400">{obj}</li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-gray-300">Standards:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {lesson.standards.map((standard, idx) => (
                    <Badge key={idx} variant="outline" className="border-green-500/50 text-green-400">
                      {standard}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-4 w-4 text-purple-400" />
                  <span className="text-sm text-gray-300">Activities:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 ml-6">
                  {lesson.activities.map((activity, idx) => (
                    <li key={idx} className="text-sm text-gray-400">{activity}</li>
                  ))}
                </ul>
              </div>

              {lesson.linkedAssignments.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Link2 className="h-4 w-4 text-orange-400" />
                    <span className="text-sm text-gray-300">Linked Assignments:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {lesson.linkedAssignments.map((assignment, idx) => (
                      <Badge key={idx} className="bg-orange-500/10 text-orange-400">
                        {assignment}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-gray-700">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-gray-400">Assessment:</span>
                </div>
                <p className="text-sm text-gray-300">{lesson.assessment}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
