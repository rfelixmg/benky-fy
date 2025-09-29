'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { ThemeProvider } from '@/components/theme-provider';
import { ErrorBoundaryWrapper } from '@/components/error-boundary-wrapper';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundaryWrapper>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundaryWrapper>
  );
}
