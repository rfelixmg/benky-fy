'use client';

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  private reloadPage = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-6 bg-red-50 border border-red-100 rounded-lg shadow-sm max-w-lg mx-auto my-8">
          <div className="flex items-center mb-4">
            <svg className="w-6 h-6 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-lg text-red-800 font-medium">Something went wrong</h2>
          </div>
          
          <div className="bg-white p-4 rounded border border-red-100 mb-4">
            <p className="text-sm text-red-600 font-mono whitespace-pre-wrap">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            {this.state.error?.stack && (
              <details className="mt-2">
                <summary className="text-sm text-red-500 cursor-pointer hover:text-red-600">
                  Show error details
                </summary>
                <pre className="mt-2 text-xs text-red-500 overflow-auto p-2 bg-red-50 rounded">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={this.resetError}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={this.reloadPage}
              className="flex-1 px-4 py-2 bg-white text-red-600 border border-red-200 rounded hover:bg-red-50 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}