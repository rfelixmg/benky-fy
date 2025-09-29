'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/hooks';
import { apiClient } from '@/lib/api-client';
import { FloatingElements } from '@/components/floating-elements';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { data: authData, isLoading } = useAuth();

  useEffect(() => {
    // Bypass login for development - redirect to dashboard
    if (!isLoading) {
      window.location.href = '/dashboard';
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-secondary">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-white" />
          <p className="text-white">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary relative overflow-hidden">
      <FloatingElements />
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <div className="max-w-md mx-auto">
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome to Benky-Fy
          </h1>
          <p className="text-lg text-white/90 mb-8">
            Redirecting to dashboard...
          </p>
          
          <Button
            onClick={() => window.location.href = '/dashboard'}
            size="lg"
            className="bg-white text-primary hover:bg-white/90 px-8 py-3"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
