# API Documentation - School Management System V2.2

## Overview

All API functions are located in `/lib/api/` directory and return a consistent `ApiResponse<T>` type for predictable error handling.

## Response Format

### Success Response
```typescript
{
  success: true,
  data: T,
  message?: string
}
```

### Error Response
```typescript
{
  success: false,
  error: string
}
```

### Paginated Response
```typescript
{
  success: true,
  data: {
    data: T[],
    total: number,
    page: number,
    pageSize: number,
    totalPages: number
  }
}
```

---

## Authentication API (`/lib/api/auth.ts`)

### signIn()
Sign in with email and password.

**Parameters:**
```typescript
{
  email: string;
  password: string;
}
```

**Response:** `ApiResponse<UserProfile>`

**Example:**
```typescript
import { signIn } from '@/lib/api/auth';

const result = await signIn({
  email: 'user@school.com',
  password: 'password123'
});

if (result.success) {
  console.log('User:', result.data);
} else {
  console.error('Error:', result.error);
}
```

---

### signOut()
Sign out the current user.

**Response:** `ApiResponse<void>`

**Example:**
```typescript
import { signOut } from '@/lib/api/auth';

const result = await signOut();
if (result.success) {
  console.log('Signed out successfully');
}
```

---

### getCurrentUserProfile()
Get the current authenticated user's profile.

**Response:** `ApiResponse<UserProfile>`

**Example:**
```typescript
import { getCurrentUserProfile } from '@/lib/api/auth';

const result = await getCurrentUserProfile();
if (result.success) {
  console.log('Current user:', result.data);
}
```

---

### requestPasswordReset()
Request a password reset email.

**Parameters:**
```typescript
email: string
```

**Response:** `ApiResponse<void>`

**Example:**
```typescript
import { requestPasswordReset } from '@/lib/api/auth';

const result = await requestPasswordReset('user@school.com');
```

---

## Students API (`/lib/api/students.ts`)

### getStudents()
Get all students with pagination (Admin only).

**Parameters:**
```typescript
page?: number = 1
pageSize?: number = 50
```

**Response:** `ApiResponse<PaginatedResponse<Student>>`

**Example:**
```typescript
import { getStudents } from '@/lib/api/students';

const result = await getStudents(1, 50);
if (result.success) {
  console.log('Students:', result.data.data);
  console.log('Total:', result.data.total);
}
```

---

### getStudentById()
Get a single student by ID.

**Parameters:**
```typescript
id: string
```

**Response:** `ApiResponse<Student>`

**Example:**
```typescript
import { getStudentById } from '@/lib/api/students';

const result = await getStudentById('student-id-123');
```

---

### addStudent()
Add a new student (Admin only).

**Parameters:**
```typescript
{
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
```

**Response:** `ApiResponse<Student>`

**Example:**
```typescript
import { addStudent } from '@/lib/api/students';

const result = await addStudent({
  name: 'John Doe',
  email: 'john.doe@school.com',
  class: '10',
  section: 'A',
  rollNumber: 'S001',
  dateOfBirth: '2008-05-15',
  gender: 'male',
  address: '123 Main St',
  phone: '+1234567890'
});
```

---

### updateStudent()
Update student information (Admin only).

**Parameters:**
```typescript
id: string
data: Partial<StudentFormData>
```

**Response:** `ApiResponse<Student>`

---

### deleteStudent()
Delete a student (Admin only).

**Parameters:**
```typescript
id: string
```

**Response:** `ApiResponse<void>`

---

### getStudentsByClass()
Get all students in a specific class (Teacher access).

**Parameters:**
```typescript
classId: string
```

**Response:** `ApiResponse<Student[]>`

**Example:**
```typescript
import { getStudentsByClass } from '@/lib/api/students';

const result = await getStudentsByClass('10A');
```

---

## Assignments API (`/lib/api/assignments.ts`)

### getTeacherAssignments()
Get all assignments created by a teacher.

**Parameters:**
```typescript
teacherId: string
```

**Response:** `ApiResponse<Assignment[]>`

**Example:**
```typescript
import { getTeacherAssignments } from '@/lib/api/assignments';

const result = await getTeacherAssignments('teacher-id');
```

---

### getStudentAssignments()
Get all assignments for a student.

**Parameters:**
```typescript
studentId: string
```

**Response:** `ApiResponse<Assignment[]>`

---

### createAssignment()
Create a new assignment (Teacher only).

**Parameters:**
```typescript
{
  title: string;
  description: string;
  classId: string;
  subject: string;
  dueDate: string;
  maxScore: number;
  attachments?: File[];
}
```

**Response:** `ApiResponse<Assignment>`

