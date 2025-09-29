import { useState, useCallback } from 'react';
import { analytics } from '@/lib/analytics';

interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, any>;
}

interface UseApiErrorReturn {
  error: ApiError | null;
  setError: (error: ApiError | null) => void;
  handleError: (error: unknown, context?: string) => void;
  clearError: () => void;
}

export function useApiError(): UseApiErrorReturn {
  const [error, setError] = useState<ApiError | null>(null);

  const handleError = useCallback((error: unknown, context?: string) => {
    let apiError: ApiError;

    if (error instanceof Error) {
      apiError = {
        message: error.message,
        details: {
          name: error.name,
          stack: error.stack,
        },
      };
    } else if (typeof error === 'string') {
      apiError = { message: error };
    } else if (error && typeof error === 'object' && 'message' in error) {
      apiError = error as ApiError;
    } else {
      apiError = { message: 'An unexpected error occurred' };
    }

    // Track error for analytics
    analytics.track('api_error', {
      context,
      error: {
        message: apiError.message,
        code: apiError.code,
      },
    });

    setError(apiError);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    setError,
    handleError,
    clearError,
  };
}
