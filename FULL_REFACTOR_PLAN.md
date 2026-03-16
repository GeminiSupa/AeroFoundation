# Complete Refactor Plan - School Management System

## Current Status

✅ **Foundation Complete**
- Authentication system working
- Database schema designed
- React Router implemented
- TanStack Query configured
- Protected routes working

🔄 **Current Phase: Full Feature Implementation**

## Implementation Phases

### Phase 1: Core UI & Database Setup (Active Now)

#### 1.1 Enhanced Database Schema
Extend the database with:
- `payroll` table
- `fee_structures` table  
- `fee_payments` table
- `student_portfolios` table
- `timetable_entries` table
- `library_books` table
- `book_checkouts` table
- `transport_routes` table
- `internal_messages` table

#### 1.2 Mobile-First Refactoring
- Convert all pages to mobile-first
- Implement Sheet for mobile navigation
- Implement Drawer for mobile dialogs
- Make all tables responsive (card view on mobile)
- Use theme variables throughout

#### 1.3 Real Data Integration
- Remove all mock data
- Connect all components to TanStack Query
- Implement proper loading/error states
- Add skeleton loaders

### Phase 2: Admin Features

#### 2.1 User Management
- Add user to `allowed_users` form
- User CRUD dashboard
- Profile management
- Role assignments

#### 2.2 Finance Hub
- Fee structures CRUD
- Fee payment tracking
- Payment reminders
- Financial reports

#### 2.3 Payroll System
- Salary management
- Deduction calculations
- Payment history
- Monthly payroll reports

#### 2.4 Academic Management
- Timetabling system
- Admissions management
- Class scheduling

#### 2.5 Operations
- Library management
- Transportation management
- Inventory tracking

### Phase 3: Teacher Features

#### 3.1 Academic Tools
- Grade entry forms
- Assignment management
- Attendance marking
- Student profiles view

#### 3.2 Classroom Tools
- Lesson planning
- Class timetable view
- Student attendance overview

#### 3.3 Communication
- Parent meetings booking
- Internal messaging

### Phase 4: Student Features

#### 4.1 Dashboard
- Personal timetable
- Upcoming assignments
- Recent grades charts

#### 4.2 Portfolio
- File uploads
- Project management
- Public portfolio preview

#### 4.3 Academics
- Grades view
- Attendance records
- Assignment submissions

#### 4.4 Resources
- Library book search
- Course materials

### Phase 5: Parent Features

#### 5.1 Dashboard
- Child-switcher for multiple children
- Visual charts (attendance, grades, fees)
- AI weekly summary

#### 5.2 Academics
- Child's timetable
- Grades and attendance
- Assignments

#### 5.3 Finance
- Fee invoices
- Payment history
- Online payment gateway (Stripe/PayPal)

#### 5.4 Communication
- Parent-teacher meetings
- Real-time notifications

### Phase 6: AI Integration

#### 6.1 Teacher AI Tools
- Lesson plan generator
- Quiz generator
- Grade analytics

#### 6.2 Student AI Tools
- AI Tutor chatbot
- Portfolio advisor
- Study plan generator

#### 6.3 Parent AI Tools
- Weekly summary generator
- Academic insights

#### 6.4 Admin AI Tools
- Natural language analytics
- Predictive insights
- Performance predictions
- Financial forecasting

## Technical Stack

### Frontend
- React 18 with TypeScript
- TanStack Query v5
- React Hook Form + Zod
- shadcn/ui components
- Tailwind CSS (mobile-first)
- React Router v6

### Backend
- Supabase (PostgreSQL)
- Row Level Security (RLS)
- Database triggers
- Storage for file uploads

### AI Integration
- Google Gemini API
- OpenAI API (optional)
- LangChain for orchestration

### Payment Integration
- Stripe for card payments
- PayPal SDK
- Bank transfer processing

## Implementation Timeline

**Week 1: Foundation**
- Enhanced database schema
- Mobile-first refactoring
- TanStack Query integration

**Week 2: Admin Core**
- User management
- Finance basics
- Payroll system

**Week 3: Teacher & Student**
- Academic tools
- Portfolio system
- Resource management

**Week 4: Parent & AI**
- Parent features
- Payment gateway
- AI integration

**Week 5: Polish & Testing**
- Mobile optimization
- Performance tuning
- E2E testing

## Next Immediate Steps

1. **Extend Database Schema** (database_setup.sql)
2. **Refactor AnnouncementsPage** (example for all pages)
3. **Implement mobile navigation** (Sheet component)
4. **Add TanStack Query hooks** for all data
5. **Create reusable form components**

Starting implementation now...
