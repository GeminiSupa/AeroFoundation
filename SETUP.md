# AI School Management System - Setup Guide

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account

## Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Supabase**
   
   Create a `.env` file in the root directory:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

## Supabase Setup

This application requires Supabase authentication to be configured. Here's how to set it up:

### 1. Create Supabase Project
- Go to [supabase.com](https://supabase.com)
- Create a new project
- Note your project URL and anon key

### 2. Database Tables Required
You'll need to create the following tables in your Supabase database:

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'student', 'parent')),
  avatar TEXT,
  class TEXT,
  employee_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Student-User Link
```sql
CREATE TABLE student_parents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES users(id),
  parent_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Row Level Security (RLS)
Enable RLS on your tables to secure the data:

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read their own data
CREATE POLICY "Users can read own data"
ON users FOR SELECT
USING (auth.uid() = id);

-- Policy to allow admins to read all data
CREATE POLICY "Admins can read all users"
ON users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);
```

### 4. Authentication
- Go to Authentication > Settings in your Supabase dashboard
- Enable Email authentication
- Configure email templates if needed

## Demo Mode

The application includes a demo mode that works without Supabase authentication. This is useful for development and testing.

To use demo mode:
- Enter any email and password
- Select your role (admin, teacher, student, or parent)
- Click Login

## Features

### Admin Features
- User management
- HR & Staff management
- Inventory management
- Class management
- Scheduling
- Leave management
- Finance management
- Reports & Analytics
- Audit logs
- Announcements
- Messages
- AI Tools

### Teacher Features
- Classes & Students
- Lesson Planning
- Leave requests
- Announcements
- Messages
- Settings

### Student Features
- Dashboard
- To-Do & Assignments
- Grades
- Attendance
- Portfolio
- Leave requests
- Announcements
- Messages
- Settings

### Parent Features
- Child Progress
- Fee Payments
- Child Leave requests
- Announcements
- Messages
- Settings

## Troubleshooting

### Build Errors
If you encounter build errors:
1. Make sure all dependencies are installed: `npm install`
2. Check that `.env` file exists with correct credentials
3. Run `npm run build` to see detailed error messages

### Authentication Issues
If authentication is not working:
1. Verify your Supabase credentials in `.env`
2. Check Supabase dashboard for authentication settings
3. Try demo mode if Supabase is not configured

### Port Already in Use
If port 3000 is already in use, edit `vite.config.ts` to change the port:
```typescript
server: {
  port: 3001, // Change to your preferred port
}
```

## Support

For issues and questions, please refer to the documentation files in the `src/` directory:
- `README.md` - Main documentation
- `API_DOCUMENTATION.md` - API reference
- `ARCHITECTURE.md` - System architecture
- `TESTING_GUIDE.md` - Testing guidelines

