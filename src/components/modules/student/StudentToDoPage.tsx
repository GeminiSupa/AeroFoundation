import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Checkbox } from '../../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Calendar, Clock, BookOpen, FileText, AlertCircle, CheckCircle2, Filter } from 'lucide-react';
import { Progress } from '../../ui/progress';

interface TodoItem {
  id: string;
  title: string;
  type: 'assignment' | 'test' | 'project' | 'event';
  subject: string;
  dueDate: string;
  dueTime?: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  description?: string;
  points?: number;
}

export function StudentToDoPage() {
  const [filterType, setFilterType] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');
  const [showCompleted, setShowCompleted] = useState(false);

  // Mock data - unified aggregation from all classes
  const todoItems: TodoItem[] = [
    {
      id: '1',
      title: 'Chapter 5 Homework: Quadratic Equations',
      type: 'assignment',
      subject: 'Mathematics',
      dueDate: '2025-10-21',
      dueTime: '23:59',
      priority: 'high',
      completed: false,
      description: 'Complete problems 1-20, show all work',
      points: 50
    },
    {
      id: '2',
      title: 'Midterm Exam',
      type: 'test',
      subject: 'Chemistry',
      dueDate: '2025-10-23',
      dueTime: '10:00',
      priority: 'high',
      completed: false,
      description: 'Covers chapters 1-6, bring calculator',
      points: 100
    },
    {
      id: '3',
      title: 'Essay: American Revolution',
      type: 'assignment',
      subject: 'History',
      dueDate: '2025-10-25',
      dueTime: '23:59',
      priority: 'medium',
      completed: false,
      description: '1000 words, MLA format',
      points: 75
    },
    {
      id: '4',
      title: 'Lab Report: Chemical Reactions',
      type: 'assignment',
      subject: 'Chemistry',
      dueDate: '2025-10-22',
      dueTime: '23:59',
      priority: 'high',
      completed: false,
      description: 'Submit via portal, include data tables',
      points: 60
    },
    {
      id: '5',
      title: 'Read Chapters 7-9',
      type: 'assignment',
      subject: 'English',
      dueDate: '2025-10-24',
      priority: 'low',
      completed: false,
      description: 'To Kill a Mockingbird',
      points: 20
    },
    {
      id: '6',
      title: 'Science Fair Project',
      type: 'project',
      subject: 'Physics',
      dueDate: '2025-11-01',
      priority: 'high',
      completed: false,
      description: 'Final presentation and display board',
      points: 200
    },
    {
      id: '7',
      title: 'Parent-Teacher Conference',
      type: 'event',
      subject: 'General',
      dueDate: '2025-10-26',
      dueTime: '15:00',
      priority: 'medium',
      completed: false,
      description: 'Room 215'
    },
    {
      id: '8',
      title: 'Quiz: Functions',
      type: 'test',
      subject: 'Mathematics',
      dueDate: '2025-10-20',
      dueTime: '09:00',
      priority: 'high',
      completed: true,
      points: 25
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'assignment': return <FileText className="h-4 w-4" />;
      case 'test': return <AlertCircle className="h-4 w-4" />;
      case 'project': return <BookOpen className="h-4 w-4" />;
      case 'event': return <Calendar className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'assignment': return 'bg-blue-500/10 text-blue-400';
      case 'test': return 'bg-red-500/10 text-red-400';
      case 'project': return 'bg-purple-500/10 text-purple-400';
      case 'event': return 'bg-green-500/10 text-green-400';
      default: return 'bg-gray-500/10 text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/10 text-red-400 border-red-500/50';
      case 'medium': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/50';
      case 'low': return 'bg-green-500/10 text-green-400 border-green-500/50';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/50';
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date('2025-10-19');
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDueDateLabel = (dueDate: string) => {
    const days = getDaysUntilDue(dueDate);
    if (days < 0) return 'Overdue';
    if (days === 0) return 'Due Today';
    if (days === 1) return 'Due Tomorrow';
    return `Due in ${days} days`;
  };

  const filteredItems = todoItems.filter(item => {
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesSubject = filterSubject === 'all' || item.subject === filterSubject;
    const matchesCompleted = showCompleted || !item.completed;
    return matchesType && matchesSubject && matchesCompleted;
  });

  const upcomingItems = filteredItems.filter(item => !item.completed && getDaysUntilDue(item.dueDate) >= 0);
  const overdueItems = filteredItems.filter(item => !item.completed && getDaysUntilDue(item.dueDate) < 0);
  const completedItems = filteredItems.filter(item => item.completed);

  const totalTasks = todoItems.filter(item => !item.completed).length;
  const completedTasks = todoItems.filter(item => item.completed).length;
  const completionRate = Math.round((completedTasks / todoItems.length) * 100);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-white">My To-Do List</h1>
          <p className="text-gray-400 mt-1">All your assignments, tests, and events in one place</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400">Total Tasks</CardDescription>
            <CardTitle className="text-white text-3xl">{totalTasks}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400">Active items</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400">Due This Week</CardDescription>
            <CardTitle className="text-white text-3xl">
              {upcomingItems.filter(item => getDaysUntilDue(item.dueDate) <= 7).length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-yellow-400">Needs attention</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400">Completed</CardDescription>
            <CardTitle className="text-white text-3xl text-green-500">{completedTasks}</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={completionRate} className="h-2" />
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400">Overdue</CardDescription>
            <CardTitle className="text-white text-3xl text-red-500">{overdueItems.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-400">Action required</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <CardTitle className="text-white">Filters</CardTitle>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="showCompleted"
                  checked={showCompleted}
                  onCheckedChange={(checked) => setShowCompleted(checked as boolean)}
                />
                <label htmlFor="showCompleted" className="text-sm text-gray-300 cursor-pointer">
                  Show completed
                </label>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="assignment">Assignments</SelectItem>
                  <SelectItem value="test">Tests & Quizzes</SelectItem>
                  <SelectItem value="project">Projects</SelectItem>
                  <SelectItem value="event">Events</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select value={filterSubject} onValueChange={setFilterSubject}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="all">All Subjects</SelectItem>
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                  <SelectItem value="Chemistry">Chemistry</SelectItem>
                  <SelectItem value="History">History</SelectItem>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Physics">Physics</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for organization */}
      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="upcoming" className="data-[state=active]:bg-blue-600">
            Upcoming ({upcomingItems.length})
          </TabsTrigger>
          {overdueItems.length > 0 && (
            <TabsTrigger value="overdue" className="data-[state=active]:bg-red-600">
              Overdue ({overdueItems.length})
            </TabsTrigger>
          )}
          <TabsTrigger value="all" className="data-[state=active]:bg-blue-600">
            All Tasks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-3">
          {upcomingItems.length === 0 ? (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="py-8 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-400">No upcoming tasks!</p>
              </CardContent>
            </Card>
          ) : (
            upcomingItems
              .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
              .map((item) => (
                <Card key={item.id} className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Checkbox
                        checked={item.completed}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-white">{item.title}</h3>
                              <Badge className={getTypeColor(item.type)}>
                                {getTypeIcon(item.type)}
                                <span className="ml-1">{item.type}</span>
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-400 mb-2">{item.subject}</p>
                            {item.description && (
                              <p className="text-sm text-gray-500 mb-2">{item.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1 text-gray-400">
                                <Calendar className="h-4 w-4" />
                                {item.dueDate}
                              </div>
                              {item.dueTime && (
                                <div className="flex items-center gap-1 text-gray-400">
                                  <Clock className="h-4 w-4" />
                                  {item.dueTime}
                                </div>
                              )}
                              {item.points && (
                                <span className="text-blue-400">{item.points} points</span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant="outline" className={getPriorityColor(item.priority)}>
                              {item.priority}
                            </Badge>
                            <span className={`text-sm ${
                              getDaysUntilDue(item.dueDate) <= 1 ? 'text-red-400' : 
                              getDaysUntilDue(item.dueDate) <= 3 ? 'text-yellow-400' : 
                              'text-gray-400'
                            }`}>
                              {getDueDateLabel(item.dueDate)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </TabsContent>

        <TabsContent value="overdue" className="space-y-3">
          {overdueItems.map((item) => (
            <Card key={item.id} className="bg-gray-800 border-red-500/50">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Checkbox checked={item.completed} />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white">{item.title}</h3>
                          <Badge className={getTypeColor(item.type)}>
                            {getTypeIcon(item.type)}
                            <span className="ml-1">{item.type}</span>
                          </Badge>
                          <Badge className="bg-red-500/10 text-red-400">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Overdue
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400 mb-2">{item.subject}</p>
                        {item.description && (
                          <p className="text-sm text-gray-500 mb-2">{item.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1 text-red-400">
                            <Calendar className="h-4 w-4" />
                            {item.dueDate}
                          </div>
                          {item.points && (
                            <span className="text-blue-400">{item.points} points</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="all" className="space-y-3">
          {filteredItems
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
            .map((item) => (
              <Card key={item.id} className={`bg-gray-800 ${item.completed ? 'border-gray-700 opacity-60' : 'border-gray-700'}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Checkbox checked={item.completed} />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`${item.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                              {item.title}
                            </h3>
                            <Badge className={getTypeColor(item.type)}>
                              {getTypeIcon(item.type)}
                              <span className="ml-1">{item.type}</span>
                            </Badge>
                            {item.completed && (
                              <Badge className="bg-green-500/10 text-green-400">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Completed
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-400 mb-2">{item.subject}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1 text-gray-400">
                              <Calendar className="h-4 w-4" />
                              {item.dueDate}
                            </div>
                            {item.points && (
                              <span className="text-blue-400">{item.points} points</span>
                            )}
                          </div>
                        </div>
                        {!item.completed && (
                          <Badge variant="outline" className={getPriorityColor(item.priority)}>
                            {item.priority}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
