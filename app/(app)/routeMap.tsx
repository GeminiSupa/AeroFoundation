'use client';

import React from 'react';
import type { UserRole } from '../../src/types';

import { AdminDashboard } from '../../src/components/dashboards/AdminDashboard';
import { TeacherDashboard } from '../../src/components/dashboards/TeacherDashboard';
import { StudentDashboard } from '../../src/components/dashboards/StudentDashboard';
import { ParentDashboard } from '../../src/components/dashboards/ParentDashboard';

import { LearningHub } from '../../src/components/modules/learning-hub/LearningHub';
import { StudentsPage } from '../../src/components/modules/StudentsPage';
import { ParentsPage } from '../../src/components/modules/ParentsPage';
import { HRStaffPage } from '../../src/components/modules/HRStaffPage';
import { InventoryPage } from '../../src/components/modules/InventoryPage';
import { AIToolsPage } from '../../src/components/modules/AIToolsPage';
import { AttendanceReportPage } from '../../src/components/modules/AttendanceReportPage';
import { LeaveAdminPage } from '../../src/components/modules/LeaveAdminPage';
import { FinancePage } from '../../src/components/modules/FinancePage';
import { ReportsPage } from '../../src/components/modules/ReportsPage';
import { AnnouncementsPage } from '../../src/components/modules/AnnouncementsPage';
import { MessagesPage } from '../../src/components/modules/MessagesPage';
import { SettingsPage } from '../../src/components/modules/SettingsPage';
import { FacilityBookingPage } from '../../src/components/modules/FacilityBookingPage';
import { LeavePortalPage } from '../../src/components/modules/LeavePortalPage';
import { UserManualPage } from '../../src/components/modules/UserManualPage';

import { LessonPlanningPage } from '../../src/components/modules/teacher/LessonPlanningPage';
import { TeacherSchedulePage } from '../../src/components/modules/teacher/TeacherSchedulePage';

import { StudentGradesPage } from '../../src/components/modules/student/StudentGradesPage';
import { StudentAttendancePage } from '../../src/components/modules/student/StudentAttendancePage';
import { StudentToDoPage } from '../../src/components/modules/student/StudentToDoPage';
import { StudentPortfolioPage } from '../../src/components/modules/student/StudentPortfolioPage';
import { StudentSchedulePage } from '../../src/components/modules/student/StudentSchedulePage';

import { ParentChildProgressPage } from '../../src/components/modules/parent/ParentChildProgressPage';
import { ParentFeePaymentPage } from '../../src/components/modules/parent/ParentFeePaymentPage';
import { ParentSchedulePage } from '../../src/components/modules/parent/ParentSchedulePage';

export type RouteDef = {
  allowedRoles: UserRole[];
  element: React.ReactNode;
};

