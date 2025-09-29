'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function ModulesError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Modules page error:', error);
  }, [error]);

  const errorMessage = error.message.includes('Authentication required') 
    ? 'Please log in to view modules'
    : error.message.includes('environment variables')
    ? 'Server configuration issue. Please check setup instructions.'
    : 'Failed to load modules. Please try again.';

  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          {errorMessage}
        </h2>
        
        {error.message.includes('Authentication required') ? (
          <Link
            href="/login"
            className="inline-block bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            Go to Login
          </Link>
        ) : (
          <button
            onClick={reset}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}