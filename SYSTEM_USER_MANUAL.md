## School Management System – End‑to‑End Usage Manual

This guide walks you from **zero data** to a fully working system: creating subjects, classes, teachers, students, parents, and linking everything together.

---

### 1. Prerequisites & First Login

- **Environment**: `.env.local` is configured with Supabase URL/keys and service role key.
- **Admin account**: You have at least one admin user (either seeded or created directly in Supabase).
- **Login**:
  - Open the web app in your browser.
  - Sign in with an **admin** account.

Admins can see and manage **all** modules. Other roles only see their own dashboards and data.

---

### 2. Core Concepts & Order of Setup

Recommended order:

1. **Subjects** – What is being taught (Math, Science, English…).
2. **Academic Sessions** – Optional, but recommended (2024–2025, Term 1, etc.).
3. **Teachers** – People who teach classes.
4. **Classes** – Combinations of subject + section + teacher (e.g., Grade 9 – Math – A).
5. **Students** – Learners enrolled into classes.
6. **Parents** – Linked to one or more students.
7. **Timetable / Learning Hub** – Schedule of when classes run.
8. **Assignments / Attendance / Fees / Leaves** – Daily operations.

You can add more later, but this order gives a clean first setup.

---

### 3. Creating Subjects

1. Login as **admin**.
2. Go to **Learning Hub** (admin).
3. Use the **Create Subject** action (dialog) to add subjects:
   - **Name**: e.g., Mathematics
   - **Code**: e.g., MATH9
   - **Color / Department / Grade**: Optional but recommended for clarity.
4. Save – subjects are now available everywhere class/assignment forms show a subject dropdown.

Subjects are role‑scoped automatically (teachers/students/parents only see subjects tied to their classes).

---

### 4. Creating Teachers (Users with role `teacher`)

1. Go to **Users** module as admin.
2. Click **Add User**.
3. Fill the form:
   - **Full Name**
   - **Email**
   - **Role**: `teacher`
   - **Password**
   - Optional metadata (phone, etc.) depending on your configuration.
4. Submit.

Behind the scenes:

- An **auth user** is created via Supabase Admin API.
- A **profile** row is created with role `teacher`.
- Related teacher records (if defined) are linked.

Teachers can now log in and will see:

- **Teacher Dashboard**
- **Learning Hub** (teacher view)
- Other teacher modules (Attendance, Lesson Planning, Messages, etc.).

---

### 5. Creating Students (Users with role `student`)

#### 5.1 Create Student User

1. Go to **Users**.
2. Click **Add User**.
3. Set **Role** to `student` and submit.

This creates the auth + profile. The **Students** module manages the academic+family details.

#### 5.2 Complete Student Academic Profile

1. Go to **Students** module (admin).
2. Click **Add New Student**.
3. Fill all fields:
   - **Full Name, Email, Password**
   - **Roll Number**
   - **Gender**
   - **Date of Birth**
   - **Class & Section** (if already created; see “Creating Classes” below)
   - **Parent** (link an existing parent, or leave empty and add later)
4. Save.

The table will now show:

- Name, Email, Roll #, DOB, Gender, Class, Parent, Parent Phone.

Edit dialog lets you change class, parent, DOB, status, etc.

You can also use **CSV Import** on the Students page to bulk‑load existing students (see import hint text in the dialog).

---

### 6. Creating Parents & Linking to Students

#### 6.1 Create Parent User

1. Go to **Users**.
2. Add a new user with **Role** = `parent`.
3. Fill in name/email/password.

#### 6.2 Link Parent to Children

There are two main flows:

**From Students page**:

1. Open **Students**.
2. Add or edit a student.
3. In the **Parent** dropdown, choose a parent user.
4. Save; parent–child link is stored on the student.

**From Parents page**:

1. Open **Parents** module.
2. Each parent row shows linked children.
3. Use the controls there to link/unlink children; this calls the same `linkParentToStudent` logic and also unlinks on delete.

Parents can now log in and see:

- **Parent Dashboard**
- Their children’s **schedule**, **fees**, **leaves**, and **progress** only (enforced via RLS).

---

### 7. Creating Classes & Assigning Teachers

1. Open **Learning Hub** as admin.
2. In the classes section, use **Create Class**.
3. Fill the form:
   - **Subject** (must already exist)
   - **Section Code** (e.g., 9A, 10B)
   - **Teacher** (dropdown of teacher profiles)
   - **Room Number** (optional)
   - **Capacity**
   - **Academic Session**
4. Save.

This creates a `class` row tied to:

- A subject.
- A teacher (for role‑scoped views).
- An academic session.

Teachers assigned to a class see it in **Learning Hub** → classes list and in their dashboard schedule.

---

### 8. Enrolling Students into Classes

All enrollment happens through **Learning Hub** (admin/teacher).

