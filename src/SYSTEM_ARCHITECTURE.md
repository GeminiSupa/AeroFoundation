# School Management System - Architecture Overview

Complete technical architecture for the AI-Powered School Management System V2.2

## 🏗️ System Architecture

### Technology Stack

**Frontend Framework**: React 18+ with TypeScript  
**Styling**: Tailwind CSS v4.0  
**UI Components**: shadcn/ui  
**State Management**: React Context API  
**Routing**: Client-side routing with page-based navigation  
**Icons**: Lucide React  
**Notifications**: Sonner (toast notifications)  
**Charts**: Recharts  
**Date Handling**: Native JavaScript Date API  

---

## 📁 Project Structure

```
/
├── App.tsx                      # Main application component with routing
├── components/
│   ├── AIAssistant.tsx         # Global AI chatbot
│   ├── auth/
│   │   └── LoginPage.tsx       # Authentication page
│   ├── dashboards/
│   │   ├── AdminDashboard.tsx      # Admin role dashboard
│   │   ├── TeacherDashboard.tsx    # Teacher role dashboard
│   │   ├── StudentDashboard.tsx    # Student role dashboard
│   │   └── ParentDashboard.tsx     # Parent role dashboard
│   ├── layout/
│   │   ├── Sidebar.tsx         # Role-based navigation
│   │   └── Topbar.tsx          # Global header with notifications
│   ├── modules/
│   │   ├── [Admin Modules]
│   │   ├── [Teacher Modules]
│   │   ├── [Student Modules]
│   │   └── [Parent Modules]
│   └── ui/                     # shadcn/ui components
├── context/
│   └── AppContext.tsx          # Global state management
├── styles/
│   └── globals.css             # Global styles and CSS variables
└── types.ts                    # TypeScript type definitions
```

---

## 🎯 Core Concepts

### 1. Role-Based Access Control (RBAC)

The system implements strict RBAC where:
- Each user has ONE primary role: Admin, Teacher, Student, or Parent
- Navigation menu items filter based on user role
- Page access is controlled via routing
- Data visibility is role-specific

```typescript
// User type definition
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'student' | 'parent';
  // Role-specific data...
}
```

### 2. Page-Based Routing

Routes follow pattern: `{role}-{module}`
- `admin-dashboard` → AdminDashboard
- `teacher-leave` → TeacherLeavePage
- `student-grades` → StudentGradesPage
- `parent-fees` → ParentFeePaymentPage

### 3. Context-Based State

Global state managed via React Context:
```typescript
interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
}
```

---

## 🔐 Authentication Flow

```
┌─────────────┐
│ Login Page  │
└──────┬──────┘
       │
       ├─ Email/Password validation
       ├─ Role detection
       │
       ▼
┌──────────────┐
│ Set User in  │
│   Context    │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ Route to Role    │
│   Dashboard      │
└──────────────────┘
```

**Mock Credentials**:
- Admin: admin@school.edu / admin123
- Teacher: teacher@school.edu / teacher123
- Student: student@school.edu / student123
- Parent: parent@school.edu / parent123

---

## 👥 User Roles & Permissions

### Admin (Full Access)
**Modules**: 14 total
- Dashboard, Users, HR & Staff, Inventory, AI Tools
- Classes, Scheduling, Leave Management (full approval)
- Finance & Payroll, Reports, Audit Logs
- Announcements, Messages, Settings

**Permissions**:
- ✅ Create/Read/Update/Delete all entities
- ✅ Approve/Reject leave requests
- ✅ Access all system logs
- ✅ Manage all users
- ✅ Configure system settings

### Teacher (Class-Focused)
**Modules**: 7 total
- Dashboard, Classes, Lesson Planning
- Leave Management (apply only)
- Announcements, Messages, Settings

**Permissions**:
- ✅ Manage own classes
- ✅ Create lesson plans
- ✅ Grade student work
- ✅ Mark attendance for own classes
- ✅ Apply for own leave
- ❌ Cannot approve leave
- ❌ Cannot access other teachers' data
- ❌ No user management

### Student (Personal Data Only)
**Modules**: 9 total
- Dashboard, My To-Do, My Grades, My Attendance
- Portfolio, Apply Leave
- Announcements, Messages, Settings

**Permissions**:
- ✅ View own academic records
- ✅ Submit assignments
- ✅ Apply for leave
- ✅ Manage personal portfolio
- ❌ Cannot see other students' data
- ❌ No administrative access

### Parent (Child-Scoped)
**Modules**: 6 total
- Dashboard (with fee payment)
- Child's Progress, Apply Leave (for child)
- Announcements, Messages, Settings

**Permissions**:
- ✅ View child's academic data
- ✅ Pay child's fees
- ✅ Apply leave for child
- ✅ Book teacher meetings
- ❌ Cannot access other students' data
- ❌ No dedicated finance module access

---

## 🧩 Module Architecture

### Module Types

