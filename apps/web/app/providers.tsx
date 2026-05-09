'use client';

import React, { ReactNode } from 'react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { AuthProvider } from '@/lib/auth/auth-context';
import { EditorProvider } from '@/lib/store/editor-store';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
    },
  },
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <EditorProvider>
          {children}
        </EditorProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
