import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Avatar, AvatarFallback } from '../../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { ScrollArea } from '../../ui/scroll-area';
import { useApp } from '../../../context/AppContext';
import { isElevatedRole } from '../../../utils/roles';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getLearningHubStats,
  getClassesForUser,
  getUserSchedule,
  getUserAssignments,
  getUserGrades,
  getClassCommunications,
  searchStudents,
  enrollStudentInClass,
  bulkEnrollStudents,
  createClass,
  getSubjects,
  getAcademicSessions,
  getTeachers,
  createAssignment,
  recordAttendance,
  getScheduleSlots,
  createScheduleSlot,
  updateScheduleSlot,
  deleteScheduleSlot,
  checkScheduleConflicts,
  createSubject,
  unenrollStudentFromClass,
  getEnrolledStudentsForClass,
  exportClassStudents
} from '../../../lib/api/learningHub';
import {
  Calendar,
  Clock,
  Users,
  BookOpen,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Star,
  MessageSquare,
  Plus,
  Filter,
  Search,
  Bell,
  UserPlus,
  GraduationCap,
  X,
  Save,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isSameDay } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { Skeleton } from '../../ui/skeleton';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Textarea } from '../../ui/textarea';
import { toast } from 'sonner';

// Types for our unified system
interface Class {
  id: string;
  subject: { name: string; code: string; color: string };
  sectionCode: string;
  teacher?: { full_name: string };
  roomNumber?: string;
  capacity: number;
  enrolledCount: number;
  scheduleSlots: ScheduleSlot[];
  nextClass?: Date;
}

interface ScheduleSlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  roomNumber?: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'announcement' | 'reminder' | 'alert';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  createdAt: string;
  author: { full_name: string };
}

interface Assignment {
  id: string;
  title: string;
  dueDate: string;
  type: 'homework' | 'quiz' | 'project' | 'exam';
  class: { subject: { name: string } };
  status: 'pending' | 'submitted' | 'graded';
}

interface Grade {
  id: string;
  score: number;
  maxScore: number;
  percentage: number;
  assignment: { title: string };
  class: { subject: { name: string } };
}

