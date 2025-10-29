# School Management System - Testing Guide

Quick reference for testing all features and flows in the V2.2 system.

## 🔐 Login & Access

### Test Users (Mock Credentials)
```
Admin:
  Email: admin@school.edu
  Password: admin123
  
Teacher:
  Email: teacher@school.edu
  Password: teacher123
  
Student:
  Email: student@school.edu
  Password: student123
  
Parent:
  Email: parent@school.edu
  Password: parent123
```

---

## 🧪 Critical V2.2 Tests

### ✅ 1. Library Module Removal

**Test**: Verify Library is completely removed from all roles

**Steps**:
1. Login as Admin → Check sidebar → Should NOT see "Library"
2. Login as Teacher → Check sidebar → Should NOT see "Library"
3. Login as Student → Check sidebar → Should NOT see "Library"
4. Login as Parent → Check sidebar → Should NOT see "Library"
5. Try navigating to any library route → Should not exist

**Expected Result**: ❌ No Library menu item or route exists for any role

---

### ✅ 2. Teacher Leave Management RBAC

**Test**: Verify teachers can ONLY apply for leave, NOT approve/reject

**Steps**:
1. Login as Teacher
2. Navigate to "Leave Management" from sidebar
3. Verify page title is "My Leave Requests"
4. Check for "Apply Leave" button → Should exist ✅
5. Check for "Approve" or "Reject" buttons → Should NOT exist ❌
6. Click "Apply Leave"
7. Fill form (Start Date, End Date, Type, Reason)
8. Click "Submit Request"
9. Verify toast notification appears
10. Check table for new request with "Pending" status

**Expected Results**:
- ✅ Can apply for own leave
- ✅ Can see own leave history
- ✅ Can see leave balance
- ❌ NO approve/reject buttons
- ❌ Cannot see other teachers' requests
- ✅ Toast shows "Leave request submitted successfully"

---

### ✅ 3. Parent Finance Access

**Test**: Verify parents have NO dedicated Finance module

**Steps**:
1. Login as Parent
2. Check sidebar → Should NOT see "Finance" menu item ❌
3. Go to Dashboard
4. Find "Payments" tab
5. Verify "Pay Now" button exists for each pending fee
6. Click "Pay Now"
7. Verify redirects to Fee Payment page (not full Finance module)
8. Check for "Set Up Recurring Payment" toggle

**Expected Results**:
- ❌ No "Finance" in sidebar
- ✅ "Payments" tab in dashboard
- ✅ "Pay Now" button functional
- ✅ Routes to fee payment (not finance module)
- ✅ Recurring payment option available

---

## 📋 Feature Testing by Role

### 🔧 Admin Features

#### User Management
- [ ] Navigate to "Users" → See all users table
- [ ] Click "+ Add User" → Modal opens
- [ ] Fill form and save → Success toast
- [ ] Click "..." menu → See Edit/Delete options
- [ ] Delete user → Confirmation modal → Success

#### HR & Staff
- [ ] Navigate to "HR & Staff"
- [ ] View staff directory with search/filter
- [ ] Check "Compliance Tracker" tab
- [ ] Verify expiring credentials show warnings
- [ ] Click "Add Staff Member" → Modal opens

#### Inventory
- [ ] Navigate to "Inventory"
- [ ] View asset list
- [ ] Click "Scan Barcode" → Modal opens
- [ ] Click "Book Facility" → Calendar modal
- [ ] Verify conflict detection works

#### Leave Management (Admin)
- [ ] See both Teacher and Student leave tabs
- [ ] Verify "Approve" and "Reject" buttons exist
- [ ] Click "Approve" → Confirmation modal
- [ ] Click "Reject" → Reason input modal

#### Audit Logs
- [ ] Navigate to "Audit Logs"
- [ ] View activity log table
- [ ] Test search/filter functionality
- [ ] Click "Export Logs" button

#### Announcements (Admin)
- [ ] Click "+ New Announcement"
- [ ] Fill form with priority, category, audience
- [ ] Toggle "Pin this announcement"
- [ ] Publish → Success toast
- [ ] Verify Edit/Delete buttons appear

---

### 👩‍🏫 Teacher Features

#### Lesson Planning
- [ ] Navigate to "Lesson Planning"
- [ ] Click "Create Lesson" → Full form modal
- [ ] Click "AI Lesson Assistant" → AI generation modal
- [ ] Fill topic, grade, standards
- [ ] Click "Generate Lesson Plan" → AI creates plan
- [ ] Verify can link assignments
- [ ] Save/Publish lesson

#### Classes
- [ ] View assigned classes
- [ ] Click "View Students" → Class roster screen
- [ ] Verify can only see own classes

#### Leave (Teacher-specific)
- [ ] Navigate to "Leave Management"
- [ ] **VERIFY**: Only shows "Apply Leave" button
- [ ] **VERIFY**: NO Approve/Reject buttons
- [ ] Apply for leave → Success toast
- [ ] View leave history (own requests only)
- [ ] Check leave balance display

#### Messages
- [ ] Navigate to "Messages"
- [ ] Click "+ New Message"
- [ ] Toggle "Schedule send" checkbox
- [ ] Select date/time for scheduled send
- [ ] Send message
- [ ] Verify AI sentiment analysis badges

---

### 🎓 Student Features

#### My To-Do
- [ ] Navigate to "My To-Do"
- [ ] View aggregated assignments/tests/events
- [ ] Filter by type and subject
- [ ] Check tasks by due date
- [ ] View "Upcoming" vs "Overdue" tabs
- [ ] Mark items complete