**Example:**
```typescript
import { createAssignment } from '@/lib/api/assignments';

const result = await createAssignment({
  title: 'Chapter 5 Homework',
  description: 'Complete problems 1-15',
  classId: '10A',
  subject: 'Mathematics',
  dueDate: '2025-10-25',
  maxScore: 100
});
```

---

### updateAssignment()
Update an existing assignment (Teacher only).

**Parameters:**
```typescript
id: string
data: Partial<AssignmentFormData>
```

**Response:** `ApiResponse<Assignment>`

---

### deleteAssignment()
Delete an assignment (Teacher only).

**Parameters:**
```typescript
id: string
```

**Response:** `ApiResponse<void>`

---

### getAssignmentById()
Get assignment details by ID.

**Parameters:**
```typescript
id: string
```

**Response:** `ApiResponse<Assignment>`

---

## Submissions API (`/lib/api/submissions.ts`)

### submitAssignment()
Submit an assignment (Student only).

**Parameters:**
```typescript
{
  assignmentId: string;
  studentId: string;
  content: string;
  attachments?: File[];
}
```

**Response:** `ApiResponse<Submission>`

**Example:**
```typescript
import { submitAssignment } from '@/lib/api/submissions';

const result = await submitAssignment({
  assignmentId: 'assignment-123',
  studentId: 'student-456',
  content: 'My solution to the problems...',
  attachments: [file1, file2]
});
```

---

### getAssignmentSubmissions()
Get all submissions for an assignment (Teacher only).

**Parameters:**
```typescript
assignmentId: string
```

**Response:** `ApiResponse<Submission[]>`

---

### getStudentSubmission()
Get a specific student's submission for an assignment.

**Parameters:**
```typescript
assignmentId: string
studentId: string
```

**Response:** `ApiResponse<Submission | null>`

---

### gradeSubmission()
Grade a student's submission (Teacher only).

**Parameters:**
```typescript
{
  submissionId: string;
  grade: number;
  feedback?: string;
}
```

**Response:** `ApiResponse<Submission>`

**Example:**
```typescript
import { gradeSubmission } from '@/lib/api/submissions';

const result = await gradeSubmission({
  submissionId: 'submission-789',
  grade: 85,
  feedback: 'Good work! Consider reviewing question 5.'
});
```

---

## Leave Management API (`/lib/api/leaves.ts`)

### applyForLeave()
Apply for leave (Student/Teacher/Parent).

**Parameters:**
```typescript
{
  userId: string;
  userName: string;
  userRole: string;
  leaveType: 'sick' | 'casual' | 'emergency' | 'vacation' | 'other';
  startDate: string;
  endDate: string;
  reason: string;
}
```

**Response:** `ApiResponse<LeaveRequest>`

**Example:**
```typescript
import { applyForLeave } from '@/lib/api/leaves';

const result = await applyForLeave({
  userId: 'user-123',
  userName: 'John Doe',
  userRole: 'student',
  leaveType: 'sick',
  startDate: '2025-10-25',
  endDate: '2025-10-27',
  reason: 'Flu symptoms'
});
```

---

### getUserLeaveRequests()
Get all leave requests for a user.

**Parameters:**
```typescript
userId: string
```

**Response:** `ApiResponse<LeaveRequest[]>`

---

### getPendingLeaveRequests()
Get all pending leave requests (Admin only).

**Response:** `ApiResponse<LeaveRequest[]>`

---

### reviewLeaveRequest()
Approve or reject a leave request (Admin only).

**Parameters:**
```typescript
{
  leaveId: string;
  status: 'approved' | 'rejected';
  reviewerId: string;
  reviewerName: string;
  comments?: string;
}
```

**Response:** `ApiResponse<LeaveRequest>`

**Example:**
```typescript
import { reviewLeaveRequest } from '@/lib/api/leaves';

const result = await reviewLeaveRequest({
  leaveId: 'leave-123',
  status: 'approved',
  reviewerId: 'admin-456',
  reviewerName: 'Admin User',
  comments: 'Approved. Get well soon!'
});
```

---

### cancelLeaveRequest()
Cancel a leave request.

**Parameters:**
```typescript
leaveId: string
```

**Response:** `ApiResponse<void>`

---

## Attendance API (`/lib/api/attendance.ts`)

### markAttendance()
Mark attendance for a class (Teacher only).

**Parameters:**
```typescript
{
  classId: string;
  date: string;
  records: Array<{
    studentId: string;
    status: 'present' | 'absent' | 'late' | 'excused';
    remarks?: string;
  }>;
  markedBy: string;
}
```

**Response:** `ApiResponse<AttendanceRecord[]>`