export function LearningHub() {
  const { user } = useApp();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('overview');

  // Dialog states
  const [createClassOpen, setCreateClassOpen] = useState(false);
  const [createSubjectOpen, setCreateSubjectOpen] = useState(false);
  const [timetableManagerOpen, setTimetableManagerOpen] = useState(false);
  const [createAssignmentOpen, setCreateAssignmentOpen] = useState(false);
  const [takeAttendanceOpen, setTakeAttendanceOpen] = useState(false);
  const [manageClassOpen, setManageClassOpen] = useState(false);
  const [selectedClassForManagement, setSelectedClassForManagement] = useState<any>(null);
  const [createScheduleSlotOpen, setCreateScheduleSlotOpen] = useState(false);
  const [selectedScheduleSlot, setSelectedScheduleSlot] = useState<any>(null);
  const [addStudentsDialogOpen, setAddStudentsDialogOpen] = useState(false);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [selectedStudentsForEnrollment, setSelectedStudentsForEnrollment] = useState<string[]>([]);

  // Schedule slot form
  const [scheduleSlotForm, setScheduleSlotForm] = useState({
    classId: '',
    dayOfWeek: 0,
    startTime: '',
    endTime: '',
    roomNumber: ''
  });
  const [scheduleFilter, setScheduleFilter] = useState('all');

  // Form states
  const [classForm, setClassForm] = useState({
    subjectId: '',
    sectionCode: '',
    teacherId: '',
    roomNumber: '',
    capacity: 30,
    academicSessionId: ''
  });

  const [subjectForm, setSubjectForm] = useState({
    name: '',
    code: '',
    description: '',
    color: '#0D6EFD',
    department: '',
    gradeLevel: ''
  });

  const [assignmentForm, setAssignmentForm] = useState({
    classId: '',
    title: '',
    description: '',
    dueDate: '',
    totalPoints: 100
  });

  // Real API calls for dashboard data with real-time updates
  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['learning-hub-stats', user?.id, user?.role],
    queryFn: async () => {
      if (!user?.id) return null;
      const result = await getLearningHubStats(user.id, user.role);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
    refetchOnWindowFocus: true,
  });

  const { data: userClasses, isLoading: classesLoading, refetch: refetchClasses } = useQuery({
    queryKey: ['learning-hub-classes', user?.id, user?.role],
    queryFn: async () => {
      if (!user?.id) return [];
      const result = await getClassesForUser(user.id, user.role);
      if (!result.success) throw new Error(result.error);
      return result.data || [];
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Real-time updates
    refetchOnWindowFocus: true,
  });

  const { data: todaySchedule, isLoading: scheduleLoading, refetch: refetchSchedule } = useQuery({
    queryKey: ['learning-hub-schedule', user?.id, user?.role, selectedDate.toDateString()],
    queryFn: async () => {
      if (!user?.id) return [];
      const result = await getUserSchedule(user.id, user.role, selectedDate.toISOString().split('T')[0]);
      if (!result.success) throw new Error(result.error);
      return result.data || [];
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Real-time updates for live classes
    refetchOnWindowFocus: true,
  });

  const { data: userAssignments, isLoading: assignmentsLoading } = useQuery({
    queryKey: ['learning-hub-assignments', user?.id, user?.role],
    queryFn: async () => {
      if (!user?.id) return [];
      const result = await getUserAssignments(user.id, user.role);
      if (!result.success) throw new Error(result.error);
      return result.data || [];
    },
    enabled: !!user?.id,
  });

  const { data: userGrades, isLoading: gradesLoading } = useQuery({
    queryKey: ['learning-hub-grades', user?.id, user?.role],
    queryFn: async () => {
      if (!user?.id) return [];
      const result = await getUserGrades(user.id, user.role);
      if (!result.success) throw new Error(result.error);
      return result.data || [];
    },
    enabled: !!user?.id,
  });

  const { data: communications, isLoading: commsLoading } = useQuery({
    queryKey: ['learning-hub-communications', user?.id, user?.role],
    queryFn: async () => {
      if (!user?.id) return [];
      const result = await getClassCommunications(user.id, user.role);
      if (!result.success) throw new Error(result.error);
      return result.data || [];
    },
    enabled: !!user?.id,
  });

  const isLoading = statsLoading || classesLoading || scheduleLoading || assignmentsLoading || gradesLoading || commsLoading;

  // Mutations
  const createClassMutation = useMutation({
    mutationFn: createClass,
    onSuccess: () => {
      toast.success('Class created successfully');
      // Invalidate all learning hub queries for real-time updates across all roles
      queryClient.invalidateQueries({ queryKey: ['learning-hub-classes'] }); // All users
      queryClient.invalidateQueries({ queryKey: ['learning-hub-stats'] }); // All users
      queryClient.invalidateQueries({ queryKey: ['learning-hub-schedule'] }); // Update schedules
      // Force immediate refetch for real-time UI update
      refetchStats();
      refetchClasses();
      refetchSchedule();
      queryClient.invalidateQueries({ queryKey: ['learning-hub-classes', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['learning-hub-stats', user?.id] });
      setCreateClassOpen(false);
      setClassForm({ subjectId: '', sectionCode: '', teacherId: '', roomNumber: '', capacity: 30, academicSessionId: '' });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create class');
    }
  });

  const createAssignmentMutation = useMutation({
    mutationFn: createAssignment,
    onSuccess: () => {
      toast.success('Assignment created successfully');
      queryClient.invalidateQueries({ queryKey: ['learning-hub-assignments', user?.id, user?.role] });
      queryClient.invalidateQueries({ queryKey: ['learning-hub-assignments', user?.id] });
      setCreateAssignmentOpen(false);
      setAssignmentForm({ classId: '', title: '', description: '', dueDate: '', totalPoints: 100 });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create assignment');
    }
  });

  const createScheduleSlotMutation = useMutation({
    mutationFn: createScheduleSlot,
    onSuccess: () => {
      toast.success('Schedule slot created successfully');
      // Invalidate all related queries for real-time updates across all roles
      queryClient.invalidateQueries({ queryKey: ['schedule-slots'] });
      queryClient.invalidateQueries({ queryKey: ['learning-hub-stats'] }); // All users
      queryClient.invalidateQueries({ queryKey: ['learning-hub-schedule'] }); // All schedules
      queryClient.invalidateQueries({ queryKey: ['learning-hub-classes'] }); // Update class schedules
      // Force immediate refetch for real-time UI update
      refetchStats();
      refetchSchedule();
      refetchClasses();
      setCreateScheduleSlotOpen(false);
      setSelectedScheduleSlot(null);
      setScheduleSlotForm({ classId: '', dayOfWeek: 1, startTime: '', endTime: '', roomNumber: '' });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create schedule slot');
    }
  });

  const updateScheduleSlotMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateScheduleSlot(id, data),
    onSuccess: () => {
      toast.success('Schedule slot updated successfully');
      // Invalidate all related queries for real-time updates across all roles
      queryClient.invalidateQueries({ queryKey: ['schedule-slots'] });
      queryClient.invalidateQueries({ queryKey: ['learning-hub-stats'] }); // All users
      queryClient.invalidateQueries({ queryKey: ['learning-hub-schedule'] }); // All schedules
      queryClient.invalidateQueries({ queryKey: ['learning-hub-classes'] }); // Update class schedules
      // Force immediate refetch for real-time UI update
      refetchStats();
      refetchSchedule();
      refetchClasses();
      setCreateScheduleSlotOpen(false);
      setSelectedScheduleSlot(null);
      setScheduleSlotForm({ classId: '', dayOfWeek: 1, startTime: '', endTime: '', roomNumber: '' });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update schedule slot');
    }
  });

  // Helper functions for timetable
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 17; hour++) {
      const startHour = String(hour).padStart(2, '0');
      const endHour = String(hour + 1).padStart(2, '0');
      const startLabel = hour < 12 ? `${hour}:00 AM` : hour === 12 ? '12:00 PM' : `${hour - 12}:00 PM`;
      const endLabel = (hour + 1) < 12 ? `${hour + 1}:00 AM` : (hour + 1) === 12 ? '12:00 PM' : `${hour + 1 - 12}:00 PM`;
      slots.push({
        start: `${startHour}:00`,
        end: `${endHour}:00`,
        label: `${startLabel} - ${endLabel}`
      });
    }
    return slots;
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const createSubjectMutation = useMutation({
    mutationFn: createSubject,
    onSuccess: () => {
      toast.success('Subject created successfully');
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      setCreateSubjectOpen(false);
      setSubjectForm({ name: '', code: '', description: '', color: '#0D6EFD', department: '', gradeLevel: '' });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create subject');
    }
  });

  // ====================================================
  // ENROLLMENT MANAGEMENT - REBUILT FROM SCRATCH
  // ====================================================
  
  // Bulk enroll mutation with comprehensive real-time updates
  const bulkEnrollMutation = useMutation({
    mutationFn: ({ classId, studentIds }: { classId: string; studentIds: string[] }) =>
      bulkEnrollStudents(classId, studentIds),
    onSuccess: async (_, variables) => {
      toast.success(`Successfully enrolled ${variables.studentIds.length} student(s)`);
      
      // Close dialog and reset state
      setAddStudentsDialogOpen(false);
      setSelectedStudentsForEnrollment([]);
      setStudentSearchTerm('');
      
      // Optimistic UI update for selected class
      if (selectedClassForManagement?.id === variables.classId) {
        setSelectedClassForManagement((prev: any) => ({
          ...prev,
          enrolledCount: (prev?.enrolledCount || 0) + variables.studentIds.length
        }));
      }
      
      // CRITICAL: Invalidate ALL related queries first (no await - fire and forget)
      queryClient.invalidateQueries({ queryKey: ['enrolled-students'] }); // All enrolled students queries
      queryClient.invalidateQueries({ queryKey: ['learning-hub-classes'] }); // All class queries for all users/roles
      queryClient.invalidateQueries({ queryKey: ['learning-hub-stats'] }); // All stats queries for all users/roles
      queryClient.invalidateQueries({ queryKey: ['learning-hub-schedule'] }); // All schedule queries
      
      // Immediately refetch all active queries for instant UI update
      await Promise.all([
        refetchEnrolledStudents(),
        refetchClasses(),
        refetchStats(),
        refetchSchedule(),
        queryClient.refetchQueries({ queryKey: ['enrolled-students', variables.classId] }),
        queryClient.refetchQueries({ queryKey: ['learning-hub-classes'] }),
        queryClient.refetchQueries({ queryKey: ['learning-hub-stats'] }),
      ]);
      
      // Force a second refetch after a short delay to ensure database consistency
      setTimeout(async () => {
        await Promise.all([
          refetchEnrolledStudents(),
          refetchClasses(),
          refetchStats(),
        ]);
      }, 500);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to enroll students');
      console.error('Enrollment error:', error);
    }
  });

  // Single enroll mutation (for quick add button)
  const enrollStudentMutation = useMutation({
    mutationFn: ({ classId, studentId }: { classId: string; studentId: string }) =>
      enrollStudentInClass(classId, studentId),
    onSuccess: async (_, variables) => {
      toast.success('Student enrolled successfully');
      
      // Optimistic UI update
      if (selectedClassForManagement?.id === variables.classId) {
        setSelectedClassForManagement((prev: any) => ({
          ...prev,
          enrolledCount: (prev?.enrolledCount || 0) + 1
        }));
      }
      
      // Invalidate and refetch all related queries
      queryClient.invalidateQueries({ queryKey: ['enrolled-students'] });
      queryClient.invalidateQueries({ queryKey: ['learning-hub-classes'] });
      queryClient.invalidateQueries({ queryKey: ['learning-hub-stats'] });
      
      await Promise.all([
        refetchEnrolledStudents(),
        refetchClasses(),
        refetchStats(),
        queryClient.refetchQueries({ queryKey: ['enrolled-students', variables.classId] }),
      ]);
      
      // Second refetch after delay
      setTimeout(async () => {
        await refetchEnrolledStudents();
        await refetchClasses();
        await refetchStats();
      }, 500);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to enroll student');
      console.error('Single enrollment error:', error);
    }
  });

  // Load schedule slots for management
  const { data: scheduleSlots, refetch: refetchScheduleSlots } = useQuery({
    queryKey: ['schedule-slots', user?.id, user?.role],
    queryFn: async () => {
      const result = await getScheduleSlots();
      if (!result.success) throw new Error(result.error);
      return result.data || [];
    },
    enabled: timetableManagerOpen || !!user?.id, // Load when dialog is open or when user is available
    refetchInterval: timetableManagerOpen ? 30000 : false, // Real-time updates when managing schedule
    refetchOnWindowFocus: true,
  });

  // Search students for enrollment
  const { data: searchResults } = useQuery({
    queryKey: ['search-students', studentSearchTerm, selectedClassForManagement?.id],
    queryFn: async () => {
      if (!studentSearchTerm.trim() || !selectedClassForManagement?.id) return [];
      const result = await searchStudents(studentSearchTerm, selectedClassForManagement.id);
      if (!result.success) throw new Error(result.error);
      return result.data || [];
    },
    enabled: addStudentsDialogOpen && !!studentSearchTerm.trim() && !!selectedClassForManagement?.id
  });

  // Get enrolled students for selected class
  const { data: enrolledStudents, refetch: refetchEnrolledStudents } = useQuery({
    queryKey: ['enrolled-students', selectedClassForManagement?.id],
    queryFn: async () => {
      if (!selectedClassForManagement?.id) return [];
      const result = await getEnrolledStudentsForClass(selectedClassForManagement.id);
      if (!result.success) throw new Error(result.error);
      return result.data || [];
    },
    enabled: manageClassOpen && !!selectedClassForManagement?.id
  });

  // Unenroll student mutation with comprehensive updates
  const unenrollMutation = useMutation({
    mutationFn: ({ classId, studentId }: { classId: string; studentId: string }) =>
      unenrollStudentFromClass(classId, studentId),
    onSuccess: async (_, variables) => {
      toast.success('Student unenrolled successfully');
      
      // Optimistic UI update
      if (selectedClassForManagement?.id === variables.classId) {
        setSelectedClassForManagement((prev: any) => ({
          ...prev,
          enrolledCount: Math.max(0, (prev?.enrolledCount || 0) - 1)
        }));
      }
      
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['enrolled-students'] });
      queryClient.invalidateQueries({ queryKey: ['learning-hub-classes'] });
      queryClient.invalidateQueries({ queryKey: ['learning-hub-stats'] });
      
      // Immediately refetch
      await Promise.all([
        refetchEnrolledStudents(),
        refetchClasses(),
        refetchStats(),
        queryClient.refetchQueries({ queryKey: ['enrolled-students', variables.classId] }),
      ]);
      
      // Second refetch after delay
      setTimeout(async () => {
        await Promise.all([
          refetchEnrolledStudents(),
          refetchClasses(),
          refetchStats(),
        ]);
      }, 500);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to unenroll student');
      console.error('Unenroll error:', error);
    }
  });

  // Export students mutation
  const exportMutation = useMutation({
    mutationFn: (classId: string) => exportClassStudents(classId),
    onSuccess: (result) => {
      if (result.success && result.data) {
        // Create and download CSV file
        const blob = new Blob([result.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `class-students-${selectedClassForManagement?.sectionCode || 'export'}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success('Student list exported successfully');
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to export student list');
    }
  });

  // Load data for forms
  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const result = await getSubjects();
      if (!result.success) throw new Error(result.error);
      return result.data;
    }
  });

  const { data: academicSessions } = useQuery({
    queryKey: ['academic-sessions'],
    queryFn: async () => {
      const result = await getAcademicSessions();
      if (!result.success) throw new Error(result.error);
      return result.data;
    }
  });

  const { data: teachers } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      const result = await getTeachers();
      if (!result.success) throw new Error(result.error);
      return result.data;
    }
  });

  const weekDays = useMemo(() => {
    const start = startOfWeek(selectedDate);
    const end = endOfWeek(selectedDate);
    return eachDayOfInterval({ start, end });
  }, [selectedDate]);

  const getRoleBasedContent = () => {
    switch (user?.role) {
      case 'admin':
        return {
          title: 'Academic Control Center',
          subtitle: 'Manage classes, schedules, and academic performance',
          primaryActions: [
            { label: 'Create Class', icon: <Plus className="w-4 h-4" />, action: () => setCreateClassOpen(true) },
            { label: 'Manage Schedule', icon: <Calendar className="w-4 h-4" />, action: () => setTimetableManagerOpen(true) },
            { label: 'View Reports', icon: <TrendingUp className="w-4 h-4" />, action: () => {} }
          ]
        };
      case 'teacher':
        return {
          title: 'My Teaching Hub',
          subtitle: 'Manage classes, assignments, and student progress',
          primaryActions: [
            { label: 'Create Assignment', icon: <Plus className="w-4 h-4" />, action: () => setCreateAssignmentOpen(true) },
            { label: 'Take Attendance', icon: <Users className="w-4 h-4" />, action: () => setTakeAttendanceOpen(true) },
            { label: 'Grade Submissions', icon: <CheckCircle className="w-4 h-4" />, action: () => {} }
          ]
        };
      case 'student':
        return {
          title: 'My Learning Space',
          subtitle: 'Track assignments, grades, and class schedule',
          primaryActions: [
            { label: 'View Schedule', icon: <Calendar className="w-4 h-4" />, action: () => {} },
            { label: 'Submit Assignment', icon: <BookOpen className="w-4 h-4" />, action: () => {} },
            { label: 'Check Grades', icon: <Star className="w-4 h-4" />, action: () => {} }
          ]
        };
      case 'parent':
        return {
          title: 'Family Academic Portal',
          subtitle: 'Monitor children\'s progress and communicate with teachers',
          primaryActions: [
            { label: 'View Children\'s Progress', icon: <TrendingUp className="w-4 h-4" />, action: () => {} },
            { label: 'Contact Teachers', icon: <MessageSquare className="w-4 h-4" />, action: () => {} },
            { label: 'Schedule Meeting', icon: <Calendar className="w-4 h-4" />, action: () => {} }
          ]
        };
      default:
        return {
          title: 'Learning Hub',
          subtitle: 'Your academic center',
          primaryActions: []
        };
    }
  };

  const roleContent = getRoleBasedContent();

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Mobile-first responsive header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {roleContent.title}
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                {roleContent.subtitle}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {roleContent.primaryActions.map((action, index) => (
                <Button
                  key={index}
                  onClick={action.action}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                  size="sm"
                >
                  {action.icon}
                  <span className="ml-2">{action.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 sm:px-6 lg:px-8">
        {/* Quick Stats Cards - Mobile optimized grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer hover:scale-105"
            onClick={() => {
              setActiveTab('classes');
              refetchClasses();
              refetchStats();
            }}
            title="View and manage all classes"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Active Classes</p>
                  <p className="text-2xl font-bold">{statsData?.totalClasses || 0}</p>
                  <p className="text-xs text-blue-200 mt-1">Click to manage</p>
                </div>
                <BookOpen className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card
            className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer hover:scale-105"
            onClick={() => {
              setActiveTab('classes');
              refetchClasses();
              refetchStats();
              // Scroll to enrollment section if available
              setTimeout(() => {
                const enrollmentSection = document.querySelector('[data-enrollment-section]');
                if (enrollmentSection) {
                  enrollmentSection.scrollIntoView({ behavior: 'smooth' });
                }
              }, 100);
            }}
            title="View enrolled students across all classes"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Enrolled Students</p>
                  <p className="text-2xl font-bold">{statsData?.activeEnrollments || 0}</p>
                  <p className="text-xs text-green-200 mt-1">Click to view details</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card
            className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer hover:scale-105"
            onClick={() => {
              // Open Manage Schedule dialog for admins/teachers, or show schedule for students/parents
              if (isElevatedRole(user?.role) || user?.role === 'teacher') {
                setTimetableManagerOpen(true);
                refetchSchedule();
              } else {
                setActiveTab('schedule');
                refetchSchedule();
              }
              refetchStats();
            }}
            title={isElevatedRole(user?.role) || user?.role === 'teacher' ? 'Manage Schedule' : 'View Today\'s Schedule'}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Live Classes Now</p>
                  <p className="text-2xl font-bold">{statsData?.currentClasses || 0}</p>
                  <p className="text-xs text-orange-200 mt-1">
                    {isElevatedRole(user?.role) || user?.role === 'teacher' ? 'Click to manage' : 'Happening right now'}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-orange-200 animate-pulse" />
              </div>
            </CardContent>
          </Card>

          <Card
            className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer hover:scale-105"
            onClick={() => setActiveTab('assignments')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Pending Assignments</p>
                  <p className="text-2xl font-bold">{statsData?.upcomingAssignments || 0}</p>
                </div>
                <Star className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-none lg:flex">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
            <TabsTrigger value="classes" className="text-xs sm:text-sm">Classes</TabsTrigger>
            <TabsTrigger value="schedule" className="text-xs sm:text-sm">Schedule</TabsTrigger>
            <TabsTrigger value="assignments" className="text-xs sm:text-sm">Assignments</TabsTrigger>
            <TabsTrigger value="grades" className="text-xs sm:text-sm">Grades</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Today's Schedule */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Today's Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                        <Calendar className="w-8 h-8 mb-2 opacity-20" />
                        <p className="text-sm">No schedule available right now.</p>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Recent Announcements */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Recent Announcements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                        <Bell className="w-8 h-8 mb-2 opacity-20" />
                        <p className="text-sm">No recent announcements.</p>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Classes Tab */}
          <TabsContent value="classes" className="space-y-6">
            {isElevatedRole(user?.role) && (
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">School Management</h3>
                  <p className="text-sm text-gray-600">Manage subjects, classes, students, and schedules</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setCreateSubjectOpen(true)}
                    variant="outline"
                    className="shadow hover:shadow-md transition-shadow"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Add Subject
                  </Button>
                  <Button
                    onClick={() => setCreateClassOpen(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Class
                  </Button>
                  <Button
                    onClick={() => setTimetableManagerOpen(true)}
                    className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Manage Timetable
                  </Button>
                </div>
              </div>
            )}

            {user?.role === 'teacher' && (
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">My Classes</h3>
                  <p className="text-sm text-gray-600">Classes you are teaching</p>
                </div>
                <Button
                  onClick={() => setCreateAssignmentOpen(true)}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Assignment
                </Button>
              </div>
            )}

            {user?.role === 'student' && (
              <div>
                <h3 className="text-lg font-semibold">My Classes</h3>
                <p className="text-sm text-gray-600">Classes you are enrolled in</p>
              </div>
            )}

            {user?.role === 'parent' && (
              <div>
                <h3 className="text-lg font-semibold">Children's Classes</h3>
                <p className="text-sm text-gray-600">Classes your children are enrolled in</p>
              </div>
            )}

            {classesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="border-0 shadow-lg">
                    <CardHeader>
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-2/3" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : userClasses && userClasses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userClasses.map((cls) => (
                  <Card key={cls.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${
                              cls.subject?.color || '#0D6EFD'
                            }`} />
                            {cls.subject?.name || 'Unknown Subject'}
                          </CardTitle>
                          <CardDescription className="text-sm mt-1">
                            Section {cls.sectionCode}
                            {cls.roomNumber && ` • Room ${cls.roomNumber}`}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {cls.capacity} capacity
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {cls.teacher && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <UserPlus className="w-4 h-4" />
                            <span>Teacher: {cls.teacher.full_name}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="w-4 h-4 text-blue-600" />
                            <span className="font-semibold text-blue-900">
                              <span className="text-lg">{cls.enrolledCount || 0}</span>
                              <span className="text-gray-600">/{cls.capacity}</span> 
                              <span className="text-xs font-normal ml-1">students enrolled</span>
                            </span>
                          </div>
                          {cls.enrolledCount > 0 && (
                            <Badge variant="default" className="bg-green-500 text-white text-xs">
                              Active
                            </Badge>
                          )}
                        </div>

                        {cls.enrolledCount > 0 && (
                          <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            <span>Click "Manage" to view and manage enrolled students</span>
                          </div>
                        )}

                        {cls.academicSessionId && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>Session: {cls.academicSessionId}</span>
                          </div>
                        )}

                        <div className="flex gap-2 mt-4">
                          {isElevatedRole(user?.role) && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1"
                                onClick={() => {
                                  setSelectedClassForManagement(cls);
                                  setManageClassOpen(true);
                                }}
                              >
                                <Users className="w-4 h-4 mr-1" />
                                Students
                              </Button>
                              <Button size="sm" variant="outline" className="flex-1">
                                <Calendar className="w-4 h-4 mr-1" />
                                Schedule
                              </Button>
                            </>
                          )}

                          {user?.role === 'teacher' && cls.teacher?.id === user.id && (
                            <>
                              <Button size="sm" variant="outline" className="flex-1">
                                <Users className="w-4 h-4 mr-1" />
                                Roster
                              </Button>
                              <Button size="sm" variant="outline" className="flex-1">
                                <BookOpen className="w-4 h-4 mr-1" />
                                Assignments
                              </Button>
                            </>
                          )}

                          {user?.role === 'student' && (
                            <Button size="sm" variant="outline" className="w-full">
                              <BookOpen className="w-4 h-4 mr-1" />
                              View Details
                            </Button>
                          )}

                          {user?.role === 'parent' && (
                            <Button size="sm" variant="outline" className="w-full">
                              <TrendingUp className="w-4 h-4 mr-1" />
                              View Progress
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-0 shadow-lg">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BookOpen className="w-12 h-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Classes Yet</h3>
                  <p className="text-gray-600 text-center mb-4">
                    {isElevatedRole(user?.role)
                      ? 'Create your first class to get started with the academic system.'
                      : user?.role === 'teacher'
                      ? 'You haven\'t been assigned to any classes yet.'
                      : user?.role === 'student'
                      ? 'You haven\'t been enrolled in any classes yet.'
                      : 'No classes available for your children yet.'
                    }
                  </p>
                  {isElevatedRole(user?.role) && (
                    <Button
                      onClick={() => setCreateClassOpen(true)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Class
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <CardTitle>Weekly Schedule</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
                  {weekDays.map((day, index) => (
                    <div key={index} className="space-y-2">
                      <div className={`p-3 text-center rounded-lg font-medium ${
                        isToday(day)
                          ? 'bg-blue-500 text-white'
                          : isSameDay(day, selectedDate)
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        <div className="text-sm">{format(day, 'EEE')}</div>
                        <div className="text-lg">{format(day, 'd')}</div>
                      </div>
                    <div className="space-y-1 min-h-32">
                      {/* Mock schedule items for each day - highlight current time */}
                      {index === new Date().getDay() && (
                        <>
                          {/* Current time indicator */}
                          <div className="text-xs text-blue-600 font-medium mb-2 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Now: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>

                          {/* Show classes happening now */}
                          <p className="text-xs text-muted-foreground">
                            Once real timetable data is configured, any classes happening right now will be highlighted here.
                          </p>
                        </>
                      )}

                      {/* Show today's schedule if it's today */}
                      {index === new Date().getDay() && (
                        <p className="text-xs text-muted-foreground">
                          Today&apos;s classes will appear here when your real schedule is connected to the Learning Hub.
                        </p>
                      )}
                    </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assignments Tab */}
          <TabsContent value="assignments" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Pending Assignments</CardTitle>
                  <CardDescription>Complete these before due dates</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        When teachers create real assignments, they will show up here with due dates and status.
                      </p>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Submitted</CardTitle>
                  <CardDescription>Awaiting grading</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      <div className="p-3 border border-blue-200 bg-blue-50 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">Science Project</p>
                            <p className="text-sm text-gray-600">Submitted: 2 days ago</p>
                          </div>
                          <Badge variant="secondary">Submitted</Badge>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Completed</CardTitle>
                  <CardDescription>Graded assignments</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      <div className="p-3 border border-green-200 bg-green-50 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">History Essay</p>
                            <p className="text-sm text-gray-600">Grade: A (95%)</p>
                          </div>
                          <Badge variant="default" className="bg-green-500">A</Badge>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Grades Tab */}
          <TabsContent value="grades" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Recent Grades</CardTitle>
                <CardDescription>Your academic performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Mathematics</p>
                          <p className="text-sm text-gray-600">Quiz #3</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-700">95%</p>
                          <p className="text-sm text-green-600">A</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">English Literature</p>
                          <p className="text-sm text-gray-600">Essay</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-700">88%</p>
                          <p className="text-sm text-blue-600">B+</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Class Dialog */}
      <Dialog open={createClassOpen} onOpenChange={setCreateClassOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Class</DialogTitle>
            <DialogDescription>
              Set up a new class with subject, teacher, and schedule.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subject" className="text-right">
                Subject
              </Label>
              <Select value={classForm.subjectId} onValueChange={(value) => setClassForm(prev => ({ ...prev, subjectId: value }))}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects?.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name} ({subject.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="session" className="text-right">
                Session
              </Label>
              <Select value={classForm.academicSessionId || ''} onValueChange={(value) => setClassForm(prev => ({ ...prev, academicSessionId: value }))}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select session" />
                </SelectTrigger>
                <SelectContent>
                  {academicSessions?.map((session) => (
                    <SelectItem key={session.id} value={session.id}>
                      {session.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="section" className="text-right">
                Section
              </Label>
              <Input
                id="section"
                value={classForm.sectionCode}
                onChange={(e) => setClassForm(prev => ({ ...prev, sectionCode: e.target.value }))}
                className="col-span-3"
                placeholder="A, B, 01, etc."
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="teacher" className="text-right">
                Teacher
              </Label>
              <Select value={classForm.teacherId} onValueChange={(value) => setClassForm(prev => ({ ...prev, teacherId: value }))}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select teacher (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {teachers?.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="room" className="text-right">
                Room
              </Label>
              <Input
                id="room"
                value={classForm.roomNumber}
                onChange={(e) => setClassForm(prev => ({ ...prev, roomNumber: e.target.value }))}
                className="col-span-3"
                placeholder="Room 101"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="capacity" className="text-right">
                Capacity
              </Label>
              <Input
                id="capacity"
                type="number"
                value={classForm.capacity}
                onChange={(e) => setClassForm(prev => ({ ...prev, capacity: Number(e.target.value) }))}
                className="col-span-3"
                min="1"
                max="100"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCreateClassOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!classForm.subjectId || !classForm.sectionCode || !classForm.academicSessionId) {
                  toast.error('Please fill in all required fields');
                  return;
                }
                createClassMutation.mutate({
                  ...classForm,
                  academicSessionId: classForm.academicSessionId!
                });
              }}
              disabled={createClassMutation.isPending}
            >
              {createClassMutation.isPending ? 'Creating...' : 'Create Class'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Assignment Dialog */}
      <Dialog open={createAssignmentOpen} onOpenChange={setCreateAssignmentOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Assignment</DialogTitle>
            <DialogDescription>
              Create a new assignment for your class.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="class" className="text-right">
                Class
              </Label>
              <Select value={assignmentForm.classId} onValueChange={(value) => setAssignmentForm(prev => ({ ...prev, classId: value }))}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {userClasses?.filter(cls => cls.teacher?.id === user?.id).map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.subject?.name} - {cls.sectionCode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={assignmentForm.title}
                onChange={(e) => setAssignmentForm(prev => ({ ...prev, title: e.target.value }))}
                className="col-span-3"
                placeholder="Assignment title"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">
                Description
              </Label>
              <Textarea
                id="description"
                value={assignmentForm.description}
                onChange={(e) => setAssignmentForm(prev => ({ ...prev, description: e.target.value }))}
                className="col-span-3"
                placeholder="Assignment details..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dueDate" className="text-right">
                Due Date
              </Label>
              <Input
                id="dueDate"
                type="datetime-local"
                value={assignmentForm.dueDate}
                onChange={(e) => setAssignmentForm(prev => ({ ...prev, dueDate: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="points" className="text-right">
                Points
              </Label>
              <Input
                id="points"
                type="number"
                value={assignmentForm.totalPoints}
                onChange={(e) => setAssignmentForm(prev => ({ ...prev, totalPoints: Number(e.target.value) }))}
                className="col-span-3"
                min="1"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCreateAssignmentOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!assignmentForm.classId || !assignmentForm.title) {
                  toast.error('Please fill in class and title');
                  return;
                }
                createAssignmentMutation.mutate(assignmentForm);
              }}
              disabled={createAssignmentMutation.isPending}
            >
              {createAssignmentMutation.isPending ? 'Creating...' : 'Create Assignment'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Professional Timetable Manager - Rebuilt from Scratch */}
      <Dialog open={timetableManagerOpen} onOpenChange={setTimetableManagerOpen}>
        <DialogContent className="sm:max-w-[1600px] max-h-[95vh] w-full p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
              <Calendar className="w-7 h-7 text-blue-600" />
              School Timetable Manager
            </DialogTitle>
            <DialogDescription className="text-base">
              Create and manage your complete school timetable with professional scheduling tools
            </DialogDescription>
          </DialogHeader>
          
          <div className="px-6 py-4 space-y-4">
            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl border-2 border-blue-200 shadow-sm">
              <div className="flex flex-wrap gap-3">
                <Button 
                  size="sm" 
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all"
                  onClick={() => {
                    setScheduleSlotForm({
                      classId: '',
                      dayOfWeek: 1,
                      startTime: '08:00',
                      endTime: '09:00',
                      roomNumber: ''
                    });
                    setSelectedScheduleSlot(null);
                    setCreateScheduleSlotOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Schedule Slot
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="border-blue-300 hover:bg-blue-50"
                  onClick={async () => {
                    // Check for conflicts across all schedule slots
                    let conflictCount = 0;
                    if (scheduleSlots && scheduleSlots.length > 0) {
                      for (const slot of scheduleSlots) {
                        const conflicts = await checkScheduleConflicts(
                          slot.day_of_week,
                          slot.start_time,
                          slot.end_time,
                          slot.id
                        );
                        if (conflicts && conflicts.success && conflicts.data && conflicts.data.length > 0) {
                          conflictCount += conflicts.data.length;
                        }
                      }
                    }
                    if (conflictCount > 0) {
                      toast.warning(`Found ${conflictCount} potential conflict(s)`, {
                        description: 'Check the timetable for highlighted conflicts'
                      });
                    } else {
                      toast.success('No conflicts detected!');
                    }
                  }}
                >
                  <AlertTriangle className="w-4 h-4 mr-2 text-orange-600" />
                  Check Conflicts
                </Button>
                <Button size="sm" variant="outline" className="border-green-300 hover:bg-green-50">
                  <FileText className="w-4 h-4 mr-2 text-green-600" />
                  Export Timetable
                </Button>
              </div>
              
              <div className="flex items-center gap-3">
                <Label className="text-sm font-semibold text-gray-700">Filter:</Label>
                <Select 
                  value={scheduleFilter} 
                  onValueChange={setScheduleFilter}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    <SelectItem value="active">Active Only</SelectItem>
                    <SelectItem value="today">Today's Schedule</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Timetable Grid - Professional Weekly View */}
            <div className="border-2 border-gray-200 rounded-xl overflow-hidden shadow-xl bg-white">
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Weekly Timetable</h3>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
                      <span>Live Now</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                      <span>Scheduled</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-400"></div>
                      <span>Conflict</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                      <th className="p-3 text-left font-bold text-gray-700 border-r-2 border-gray-300 min-w-[140px] sticky left-0 bg-gray-100 z-10">Time Slot</th>
                      <th className="p-3 text-center font-bold text-gray-700 border-r border-gray-300 min-w-[180px]">Monday</th>
                      <th className="p-3 text-center font-bold text-gray-700 border-r border-gray-300 min-w-[180px]">Tuesday</th>
                      <th className="p-3 text-center font-bold text-gray-700 border-r border-gray-300 min-w-[180px]">Wednesday</th>
                      <th className="p-3 text-center font-bold text-gray-700 border-r border-gray-300 min-w-[180px]">Thursday</th>
                      <th className="p-3 text-center font-bold text-gray-700 border-r border-gray-300 min-w-[180px]">Friday</th>
                      <th className="p-3 text-center font-bold text-gray-700 border-r border-gray-300 min-w-[180px]">Saturday</th>
                      <th className="p-3 text-center font-bold text-gray-700 min-w-[180px]">Sunday</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generateTimeSlots().map((slot, slotIdx) => {
                      const currentTime = new Date();
                      const currentHour = currentTime.getHours();
                      const currentMinute = currentTime.getMinutes();
                      const currentTimeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
                      const isCurrentTimeSlot = currentTimeStr >= slot.start && currentTimeStr < slot.end;
                      const currentDayOfWeek = currentTime.getDay();
                      
                      return (
                        <tr key={slotIdx} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="p-3 font-medium text-gray-700 border-r-2 border-gray-300 sticky left-0 bg-white z-10">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-sm">{slot.label}</span>
                            </div>
                          </td>
                          {[1, 2, 3, 4, 5, 6, 0].map((dayOfWeek) => {
                            const daySlots = (scheduleSlots || []).filter((s: any) => 
                              s.day_of_week === dayOfWeek && 
                              s.start_time >= slot.start && 
                              s.start_time < slot.end
                            );
                            
                            return (
                              <td key={dayOfWeek} className="p-2 border-r border-gray-200 align-top">
                                <div className="space-y-2 min-h-[60px]">
                                  {daySlots.map((scheduleSlot: any) => {
                                    const classInfo = userClasses?.find(c => c.id === scheduleSlot.class_id);
                                    const isLive = isCurrentTimeSlot && currentDayOfWeek === dayOfWeek;
                                    const hasConflict = scheduleSlot.hasConflict || false;
                                    
                                    return (
                                      <div
                                        key={scheduleSlot.id}
                                        className={`p-2 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                                          isLive 
                                            ? 'bg-green-100 border-green-400 ring-2 ring-green-300' 
                                            : hasConflict
                                            ? 'bg-orange-100 border-orange-400 ring-2 ring-orange-300'
                                            : 'bg-blue-50 border-blue-300 hover:border-blue-400'
                                        }`}
                                        onClick={() => {
                                          setSelectedScheduleSlot(scheduleSlot);
                                          setScheduleSlotForm({
                                            classId: scheduleSlot.class_id,
                                            dayOfWeek: scheduleSlot.day_of_week,
                                            startTime: scheduleSlot.start_time,
                                            endTime: scheduleSlot.end_time,
                                            roomNumber: scheduleSlot.room_number || ''
                                          });
                                          setCreateScheduleSlotOpen(true);
                                        }}
                                      >
                                        <div className="font-semibold text-sm text-gray-900">
                                          {classInfo?.subject?.name || 'Unknown Subject'}
                                        </div>
                                        <div className="text-xs text-gray-600 mt-1">
                                          {classInfo?.sectionCode || 'N/A'} • Room {scheduleSlot.room_number || 'TBD'}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                          {formatTime(scheduleSlot.start_time)} - {formatTime(scheduleSlot.end_time)}
                                        </div>
                                        {isLive && (
                                          <div className="flex items-center gap-1 mt-1">
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                            <span className="text-xs font-medium text-green-700">Live</span>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                  {daySlots.length === 0 && (
                                    <div className="text-center text-xs text-gray-400 py-2">
                                      Available
                                    </div>
                                  )}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-5 rounded-xl shadow-lg">
                <div className="text-3xl font-bold mb-1">{scheduleSlots?.length || 0}</div>
                <div className="text-sm font-medium opacity-90">Scheduled Classes</div>
                <div className="text-xs opacity-75 mt-1">This week</div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-5 rounded-xl shadow-lg">
                <div className="text-3xl font-bold mb-1">
                  {scheduleSlots ? Math.max(0, 63 - scheduleSlots.length) : 63}
                </div>
                <div className="text-sm font-medium opacity-90">Available Slots</div>
                <div className="text-xs opacity-75 mt-1">Ready to schedule</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-5 rounded-xl shadow-lg">
                <div className="text-3xl font-bold mb-1">
                  {scheduleSlots ? new Set(scheduleSlots.map((s: any) => s.class?.teacher?.id).filter(Boolean)).size : 0}
                </div>
                <div className="text-sm font-medium opacity-90">Active Teachers</div>
                <div className="text-xs opacity-75 mt-1">This week</div>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-5 rounded-xl shadow-lg">
                <div className="text-3xl font-bold mb-1">0</div>
                <div className="text-sm font-medium opacity-90">Conflicts</div>
                <div className="text-xs opacity-75 mt-1">All clear ✓</div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
            <Button variant="outline" onClick={() => setTimetableManagerOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Schedule Slot Dialog - Rebuilt */}
      <Dialog open={createScheduleSlotOpen} onOpenChange={setCreateScheduleSlotOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {selectedScheduleSlot ? 'Edit Schedule Slot' : 'Create Schedule Slot'}
            </DialogTitle>
            <DialogDescription>
              {selectedScheduleSlot ? 'Update the schedule slot details' : 'Assign a class to a specific day and time slot'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="class-select" className="font-semibold">
                Class <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={scheduleSlotForm.classId} 
                onValueChange={(value) => setScheduleSlotForm(prev => ({ ...prev, classId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  {userClasses?.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.subject?.name || 'Unknown'} - {cls.sectionCode || 'N/A'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="day" className="font-semibold">
                Day of Week <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={scheduleSlotForm.dayOfWeek.toString()} 
                onValueChange={(value) => setScheduleSlotForm(prev => ({ ...prev, dayOfWeek: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Sunday</SelectItem>
                  <SelectItem value="1">Monday</SelectItem>
                  <SelectItem value="2">Tuesday</SelectItem>
                  <SelectItem value="3">Wednesday</SelectItem>
                  <SelectItem value="4">Thursday</SelectItem>
                  <SelectItem value="5">Friday</SelectItem>
                  <SelectItem value="6">Saturday</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start-time" className="font-semibold">
                  Start Time <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="start-time"
                  type="time"
                  value={scheduleSlotForm.startTime}
                  onChange={(e) => setScheduleSlotForm(prev => ({ ...prev, startTime: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end-time" className="font-semibold">
                  End Time <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="end-time"
                  type="time"
                  value={scheduleSlotForm.endTime}
                  onChange={(e) => setScheduleSlotForm(prev => ({ ...prev, endTime: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="room-number" className="font-semibold">
                Room Number (Optional)
              </Label>
              <Input
                id="room-number"
                placeholder="e.g., Room 101, Lab A"
                value={scheduleSlotForm.roomNumber || ''}
                onChange={(e) => setScheduleSlotForm(prev => ({ ...prev, roomNumber: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => {
              setCreateScheduleSlotOpen(false);
              setSelectedScheduleSlot(null);
              setScheduleSlotForm({
                classId: '',
                dayOfWeek: 1,
                startTime: '',
                endTime: '',
                roomNumber: ''
              });
            }}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!scheduleSlotForm.classId || !scheduleSlotForm.startTime || !scheduleSlotForm.endTime) {
                  toast.error('Please fill in all required fields');
                  return;
                }
                if (selectedScheduleSlot) {
                  updateScheduleSlotMutation.mutate({
                    id: selectedScheduleSlot.id,
                    data: scheduleSlotForm
                  });
                } else {
                  createScheduleSlotMutation.mutate(scheduleSlotForm);
                }
              }}
              disabled={createScheduleSlotMutation.isPending || updateScheduleSlotMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {createScheduleSlotMutation.isPending || updateScheduleSlotMutation.isPending 
                ? 'Saving...' 
                : selectedScheduleSlot 
                ? 'Update Slot' 
                : 'Create Slot'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Take Attendance Dialog - Placeholder for now */}
      <Dialog open={takeAttendanceOpen} onOpenChange={setTakeAttendanceOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Take Attendance</DialogTitle>
            <DialogDescription>
              Attendance management features coming soon.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-center text-gray-500">
              Quick attendance taking will be implemented here.
            </p>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setTakeAttendanceOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage Class Dialog */}
      <Dialog open={manageClassOpen} onOpenChange={setManageClassOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Manage Class: {selectedClassForManagement?.subject?.name} - {selectedClassForManagement?.sectionCode}</DialogTitle>
            <DialogDescription>
              View and manage enrolled students for this class.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedClassForManagement && (
              <div className="space-y-4">
                {/* Class Info */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Subject</p>
                    <p className="font-medium">{selectedClassForManagement.subject?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Section</p>
                    <p className="font-medium">{selectedClassForManagement.sectionCode}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Teacher</p>
                    <p className="font-medium">{selectedClassForManagement.teacher?.full_name || 'Not assigned'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Capacity</p>
                    <p className="font-medium">{selectedClassForManagement.capacity}</p>
                  </div>
                </div>

                {/* Student Enrollment Management */}
                <div data-enrollment-section>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium">Student Enrollment</h4>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setAddStudentsDialogOpen(true);
                        setStudentSearchTerm('');
                        setSelectedStudentsForEnrollment([]);
                      }}
                      disabled={(enrolledStudents?.length || 0) >= selectedClassForManagement.capacity}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Students
                    </Button>
                  </div>

                  {/* Enrollment Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{enrolledStudents?.length || 0}</div>
                      <div className="text-xs text-gray-600">Enrolled</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {selectedClassForManagement.capacity - (enrolledStudents?.length || 0)}
                      </div>
                      <div className="text-xs text-gray-600">Available</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-600">{selectedClassForManagement.capacity}</div>
                      <div className="text-xs text-gray-600">Capacity</div>
                    </div>
                  </div>

                  {/* Enrolled Students List */}
                  <div className="border rounded-lg">
                    <div className="p-3 border-b bg-gray-50">
                      <h5 className="font-medium text-sm">Enrolled Students ({enrolledStudents?.length || 0})</h5>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {enrolledStudents && enrolledStudents.length > 0 ? (
                        <div className="divide-y">
                          {enrolledStudents.map((enrollment: any) => {
                            const initials = enrollment.student?.full_name
                              ?.split(' ')
                              .map((n: string) => n[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2) || '?';
                            return (
                              <div key={enrollment.id} className="p-3 flex items-center justify-between hover:bg-gray-50">
                                <div className="flex items-center gap-3">
                                  <Avatar className="w-8 h-8">
                                    <AvatarFallback className="bg-blue-100 text-blue-600">{initials}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium text-sm">{enrollment.student?.full_name || 'Unknown'}</p>
                                    <p className="text-xs text-gray-500">Roll: {enrollment.student?.roll_number || 'N/A'}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className="text-xs">Enrolled</Badge>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                    onClick={() => {
                                      if (window.confirm(`Remove ${enrollment.student?.full_name || 'this student'} from this class?`)) {
                                        unenrollMutation.mutate({
                                          classId: selectedClassForManagement.id,
                                          studentId: enrollment.student_id
                                        });
                                      }
                                    }}
                                    disabled={unenrollMutation.isPending}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-8 text-center text-gray-500">
                          <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No students enrolled yet</p>
                          <p className="text-xs text-gray-400 mt-1">Click "Add Students" to enroll students</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Management Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      setAddStudentsDialogOpen(true);
                      setStudentSearchTerm('');
                      setSelectedStudentsForEnrollment([]);
                    }}
                    disabled={(enrolledStudents?.length || 0) >= selectedClassForManagement.capacity}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Student
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      // Bulk actions - select multiple students from enrolled list
                      if (selectedStudentsForEnrollment.length > 0) {
                        if (window.confirm(`Unenroll ${selectedStudentsForEnrollment.length} selected students?`)) {
                          selectedStudentsForEnrollment.forEach(studentId => {
                            unenrollMutation.mutate({
                              classId: selectedClassForManagement.id,
                              studentId
                            });
                          });
                          setSelectedStudentsForEnrollment([]);
                        }
                      } else {
                        toast.info('Select students first to perform bulk actions');
                      }
                    }}
                    disabled={!enrolledStudents || enrolledStudents.length === 0}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Bulk Actions
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      if (selectedClassForManagement?.id) {
                        exportMutation.mutate(selectedClassForManagement.id);
                      }
                    }}
                    disabled={exportMutation.isPending || !enrolledStudents || enrolledStudents.length === 0}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    {exportMutation.isPending ? 'Exporting...' : 'Export List'}
                  </Button>
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setManageClassOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Students Dialog */}
      <Dialog open={addStudentsDialogOpen} onOpenChange={setAddStudentsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Add Students to Class</DialogTitle>
            <DialogDescription>
              Search and select students to enroll in {selectedClassForManagement?.subject?.name} - {selectedClassForManagement?.sectionCode}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {/* Search Input */}
            <div>
              <Label htmlFor="student-search">Search Students</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="student-search"
                  placeholder="Type student name or roll number..."
                  value={studentSearchTerm}
                  onChange={(e) => setStudentSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  variant="outline" 
                  onClick={() => setStudentSearchTerm('')}
                  disabled={!studentSearchTerm}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Selected Students Count */}
            {selectedStudentsForEnrollment.length > 0 && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-900">
                  {selectedStudentsForEnrollment.length} student{selectedStudentsForEnrollment.length !== 1 ? 's' : ''} selected
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  {selectedClassForManagement.capacity - (enrolledStudents?.length || 0) - selectedStudentsForEnrollment.length} slots remaining
                </p>
              </div>
            )}

            {/* Search Results */}
            <div className="border rounded-lg max-h-64 overflow-y-auto">
              {studentSearchTerm.trim() ? (
                searchResults && searchResults.length > 0 ? (
                  <div className="divide-y">
                    {searchResults.map((student: any) => {
                      const isSelected = selectedStudentsForEnrollment.includes(student.id);
                      const isAlreadyEnrolled = enrolledStudents?.some((e: any) => e.student_id === student.id);
                      const remainingSlots = selectedClassForManagement.capacity - (enrolledStudents?.length || 0);
                      const wouldExceedCapacity = selectedStudentsForEnrollment.length >= remainingSlots && !isSelected;

                      return (
                        <div
                          key={student.id}
                          className={`p-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer ${
                            isAlreadyEnrolled || wouldExceedCapacity ? 'opacity-50' : ''
                          }`}
                          onClick={() => {
                            if (!isAlreadyEnrolled && !wouldExceedCapacity) {
                              if (isSelected) {
                                setSelectedStudentsForEnrollment(prev => prev.filter(id => id !== student.id));
                              } else {
                                if (selectedStudentsForEnrollment.length < remainingSlots) {
                                  setSelectedStudentsForEnrollment(prev => [...prev, student.id]);
                                } else {
                                  toast.warning(`Cannot select more students. Only ${remainingSlots} slots available.`);
                                }
                              }
                            }
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                            }`}>
                              {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{student.full_name}</p>
                              <p className="text-xs text-gray-500">
                                {student.roll_number && `Roll: ${student.roll_number} • `}
                                {student.email}
                              </p>
                            </div>
                          </div>
                          {isAlreadyEnrolled && (
                            <Badge variant="secondary" className="text-xs">Already Enrolled</Badge>
                          )}
                          {wouldExceedCapacity && !isAlreadyEnrolled && (
                            <Badge variant="outline" className="text-xs">Capacity Full</Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No students found</p>
                    <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
                  </div>
                )
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Start typing to search for students</p>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
              setAddStudentsDialogOpen(false);
              setStudentSearchTerm('');
              setSelectedStudentsForEnrollment([]);
            }}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedStudentsForEnrollment.length === 0) {
                  toast.warning('Please select at least one student');
                  return;
                }
                if (selectedClassForManagement?.id) {
                  bulkEnrollMutation.mutate({
                    classId: selectedClassForManagement.id,
                    studentIds: selectedStudentsForEnrollment
                  });
                }
              }}
              disabled={bulkEnrollMutation.isPending || selectedStudentsForEnrollment.length === 0}
            >
              {bulkEnrollMutation.isPending ? 'Enrolling...' : `Enroll ${selectedStudentsForEnrollment.length} Student${selectedStudentsForEnrollment.length !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Subject Dialog */}
      <Dialog open={createSubjectOpen} onOpenChange={setCreateSubjectOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Subject</DialogTitle>
            <DialogDescription>
              Add a new subject to your school's curriculum.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subject-name" className="text-right">
                Name
              </Label>
              <Input
                id="subject-name"
                value={subjectForm.name}
                onChange={(e) => setSubjectForm(prev => ({ ...prev, name: e.target.value }))}
                className="col-span-3"
                placeholder="Mathematics, English, Science..."
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subject-code" className="text-right">
                Code
              </Label>
              <Input
                id="subject-code"
                value={subjectForm.code}
                onChange={(e) => setSubjectForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                className="col-span-3"
                placeholder="MATH, ENG, SCI..."
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="subject-description" className="text-right pt-2">
                Description
              </Label>
              <Textarea
                id="subject-description"
                value={subjectForm.description}
                onChange={(e) => setSubjectForm(prev => ({ ...prev, description: e.target.value }))}
                className="col-span-3"
                placeholder="Subject description..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subject-color" className="text-right">
                Color
              </Label>
              <div className="col-span-3 flex gap-2">
                <Input
                  id="subject-color"
                  type="color"
                  value={subjectForm.color}
                  onChange={(e) => setSubjectForm(prev => ({ ...prev, color: e.target.value }))}
                  className="w-12 h-10 p-1 border rounded"
                />
                <div className="flex gap-1">
                  {['#0D6EFD', '#198754', '#DC3545', '#FFC107', '#6F42C1', '#20C997'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-6 h-6 rounded-full border-2 ${subjectForm.color === color ? 'border-gray-800' : 'border-gray-300'}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSubjectForm(prev => ({ ...prev, color }))}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subject-department" className="text-right">
                Department
              </Label>
              <Select value={subjectForm.department} onValueChange={(value) => setSubjectForm(prev => ({ ...prev, department: value }))}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mathematics">Mathematics</SelectItem>
                  <SelectItem value="sciences">Sciences</SelectItem>
                  <SelectItem value="languages">Languages</SelectItem>
                  <SelectItem value="social-studies">Social Studies</SelectItem>
                  <SelectItem value="arts">Arts</SelectItem>
                  <SelectItem value="physical-education">Physical Education</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subject-grade" className="text-right">
                Grade Level
              </Label>
              <Select value={subjectForm.gradeLevel} onValueChange={(value) => setSubjectForm(prev => ({ ...prev, gradeLevel: value }))}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select grade level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="elementary">Elementary (K-5)</SelectItem>
                  <SelectItem value="middle">Middle School (6-8)</SelectItem>
                  <SelectItem value="high">High School (9-12)</SelectItem>
                  <SelectItem value="all">All Grades</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCreateSubjectOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!subjectForm.name || !subjectForm.code) {
                  toast.error('Please fill in name and code');
                  return;
                }
                createSubjectMutation.mutate(subjectForm);
              }}
              disabled={createSubjectMutation.isPending}
            >
              {createSubjectMutation.isPending ? 'Creating...' : 'Create Subject'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
