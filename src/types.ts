export type UserRole = 'admin' | 'teacher' | 'student' | 'parent';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  class?: string;
  children?: Student[];
}

export interface Student {
  id: string;
  name: string;
  email?: string;
  class: string;
  section?: string;
  rollNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  phone?: string;
  admissionDate?: string;
  status?: string;
  photo?: string;
  attendance?: number;
  averageGrade?: number;
  [key: string]: any;
}

export interface Class {
  id: string;
  name: string;
  teacher: string;
  students: number;
  schedule: string;
}

export interface Leave {
  id: string;
  applicant: string;
  role: UserRole;
  dates: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Assignment {
  id: string;
  title: string;
  description?: string;
  classId?: string;
  className?: string;
  teacherId?: string;
  teacherName?: string;
  subject?: string;
  maxScore?: number;
  createdAt?: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded' | 'draft';
  grade?: number;
  [key: string]: any;
}

export interface Notification {
  id: string;
  type: 'system' | 'alert' | 'info';
  message: string;
  time: string;
  read: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Form Data Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface StudentFormData {
  name: string;
  email: string;
  class: string;
  section: string;
  rollNumber: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  phone: string;
  parentId?: string;
}

export interface AssignmentFormData {
  title: string;
  description: string;
  classId: string;
  subject: string;
  dueDate: string;
  maxScore: number;
  attachments?: File[];
}

export interface LeaveFormData {
  leaveType: 'sick' | 'casual' | 'emergency' | 'vacation' | 'other';
  startDate: string;
  endDate: string;
  reason: string;
}

export interface GradeFormData {
  studentId: string;
  subject: string;
  examType: 'quiz' | 'midterm' | 'final' | 'assignment' | 'project';
  score: number;
  maxScore: number;
  date: string;
  remarks?: string;
}

// Extended Types from index.ts
export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  remarks?: string;
  markedBy: string;
  markedAt: string;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  leaveType: 'sick' | 'casual' | 'emergency' | 'vacation' | 'other';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewComments?: string;
}

export interface Grade {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  subject: string;
  examType: 'quiz' | 'midterm' | 'final' | 'assignment' | 'project';
  score: number;
  maxScore: number;
  percentage: number;
  date: string;
  teacherId: string;
  remarks?: string;
}
