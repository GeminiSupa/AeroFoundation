'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AppShell } from '../AppShell';
import { Protected } from '../Protected';
import { routeMap } from '../routeMap';

export default function CatchAllAppRoute() {
  const pathname = usePathname();
  const def = routeMap[pathname];

  if (!def) {
    // Keep behavior similar to old router: unknown route goes to /login
    // (Protected will redirect if user is logged out; otherwise role dashboard redirect happens there)
    return (
      <Protected>
        <AppShell>
          <div className="p-4 sm:p-6">
            <div className="rounded-lg border bg-card p-6">
              <div className="text-sm text-muted-foreground">Page not found</div>
              <div className="mt-1 text-lg font-semibold">{pathname}</div>
              <div className="mt-2 text-sm text-muted-foreground">Use the sidebar to navigate.</div>
            </div>
          </div>
        </AppShell>
      </Protected>
    );
  }

  return (
    <Protected allowedRoles={def.allowedRoles}>
      <AppShell>{def.element}</AppShell>
    </Protected>
  );
}

