# School Management System - Architecture Guide (V2.2)

## Overview
This is a production-ready, AI-Powered School Management System built with modern web technologies and designed for scalability and maintainability.

## Technology Stack

- **Framework**: Next.js (App Router architecture)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **UI Components**: shadcn/ui
- **State Management**: React Context API
- **Icons**: Lucide React

## Project Structure

```
/
├── app/                          # Next.js App Router (to be created)
│   ├── (auth)/                   # Authentication routes
│   │   ├── login/
│   │   └── forgot-password/
│   └── (dashboard)/              # Protected dashboard routes
│       ├── layout.tsx            # Dashboard layout with Sidebar + Topbar
│       ├── admin/
│       ├── teacher/
│       ├── student/
│       └── parent/
├── components/                   # React components
│   ├── auth/                     # Authentication components
│   ├── dashboards/               # Role-specific dashboards
│   ├── layout/                   # Layout components (Sidebar, Topbar)
│   ├── modules/                  # Feature modules
│   │   ├── admin/
│   │   ├── teacher/
│   │   ├── student/
│   │   └── parent/
│   ├── ui/                       # shadcn/ui components
│   ├── AIAssistant.tsx           # AI chatbot component
│   └── AIInsights.tsx            # AI insights component
├── lib/                          # Library code
│   ├── api/                      # API service layer
│   │   ├── auth.ts               # Authentication APIs
│   │   ├── students.ts           # Student management APIs
│   │   ├── assignments.ts        # Assignment APIs
│   │   ├── submissions.ts        # Submission APIs
│   │   ├── leaves.ts             # Leave management APIs
│   │   ├── attendance.ts         # Attendance APIs
│   │   ├── grades.ts             # Grade management APIs
│   │   └── index.ts              # API exports
│   └── supabaseClient.ts         # Supabase client initialization
├── types/                        # TypeScript type definitions
│   └── index.ts                  # All data models and types
├── context/                      # React Context providers
│   └── AppContext.tsx            # Global app state
├── styles/                       # Global styles
│   └── globals.css               # Tailwind + custom CSS
└── public/                       # Static assets
```

## Architecture Layers

### 1. Presentation Layer (Components)
- **Role-based dashboards**: Admin, Teacher, Student, Parent
- **Feature modules**: Attendance, Grades, Assignments, Leave Management, etc.
- **Reusable UI components**: From shadcn/ui library
- **Layout components**: Responsive Sidebar and Topbar

### 2. Service Layer (lib/api)
All backend interactions are abstracted into API service functions:
- Each file contains related API functions
- All functions return `ApiResponse<T>` for consistency
- Mock data provided for development
- Easy to replace with actual Supabase queries

### 3. Data Layer (Supabase)
- **Authentication**: Supabase Auth with email/password (no social login)
- **Database**: PostgreSQL with type-safe queries
- **Storage**: For file uploads (assignments, avatars, documents)
- **Real-time**: Optional real-time subscriptions

### 4. Type Safety (types/)
- Complete TypeScript definitions for all data models
- Form data types for validation
- API response types for consistency
- Strict type checking throughout the app

## Design System

### Colors
```css
--primary: #0D6EFD;       /* Primary Blue - Buttons, Links */
--success: #28A745;        /* Green - Success states */
--ai-accent: #FF9800;      /* Orange - AI features */
--warning: #FFC107;        /* Yellow - Warnings */
```

### Typography
- **Headings**: Roboto
- **Body/Data**: Roboto Condensed

### Responsive Design
- **Mobile-first approach**
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Desktop**: Collapsible sidebar
- **Mobile**: Slide-in menu or bottom navigation

## Role-Based Access Control (RBAC)

### Admin (Full Access)
- User Management (CRUD all users)
- HR & Staff Management
- Inventory & Facility Management
- Finance & Payroll
- Class & Subject Management
- Attendance (Override capability)
- Leave Management (Approve/Reject)
- Reports & Analytics
- Global Communications

### Teacher (Class-Scoped)
- My Classes (Assigned classes only)
- Lesson Planning
- Attendance (Mark for assigned classes)
- Assignments & Grades (For assigned classes)
- Leave Management (Own leave only)
- Communication (With students/parents in classes)