1. **Dashboard Modules**: Role-specific overview pages
2. **CRUD Modules**: Full create/read/update/delete functionality
3. **View-Only Modules**: Read access only
4. **Apply-Only Modules**: Submit requests only
5. **Shared Modules**: Accessible by multiple roles with different permissions

### Example: Leave Management

```
┌─────────────────────────────────────┐
│      Leave Management Module        │
└─────────────────┬───────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
    ┌───▼────┐       ┌──────▼──────┐
    │ Admin  │       │   Teacher   │
    │ View   │       │    View     │
    └───┬────┘       └──────┬──────┘
        │                   │
        │                   │
  ┌─────▼─────┐       ┌─────▼─────┐
  │Full CRUD  │       │Apply Only │
  │+ Approve  │       │+ View Own │
  │+ Reject   │       │  Requests │
  └───────────┘       └───────────┘
```

**Admin Version** (`LeaveManagementPage.tsx`):
- View all teacher/student leave requests
- Approve/Reject buttons
- Statistics dashboard
- Filtering and search

**Teacher Version** (`TeacherLeavePage.tsx`):
- Apply for own leave
- View own request history
- Leave balance display
- NO approve/reject functionality

---

## 🎨 Design System

### Color Palette

```css
/* Primary Colors */
--primary-blue: #0D6EFD;      /* CTAs, links, active states */
--secondary-blue: #1E90FF;    /* Hover states */

/* AI Features */
--ai-orange: #FF9800;         /* All AI-related elements */
--info-teal: #20C997;         /* AI panels, insights */

/* Status Colors */
--success-green: #28A745;     /* Success, approved, positive */
--warning-yellow: #FFC107;    /* Warning, pending, attention */
--error-red: #DC3545;         /* Error, rejected, critical */

/* Neutral Colors */
--gray-50: #F9FAFB;
--gray-800: #1F2937;
--gray-900: #111827;
```

### Typography

```css
/* Font Family */
font-family: 'Roboto', sans-serif;
font-family: 'Roboto Condensed', sans-serif; /* For data tables */

/* Predefined in globals.css - DO NOT override with Tailwind */
h1 { font-size: 2rem; font-weight: 700; }
h2 { font-size: 1.5rem; font-weight: 600; }
h3 { font-size: 1.25rem; font-weight: 600; }
p  { font-size: 1rem; line-height: 1.5; }
```

### Component Patterns

**Cards**:
```tsx
<Card className="bg-gray-800 border-gray-700">
  <CardHeader>
    <CardTitle className="text-white">Title</CardTitle>
    <CardDescription className="text-gray-400">Description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

**Buttons**:
```tsx
{/* Primary CTA */}
<Button className="bg-blue-600 hover:bg-blue-700">Action</Button>

{/* AI Feature */}
<Button className="bg-orange-500 hover:bg-orange-600">
  <Sparkles className="mr-2 h-4 w-4" />
  AI Feature
</Button>
```

**Status Badges**:
```tsx
<Badge className="bg-green-500/10 text-green-500">Approved</Badge>
<Badge className="bg-yellow-500/10 text-yellow-500">Pending</Badge>
<Badge className="bg-red-500/10 text-red-500">Rejected</Badge>
```

---

## 🤖 AI Integration Points

### 1. Predictive Intervention Alerts
**Location**: Admin & Teacher Dashboards  
**Trigger**: Automatic based on student data  
**Display**: Warning widget with CTA  
**Action**: Shows suggested interventions modal

### 2. Curriculum Gap Analysis
**Location**: Teacher Grading Module  
**Trigger**: After grading assessment  
**Display**: Panel showing top 3 struggling topics  
**Action**: Links to lesson planning suggestions

### 3. AI Lesson Plan Generator
**Location**: Teacher Lesson Planning  
**Trigger**: Manual button click  
**Display**: Modal with input fields  
**Action**: Generates comprehensive lesson plan

### 4. AI Learning Recommendations
**Location**: Student Dashboard & Grades  
**Trigger**: Based on low performance  
**Display**: Widget with resource suggestions  
**Action**: Links to practice materials

### 5. AI Sentiment Analysis
**Location**: Messaging System  
**Trigger**: Automatic on message send  
**Display**: Badge showing tone (positive/neutral/negative)  
**Purpose**: Help detect concerning communications

### 6. Dynamic Report Card Narratives
**Location**: Teacher Grading  
**Trigger**: Button click  
**Display**: Auto-generated comment in text field  
**Action**: Teacher can edit before saving

### 7. AI Schedule Optimizer
**Location**: Admin Scheduling  
**Trigger**: Manual optimization button  
**Display**: Loading state → confirmation modal  
**Action**: Optimizes room/resource allocation

### 8. AI Grade Prediction
**Location**: Parent Dashboard  
**Trigger**: Automatic  
**Display**: Progress trend with prediction  
**Purpose**: Show expected final grade

---

## 🔄 Data Flow

### Typical User Action Flow

```
User Action (e.g., "Submit Leave Request")
            ↓
    Component Handler
            ↓
    Validation Layer
            ↓
    [Backend API Call] ← (Future: Currently mock)
            ↓
    Update Local State
            ↓
    Show Toast Notification
            ↓
    Update UI with new data
