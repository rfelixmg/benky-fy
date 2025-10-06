"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/core/query-client";
import { ThemeProvider } from "@/components/theme-provider";
import { ErrorBoundaryWrapper } from "@/components/error-boundary-wrapper";
import { UserProvider } from "@/core/user-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundaryWrapper>
      <UserProvider>
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
      </UserProvider>
    </ErrorBoundaryWrapper>
  );
}
