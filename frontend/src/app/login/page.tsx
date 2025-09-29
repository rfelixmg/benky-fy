import { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Login | Benky-Fy',
  description: 'Log in to your Benky-Fy account',
};

'use client';

import { useState } from 'react';

export default function LoginPage() {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTestLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/test-login');
      const data = await response.json().catch(() => null);
      
      if (response.ok) {
        window.location.href = '/';
      } else {
        setError(data?.error || 'Login failed. Please try again.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Test login error:', error);
      setError('Connection error. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="flex flex-col items-center">
          <Image
            src="/img/logo.png"
            alt="BenkyFY logo"
            width={80}
            height={80}
            className="h-20 w-auto"
            priority
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to Benky-fy
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Study Japanese, one card at a time
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="space-y-4">
            {/* Server Status Indicator */}
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 mb-6">
              <div className="flex items-center">
                <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                <span>Flask API</span>
              </div>
              <span>•</span>
              <div className="flex items-center">
                <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                <span>Next.js Frontend</span>
              </div>
            </div>

            {/* Production Login */}
            <a
              href="/auth/google"
              className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              onClick={(e) => {
                const btn = e.currentTarget;
                btn.classList.add('opacity-75', 'cursor-wait');
                btn.innerHTML = '<span class="inline-flex items-center">Redirecting to Google... <svg class="animate-spin ml-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></span>';
              }}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                />
              </svg>
              Sign in with Google
            </a>

            {/* Development Test Login */}
            {error && (
              <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-lg" role="alert">
                <p className="text-sm">{error}</p>
              </div>
            )}

            {isDevelopment && (
              <button
                onClick={handleTestLogin}
                disabled={isLoading}
                className={`w-full flex items-center justify-center py-3 px-4 border-2 border-green-600 rounded-lg shadow-sm text-sm font-medium ${
                  isLoading 
                    ? 'opacity-75 cursor-wait bg-green-50' 
                    : 'text-green-700 bg-white hover:bg-green-50'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors`}
              >
                {isLoading ? (
                  <span className="inline-flex items-center">
                    Logging in as test user...
                    <svg className="animate-spin ml-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </span>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Development Test Login
                  </>
                )}
              </button>
            )}
          </div>

          {/* Environment Indicator */}
          {isDevelopment && (
            <div className="text-center text-xs text-gray-500 mt-8">
              Development Environment
              <div className="text-xs text-gray-400 mt-1">
                Flask API: localhost:5000 • Next.js: localhost:3000
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}