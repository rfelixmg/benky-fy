'use client';

import { useAuth } from "@/core/hooks";
import { AuthGuardProps } from "./types";
import { AuthLoading } from "./auth-loading";
import { AuthError } from "./auth-error";
import { AuthRedirect } from "./auth-redirect";

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { data: authData, isLoading, error } = useAuth();

  if (isLoading) {
    return <AuthLoading />;
  }

  if (error) {
    return <AuthError />;
  }

  if (!authData?.authenticated) {
    return fallback || <AuthRedirect />;
  }

  return <>{children}</>;
}
