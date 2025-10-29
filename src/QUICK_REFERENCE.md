# Quick Reference Card - School Management System V2.2

## 🚀 Common Tasks

### Authentication

```typescript
// Login
import { signIn } from '@/lib/api/auth';
const result = await signIn({ email, password });

// Logout
import { signOut } from '@/lib/api/auth';
await signOut();

// Get current user
import { getCurrentUserProfile } from '@/lib/api/auth';
const user = await getCurrentUserProfile();
```

### Students

```typescript
import { getStudents, addStudent, updateStudent, deleteStudent } from '@/lib/api/students';

// List students (paginated)
const students = await getStudents(1, 50);

// Add student
const newStudent = await addStudent({
  name: 'John Doe',
  email: 'john@school.com',
  class: '10',
  section: 'A',
  // ... other fields
});

// Update student
await updateStudent('student-id', { name: 'Jane Doe' });

// Delete student
await deleteStudent('student-id');
```

### Assignments

```typescript
import { createAssignment, getStudentAssignments } from '@/lib/api/assignments';

// Create assignment
const assignment = await createAssignment({
  title: 'Homework',
  description: 'Complete chapter 5',
  classId: '10A',
  subject: 'Math',
  dueDate: '2025-10-30',
  maxScore: 100
});

// Get student's assignments
const assignments = await getStudentAssignments('student-id');
```

### Submissions

```typescript
import { submitAssignment, gradeSubmission } from '@/lib/api/submissions';

// Submit assignment
const submission = await submitAssignment({
  assignmentId: 'assignment-id',
  studentId: 'student-id',
  content: 'My answer...',
  attachments: [file1, file2]
});

// Grade submission
await gradeSubmission({
  submissionId: 'submission-id',
  grade: 85,
  feedback: 'Good work!'
});
```

### Attendance

```typescript
import { markAttendance, getStudentAttendanceStats } from '@/lib/api/attendance';

// Mark attendance
await markAttendance({
  classId: '10A',
  date: '2025-10-27',
  records: [
    { studentId: 'id1', status: 'present' },
    { studentId: 'id2', status: 'absent' }
  ],
  markedBy: 'teacher-id'
});

// Get stats
const stats = await getStudentAttendanceStats('student-id');
// Returns: { totalDays, presentDays, percentage, ... }
```

### Grades

```typescript
import { addGrade, getStudentGrades } from '@/lib/api/grades';

// Add grade
await addGrade({
  studentId: 'student-id',
  subject: 'Math',
  examType: 'midterm',
  score: 85,
  maxScore: 100,
  date: '2025-10-20',
  teacherId: 'teacher-id'
});

// Get student grades
const grades = await getStudentGrades('student-id');
```

### Leave Management

```typescript
import { applyForLeave, reviewLeaveRequest } from '@/lib/api/leaves';

// Apply for leave
await applyForLeave({
  userId: 'user-id',
  userName: 'John Doe',
  userRole: 'student',
  leaveType: 'sick',
  startDate: '2025-10-28',
  endDate: '2025-10-30',
  reason: 'Flu'
});

// Admin approve/reject
await reviewLeaveRequest({
  leaveId: 'leave-id',
  status: 'approved',
  reviewerId: 'admin-id',
  reviewerName: 'Admin',
  comments: 'Approved'
});
```

## 🎨 UI Components

### AI Insights
```typescript
import { AIInsights } from '@/components/AIInsights';

<AIInsights role="teacher" />
// Roles: 'admin' | 'teacher' | 'student' | 'parent'
```

### Toasts
```typescript
import { toast } from 'sonner@2.0.3';

toast.success('Success message');
toast.error('Error message');
toast.info('Info message');
toast.warning('Warning message');
```

### Dialogs
```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    {/* Content */}
  </DialogContent>
</Dialog>
```

### Forms
```typescript
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

<div className="space-y-4">
  <div>
    <Label htmlFor="name">Name</Label>
    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
  </div>
  
  <div>
    <Label htmlFor="description">Description</Label>
    <Textarea id="description" rows={5} />
  </div>
  
  <div>
    <Label>Select Option</Label>
    <Select onValueChange={setValue}>
      <SelectTrigger>
        <SelectValue placeholder="Choose..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="1">Option 1</SelectItem>
        <SelectItem value="2">Option 2</SelectItem>
      </SelectContent>
    </Select>
  </div>
  
  <Button onClick={handleSubmit}>Submit</Button>
</div>
```

