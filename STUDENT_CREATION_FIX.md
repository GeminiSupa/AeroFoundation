# Student Creation Error - Fixed

## The Problem

When creating a student, you got this error:
```
ERROR: 23502: null value in column "id" of relation "students" violates not-null constraint
```

## Root Cause

The `students` table has a foreign key constraint:
```sql
id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE
```

This means:
1. The `students.id` **MUST** reference an existing `profiles.id`
2. A profile must be created FIRST before creating a student record

## The Solution

### Option 1: Use the User Creation API (Recommended)

I've created a new API function `createUser` in `src/lib/api/users.ts` that:
1. Creates the auth user
2. Waits for the profile to be auto-created by the trigger
3. Creates the student record with the correct profile ID

**Use this for creating users programmatically from your app.**

### Option 2: Manual Database Insert

When inserting test data manually:

1. **First**, get the profile ID:
```sql
SELECT id, email, role FROM profiles WHERE email = 'student@test.com';
```

2. **Then**, use that ID to create the student:
```sql
INSERT INTO public.students (id, roll_number, class_id, section, date_of_birth, gender, parent_id, status)
VALUES (
  'PROFILE_ID_FROM_STEP_1',  -- Must be an existing profile ID
  'STU001',
  'CLASS_ID_HERE',
  'A',
  '2005-05-15'::DATE,
  'male',
  'PARENT_PROFILE_ID',
  'active'
);
```

3. **Better yet**, use a query:
```sql
WITH student_profile AS (
  SELECT id FROM public.profiles WHERE email = 'student@test.com' LIMIT 1
),
parent_profile AS (
  SELECT id FROM public.profiles WHERE email = 'parent@test.com' LIMIT 1
),
class_data AS (
  SELECT id FROM public.classes WHERE name = '10A' LIMIT 1
)
INSERT INTO public.students (id, roll_number, class_id, section, date_of_birth, gender, parent_id, status)
SELECT 
  sp.id,
  'STU001',
  c.id,
  'A',
  '2005-05-15'::DATE,
  'male',
  pp.id,
  'active'
FROM student_profile sp, parent_profile pp, class_data c;
```

## Quick Test Data Setup

1. **Create auth users in Supabase Dashboard**:
   - Go to Authentication > Users
   - Add: admin@test.com, teacher@test.com, student@test.com, parent@test.com
   - Set passwords and "Auto Confirm" to ON

2. **Run this SQL to create test records**:
```sql
-- Add sample classes first
INSERT INTO public.classes (name, section, grade, room, capacity, enrolled, schedule, subjects)
VALUES
  ('10A', 'A', 10, 'Room 201', 30, 0, 'Mon-Fri 8:00 AM', ARRAY['Mathematics', 'Science']),
  ('10B', 'B', 10, 'Room 202', 30, 0, 'Mon-Fri 8:00 AM', ARRAY['Mathematics', 'Science']);

-- Get profile IDs (replace emails with your actual test emails)
WITH profiles_data AS (
  SELECT 
    (SELECT id FROM profiles WHERE email = 'teacher@test.com' LIMIT 1) as teacher_id,
    (SELECT id FROM profiles WHERE email = 'student@test.com' LIMIT 1) as student_id,
    (SELECT id FROM profiles WHERE email = 'parent@test.com' LIMIT 1) as parent_id,
    (SELECT id FROM classes WHERE name = '10A' LIMIT 1) as class_id
)
SELECT * FROM profiles_data;  -- View the IDs

-- Create teacher record (replace ID from above)
INSERT INTO public.teachers (id, employee_id, department, subject, qualification, experience, phone, date_of_joining, salary, status)
SELECT 
  id,
  'EMP001',
  'Mathematics',
  'Mathematics',
  'M.Sc',
  5,
  '+1234567890',
  NOW() - INTERVAL '2 years',
  50000,
  'active'
FROM profiles WHERE email = 'teacher@test.com'
ON CONFLICT DO NOTHING;

-- Create student record (replace IDs from above)
INSERT INTO public.students (id, roll_number, class_id, section, date_of_birth, gender, parent_id, status)
SELECT 
  student.id,
  'STU001',
  (SELECT id FROM classes WHERE name = '10A' LIMIT 1),
  'A',
  '2005-05-15'::DATE,
  'male',
  parent.id,
  'active'
FROM profiles student
CROSS JOIN LATERAL (SELECT id FROM profiles WHERE email = 'parent@test.com' LIMIT 1) parent
WHERE student.email = 'student@test.com'
ON CONFLICT DO NOTHING;
```

## Complete Setup Guide

See `SETUP_COMPLETE.md` for the full step-by-step setup instructions including:
1. Supabase project creation
2. Database migration
3. Auth user creation
4. Test data setup

## Using the API in Your App

```typescript
import { useCreateUser } from '../../hooks/useUsers';

function AddStudentForm() {
  const createUser = useCreateUser();

  const handleSubmit = async () => {
    await createUser.mutateAsync({
      email: 'student@test.com',
      password: 'securepassword123',
      full_name: 'John Doe',
      role: 'student',
      additional_data: {
        roll_number: 'STU001',
        class_id: 'CLASS_ID_HERE',
        section: 'A',
        date_of_birth: '2005-05-15',
        gender: 'male',
        parent_id: 'PARENT_ID_HERE',
      },
    });
  };
}
```

This will automatically:
1. Create auth user
2. Create profile via trigger
3. Create student record with proper ID linkage

No more null ID errors! ✅