1. Open **Learning Hub** as admin or teacher.
2. In the **Classes** list, choose a class.
3. Click **Students / Manage Class** (depending on button label).
4. Use:
   - **Add Students** dialog for **bulk enrollment**.
   - Quick “add” actions for single enrollment.
5. Type part of the student name/email in the search box.
6. Select one or many students and confirm.

The system:

- Inserts into `class_enrollments`.
- Updates enrollment counts.
- Invalidates / refetches all related queries:
  - Learning Hub stats
  - Schedules
  - Enrolled students

Students will now see:

- Classes in their **Student Dashboard** and **Learning Hub**.
- Assignments and attendance tied to those classes.

---

### 9. Building the Timetable (Schedule)

Use **Learning Hub → Timetable / Schedule manager**.

1. As admin (or authorized staff), open the timetable manager dialog.
2. For each class, add **Schedule Slots**:
   - **Class**
   - **Day of Week**
   - **Start / End time**
   - **Room** (optional)
3. Save.

Learning Hub will:

- Show the weekly schedule in a responsive grid.
- Use color and badges to highlight **today** and **now**.
- Respect role scoping:
  - Teachers see their teaching schedule.
  - Students see their enrolled classes.
  - Parents see children’s schedules via parent views.

---

### 10. Assignments, Attendance, Leaves, and Fees

#### 10.1 Assignments

- Teachers (or admins) create assignments via **Assignments** / **Learning Hub**:
  - Choose class, title, due date, points.
  - Students see them in the **Student Dashboard**, **To‑Do**, and **Learning Hub**.

#### 10.2 Attendance

- Use **Attendance** or **Learning Hub** attendance tools:
  - Select class/date.
  - Mark each student present/absent.
- Admin/teacher dashboards and reports show attendance summaries.

#### 10.3 Leaves

- **Students/Teachers** submit leave in **Leave Portal**.
- **Parents** submit leave for their children (RLS ensures they only see their kids).
- Admin/HR can approve/reject in **Leave Admin**.

#### 10.4 Fees

- Admin uses **Finance** module:
  - Configure fee structures.
  - Record payments per **student**, not just per class.
- **Parents** see their children’s fee status in **Parent Fees**.

---

### 11. Messaging & Announcements

#### Announcements

- Admins and teachers can post **Announcements**.
- RLS ensures teachers can manage only their own announcements.
- Students and parents see relevant announcements in dashboards and modules.

#### Messages

- Use the **Messages** module to send internal messages.
- Recipient lists are populated from `profiles` (directory policy allows authenticated users to see basic profile info for dropdowns).

---

### 12. Learning Hub – Role‑Based Views (What You Should Expect)

**Admin**

- Global overview of:
  - Active classes & enrollments
  - Schedule & utilization
  - Assignments, grades, communications
- Full management tools:
  - Create subjects/classes/sessions
  - Manage timetable
  - Bulk enroll/unenroll

**Teacher**

- Personal teaching **schedule**.
- Classes they teach and their rosters.
- Quick access to:
  - Assignments per class
  - Attendance & grading actions.

**Student**

- Own:
  - Schedule (today & week)
  - Assignments and grades
  - To‑Do / Learning Hub views.

**Parent**

- Children’s:
  - Schedules
  - Progress & grades
  - Attendance, leaves, and fees.

All of this is enforced by **Row Level Security** (RLS) policies you already have in `supabase_schema_full.sql`.

---

### 13. Mobile‑First Behavior (What to Check)

The entire app is designed to be **mobile‑first**:

- Pages use `p-4 sm:p-6`, stacked **cards** and **tabs** on small screens.
- Large tables scroll horizontally inside responsive containers.
- Learning Hub:
  - Tabs collapse into a vertical stack on narrow devices.
  - Class and schedule cards use single‑column layouts on mobile.

If you add new pages, follow the same pattern:

- Use `flex flex-col gap-4` and responsive grids (`grid-cols-1 md:grid-cols-2`).
- Avoid fixed widths; prefer `w-full`, `max-w-*`, and percentage‑based layouts.

---

### 14. Daily Use Checklist

**Admin**

- Review dashboards (attendance, finance, usage).
- Create/update subjects, classes, sessions as needed.
- Manage users and roles.
- Monitor Learning Hub statistics.

**Teacher**

- Check daily schedule.
- Take attendance.
- Create/grade assignments.
- Communicate with students/parents.

**Student**

- Check dashboard and To‑Do.
- Review schedule and upcoming assignments.
- Track grades and attendance.

**Parent**

- Review each child’s schedule and progress.
- Track fees and payments.
- Submit/monitor leave requests.

---

You now have a complete **0 → production** flow for using the management system: from blank database to fully linked subjects, classes, teachers, students, parents, and daily operations. 

