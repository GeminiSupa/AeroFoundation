import type { UserRole } from '../types';

/** Roles that have full admin access (dashboard, users, HR, finance, etc.) */
const ELEVATED_ROLES: UserRole[] = ['admin', 'owner', 'super_admin'];

export function isElevatedRole(role: UserRole | undefined | null): boolean {
  return role != null && ELEVATED_ROLES.includes(role);
}

/** Map owner/super_admin to the same dashboard path as admin (admin-dashboard, admin-users, etc.) */
export function getDashboardRole(role: UserRole): 'admin' | 'teacher' | 'student' | 'parent' {
  if (role === 'owner' || role === 'super_admin') return 'admin';
  return role;
}
