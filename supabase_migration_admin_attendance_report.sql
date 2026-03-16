-- Add admin_attendance_report view for Attendance Report page.
-- Run in Supabase SQL Editor if you already have the schema applied.

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