```

### State Management Flow

```
        ┌──────────────┐
        │  AppContext  │
        └───────┬──────┘
                │
    ┌───────────┼───────────┐
    │           │           │
┌───▼───┐  ┌───▼───┐  ┌───▼───┐
│ User  │  │ Theme │  │ Page  │
└───┬───┘  └───┬───┘  └───┬───┘
    │          │          │
    └──────────┴──────────┘
               │
        Used by all components
```

---

## 📊 Mock Data Strategy

Currently, all data is mocked in components for demonstration:

```typescript
// Example mock data structure
const mockStudents = [
  {
    id: '1',
    name: 'John Smith',
    grade: 10,
    attendance: 95,
    averageGrade: 87,
    // ...
  }
];
```

**Future**: Replace with API calls
```typescript
// Future implementation
const { data, isLoading } = useFetch('/api/students');
```

---

## 🔔 Notification System

### Toast Notifications (Sonner)

```typescript
import { toast } from 'sonner@2.0.3';

// Success
toast.success('Action completed!', {
  description: 'Additional details...'
});

// Error
toast.error('Action failed!', {
  description: 'Error details...'
});

// Info
toast.info('Information...', {
  description: 'More details...'
});
```

### Usage Pattern
- **Success**: After successful CRUD operation
- **Error**: On validation failure or network error
- **Info**: For general notifications
- **Warning**: For important reminders

---

## 🎯 Performance Considerations

### Current Optimizations
- ✅ Component-level code splitting
- ✅ Lazy loading of heavy components
- ✅ Memoization of expensive computations
- ✅ Conditional rendering to reduce DOM size

### Future Optimizations
- Virtual scrolling for large tables
- Image optimization and lazy loading
- API response caching
- Debouncing search inputs
- Pagination for large datasets

---

## 🔒 Security Architecture

### Current Implementation
- Role-based UI rendering
- Client-side route protection
- Input sanitization (basic)

### Production Requirements
- JWT token authentication
- HTTPS enforcement
- CSRF protection
- XSS prevention
- SQL injection prevention (backend)
- Rate limiting
- Session management
- Audit logging
- Data encryption at rest

---

## 📱 Responsive Design

### Breakpoints
```css
/* Mobile */
@media (max-width: 640px) { ... }

/* Tablet */
@media (min-width: 768px) and (max-width: 1024px) { ... }

/* Desktop */
@media (min-width: 1024px) { ... }
```

### Grid System
- Desktop: 12-column grid
- Tablet: 8-column grid
- Mobile: 4-column grid (stacked)

### Navigation
- Desktop: Fixed sidebar + topbar
- Tablet: Collapsible sidebar
- Mobile: Drawer/hamburger menu

---

## 🧪 Testing Strategy

### Unit Tests (Future)
- Component rendering
- Business logic functions
- Utility functions

### Integration Tests (Future)
- User flows
- API integrations
- State management

### E2E Tests (Future)
- Complete user journeys
- Cross-browser testing
- Accessibility testing

---

## 🚀 Deployment Considerations

### Build Process
```bash
npm run build
```

### Environment Variables
```env
REACT_APP_API_URL=https://api.school.edu
REACT_APP_SUPABASE_URL=...
REACT_APP_SUPABASE_KEY=...
```

### Production Checklist
- [ ] Minification enabled
- [ ] Source maps generated
- [ ] Environment variables set
- [ ] API endpoints configured
- [ ] Error tracking setup
- [ ] Analytics integrated
- [ ] CDN for static assets
- [ ] SSL certificate installed

---

## 📚 Dependencies

### Core
- `react` - UI framework
- `react-dom` - DOM rendering
- `typescript` - Type safety

### UI
- `tailwindcss` - Styling
- `lucide-react` - Icons
- `sonner` - Toast notifications
- `recharts` - Charts

### Utilities
- `date-fns` - Date formatting (optional)
- `clsx` - Conditional classnames

### Development
- `vite` - Build tool
- `eslint` - Code linting
- `prettier` - Code formatting

---

## 🔄 Version History

- **V2.2** (Current) - RBAC corrections, Library removal, functional flows
- **V2.0** - Major feature expansion, 50+ new features
- **V1.0** - Initial implementation with basic RBAC

---

## 📞 Support & Documentation

- **Architecture**: This document
- **Features**: `/NEW_FEATURES.md`
- **V2.2 Changes**: `/V2.2_CHANGES.md`
- **Testing**: `/TESTING_GUIDE.md`
- **Code Guidelines**: `/guidelines/Guidelines.md`

---

**Last Updated**: October 19, 2025  
**System Version**: V2.2  
**Architecture Status**: Production-Ready (Mock Data)
