# Migration Guide: V2.2 Production-Ready Structure

## Overview
This guide explains how to migrate from the current single-page application structure to the new production-ready Next.js App Router architecture.

## What's New in V2.2

### ✅ Completed
1. **Supabase Client Setup** (`/lib/supabaseClient.ts`)
   - Singleton client instance
   - Helper functions for auth operations
   - Ready for production use

2. **Complete Type Definitions** (`/types/index.ts`)
   - All data models defined
   - Form data types
   - API response types
   - Strict TypeScript throughout

3. **API Service Layer** (`/lib/api/`)
   - `auth.ts` - Authentication operations
   - `students.ts` - Student management
   - `assignments.ts` - Assignment CRUD
   - `submissions.ts` - Assignment submissions
   - `leaves.ts` - Leave management
   - `attendance.ts` - Attendance tracking
   - `grades.ts` - Grade management
   - All functions return consistent `ApiResponse<T>`

4. **AI Insights Component**
   - Role-based intelligent predictions
   - Integrated across all dashboards
   - Confidence scores and actionable insights

### 🚧 To Be Migrated

The following components need to be updated to use the new API layer:

## Step-by-Step Migration

### Phase 1: Update Existing Components to Use API Layer

#### 1. Update Login Component
**File**: `/components/auth/LoginPage.tsx`

**Current**: Uses mock authentication
**New**: Use the API layer

```typescript
// Import the API function
import { signIn } from '../../lib/api/auth';

// In handleSubmit:
const result = await signIn({ email, password });
if (result.success) {
  toast.success('Login successful!');
  // Update context with user profile
  login(result.data!);
} else {
  toast.error(result.error || 'Login failed');
}
```

#### 2. Update Student Management
**File**: `/components/modules/UsersPage.tsx`

```typescript
import { getStudents, addStudent, updateStudent, deleteStudent } from '../../lib/api/students';

// Fetch students
const result = await getStudents(page, pageSize);
if (result.success) {
  setStudents(result.data.data);
  setTotalPages(result.data.totalPages);
}

// Add student
const result = await addStudent(formData);
if (result.success) {
  toast.success(result.message);
  refreshStudents();
}
```

#### 3. Update Attendance Module
**File**: `/components/modules/teacher/AttendancePage.tsx` (needs to be created)

```typescript
import { markAttendance, getClassAttendance } from '../../lib/api/attendance';

// Mark attendance
const result = await markAttendance({
  classId: selectedClass,
  date: selectedDate,
  records: attendanceRecords,
  markedBy: userId
});
```

#### 4. Update Assignment Creation
**File**: `/components/modules/ClassesPage.tsx`

```typescript
import { createAssignment } from '../../lib/api/assignments';

const handleCreateAssignment = async () => {
  const result = await createAssignment({
    title: assignmentTitle,
    description: assignmentDescription,
    classId: selectedClass,
    subject: selectedSubject,
    dueDate: dueDate,
    maxScore: maxScore,
    attachments: uploadedFiles
  });
  
  if (result.success) {
    toast.success(result.message);
    // Reset form
  }
};
```

#### 5. Update Leave Management
**Files**: 
- `/components/modules/student/StudentLeavePage.tsx`
- `/components/modules/teacher/TeacherLeavePage.tsx`
- `/components/modules/parent/ParentChildLeavePage.tsx`
- `/components/modules/LeaveManagementPage.tsx` (Admin)

```typescript
import { applyForLeave, getUserLeaveRequests, reviewLeaveRequest } from '../../lib/api/leaves';

// Apply for leave (Student/Teacher/Parent)
const result = await applyForLeave({
  userId: user.id,
  userName: user.name,
  userRole: user.role,
  leaveType: formData.leaveType,
  startDate: formData.startDate,
  endDate: formData.endDate,
  reason: formData.reason
});

// Admin approve/reject
const result = await reviewLeaveRequest({
  leaveId: leave.id,
  status: 'approved',
  reviewerId: admin.id,
  reviewerName: admin.name,
  comments: reviewComments
});
```

### Phase 2: Create Next.js App Router Structure (Future)

When ready to migrate to full Next.js App Router:

