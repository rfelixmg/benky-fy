'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/core/query-client';
import { ThemeProvider } from '@/components/theme-provider';
import { ErrorBoundaryWrapper } from '@/components/error-boundary-wrapper';
// Note: UserProvider will be added when Auth0 is fully configured
// import { UserProvider } from '@auth0/nextjs-auth0/client';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundaryWrapper>
      {/* UserProvider will be added when Auth0 is fully configured */}
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
