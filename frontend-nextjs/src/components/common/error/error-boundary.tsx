'use client';

import React from "react";
import { ErrorBoundaryProps, ErrorBoundaryState } from "./types";
import { ErrorDisplay } from "./error-display";
import { useError } from "./error-context";

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    // You could also send this to an error reporting service
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error}
            resetError={this.resetError}
          />
        );
      }

      return (
        <ErrorDisplay
          error={this.state.error}
          actions={[
            {
              label: "Try Again",
              onClick: this.resetError,
              className: "bg-white text-primary hover:bg-white/90",
            },
          ]}
        />
      );
    }

    return this.props.children;
  }
}
