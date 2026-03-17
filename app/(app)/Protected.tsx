'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../src/context/AppContext';
import { getDashboardRole } from '../../src/utils/roles';
import type { UserRole } from '../../src/types';

export function Protected({
  allowedRoles,
  children,
}: {
  allowedRoles?: UserRole[];
  children: React.ReactNode;
}) {
  const { user, isLoading } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (allowedRoles && allowedRoles.length > 0) {
      const effectiveRole = getDashboardRole(user.role);
      const allowed = allowedRoles.includes(user.role) || allowedRoles.includes(effectiveRole);
      if (!allowed) {
        router.replace(`/${effectiveRole}-dashboard`);
      }
    }
  }, [allowedRoles, isLoading, router, user]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0D6EFD] mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;
  if (allowedRoles && allowedRoles.length > 0) {
    const effectiveRole = getDashboardRole(user.role);
    const allowed = allowedRoles.includes(user.role) || allowedRoles.includes(effectiveRole);
    if (!allowed) return null;
  }

  return <>{children}</>;
}

