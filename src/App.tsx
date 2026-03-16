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
import { SettingsPage } from "./components/modules/SettingsPage";
import { FinancePage } from "./components/modules/FinancePage";
import { ReportsPage } from "./components/modules/ReportsPage";
import { StudentsPage } from "./components/modules/StudentsPage";
import { HRStaffPage } from "./components/modules/HRStaffPage";
import { ParentsPage } from "./components/modules/ParentsPage";
import { InventoryPage } from "./components/modules/InventoryPage";
import { AnnouncementsPage } from "./components/modules/AnnouncementsPage";
import { MessagesPage } from "./components/modules/MessagesPage";
import { AttendanceReportPage } from "./components/modules/AttendanceReportPage";
import { LessonPlanningPage } from "./components/modules/teacher/LessonPlanningPage";
import { StudentGradesPage } from "./components/modules/student/StudentGradesPage";
import { StudentAttendancePage } from "./components/modules/student/StudentAttendancePage";
import { StudentToDoPage } from "./components/modules/student/StudentToDoPage";
import { StudentPortfolioPage } from "./components/modules/student/StudentPortfolioPage";
import { StudentSchedulePage } from "./components/modules/student/StudentSchedulePage";
import { ParentChildProgressPage } from "./components/modules/parent/ParentChildProgressPage";
import { ParentFeePaymentPage } from "./components/modules/parent/ParentFeePaymentPage";
import { FacilityBookingPage } from "./components/modules/FacilityBookingPage";
import { LeavePortalPage } from "./components/modules/LeavePortalPage";
import { LeaveAdminPage } from "./components/modules/LeaveAdminPage";
import { LearningHub } from "./components/modules/learning-hub/LearningHub";
import { TeacherSchedulePage } from "./components/modules/teacher/TeacherSchedulePage";
import { ParentSchedulePage } from "./components/modules/parent/ParentSchedulePage";
import { UserManualPage } from "./components/modules/UserManualPage";
import { AIAssistant } from "./components/AIAssistant";
import { Toaster } from "./components/ui/sonner";

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-sap-shell dark:bg-sap-shell">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      
      {/* Mobile/Desktop Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden min-w-0">{children}</main>
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
        <ProtectedRoute allowedRoles={['admin', 'owner', 'super_admin']}>
          <AppLayout><AdminDashboard /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin-learning-hub" element={
        <ProtectedRoute allowedRoles={['admin', 'owner', 'super_admin']}>
          <AppLayout><LearningHub /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin-students" element={
        <ProtectedRoute allowedRoles={['admin', 'owner', 'super_admin']}>
          <AppLayout><StudentsPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin-parents" element={
        <ProtectedRoute allowedRoles={['admin', 'owner', 'super_admin']}>
          <AppLayout><ParentsPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin-hr-staff" element={
        <ProtectedRoute allowedRoles={['admin', 'owner', 'super_admin']}>
          <AppLayout><HRStaffPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin-inventory" element={
        <ProtectedRoute allowedRoles={['admin', 'owner', 'super_admin']}>
          <AppLayout><InventoryPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin-ai-tools" element={
        <ProtectedRoute allowedRoles={['admin', 'owner', 'super_admin']}>
          <AppLayout><AIToolsPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin-finance" element={
        <ProtectedRoute allowedRoles={['admin', 'owner', 'super_admin']}>
          <AppLayout><FinancePage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin-reports" element={
        <ProtectedRoute allowedRoles={['admin', 'owner', 'super_admin']}>
          <AppLayout><ReportsPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin-leave" element={
        <ProtectedRoute allowedRoles={['admin', 'owner', 'super_admin']}>
          <AppLayout><LeaveAdminPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin-attendance" element={
        <ProtectedRoute allowedRoles={['admin', 'owner', 'super_admin']}>
          <AppLayout><AttendanceReportPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin-announcements" element={
        <ProtectedRoute allowedRoles={['admin', 'owner', 'super_admin']}>
          <AppLayout><AnnouncementsPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin-messages" element={
        <ProtectedRoute allowedRoles={['admin', 'owner', 'super_admin']}>
          <AppLayout><MessagesPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin-settings" element={
        <ProtectedRoute allowedRoles={['admin', 'owner', 'super_admin']}>
          <AppLayout><SettingsPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin-manual" element={
        <ProtectedRoute allowedRoles={['admin', 'owner', 'super_admin']}>
          <AppLayout><UserManualPage /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Teacher routes */}
      <Route path="/teacher-dashboard" element={
        <ProtectedRoute allowedRoles={['teacher']}>
          <AppLayout><TeacherDashboard /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/teacher-lesson-planning" element={
        <ProtectedRoute allowedRoles={['teacher']}>
          <AppLayout><LessonPlanningPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/teacher-learning-hub" element={
        <ProtectedRoute allowedRoles={['teacher']}>
          <AppLayout><LearningHub /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/teacher-schedule" element={
        <ProtectedRoute allowedRoles={['teacher']}>
          <AppLayout><TeacherSchedulePage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/teacher-leave" element={
        <ProtectedRoute allowedRoles={['teacher']}>
          <AppLayout><LeavePortalPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/facility-booking" element={
        <ProtectedRoute allowedRoles={['teacher', 'student']}>
          <AppLayout><FacilityBookingPage /></AppLayout>
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
      <Route path="/teacher-manual" element={
        <ProtectedRoute allowedRoles={['teacher']}>
          <AppLayout><UserManualPage /></AppLayout>
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
          <AppLayout><LeavePortalPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/student-learning-hub" element={
        <ProtectedRoute allowedRoles={['student']}>
          <AppLayout><LearningHub /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/student-schedule" element={
        <ProtectedRoute allowedRoles={['student']}>
          <AppLayout><StudentSchedulePage /></AppLayout>
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
      <Route path="/student-manual" element={
        <ProtectedRoute allowedRoles={['student']}>
          <AppLayout><UserManualPage /></AppLayout>
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
      <Route path="/parent-learning-hub" element={
        <ProtectedRoute allowedRoles={['parent']}>
          <AppLayout><LearningHub /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/parent-schedule" element={
        <ProtectedRoute allowedRoles={['parent']}>
          <AppLayout><ParentSchedulePage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/parent-fees" element={
        <ProtectedRoute allowedRoles={['parent']}>
          <AppLayout><ParentFeePaymentPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/parent-leave" element={
        <ProtectedRoute allowedRoles={['parent']}>
          <AppLayout><LeavePortalPage /></AppLayout>
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
      <Route path="/parent-manual" element={
        <ProtectedRoute allowedRoles={['parent']}>
          <AppLayout><UserManualPage /></AppLayout>
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