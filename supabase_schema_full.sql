-- =====================================================
-- AI SCHOOL MANAGEMENT SYSTEM - FULL SCHEMA
-- =====================================================
-- Run this in your Supabase SQL Editor (new project).
-- Then update .env.local with your project URL and anon key.
-- =====================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. AUTH & PROFILES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.allowed_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'student', 'parent', 'owner', 'super_admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Allow owner/super_admin in case schema was applied with old CHECK
DO $$
BEGIN
  ALTER TABLE public.allowed_users DROP CONSTRAINT IF EXISTS allowed_users_role_check;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;
ALTER TABLE public.allowed_users ADD CONSTRAINT allowed_users_role_check CHECK (role IN ('admin', 'teacher', 'student', 'parent', 'owner', 'super_admin'));

-- Seed allowed_users with your own real users in Supabase SQL Editor.
-- Example:
-- INSERT INTO public.allowed_users (email, role) VALUES
--   ('admin@your-school.com', 'admin');

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'student', 'parent', 'owner', 'super_admin')),
  phone TEXT,
  address TEXT,
  date_of_birth TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure profiles role CHECK includes owner/super_admin (for existing DBs)
DO $$
BEGIN
  ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
EXCEPTION WHEN undefined_object THEN NULL;
END $$;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'teacher', 'student', 'parent', 'owner', 'super_admin'));

CREATE OR REPLACE FUNCTION public.validate_user_signup()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.allowed_users WHERE email = NEW.email) THEN
    RAISE EXCEPTION 'Email not authorized. Please contact administrator.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE user_role TEXT;
BEGIN
  SELECT role INTO user_role FROM public.allowed_users WHERE email = NEW.email;
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'), user_role);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS check_email_allowed ON auth.users;
CREATE TRIGGER check_email_allowed BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.validate_user_signup();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 2. CORE: TEACHERS, STUDENTS (before Learning Hub)
-- =====================================================

-- Academic sessions (Learning Hub)
CREATE TABLE IF NOT EXISTS public.academic_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT CHECK (status IN ('upcoming', 'active', 'completed')) DEFAULT 'upcoming',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subjects (Learning Hub)
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#0070F2',
  department TEXT,
  grade_level TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Classes (Unified Learning Hub - single class model)
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  academic_session_id UUID REFERENCES public.academic_sessions(id) ON DELETE CASCADE,
  section_code TEXT NOT NULL,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  room_number TEXT,
  capacity INTEGER DEFAULT 30,
  enrollment_count INTEGER DEFAULT 0,
  schedule_data JSONB,
  status TEXT CHECK (status IN ('draft', 'active', 'cancelled', 'completed')) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(subject_id, academic_session_id, section_code)
);

