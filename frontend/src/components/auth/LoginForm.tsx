'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { analytics } from '@/lib/analytics';

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    analytics.track('login_started', { method: 'google' });

    try {
      const response = await fetch('/api/auth/google', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        analytics.track('login_success', { method: 'google' });
        router.push(data.redirect_url || '/');
      } else {
        throw new Error('Login failed');
      }
    } catch (err) {
      setError('Failed to login with Google. Please try again.');
      analytics.track('login_error', {
        method: 'google',
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestLogin = async () => {
    if (process.env.NODE_ENV !== 'development') return;

    setLoading(true);
    setError(null);
    analytics.track('login_started', { method: 'test' });

    try {
      const response = await fetch('/api/auth/test-login', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        analytics.track('login_success', { method: 'test' });
        router.push('/');
      } else {
        throw new Error('Test login failed');
      }
    } catch (err) {
      setError('Failed to login with test account. Please try again.');
      analytics.track('login_error', {
        method: 'test',
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Login to Benky-Fy</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className={`w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <img
            src="/img/google.svg"
            alt="Google"
            className="h-5 w-5 mr-2"
          />
          Continue with Google
        </button>

        {process.env.NODE_ENV === 'development' && (
          <button
            onClick={handleTestLogin}
            disabled={loading}
            className={`w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Development Test Login
          </button>
        )}
      </div>

      {loading && (
        <div className="mt-4 text-center text-gray-500">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Logging in...</p>
        </div>
      )}
    </div>
  );
}
