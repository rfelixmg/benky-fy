'use client';

import { ErrorBoundary } from "./error-boundary";
import { ErrorProvider } from "./error-context";

interface ErrorBoundaryWrapperProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

export function ErrorBoundaryWrapper({
  children,
  fallback,
}: ErrorBoundaryWrapperProps) {
  return (
    <ErrorProvider>
      <ErrorBoundary fallback={fallback}>{children}</ErrorBoundary>
    </ErrorProvider>
  );
}
