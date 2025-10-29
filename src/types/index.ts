// User Roles
export type UserRole = 'admin' | 'teacher' | 'student' | 'parent';

// Login Form Data
export interface LoginFormData {
  email: string;
  password: string;
}

// User Profile
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  // Role-specific fields
  class?: string; // For students
  employeeId?: string; // For teachers and staff
  children?: ChildProfile[]; // For parents
}

// Child Profile (for Parents)
export interface ChildProfile {
  id: string;
  name: string;
  class: string;
  rollNumber: string;
  attendance: number;
  performance: number;
}

// Student
export interface Student {
  id: string;
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
  admissionDate: string;
  status: 'active' | 'inactive' | 'graduated';
  avatar?: string;
}

// Teacher/Staff
export interface Teacher {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  department: string;
  subject?: string;
  qualification: string;
  experience: number;
  phone: string;
  dateOfJoining: string;
  salary: number;
  status: 'active' | 'on-leave' | 'inactive';
  avatar?: string;
}

// Class
export interface Class {
  id: string;
  name: string;
  section: string;
  grade: number;
  teacherId: string;
  teacherName: string;
  room: string;
  capacity: number;
  enrolled: number;
  schedule: string;
  subjects: string[];
}

// Assignment
export interface Assignment {
  id: string;
  title: string;
  description: string;
  classId: string;
  className: string;
  teacherId: string;
  teacherName: string;
  subject: string;
  dueDate: string;
  maxScore: number;
  attachments?: string[];
  createdAt: string;
  status: 'draft' | 'published' | 'closed';
}

// Submission
export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  content: string;
  attachments?: string[];
  submittedAt: string;
  grade?: number;
  feedback?: string;
  status: 'pending' | 'graded' | 'late';
}

// Grade
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

// Attendance
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

// Leave Request
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

// Lesson Plan
export interface LessonPlan {
  id: string;
  teacherId: string;
  teacherName: string;
  classId: string;
  className: string;
  subject: string;
  topic: string;
  objectives: string[];
  activities: string[];
  materials: string[];
  duration: number; // in minutes
  date: string;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

// Fee Record
export interface FeeRecord {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  feeType: 'tuition' | 'transport' | 'library' | 'lab' | 'exam' | 'other';
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'pending' | 'paid' | 'overdue' | 'waived';
  paymentMethod?: 'cash' | 'card' | 'bank-transfer' | 'online';
  transactionId?: string;
}

// Inventory Item
export interface InventoryItem {
  id: string;
  name: string;
  category: 'furniture' | 'electronics' | 'books' | 'sports' | 'lab-equipment' | 'other';
  quantity: number;
  location: string;
  condition: 'new' | 'good' | 'fair' | 'damaged';
  purchaseDate: string;
  cost: number;
  supplier?: string;
  lastMaintenance?: string;
  assignedTo?: string;
}

// Announcement
export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  targetRoles: UserRole[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  publishDate: string;
  expiryDate?: string;
  status: 'draft' | 'published' | 'expired';
  attachments?: string[];
}

// Message
export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  recipientId: string;
  recipientName: string;
  recipientRole: UserRole;
  subject: string;
  content: string;
  sentAt: string;
  readAt?: string;
  status: 'unread' | 'read' | 'archived';
}

// AI Insight
export interface AIInsight {
  id: string;
  type: 'prediction' | 'recommendation' | 'alert' | 'analysis';
  category: 'academic' | 'attendance' | 'financial' | 'operational';
  title: string;
  description: string;
  confidence: number; // 0-100
  affectedUsers?: string[];
  actionRequired: boolean;
  createdAt: string;
  expiresAt?: string;
  metadata?: Record<string, any>;
}

// Report
export interface Report {
  id: string;
  title: string;
  type: 'attendance' | 'academic' | 'financial' | 'custom';
  generatedBy: string;
  generatedAt: string;
  parameters: Record<string, any>;
  data: any;
  format: 'pdf' | 'excel' | 'csv';
  fileUrl?: string;
}

// Audit Log
export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entity: string;
  entityId: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  timestamp: string;
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
