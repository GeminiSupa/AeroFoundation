import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from "./context/AppContext";
import { QueryProvider } from "./lib/providers/QueryProvider";
import { LoginPage } from "./components/auth/LoginPage";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Sidebar } from "./components/layout/Sidebar";
import { Topbar } from "./components/layout/Topbar";
import { AdminDashboard } from "./components/dashboards/AdminDashboard";
import { TeacherDashboard } from "./components/dashboards/TeacherDashboard";
import { StudentDashboard } from "./components/dashboards/StudentDashboard";
import { ParentDashboard } from "./components/dashboards/ParentDashboard";
import { AIToolsPage } from "./components/modules/AIToolsPage";
import { SchedulingPage } from "./components/modules/SchedulingPage";
import { LeaveManagementPage } from "./components/modules/LeaveManagementPage";
import { SettingsPage } from "./components/modules/SettingsPage";
import { FinancePage } from "./components/modules/FinancePage";
import { ReportsPage } from "./components/modules/ReportsPage";
import { UsersPage } from "./components/modules/UsersPage";
import { ClassesPage } from "./components/modules/ClassesPage";
import { HRStaffPage } from "./components/modules/HRStaffPage";
import { InventoryPage } from "./components/modules/InventoryPage";
import { AuditLogsPage } from "./components/modules/AuditLogsPage";
import { AnnouncementsPage } from "./components/modules/AnnouncementsPage";
import { MessagesPage } from "./components/modules/MessagesPage";
import { LessonPlanningPage } from "./components/modules/teacher/LessonPlanningPage";
import { TeacherLeavePage } from "./components/modules/teacher/TeacherLeavePage";
import { StudentGradesPage } from "./components/modules/student/StudentGradesPage";
import { StudentAttendancePage } from "./components/modules/student/StudentAttendancePage";
import { StudentLeavePage } from "./components/modules/student/StudentLeavePage";
import { StudentToDoPage } from "./components/modules/student/StudentToDoPage";
import { StudentPortfolioPage } from "./components/modules/student/StudentPortfolioPage";
import { ParentChildProgressPage } from "./components/modules/parent/ParentChildProgressPage";
import { ParentFeePaymentPage } from "./components/modules/parent/ParentFeePaymentPage";
import { ParentChildLeavePage } from "./components/modules/parent/ParentChildLeavePage";
import { AIAssistant } from "./components/AIAssistant";
import { Toaster } from "./components/ui/sonner";

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
      <AIAssistant />
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* Protected routes with role-based access */}
      <Route path="/admin-dashboard" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AppLayout><AdminDashboard /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin-users" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AppLayout><UsersPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin-hr-staff" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AppLayout><HRStaffPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin-inventory" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AppLayout><InventoryPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin-ai-tools" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AppLayout><AIToolsPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin-classes" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AppLayout><ClassesPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin-scheduling" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AppLayout><SchedulingPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin-leave" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AppLayout><LeaveManagementPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin-finance" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AppLayout><FinancePage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin-reports" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AppLayout><ReportsPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin-audit-logs" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AppLayout><AuditLogsPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin-announcements" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AppLayout><AnnouncementsPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin-messages" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AppLayout><MessagesPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin-settings" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AppLayout><SettingsPage /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Teacher routes */}
      <Route path="/teacher-dashboard" element={
        <ProtectedRoute allowedRoles={['teacher']}>
          <AppLayout><TeacherDashboard /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/teacher-classes" element={
        <ProtectedRoute allowedRoles={['teacher']}>
          <AppLayout><ClassesPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/teacher-lesson-planning" element={
        <ProtectedRoute allowedRoles={['teacher']}>
          <AppLayout><LessonPlanningPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/teacher-leave" element={
        <ProtectedRoute allowedRoles={['teacher']}>
          <AppLayout><TeacherLeavePage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/teacher-announcements" element={
        <ProtectedRoute allowedRoles={['teacher']}>
          <AppLayout><AnnouncementsPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/teacher-messages" element={
        <ProtectedRoute allowedRoles={['teacher']}>
          <AppLayout><MessagesPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/teacher-settings" element={
        <ProtectedRoute allowedRoles={['teacher']}>
          <AppLayout><SettingsPage /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Student routes */}
      <Route path="/student-dashboard" element={
        <ProtectedRoute allowedRoles={['student']}>
          <AppLayout><StudentDashboard /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/student-todo" element={
        <ProtectedRoute allowedRoles={['student']}>
          <AppLayout><StudentToDoPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/student-grades" element={
        <ProtectedRoute allowedRoles={['student']}>
          <AppLayout><StudentGradesPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/student-attendance" element={
        <ProtectedRoute allowedRoles={['student']}>
          <AppLayout><StudentAttendancePage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/student-portfolio" element={
        <ProtectedRoute allowedRoles={['student']}>
          <AppLayout><StudentPortfolioPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/student-leave" element={
        <ProtectedRoute allowedRoles={['student']}>
          <AppLayout><StudentLeavePage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/student-announcements" element={
        <ProtectedRoute allowedRoles={['student']}>
          <AppLayout><AnnouncementsPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/student-messages" element={
        <ProtectedRoute allowedRoles={['student']}>
          <AppLayout><MessagesPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/student-settings" element={
        <ProtectedRoute allowedRoles={['student']}>
          <AppLayout><SettingsPage /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Parent routes */}
      <Route path="/parent-dashboard" element={
        <ProtectedRoute allowedRoles={['parent']}>
          <AppLayout><ParentDashboard /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/parent-progress" element={
        <ProtectedRoute allowedRoles={['parent']}>
          <AppLayout><ParentChildProgressPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/parent-fees" element={
        <ProtectedRoute allowedRoles={['parent']}>
          <AppLayout><ParentFeePaymentPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/parent-leave" element={
        <ProtectedRoute allowedRoles={['parent']}>
          <AppLayout><ParentChildLeavePage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/parent-announcements" element={
        <ProtectedRoute allowedRoles={['parent']}>
          <AppLayout><AnnouncementsPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/parent-messages" element={
        <ProtectedRoute allowedRoles={['parent']}>
          <AppLayout><MessagesPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/parent-settings" element={
        <ProtectedRoute allowedRoles={['parent']}>
          <AppLayout><SettingsPage /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryProvider>
      <BrowserRouter>
        <AppProvider>
          <AppRoutes />
          <Toaster />
        </AppProvider>
      </BrowserRouter>
    </QueryProvider>
  );
}