### Student (Own Data Only)
- My Assignments (View and submit)
- My Grades (Personal gradebook)
- My Attendance (Personal calendar)
- Digital Portfolio
- To-Do List
- Leave Management (Apply for own leave)

### Parent (Child's Data Only)
- Child's Progress (View grades/attendance)
- Fee Payment (For their child)
- Leave Management (Apply for child's leave)
- Teacher Communication
- Multiple children support

## AI Features Integration

### AI Teaching Assistant (Teacher)
- Lesson plan suggestions based on student performance
- Auto-grading with confidence scores
- Student performance alerts
- Class performance predictions

### AI Learning Assistant (Student)
- Personalized study recommendations
- Performance predictions
- Assignment prioritization
- Strength analysis

### AI Parent Advisor (Parent)
- Child progress updates
- Attendance alerts
- Learning pattern insights
- Semester forecasts

### AI School Analytics (Admin)
- Enrollment forecasts
- Teacher workload analysis
- Financial health tracking
- Facility optimization

## Core Functional Flows

### 1. Authentication Flow
```typescript
// Login
const result = await signIn({ email, password });
if (result.success) {
  // Redirect to role-specific dashboard
}

// Logout
await signOut();
```

### 2. Student Management (Admin)
```typescript
// Get all students
const students = await getStudents(page, pageSize);

// Add student
const newStudent = await addStudent(formData);

// Update student
const updated = await updateStudent(id, formData);

// Delete student
await deleteStudent(id);
```

### 3. Attendance Marking (Teacher)
```typescript
// Mark attendance for class
const result = await markAttendance({
  classId,
  date,
  records: [
    { studentId: '1', status: 'present' },
    { studentId: '2', status: 'absent', remarks: 'Sick' }
  ],
  markedBy: teacherId
});
```

### 4. Assignment Submission (Student)
```typescript
// Submit assignment
const submission = await submitAssignment({
  assignmentId,
  studentId,
  content: 'My work...',
  attachments: files
});
```

### 5. Leave Management
```typescript
// Apply for leave
const request = await applyForLeave({
  userId,
  userName,
  userRole,
  leaveType: 'sick',
  startDate,
  endDate,
  reason
});

// Admin approves/rejects
await reviewLeaveRequest({
  leaveId,
  status: 'approved',
  reviewerId,
  reviewerName,
  comments
});
```

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Supabase
- Create a Supabase project
- Set up authentication (email/password only)
- Create database tables based on types in `types/index.ts`
- Add environment variables

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
npm start
```

## Migration from Current Structure

The current implementation uses a single-page app structure with `App.tsx`. To migrate to the new Next.js App Router structure:

1. **Create app directory structure** with proper routing
2. **Move components** to role-specific folders
3. **Update imports** to use new API layer from `lib/api`
4. **Replace mock data** with actual Supabase queries
5. **Implement proper authentication** flow
6. **Add middleware** for route protection

## Next Steps for Production

### Database Setup
1. Create Supabase tables for all data models
2. Set up Row Level Security (RLS) policies
3. Create database functions for complex queries
4. Set up indexes for performance

### File Storage
1. Create storage buckets for:
   - User avatars
   - Assignment attachments
   - Student portfolios
   - Documents

### Testing
1. Unit tests for API functions
2. Integration tests for user flows
3. E2E tests with Playwright/Cypress

### Deployment
1. Deploy to Vercel/Netlify
2. Set up CI/CD pipeline
3. Configure environment variables
4. Set up monitoring and analytics

## Best Practices

### Component Organization
- Keep components small and focused
- Use composition over inheritance
- Extract reusable logic into hooks
- Follow naming conventions

### State Management
- Use local state for UI state
- Use Context for global state
- Use Supabase real-time for live data
- Avoid prop drilling

### Error Handling
- Always handle API errors
- Show user-friendly error messages
- Use toast notifications for feedback
- Log errors for debugging

### Performance
- Use React.memo for expensive components
- Implement pagination for large lists
- Lazy load routes and components
- Optimize images and assets

### Security
- Validate all inputs
- Sanitize user data
- Use RBAC for access control
- Keep dependencies updated
- Never expose sensitive keys

## Support & Documentation

- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com
