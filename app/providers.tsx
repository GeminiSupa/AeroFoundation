'use client';

import React from 'react';
import { QueryProvider } from '../src/lib/providers/QueryProvider';
import { AppProvider } from '../src/context/AppContext';
import { Toaster } from '../src/components/ui/sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AppProvider>
        {children}
        <Toaster />
      </AppProvider>
    </QueryProvider>
  );
}