**Example:**
```typescript
import { markAttendance } from '@/lib/api/attendance';

const result = await markAttendance({
  classId: '10A',
  date: '2025-10-27',
  records: [
    { studentId: 'student-1', status: 'present' },
    { studentId: 'student-2', status: 'absent', remarks: 'Sick' },
    { studentId: 'student-3', status: 'late' }
  ],
  markedBy: 'teacher-123'
});
```

---

### getClassAttendance()
Get attendance for a class on a specific date.

**Parameters:**
```typescript
classId: string
date: string
```

**Response:** `ApiResponse<AttendanceRecord[]>`

---

### getStudentAttendance()
Get attendance history for a student.

**Parameters:**
```typescript
studentId: string
startDate?: string
endDate?: string
```

**Response:** `ApiResponse<AttendanceRecord[]>`

---

### getStudentAttendanceStats()
Get attendance statistics for a student.

**Parameters:**
```typescript
studentId: string
```

**Response:** `ApiResponse<{ totalDays, presentDays, absentDays, lateDays, percentage }>`

**Example:**
```typescript
import { getStudentAttendanceStats } from '@/lib/api/attendance';

const result = await getStudentAttendanceStats('student-123');
if (result.success) {
  console.log(`Attendance: ${result.data.percentage}%`);
}
```

---

### updateAttendance()
Update an attendance record.

**Parameters:**
```typescript
recordId: string
status: 'present' | 'absent' | 'late' | 'excused'
remarks?: string
```

**Response:** `ApiResponse<AttendanceRecord>`

---

## Grades API (`/lib/api/grades.ts`)

### addGrade()
Add a new grade (Teacher only).

**Parameters:**
```typescript
{
  studentId: string;
  subject: string;
  examType: 'quiz' | 'midterm' | 'final' | 'assignment' | 'project';
  score: number;
  maxScore: number;
  date: string;
  remarks?: string;
  teacherId: string;
}
```

**Response:** `ApiResponse<Grade>`

**Example:**
```typescript
import { addGrade } from '@/lib/api/grades';

const result = await addGrade({
  studentId: 'student-123',
  subject: 'Mathematics',
  examType: 'midterm',
  score: 85,
  maxScore: 100,
  date: '2025-10-20',
  remarks: 'Good performance',
  teacherId: 'teacher-456'
});
```

---

### getStudentGrades()
Get all grades for a student.

**Parameters:**
```typescript
studentId: string
```

**Response:** `ApiResponse<Grade[]>`

---

### getClassGrades()
Get all grades for a class (Teacher only).

**Parameters:**
```typescript
classId: string
subject?: string
```

**Response:** `ApiResponse<Grade[]>`

---

### updateGrade()
Update a grade (Teacher only).

**Parameters:**
```typescript
gradeId: string
data: Partial<GradeFormData>
```

**Response:** `ApiResponse<Grade>`

---

### deleteGrade()
Delete a grade (Teacher only).

**Parameters:**
```typescript
gradeId: string
```

**Response:** `ApiResponse<void>`

---

### getStudentGradeStats()
Get grade statistics for a student.

**Parameters:**
```typescript
studentId: string
```

**Response:** `ApiResponse<{ averagePercentage, totalGrades, subjectAverages }>`

---

## Error Handling

All API functions follow consistent error handling:

```typescript
try {
  const result = await someAPIFunction(params);
  
  if (result.success) {
    // Handle success
    console.log(result.data);
    toast.success(result.message || 'Success!');
  } else {
    // Handle error
    console.error(result.error);
    toast.error(result.error);
  }
} catch (error) {
  // Handle unexpected errors
  console.error('Unexpected error:', error);
  toast.error('An unexpected error occurred');
}
```

## Type Safety

All API functions are fully typed with TypeScript:

```typescript
import type { ApiResponse, Student } from '@/types';

const result: ApiResponse<Student> = await getStudentById('123');
```

## Best Practices

1. **Always check `result.success`** before accessing data
2. **Show user feedback** with toast notifications
3. **Handle loading states** during API calls
4. **Log errors** for debugging
5. **Validate input** before calling APIs
6. **Use TypeScript** for type safety

## Rate Limiting

Consider implementing rate limiting in production:
- Use Supabase's built-in rate limiting
- Implement client-side debouncing
- Cache frequently accessed data

## Authentication

Most API calls require authentication. Ensure user is authenticated before calling:

```typescript
import { getCurrentUserProfile } from '@/lib/api/auth';

const user = await getCurrentUserProfile();
if (!user.success) {
  // Redirect to login
  router.push('/login');
  return;
}

// Proceed with API call
const result = await getStudents();
```

## Next Steps

1. Replace mock data with actual Supabase queries
2. Implement file upload to Supabase Storage
3. Add real-time subscriptions for live updates
4. Implement caching strategies
5. Add comprehensive error logging

---

**Last Updated**: October 27, 2025