CREATE TABLE IF NOT EXISTS public.teachers (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  employee_id TEXT UNIQUE,
  department TEXT,
  subject TEXT,
  qualification TEXT,
  experience INTEGER,
  phone TEXT,
  date_of_joining TIMESTAMPTZ,
  salary DECIMAL(10, 2),
  status TEXT CHECK (status IN ('active', 'on-leave', 'inactive')) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  roll_number TEXT UNIQUE NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  section TEXT,
  date_of_birth TIMESTAMPTZ,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  parent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  admission_date TIMESTAMPTZ DEFAULT NOW(),
  status TEXT CHECK (status IN ('active', 'inactive', 'graduated')) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. LEARNING HUB: enrollments, schedule, attendance, assignments, grades, communications
-- =====================================================

CREATE TABLE IF NOT EXISTS public.class_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  enrollment_date TIMESTAMPTZ DEFAULT NOW(),
  status TEXT CHECK (status IN ('active', 'withdrawn', 'completed')) DEFAULT 'active',
  grade TEXT,
  notes TEXT,
  UNIQUE(class_id, student_id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.schedule_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room_number TEXT,
  recurrence_type TEXT CHECK (recurrence_type IN ('weekly', 'biweekly', 'once')) DEFAULT 'weekly',
  is_active BOOLEAN DEFAULT true,
  UNIQUE(class_id, day_of_week, start_time),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  schedule_slot_id UUID REFERENCES public.schedule_slots(id) ON DELETE SET NULL,
  attendance_date DATE NOT NULL,
  status TEXT CHECK (status IN ('present', 'absent', 'late', 'excused')) DEFAULT 'present',
  check_in_time TIMESTAMPTZ,
  check_out_time TIMESTAMPTZ,
  notes TEXT,
  marked_by UUID REFERENCES public.profiles(id),
  UNIQUE(class_id, student_id, attendance_date),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('homework', 'quiz', 'project', 'exam', 'other')) DEFAULT 'homework',
  due_date TIMESTAMPTZ,
  total_points DECIMAL(5,2),
  weight DECIMAL(3,2) DEFAULT 1.0,
  status TEXT CHECK (status IN ('draft', 'published', 'closed')) DEFAULT 'draft',
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  submitted_at TIMESTAMPTZ,
  content TEXT,
  grade DECIMAL(5,2),
  feedback TEXT,
  status TEXT CHECK (status IN ('submitted', 'graded', 'late', 'missing')) DEFAULT 'submitted',
  UNIQUE(assignment_id, student_id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE SET NULL,
  grade_type TEXT CHECK (grade_type IN ('assignment', 'quiz', 'exam', 'participation', 'final')) DEFAULT 'assignment',
  score DECIMAL(5,2),
  max_score DECIMAL(5,2),
  percentage DECIMAL(5,2) GENERATED ALWAYS AS (CASE WHEN max_score > 0 THEN (score / max_score) * 100 ELSE NULL END) STORED,
  comments TEXT,
  graded_by UUID REFERENCES public.profiles(id),
  graded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.class_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT CHECK (type IN ('announcement', 'reminder', 'update', 'alert')) DEFAULT 'announcement',
  priority TEXT CHECK (priority IN ('low', 'normal', 'high', 'urgent')) DEFAULT 'normal',
  is_pinned BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  read_by UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RPCs for enrollment count (used by Learning Hub)
CREATE OR REPLACE FUNCTION public.increment_class_enrollment(class_id UUID, count INTEGER DEFAULT 1)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.classes SET enrollment_count = COALESCE(enrollment_count, 0) + count WHERE id = class_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.decrement_class_enrollment(class_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.classes SET enrollment_count = GREATEST(COALESCE(enrollment_count, 0) - 1, 0) WHERE id = class_id;
END;
$$;

-- RPC: add allowed user (for user creation by admin/owner/super_admin)
CREATE OR REPLACE FUNCTION public.add_allowed_user(p_email TEXT, p_role TEXT)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'owner', 'super_admin')) THEN
    RAISE EXCEPTION 'Only admin, owner, or super_admin can add allowed users.';
  END IF;
  IF p_role IS NULL OR p_role NOT IN ('admin', 'teacher', 'student', 'parent', 'owner', 'super_admin') THEN
    RAISE EXCEPTION 'Invalid role.';
  END IF;
  INSERT INTO public.allowed_users (email, role) VALUES (LOWER(TRIM(p_email)), p_role)
  ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role, updated_at = NOW();
END;
$$;

-- =====================================================
-- 4. LEAVE REQUESTS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  leave_type TEXT NOT NULL CHECK (leave_type IN ('sick', 'casual', 'emergency', 'vacation', 'other')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days INTEGER GENERATED ALWAYS AS (end_date - start_date + 1) STORED,
  reason TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')) DEFAULT 'pending',
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  review_comments TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. FINANCE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.fee_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  fee_type TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  frequency TEXT DEFAULT 'monthly',
  due_day INTEGER CHECK (due_day >= 1 AND due_day <= 31),
  academic_year TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  description TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.fee_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  fee_structure_id UUID REFERENCES public.fee_structures(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  due_date DATE NOT NULL,
  payment_date DATE,
  payment_method TEXT,
  transaction_id TEXT,
  status TEXT CHECK (status IN ('unpaid', 'paid', 'pending', 'overdue', 'partial', 'waived')) DEFAULT 'pending',
  receipt_url TEXT,
  notes TEXT,
  paid_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payroll (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  salary_amount DECIMAL(10, 2) NOT NULL,
  deductions DECIMAL(10, 2) DEFAULT 0,
  net_salary DECIMAL(10, 2) NOT NULL,
  pay_period_start DATE NOT NULL,
  pay_period_end DATE NOT NULL,
  payment_date DATE NOT NULL,
  payment_method TEXT DEFAULT 'bank_transfer',
  transaction_id TEXT,
  status TEXT CHECK (status IN ('pending', 'paid', 'failed')) DEFAULT 'pending',
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. COMMUNICATION & MESSAGING
-- =====================================================

CREATE TABLE IF NOT EXISTS public.internal_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  priority TEXT DEFAULT 'normal',
  attachments JSONB,
  parent_message_id UUID REFERENCES public.internal_messages(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.parent_teacher_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  meeting_date DATE NOT NULL,
  meeting_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  status TEXT CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')) DEFAULT 'scheduled',
  agenda TEXT,
  notes TEXT,
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.teacher_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 7. ANNOUNCEMENTS, AUDIT, NOTIFICATIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT,
  audience TEXT[] DEFAULT '{}',
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_name TEXT,
  action TEXT NOT NULL,
  entity TEXT,
  entity_id TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES public.profiles(id),
  target_roles TEXT[],
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  publish_date TIMESTAMPTZ DEFAULT NOW(),
  expiry_date TIMESTAMPTZ,
  status TEXT CHECK (status IN ('draft', 'published', 'expired')) DEFAULT 'draft',
  attachments TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 8. INVENTORY & FACILITIES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  barcode TEXT UNIQUE,
  status TEXT CHECK (status IN ('available', 'in-use', 'maintenance', 'damaged')) DEFAULT 'available',
  location TEXT,
  assigned_to TEXT,
  purchase_date DATE,
  condition TEXT DEFAULT 'Good',
  value DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.facility_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility TEXT NOT NULL,
  booked_by TEXT NOT NULL,
  date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  purpose TEXT,
  status TEXT CHECK (status IN ('confirmed', 'pending', 'cancelled')) DEFAULT 'confirmed',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 9. TIMETABLE, LIBRARY, TRANSPORT, PORTFOLIO
-- =====================================================

CREATE TABLE IF NOT EXISTS public.timetable_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room_number TEXT,
  academic_year TEXT NOT NULL,
  term TEXT,
  status TEXT DEFAULT 'active',
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.library_books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  isbn TEXT UNIQUE,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  publisher TEXT,
  publication_year INTEGER,
  category TEXT,
  edition TEXT,
  total_copies INTEGER DEFAULT 0,
  available_copies INTEGER DEFAULT 0,
  location TEXT,
  description TEXT,
  cover_image_url TEXT,
  status TEXT DEFAULT 'available',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.book_checkouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID REFERENCES public.library_books(id) ON DELETE CASCADE,
  borrower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  checkout_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  return_date DATE,
  status TEXT CHECK (status IN ('checked_out', 'returned', 'overdue', 'lost')) DEFAULT 'checked_out',
  fine_amount DECIMAL(10, 2) DEFAULT 0,
  notes TEXT,
  checked_out_by UUID REFERENCES public.profiles(id),
  returned_to UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.transport_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_name TEXT NOT NULL,
  route_number TEXT UNIQUE,
  driver_name TEXT,
  driver_contact TEXT,
  vehicle_number TEXT,
  vehicle_type TEXT,
  capacity INTEGER,
  start_location TEXT,
  end_location TEXT,
  stops JSONB,
  fee_amount DECIMAL(10, 2),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.transport_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  route_id UUID REFERENCES public.transport_routes(id) ON DELETE CASCADE,
  pickup_location TEXT,
  dropoff_location TEXT,
  status TEXT DEFAULT 'active',
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.student_portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  project_type TEXT NOT NULL,
  attachments JSONB,
  external_link TEXT,
  tags TEXT[],
  featured BOOLEAN DEFAULT false,
  visibility TEXT DEFAULT 'private',
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 10. VIEWS: class_schedules, admin_attendance_report
-- =====================================================

CREATE OR REPLACE VIEW public.class_schedules AS
SELECT ss.id, ss.class_id, c.teacher_id, ss.day_of_week, ss.start_time, ss.end_time, ss.room_number
FROM public.schedule_slots ss
JOIN public.classes c ON c.id = ss.class_id
WHERE ss.is_active = true;

-- Admin attendance report: join attendance_records with students, profiles, classes, teacher
CREATE OR REPLACE VIEW public.admin_attendance_report AS
SELECT
  ar.id,
  ar.attendance_date,
  ar.status::TEXT,
  ar.class_id,
  ar.student_id,
  COALESCE(st.roll_number, '') AS roll_number,
  COALESCE(p_student.full_name, '') AS student_name,
  COALESCE(p_student.email, '') AS student_email,
  TRIM(COALESCE(s_sub.name, '') || ' ' || COALESCE(c.section_code, '')) AS class_name,
  c.section_code AS class_section,
  c.room_number AS class_room,
  COALESCE(p_teacher.full_name, '') AS teacher_name,
  ar.notes,
  ar.created_at
FROM public.attendance_records ar
JOIN public.classes c ON c.id = ar.class_id
LEFT JOIN public.students st ON st.id = ar.student_id
LEFT JOIN public.profiles p_student ON p_student.id = ar.student_id
LEFT JOIN public.profiles p_teacher ON p_teacher.id = c.teacher_id
LEFT JOIN public.subjects s_sub ON s_sub.id = c.subject_id;

-- =====================================================
-- 11. INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_classes_subject_session ON public.classes(subject_id, academic_session_id);
CREATE INDEX IF NOT EXISTS idx_classes_teacher ON public.classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_class ON public.class_enrollments(class_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON public.class_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_schedule_slots_class ON public.schedule_slots(class_id);
CREATE INDEX IF NOT EXISTS idx_schedule_slots_day ON public.schedule_slots(day_of_week);
CREATE INDEX IF NOT EXISTS idx_attendance_class_date ON public.attendance_records(class_id, attendance_date);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON public.attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_assignments_class ON public.assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_grades_class_student ON public.grades(class_id, student_id);
CREATE INDEX IF NOT EXISTS idx_communications_class ON public.class_communications(class_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_user ON public.leave_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON public.leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_fee_payments_student ON public.fee_payments(student_id);
CREATE INDEX IF NOT EXISTS idx_fee_payments_parent ON public.fee_payments(parent_id);
CREATE INDEX IF NOT EXISTS idx_fee_payments_status ON public.fee_payments(status);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON public.internal_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.internal_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- =====================================================
-- 12. UPDATED_AT TRIGGER
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'academic_sessions','subjects','classes','class_enrollments','schedule_slots',
    'attendance_records','assignments','assignment_submissions','grades','class_communications',
    'leave_requests','fee_structures','fee_payments','payroll','internal_messages',
    'parent_teacher_meetings','teacher_availability','announcements','assets','facility_bookings',
    'timetable_entries','library_books','book_checkouts','transport_routes','transport_assignments',
    'student_portfolios','profiles','teachers','students','notifications','allowed_users'
  ] LOOP
    BEGIN
      EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_updated ON public.%I', t, t);
      EXECUTE format('CREATE TRIGGER trg_%I_updated BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()', t, t);
    EXCEPTION WHEN undefined_table OR undefined_column THEN NULL;
    END;
  END LOOP;
END $$;

-- =====================================================
-- 13. ROW LEVEL SECURITY - ENABLE ON ALL
-- =====================================================

ALTER TABLE public.allowed_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_teacher_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_checkouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_portfolios ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 13b. RLS HELPER (must exist before policies that use it; avoids recursion on profiles)
-- =====================================================
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'owner', 'super_admin'));
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_teacher_of_class(target_class_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM public.classes WHERE id = target_class_id AND teacher_id = auth.uid());
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_enrolled_in_class(target_class_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.class_enrollments
    WHERE class_id = target_class_id AND student_id = auth.uid() AND status = 'active'
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_parent_of_student(target_student_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.id = target_student_id AND s.parent_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- =====================================================
-- 14. RLS POLICIES - PROFILES & CORE
-- =====================================================

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.is_admin_user());

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (public.is_admin_user());

-- Allow authenticated users to look up basic directory info (needed for dropdowns: teachers, recipients, etc.)
DROP POLICY IF EXISTS "Authenticated can view profiles directory" ON public.profiles;
CREATE POLICY "Authenticated can view profiles directory" ON public.profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins manage allowed_users" ON public.allowed_users;
CREATE POLICY "Admins manage allowed_users" ON public.allowed_users FOR ALL USING (public.is_admin_user());

DROP POLICY IF EXISTS "Anyone can view classes" ON public.classes;
CREATE POLICY "Anyone can view classes" ON public.classes FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admins can manage classes" ON public.classes;
CREATE POLICY "Admins can manage classes" ON public.classes FOR ALL USING (public.is_admin_user());

DROP POLICY IF EXISTS "Users view own student profile" ON public.students;
CREATE POLICY "Users view own student profile" ON public.students FOR SELECT USING (id = auth.uid());
DROP POLICY IF EXISTS "Admins view all students" ON public.students;
CREATE POLICY "Admins view all students" ON public.students FOR SELECT USING (public.is_admin_user());
DROP POLICY IF EXISTS "Teachers view students in their classes" ON public.students;
CREATE POLICY "Teachers view students in their classes" ON public.students FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.classes WHERE teacher_id = auth.uid() AND classes.id = students.class_id));

DROP POLICY IF EXISTS "Parents view their children" ON public.students;
CREATE POLICY "Parents view their children" ON public.students FOR SELECT USING (parent_id = auth.uid());

DROP POLICY IF EXISTS "Admins manage students" ON public.students;
CREATE POLICY "Admins manage students" ON public.students FOR ALL USING (public.is_admin_user());

-- =====================================================
-- 15. RLS - LEARNING HUB HELPERS & POLICIES
-- =====================================================

-- Learning Hub table policies (allow service role / authenticated with helpers)
DROP POLICY IF EXISTS "academic_sessions_admin_only" ON public.academic_sessions;
CREATE POLICY "academic_sessions_admin_only" ON public.academic_sessions FOR ALL USING (public.is_admin_user());

DROP POLICY IF EXISTS "subjects_read_all" ON public.subjects;
CREATE POLICY "subjects_read_all" ON public.subjects FOR SELECT USING (true);
DROP POLICY IF EXISTS "subjects_admin_manage" ON public.subjects;
CREATE POLICY "subjects_admin_manage" ON public.subjects FOR ALL USING (public.is_admin_user());

DROP POLICY IF EXISTS "classes_read" ON public.classes;
CREATE POLICY "classes_read" ON public.classes FOR SELECT USING (
  public.is_admin_user() OR teacher_id = auth.uid() OR public.is_enrolled_in_class(id) OR
  EXISTS (SELECT 1 FROM public.class_enrollments ce JOIN public.students s ON s.id = ce.student_id WHERE ce.class_id = classes.id AND s.parent_id = auth.uid()));
DROP POLICY IF EXISTS "classes_manage" ON public.classes;
CREATE POLICY "classes_manage" ON public.classes FOR ALL USING (public.is_admin_user() OR teacher_id = auth.uid());

DROP POLICY IF EXISTS "enrollments_read" ON public.class_enrollments;
CREATE POLICY "enrollments_read" ON public.class_enrollments FOR SELECT USING (
  public.is_admin_user() OR student_id = auth.uid() OR public.is_parent_of_student(student_id));
DROP POLICY IF EXISTS "enrollments_manage" ON public.class_enrollments;
CREATE POLICY "enrollments_manage" ON public.class_enrollments FOR ALL USING (public.is_admin_user());

DROP POLICY IF EXISTS "schedule_read" ON public.schedule_slots;
CREATE POLICY "schedule_read" ON public.schedule_slots FOR SELECT USING (
  public.is_admin_user() OR public.is_enrolled_in_class(class_id) OR
  EXISTS (SELECT 1 FROM public.class_enrollments ce JOIN public.students s ON s.id = ce.student_id WHERE ce.class_id = schedule_slots.class_id AND s.parent_id = auth.uid()));
DROP POLICY IF EXISTS "schedule_manage" ON public.schedule_slots;
CREATE POLICY "schedule_manage" ON public.schedule_slots FOR ALL USING (public.is_admin_user());

DROP POLICY IF EXISTS "attendance_read" ON public.attendance_records;
CREATE POLICY "attendance_read" ON public.attendance_records FOR SELECT USING (
  public.is_admin_user() OR student_id = auth.uid() OR public.is_parent_of_student(student_id));
DROP POLICY IF EXISTS "attendance_manage" ON public.attendance_records;
CREATE POLICY "attendance_manage" ON public.attendance_records FOR ALL USING (public.is_admin_user());

DROP POLICY IF EXISTS "assignments_read" ON public.assignments;
CREATE POLICY "assignments_read" ON public.assignments FOR SELECT USING (
  public.is_admin_user() OR
  EXISTS (SELECT 1 FROM public.class_enrollments WHERE class_id = assignments.class_id AND student_id = auth.uid() AND status = 'active') OR
  EXISTS (SELECT 1 FROM public.class_enrollments ce JOIN public.students s ON s.id = ce.student_id WHERE ce.class_id = assignments.class_id AND s.parent_id = auth.uid()));
DROP POLICY IF EXISTS "assignments_manage" ON public.assignments;
CREATE POLICY "assignments_manage" ON public.assignments FOR ALL USING (public.is_admin_user());

DROP POLICY IF EXISTS "submissions_read" ON public.assignment_submissions;
CREATE POLICY "submissions_read" ON public.assignment_submissions FOR SELECT USING (
  public.is_admin_user() OR student_id = auth.uid() OR public.is_parent_of_student(student_id));
DROP POLICY IF EXISTS "submissions_manage" ON public.assignment_submissions;
CREATE POLICY "submissions_manage" ON public.assignment_submissions FOR ALL USING (
  student_id = auth.uid() OR public.is_admin_user());

DROP POLICY IF EXISTS "grades_read" ON public.grades;
CREATE POLICY "grades_read" ON public.grades FOR SELECT USING (
  public.is_admin_user() OR student_id = auth.uid() OR public.is_parent_of_student(student_id));
DROP POLICY IF EXISTS "grades_manage" ON public.grades;
CREATE POLICY "grades_manage" ON public.grades FOR ALL USING (public.is_admin_user());

DROP POLICY IF EXISTS "communications_read" ON public.class_communications;
CREATE POLICY "communications_read" ON public.class_communications FOR SELECT USING (
  public.is_admin_user() OR public.is_enrolled_in_class(class_id) OR
  EXISTS (SELECT 1 FROM public.class_enrollments ce JOIN public.students s ON s.id = ce.student_id WHERE ce.class_id = class_communications.class_id AND s.parent_id = auth.uid()));
DROP POLICY IF EXISTS "communications_manage" ON public.class_communications;
CREATE POLICY "communications_manage" ON public.class_communications FOR ALL USING (
  public.is_admin_user() OR author_id = auth.uid());

-- =====================================================
-- 16. RLS - LEAVE, FINANCE, MESSAGES, ETC.
-- =====================================================

DROP POLICY IF EXISTS "leave_select_self" ON public.leave_requests;
CREATE POLICY "leave_select_self" ON public.leave_requests FOR SELECT USING (
  user_id = auth.uid() OR public.is_admin_user());
DROP POLICY IF EXISTS "leave_select_parent" ON public.leave_requests;
CREATE POLICY "leave_select_parent" ON public.leave_requests FOR SELECT USING (public.is_parent_of_student(user_id));
DROP POLICY IF EXISTS "leave_insert_self" ON public.leave_requests;
CREATE POLICY "leave_insert_self" ON public.leave_requests FOR INSERT WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "leave_insert_parent" ON public.leave_requests;
CREATE POLICY "leave_insert_parent" ON public.leave_requests FOR INSERT WITH CHECK (public.is_parent_of_student(user_id));
DROP POLICY IF EXISTS "leave_admin_manage" ON public.leave_requests;
CREATE POLICY "leave_admin_manage" ON public.leave_requests FOR ALL USING (public.is_admin_user());

DROP POLICY IF EXISTS "fee_structures_read" ON public.fee_structures;
CREATE POLICY "fee_structures_read" ON public.fee_structures FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "fee_structures_admin" ON public.fee_structures;
CREATE POLICY "fee_structures_admin" ON public.fee_structures FOR ALL USING (public.is_admin_user());
DROP POLICY IF EXISTS "fee_payments_read" ON public.fee_payments;
CREATE POLICY "fee_payments_read" ON public.fee_payments FOR SELECT USING (
  student_id IN (SELECT id FROM public.students WHERE id = auth.uid() OR parent_id = auth.uid()) OR paid_by = auth.uid() OR public.is_admin_user());
DROP POLICY IF EXISTS "fee_payments_admin" ON public.fee_payments;
CREATE POLICY "fee_payments_admin" ON public.fee_payments FOR ALL USING (public.is_admin_user());

DROP POLICY IF EXISTS "payroll_own" ON public.payroll;
CREATE POLICY "payroll_own" ON public.payroll FOR SELECT USING (employee_id = auth.uid());
DROP POLICY IF EXISTS "payroll_admin" ON public.payroll;
CREATE POLICY "payroll_admin" ON public.payroll FOR ALL USING (public.is_admin_user());

DROP POLICY IF EXISTS "messages_view" ON public.internal_messages;
CREATE POLICY "messages_view" ON public.internal_messages FOR SELECT USING (sender_id = auth.uid() OR recipient_id = auth.uid());
DROP POLICY IF EXISTS "messages_insert" ON public.internal_messages;
CREATE POLICY "messages_insert" ON public.internal_messages FOR INSERT WITH CHECK (sender_id = auth.uid());
DROP POLICY IF EXISTS "messages_update" ON public.internal_messages;
CREATE POLICY "messages_update" ON public.internal_messages FOR UPDATE USING (sender_id = auth.uid() OR recipient_id = auth.uid());

DROP POLICY IF EXISTS "announcements_all" ON public.announcements;
CREATE POLICY "announcements_all" ON public.announcements FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "announcements_admin" ON public.announcements;
CREATE POLICY "announcements_admin" ON public.announcements FOR ALL USING (public.is_admin_user());

-- Allow teachers to publish announcements they authored.
DROP POLICY IF EXISTS "announcements_teacher_insert" ON public.announcements;
CREATE POLICY "announcements_teacher_insert" ON public.announcements FOR INSERT
  WITH CHECK (author_id = auth.uid());
DROP POLICY IF EXISTS "announcements_teacher_manage_own" ON public.announcements;
CREATE POLICY "announcements_teacher_manage_own" ON public.announcements FOR UPDATE
  USING (author_id = auth.uid());
DROP POLICY IF EXISTS "announcements_teacher_delete_own" ON public.announcements;
CREATE POLICY "announcements_teacher_delete_own" ON public.announcements FOR DELETE
  USING (author_id = auth.uid());

DROP POLICY IF EXISTS "audit_admin" ON public.audit_logs;
CREATE POLICY "audit_admin" ON public.audit_logs FOR SELECT USING (public.is_admin_user());
DROP POLICY IF EXISTS "audit_insert" ON public.audit_logs;
CREATE POLICY "audit_insert" ON public.audit_logs FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "notifications_role" ON public.notifications;
CREATE POLICY "notifications_role" ON public.notifications FOR SELECT USING (
  status = 'published' AND (target_roles IS NULL OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = ANY(target_roles)));

DROP POLICY IF EXISTS "assets_view" ON public.assets;
CREATE POLICY "assets_view" ON public.assets FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "assets_admin" ON public.assets;
CREATE POLICY "assets_admin" ON public.assets FOR ALL USING (public.is_admin_user());
DROP POLICY IF EXISTS "facility_view" ON public.facility_bookings;
CREATE POLICY "facility_view" ON public.facility_bookings FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "facility_insert" ON public.facility_bookings;
CREATE POLICY "facility_insert" ON public.facility_bookings FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "facility_admin" ON public.facility_bookings;
CREATE POLICY "facility_admin" ON public.facility_bookings FOR ALL USING (public.is_admin_user());

DROP POLICY IF EXISTS "timetable_view" ON public.timetable_entries;
CREATE POLICY "timetable_view" ON public.timetable_entries FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "timetable_admin" ON public.timetable_entries;
CREATE POLICY "timetable_admin" ON public.timetable_entries FOR ALL USING (public.is_admin_user());

-- Teachers should be able to manage their own timetable entries too.
DROP POLICY IF EXISTS "timetable_teacher_manage" ON public.timetable_entries;
CREATE POLICY "timetable_teacher_manage" ON public.timetable_entries FOR ALL USING (teacher_id = auth.uid());
DROP POLICY IF EXISTS "library_view" ON public.library_books;
CREATE POLICY "library_view" ON public.library_books FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "library_admin" ON public.library_books;
CREATE POLICY "library_admin" ON public.library_books FOR ALL USING (public.is_admin_user());
DROP POLICY IF EXISTS "checkouts_view" ON public.book_checkouts;
CREATE POLICY "checkouts_view" ON public.book_checkouts FOR SELECT USING (
  borrower_id = auth.uid() OR public.is_admin_user() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher'));
DROP POLICY IF EXISTS "checkouts_manage" ON public.book_checkouts;
CREATE POLICY "checkouts_manage" ON public.book_checkouts FOR ALL USING (
  public.is_admin_user() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher'));
DROP POLICY IF EXISTS "transport_view" ON public.transport_routes;
CREATE POLICY "transport_view" ON public.transport_routes FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "transport_admin" ON public.transport_routes;
CREATE POLICY "transport_admin" ON public.transport_routes FOR ALL USING (public.is_admin_user());
DROP POLICY IF EXISTS "transport_assign_view" ON public.transport_assignments;
CREATE POLICY "transport_assign_view" ON public.transport_assignments FOR SELECT USING (
  student_id IN (SELECT id FROM public.students WHERE id = auth.uid() OR parent_id = auth.uid()) OR public.is_admin_user());
DROP POLICY IF EXISTS "portfolio_own" ON public.student_portfolios;
CREATE POLICY "portfolio_own" ON public.student_portfolios FOR ALL USING (
  student_id IN (SELECT id FROM public.students WHERE id = auth.uid()) OR public.is_admin_user());
DROP POLICY IF EXISTS "portfolio_public" ON public.student_portfolios;
CREATE POLICY "portfolio_public" ON public.student_portfolios FOR SELECT USING (is_public = true OR visibility = 'public');

-- =====================================================
-- 17. REALTIME (optional - run if you want live messages)
-- =====================================================
-- ALTER PUBLICATION supabase_realtime ADD TABLE internal_messages;

-- =====================================================
-- 18. SEED DATA (Learning Hub) - optional; adjust or add rows to match your real subjects/sessions.
-- =====================================================

-- Example seeding (customize to your real data if needed):
-- INSERT INTO public.academic_sessions (name, start_date, end_date, status)
-- VALUES ('2025-2026 Academic Year', '2025-04-01', '2026-03-31', 'active')
-- ON CONFLICT DO NOTHING;
--
-- INSERT INTO public.subjects (code, name, description, color, department, grade_level)
-- VALUES
--   ('MATH101', 'Mathematics', 'Mathematics', '#FF6B35', 'Mathematics', '9-12')
-- ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- DONE
-- =====================================================
-- Manual step: Create these auth users in Supabase Dashboard > Authentication > Users > Add user:
--   1. aftab@aero.com  / Qwerty@11  (owner)   - full control
--   2. Kashaf@aero.com / Qwerty@11  (super_admin) - creates roles and temp passwords
-- After first login, handle_new_user will set their profile role from allowed_users.
-- If they already exist, run: UPDATE profiles SET role = 'owner' WHERE email = 'aftab@aero.com';
--   UPDATE profiles SET role = 'super_admin' WHERE email = 'Kashaf@aero.com';
SELECT 'Schema applied successfully. Set up auth in Supabase Dashboard and update .env.local.' AS status;