#### 1. Create App Directory Structure
```
/app
  /(auth)
    /login
      page.tsx          # Login page
    /forgot-password
      page.tsx          # Password reset page
    layout.tsx          # Auth layout (centered, no sidebar)
  
  /(dashboard)
    layout.tsx          # Dashboard layout (Sidebar + Topbar)
    /admin
      page.tsx          # Admin dashboard
      /users
        page.tsx        # User management
      /hr
        page.tsx        # HR & Staff
      /finance
        page.tsx        # Finance
      ...
    /teacher
      page.tsx          # Teacher dashboard
      /classes
        page.tsx        # Classes
      /lesson-planning
        page.tsx        # Lesson planning
      ...
    /student
      page.tsx          # Student dashboard
      /assignments
        page.tsx        # Assignments
      /grades
        page.tsx        # Grades
      ...
    /parent
      page.tsx          # Parent dashboard
      /child-progress
        page.tsx        # Child progress
      /fees
        page.tsx        # Fee payment
      ...
```

#### 2. Create Middleware for Route Protection
**File**: `/middleware.ts`

```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  // Redirect to login if not authenticated
  if (!session && !req.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  
  // Role-based route protection
  const userRole = session?.user?.user_metadata?.role;
  const path = req.nextUrl.pathname;
  
  if (path.startsWith('/admin') && userRole !== 'admin') {
    return NextResponse.redirect(new URL(`/${userRole}`, req.url));
  }
  
  // Add similar checks for other roles
  
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

#### 3. Update Components to Use Server/Client Components
```typescript
// Server Component (for data fetching)
// app/(dashboard)/admin/users/page.tsx
import { getStudents } from '@/lib/api/students';

export default async function UsersPage() {
  const result = await getStudents();
  
  return <UsersTable initialData={result.data} />;
}

// Client Component (for interactivity)
'use client';

import { useState } from 'react';

export function UsersTable({ initialData }) {
  const [students, setStudents] = useState(initialData);
  // ...interactive logic
}
```

### Phase 3: Replace Mock Data with Supabase

#### 1. Create Database Tables

Run these SQL commands in Supabase SQL Editor:

```sql
-- Users/Profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'student', 'parent')),
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Students
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  class TEXT NOT NULL,
  section TEXT NOT NULL,
  roll_number TEXT UNIQUE NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  address TEXT,
  phone TEXT,
  parent_id UUID REFERENCES profiles(id),
  admission_date DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'graduated')),
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assignments
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  class_id TEXT NOT NULL,
  teacher_id UUID REFERENCES profiles(id) NOT NULL,
  subject TEXT NOT NULL,
  due_date DATE NOT NULL,
  max_score INTEGER NOT NULL,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Continue for other tables...
```

#### 2. Set Up Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Admin can see all
CREATE POLICY "Admins can view all students"
  ON students FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Students can only see themselves
CREATE POLICY "Students can view own data"
  ON students FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()
  );

-- Parents can see their children
CREATE POLICY "Parents can view their children"
  ON students FOR SELECT
  TO authenticated
  USING (
    parent_id = auth.uid()
  );

-- Continue for other policies...
```

#### 3. Update API Functions

Replace mock data in `/lib/api/students.ts`:

```typescript
export async function getStudents(page = 1, pageSize = 50) {
  try {
    const { data, error, count } = await supabase
      .from('students')
      .select('*', { count: 'exact' })
      .range((page - 1) * pageSize, page * pageSize - 1)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      success: true,
      data: {
        data: data as Student[],
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch students',
    };
  }
}
```

## Testing the Migration

### 1. Test Authentication
```bash
# Create a test user in Supabase Auth
# Try logging in with the new API
```

### 2. Test Each API Function
```typescript
// In a test file or component
const testStudentAPI = async () => {
  const result = await getStudents();
  console.log('Students:', result);
};
```

### 3. Test RBAC
- Login as different roles
- Verify correct data visibility
- Test unauthorized access attempts

## Checklist

- [ ] All components use new API layer
- [ ] No direct Supabase queries in components
- [ ] All forms call API functions on submit
- [ ] Toast notifications for all actions
- [ ] Error handling in place
- [ ] Loading states implemented
- [ ] Database tables created
- [ ] RLS policies configured
- [ ] Environment variables set
- [ ] Types match database schema

## Troubleshooting

### Issue: API functions not working
**Solution**: Check Supabase environment variables in `.env.local`

### Issue: RLS blocking queries
**Solution**: Review RLS policies, ensure user has proper role

### Issue: Type errors
**Solution**: Ensure types in `/types/index.ts` match database schema

### Issue: File uploads failing
**Solution**: Create storage buckets in Supabase, set up proper policies

## Additional Resources

- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)

## Support

If you encounter issues during migration, refer to:
1. `/ARCHITECTURE.md` for architecture overview
2. Supabase documentation
3. Next.js documentation
4. Component examples in `/components`
