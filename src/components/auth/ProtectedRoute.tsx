import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { getDashboardRole } from '../../utils/roles';
import type { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useApp();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0D6EFD] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access (owner/super_admin count as admin for admin routes)
  if (allowedRoles && allowedRoles.length > 0) {
    const effectiveRole = getDashboardRole(user.role);
    const allowed = allowedRoles.includes(user.role) || allowedRoles.includes(effectiveRole);
    if (!allowed) {
      return <Navigate to={`/${effectiveRole}-dashboard`} replace />;
    }
  }

  return <>{children}</>;
}