## 📝 TypeScript Types

### Import Types
```typescript
import type { 
  Student,
  Teacher,
  Assignment,
  Submission,
  Grade,
  AttendanceRecord,
  LeaveRequest,
  UserProfile,
  ApiResponse
} from '@/types';
```

### Use Types
```typescript
const [student, setStudent] = useState<Student | null>(null);
const [assignments, setAssignments] = useState<Assignment[]>([]);
const [loading, setLoading] = useState<boolean>(false);

const handleSubmit = async (): Promise<void> => {
  const result: ApiResponse<Student> = await addStudent(data);
  if (result.success) {
    setStudent(result.data!);
  }
};
```

## 🎯 Error Handling Pattern

```typescript
const handleAction = async () => {
  try {
    setLoading(true);
    
    const result = await apiFunction(params);
    
    if (result.success) {
      toast.success(result.message || 'Success!');
      // Update state
      // Close modal
      // Refresh data
    } else {
      toast.error(result.error);
    }
  } catch (error) {
    console.error('Error:', error);
    toast.error('An unexpected error occurred');
  } finally {
    setLoading(false);
  }
};
```

## 🔐 Role-Based Rendering

```typescript
import { useApp } from '@/context/AppContext';

function MyComponent() {
  const { user } = useApp();
  
  return (
    <>
      {user?.role === 'admin' && <AdminSection />}
      {user?.role === 'teacher' && <TeacherSection />}
      {user?.role === 'student' && <StudentSection />}
      {user?.role === 'parent' && <ParentSection />}
    </>
  );
}
```

## 📊 Data Fetching Pattern

```typescript
import { useEffect, useState } from 'react';

function DataComponent() {
  const [data, setData] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await getDataFromAPI();
      
      if (result.success) {
        setData(result.data);
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return <div>{/* Render data */}</div>;
}
```

## 🎨 Tailwind Common Classes

```typescript
// Containers
className="p-6 space-y-6"
className="flex items-center justify-between"
className="grid grid-cols-1 md:grid-cols-3 gap-4"

// Cards
className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"

// Buttons
className="bg-blue-600 hover:bg-blue-700 text-white"
className="bg-orange-500 hover:bg-orange-600"  // AI features

// Text
className="text-sm text-muted-foreground"
className="text-lg font-semibold"

// Spacing
className="space-y-4"  // Vertical spacing
className="flex gap-2"  // Horizontal gap
```

## 🔧 Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 📱 Responsive Design

```typescript
// Mobile first approach
className="w-full md:w-1/2 lg:w-1/3"
className="flex-col md:flex-row"
className="hidden md:block"  // Hide on mobile
className="md:hidden"  // Show only on mobile
```

## 🎨 Color Scheme

```typescript
Primary Blue:   #0D6EFD  bg-blue-600
Success Green:  #28A745  bg-green-500
AI Orange:      #FF9800  bg-orange-500
Warning Yellow: #FFC107  bg-yellow-500
```

## 📦 File Structure

```
/lib/api/          - API functions
/types/            - TypeScript types
/components/       - React components
  /ui/             - shadcn/ui components
  /dashboards/     - Role dashboards
  /modules/        - Feature modules
  /layout/         - Layout components
/context/          - React Context
/styles/           - Global styles
```

## 🚨 Common Pitfalls

❌ **Don't**: Access data without checking success
```typescript
const result = await getData();
setData(result.data);  // May be undefined!
```

✅ **Do**: Always check success
```typescript
const result = await getData();
if (result.success) {
  setData(result.data);
}
```

---

❌ **Don't**: Forget loading states
```typescript
const data = await getData();
```

✅ **Do**: Show loading indicator
```typescript
setLoading(true);
const data = await getData();
setLoading(false);
```

---

❌ **Don't**: Ignore errors
```typescript
await submitData(form);
```

✅ **Do**: Handle errors
```typescript
const result = await submitData(form);
if (!result.success) {
  toast.error(result.error);
}
```

## 📚 Useful Links

- [Supabase Docs](https://supabase.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev)

## 🎯 Quick Commands

```bash
# Development
npm run dev

# Build
npm run build

# Start production
npm start

# Format code
npm run format

# Lint
npm run lint
```

---

**Last Updated**: October 27, 2025  
**Version**: 2.2
