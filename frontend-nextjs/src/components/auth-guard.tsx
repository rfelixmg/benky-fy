'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/hooks';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Loader2, User, LogOut } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { data: authData, isLoading, error } = useAuth();

  // Bypass login redirect for development
  // useEffect(() => {
  //   if (authData && !authData.authenticated && !isLoading) {
  //     apiClient.login();
  //   }
  // }, [authData, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-secondary">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-white" />
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-secondary">
        <div className="text-center">
          <p className="text-white mb-4">Authentication error occurred</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!authData?.authenticated) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-secondary">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-white" />
          <p className="text-white">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

interface UserMenuProps {
  user: {
    name: string;
    email: string;
    picture?: string;
  };
}

export function UserMenu({ user }: UserMenuProps) {
  const handleLogout = () => {
    apiClient.logout();
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        {user.picture ? (
          <img
            src={user.picture}
            alt={user.name}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <User className="w-8 h-8 text-muted-foreground" />
        )}
        <span className="text-sm font-medium">{user.name}</span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleLogout}
        className="flex items-center gap-2"
      >
        <LogOut className="w-4 h-4" />
        Logout
      </Button>
    </div>
  );
}
