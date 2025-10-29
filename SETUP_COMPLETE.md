# Production Setup Guide

## Overview

This document provides step-by-step instructions to set up your School Management System with Supabase authentication and database.

## Prerequisites

1. **Supabase Account**: Create a free account at [supabase.com](https://supabase.com)
2. **Node.js**: Version 18 or higher
3. **npm or yarn**: Package manager

## Step 1: Supabase Project Setup

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" or "New project"
3. Fill in your project details:
   - Name: `ai-sms` (or your preferred name)
   - Database Password: Choose a strong password
   - Region: Select closest to you
4. Wait for your project to be created (2-3 minutes)

### 1.2 Get Your API Keys

1. Go to Project Settings (gear icon on the sidebar)
2. Click on "API" in the left menu
3. Copy these values:
   - `Project URL` (under Project URL section)
   - `anon` `public` key (under Project API keys)

### 1.3 Configure Authentication

1. Go to Authentication > Settings
2. **IMPORTANT**: Disable the following:
   - Click the "Disable" button next to "Enable email signup" (you want only allowed users to sign up)
   - Disable all OAuth providers (Google, GitHub, etc.) if you don't need them
3. Save changes

## Step 2: Database Setup

### 2.1 Run SQL Migration

1. Go to SQL Editor in your Supabase dashboard (left sidebar)
2. Click "New query"
3. Open the file `database_setup.sql` from your project root
4. Copy the entire contents
5. Paste into the SQL editor
6. Click "Run" or press `Cmd/Ctrl + Enter`
7. Wait for the query to complete (you should see a success message)

This will create:
- `allowed_users` table (controls who can sign up)
- `profiles` table (user profiles linked to auth.users)
- All core tables (classes, students, teachers, grades, attendance, etc.)
- Row Level Security (RLS) policies for security
- Triggers to automatically create profiles

### 2.2 Verify Tables

1. Go to "Table Editor" in Supabase dashboard
2. You should see these tables:
   - `allowed_users`
   - `profiles`
   - `classes`
   - `students`
   - `teachers`
   - `subjects`
   - `grades`
   - `attendance`
   - `leave_requests`
   - `notifications`

## Step 3: Environment Variables

1. Create a `.env` file in the root of your project:

```bash
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Important**: Replace `your_project_url_here` and `your_anon_key_here` with the actual values from Step 1.2

Example:
```
VITE_SUPABASE_URL=https://xyz123.supabase.co
VITE_SUPABASE_ANON_KEY=REDACTED_ANON_KEY
```

## Step 4: Create Test Users

### 4.1 Add Users to Allowed List

The `allowed_users` table already has these test users:
- `admin@test.com`
- `teacher@test.com`
- `student@test.com`
- `parent@test.com`

### 4.2 Create Auth Users

You need to manually create these users in Supabase:

1. Go to Authentication > Users
2. Click "Add user" → "Create new user"
3. Create each user with these details:

**Admin User**:
- Email: `admin@test.com`
- Password: `admin123` (or your preferred password)
- Auto Confirm User: ✅ (check this box)
- Click "Create user"

**Teacher User**:
- Email: `teacher@test.com`
- Password: `teacher123`
- Auto Confirm User: ✅
- Click "Create user"

**Student User**:
- Email: `student@test.com`
- Password: `student123`
- Auto Confirm User: ✅
- Click "Create user"

**Parent User**:
- Email: `parent@test.com`
- Password: `parent123`
- Auto Confirm User: ✅
- Click "Create user"

### 4.3 Verify Profiles

1. Go to Table Editor
2. Select the `profiles` table
3. You should see 4 profiles automatically created (one for each user you just created)

## Step 5: Run the Application

### 5.1 Install Dependencies

```bash
npm install
```

### 5.2 Start Development Server

```bash
npm run dev
```

The application should start on `http://localhost:3000`

### 5.3 Build for Production

```bash
npm run build
```

The build output will be in the `build/` directory.

## Step 6: Testing the Login

1. Open `http://localhost:3000`
2. You should see the login page
3. Try logging in with:
   - Email: `admin@test.com`
   - Password: `admin123`
4. You should be redirected to the admin dashboard
5. Try logging in with other test users

## Security Features Implemented

### 1. Email Authorization
- Only users in `allowed_users` table can sign up
- Trigger blocks unauthorized sign-ups at the database level

### 2. Row Level Security (RLS)
- All tables have RLS enabled
- Users can only access data they're authorized to see
- Students can only see their own grades
- Teachers can only manage their classes
- Admins have full access

### 3. Automatic Profile Creation
- Profile is automatically created when a user signs up
- Links to auth.users via foreign key

## Troubleshooting

### "Profile not found" error
- Make sure the user exists in `allowed_users` table
- Check that the profile was created (should happen automatically)

### Can't sign up
- Make sure email signup is disabled in Supabase settings
- Use the password you set in Supabase dashboard (not creating a new account)

### "Email not authorized"
- Add the email to `allowed_users` table manually
- Or enable email signup in Supabase settings (not recommended)

### Authentication token issues
- Clear browser cache and cookies
- Check that VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are correct in `.env`

## Next Steps

### Development
1. Add real students, teachers, and classes data
2. Implement CRUD operations for each module
3. Add more RLS policies as needed

### Production Deployment
1. Set up environment variables on your hosting platform
2. Configure custom domain
3. Enable SSL/HTTPS
4. Set up database backups

## Architecture Overview

### Frontend
- **React 18**: UI framework
- **Vite**: Build tool
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **React Router**: Routing
- **TanStack Query**: Data fetching
- **React Hook Form + Zod**: Form management
- **shadcn/ui**: UI components

### Backend
- **Supabase**: Authentication, database, and storage
- **PostgreSQL**: Database
- **Row Level Security**: Security policies

## Support

If you encounter issues:
1. Check the browser console for errors
2. Check Supabase logs (Dashboard > Logs)
3. Verify environment variables
4. Ensure database migrations completed successfully