#### Portfolio
- [ ] Navigate to "Portfolio"
- [ ] Click "Add Work"
- [ ] Upload file (mock)
- [ ] Add title, description, tags
- [ ] Mark as "Featured"
- [ ] Click "Share Portfolio"
- [ ] Generate shareable link

#### My Grades
- [ ] View grades by subject
- [ ] Check grade breakdown
- [ ] Test "What-If Calculator" (if implemented)
- [ ] See AI learning recommendations

#### Apply Leave (Student)
- [ ] Navigate to "Apply Leave"
- [ ] Click "Apply Leave"
- [ ] Fill form
- [ ] Submit → Success toast
- [ ] View status (Pending/Approved/Rejected)

---

### 👨‍👩‍👧 Parent Features

#### Dashboard
- [ ] View all children cards
- [ ] Check attendance % and grades for each child
- [ ] Click "Request Leave" for child
- [ ] Switch between "AI Insights" and "Payments" tabs
- [ ] **VERIFY**: "Payments" tab shows fee overview
- [ ] Click "Pay Now" → Routes to fee payment page

#### Child's Progress
- [ ] Navigate to "Child's Progress"
- [ ] View detailed grade reports
- [ ] Check attendance trends
- [ ] See AI predictions

#### Fee Payment (NOT Finance)
- [ ] From dashboard, click "Pay Now"
- [ ] **VERIFY**: Lands on fee payment page (not full finance)
- [ ] See payment details
- [ ] Toggle "Set Up Recurring Payment"
- [ ] Process payment (mock)

#### Apply Leave (for Child)
- [ ] Navigate to "Apply Leave"
- [ ] Select child from dropdown
- [ ] Fill leave request form
- [ ] Submit for child
- [ ] View status

---

## 🎨 UI/UX Tests

### Dark Mode
- [ ] Toggle dark mode from topbar
- [ ] Verify all pages render correctly
- [ ] Check contrast and readability
- [ ] Test modal backgrounds

### Responsive Design
- [ ] Test on desktop (1920px)
- [ ] Test on tablet (768px)
- [ ] Test on mobile (375px)
- [ ] Verify sidebar collapses on mobile
- [ ] Check table scrolling on small screens

### AI Features (Orange Accent)
- [ ] Verify all AI widgets use orange (#FF9800)
- [ ] Check AI icons have sparkle/bot appearance
- [ ] Test AI modals and interactions
- [ ] Verify AI badges visible

---

## 🔔 Notification Tests

### Toast Notifications
- [ ] Create user → Success toast
- [ ] Submit leave → Success toast
- [ ] Send message → Success toast
- [ ] Delete item → Confirmation, then success toast
- [ ] Invalid form → Error toast
- [ ] Network error simulation → Error toast

### In-App Notifications
- [ ] Check notification bell in topbar
- [ ] View notification dropdown
- [ ] Click notification → Navigate to relevant page
- [ ] Mark as read

---

## 🚨 Error Handling Tests

### Unauthorized Access (Future Implementation)
- [ ] Try to access admin page as student
- [ ] Should show "Access Denied" modal
- [ ] Try to approve leave as teacher
- [ ] Should show error message

### Form Validation
- [ ] Submit empty form → Show validation errors
- [ ] Invalid email format → Show error
- [ ] Past date selection → Show error
- [ ] Missing required fields → Highlight in red

---

## 📊 Data Integrity Tests

### Student Data Isolation
- [ ] Login as Student A
- [ ] Verify cannot see Student B's grades
- [ ] Verify cannot see Student B's attendance
- [ ] Check all data is student-specific

### Parent Data Isolation
- [ ] Login as Parent of Child A
- [ ] Verify cannot see Child B's data
- [ ] Verify can only pay Child A's fees
- [ ] Check multi-child switching works

### Teacher Data Isolation
- [ ] Login as Teacher A
- [ ] Verify can only see own classes
- [ ] Verify cannot see Teacher B's lessons
- [ ] Check payroll shows only own data

---

## ✅ Acceptance Criteria Checklist

### V2.2 Compliance
- [ ] ✅ Library completely removed from all roles
- [ ] ✅ Teacher can only apply for leave (no approve/reject)
- [ ] ✅ Parent has no dedicated Finance sidebar item
- [ ] ✅ Parent fee payment accessible via dashboard only
- [ ] ✅ All CRUD operations show toast notifications
- [ ] ✅ All modals are functional
- [ ] ✅ AI features are interactive
- [ ] ✅ Data isolation enforced by role

### General Functionality
- [ ] ✅ All navigation links work
- [ ] ✅ All forms submit correctly
- [ ] ✅ All tables display data
- [ ] ✅ All modals open/close properly
- [ ] ✅ All dropdowns function
- [ ] ✅ All buttons trigger actions
- [ ] ✅ All filters work correctly

### Design Compliance
- [ ] ✅ Primary Blue (#0D6EFD) for CTAs
- [ ] ✅ Orange (#FF9800) for AI features
- [ ] ✅ Green for success states
- [ ] ✅ Red for errors/critical items
- [ ] ✅ Yellow for warnings
- [ ] ✅ Roboto fonts throughout
- [ ] ✅ Consistent spacing and layout

---

## 🐛 Bug Reporting Template

When you find an issue, report it like this:

```
**Issue**: [Brief description]
**Role**: Admin/Teacher/Student/Parent
**Page**: [Page name]
**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected**: [What should happen]
**Actual**: [What actually happened]
**Screenshot**: [If applicable]
```

---

## 📞 Support

For issues or questions:
- Check the `/V2.2_CHANGES.md` for implementation details
- Review `/NEW_FEATURES.md` for feature documentation
- Check console for any JavaScript errors

---

**Happy Testing! 🚀**