export const routeMap: Record<string, RouteDef> = {
  // Admin
  '/admin-dashboard': { allowedRoles: ['admin', 'owner', 'super_admin'], element: <AdminDashboard /> },
  '/admin-learning-hub': { allowedRoles: ['admin', 'owner', 'super_admin'], element: <LearningHub /> },
  '/admin-students': { allowedRoles: ['admin', 'owner', 'super_admin'], element: <StudentsPage /> },
  '/admin-parents': { allowedRoles: ['admin', 'owner', 'super_admin'], element: <ParentsPage /> },
  '/admin-hr-staff': { allowedRoles: ['admin', 'owner', 'super_admin'], element: <HRStaffPage /> },
  '/admin-inventory': { allowedRoles: ['admin', 'owner', 'super_admin'], element: <InventoryPage /> },
  '/admin-ai-tools': { allowedRoles: ['admin', 'owner', 'super_admin'], element: <AIToolsPage /> },
  '/admin-attendance': { allowedRoles: ['admin', 'owner', 'super_admin'], element: <AttendanceReportPage /> },
  '/admin-leave': { allowedRoles: ['admin', 'owner', 'super_admin'], element: <LeaveAdminPage /> },
  '/admin-finance': { allowedRoles: ['admin', 'owner', 'super_admin'], element: <FinancePage /> },
  '/admin-reports': { allowedRoles: ['admin', 'owner', 'super_admin'], element: <ReportsPage /> },
  '/admin-announcements': { allowedRoles: ['admin', 'owner', 'super_admin'], element: <AnnouncementsPage /> },
  '/admin-messages': { allowedRoles: ['admin', 'owner', 'super_admin'], element: <MessagesPage /> },
  '/admin-settings': { allowedRoles: ['admin', 'owner', 'super_admin'], element: <SettingsPage /> },
  '/admin-manual': { allowedRoles: ['admin', 'owner', 'super_admin'], element: <UserManualPage /> },

  // Teacher
  '/teacher-dashboard': { allowedRoles: ['teacher'], element: <TeacherDashboard /> },
  '/teacher-learning-hub': { allowedRoles: ['teacher'], element: <LearningHub /> },
  '/teacher-schedule': { allowedRoles: ['teacher'], element: <TeacherSchedulePage /> },
  '/teacher-lesson-planning': { allowedRoles: ['teacher'], element: <LessonPlanningPage /> },
  '/teacher-leave': { allowedRoles: ['teacher'], element: <LeavePortalPage /> },
  '/teacher-announcements': { allowedRoles: ['teacher'], element: <AnnouncementsPage /> },
  '/teacher-messages': { allowedRoles: ['teacher'], element: <MessagesPage /> },
  '/teacher-settings': { allowedRoles: ['teacher'], element: <SettingsPage /> },
  '/teacher-manual': { allowedRoles: ['teacher'], element: <UserManualPage /> },

  // Student
  '/student-dashboard': { allowedRoles: ['student'], element: <StudentDashboard /> },
  '/student-learning-hub': { allowedRoles: ['student'], element: <LearningHub /> },
  '/student-schedule': { allowedRoles: ['student'], element: <StudentSchedulePage /> },
  '/student-todo': { allowedRoles: ['student'], element: <StudentToDoPage /> },
  '/student-grades': { allowedRoles: ['student'], element: <StudentGradesPage /> },
  '/student-attendance': { allowedRoles: ['student'], element: <StudentAttendancePage /> },
  '/student-portfolio': { allowedRoles: ['student'], element: <StudentPortfolioPage /> },
  '/student-leave': { allowedRoles: ['student'], element: <LeavePortalPage /> },
  '/student-announcements': { allowedRoles: ['student'], element: <AnnouncementsPage /> },
  '/student-messages': { allowedRoles: ['student'], element: <MessagesPage /> },
  '/student-settings': { allowedRoles: ['student'], element: <SettingsPage /> },
  '/student-manual': { allowedRoles: ['student'], element: <UserManualPage /> },

  // Parent
  '/parent-dashboard': { allowedRoles: ['parent'], element: <ParentDashboard /> },
  '/parent-learning-hub': { allowedRoles: ['parent'], element: <LearningHub /> },
  '/parent-schedule': { allowedRoles: ['parent'], element: <ParentSchedulePage /> },
  '/parent-progress': { allowedRoles: ['parent'], element: <ParentChildProgressPage /> },
  '/parent-fees': { allowedRoles: ['parent'], element: <ParentFeePaymentPage /> },
  '/parent-leave': { allowedRoles: ['parent'], element: <LeavePortalPage /> },
  '/parent-announcements': { allowedRoles: ['parent'], element: <AnnouncementsPage /> },
  '/parent-messages': { allowedRoles: ['parent'], element: <MessagesPage /> },
  '/parent-settings': { allowedRoles: ['parent'], element: <SettingsPage /> },
  '/parent-manual': { allowedRoles: ['parent'], element: <UserManualPage /> },

  // Shared
  '/facility-booking': { allowedRoles: ['teacher', 'student'], element: <FacilityBookingPage /> },
};

