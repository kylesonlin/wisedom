import React from 'react';
import { ErrorBoundary } from './error-boundary';
import { handleError, formatErrorForDisplay, getErrorResolutionSteps } from '../utils/error-handling';

interface WithErrorBoundaryOptions {
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  componentName?: string;
}

export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithErrorBoundaryOptions = {}
) {
  const displayName = options.componentName || WrappedComponent.displayName || WrappedComponent.name || 'Component';

  const WithErrorBoundary = (props: P) => {
    const handleErrorCallback = (error: Error, errorInfo: React.ErrorInfo) => {
      // Log the error
      console.error(`Error in ${displayName}:`, error, errorInfo);
      
      // Handle the error using our utility
      const errorDetails = handleError(error);
      
      // Call the provided onError callback if it exists
      if (options.onError) {
        options.onError(error, errorInfo);
      }
    };

    const defaultFallback = (
      <div className="p-4 rounded-lg bg-red-50 border border-red-200">
        <h2 className="text-lg font-semibold text-red-800">
          Error in {displayName}
        </h2>
        <p className="mt-2 text-sm text-red-600">
          An unexpected error occurred
        </p>
        <ul className="mt-4 list-disc list-inside text-sm text-red-600">
          <li>Try refreshing the page</li>
          <li>Check your internet connection</li>
          <li>Contact support if the problem persists</li>
        </ul>
      </div>
    );

    return (
      <ErrorBoundary
        fallback={options.fallback || defaultFallback}
        onError={handleErrorCallback}
      >
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };

  WithErrorBoundary.displayName = `WithErrorBoundary(${displayName})`;

  return WithErrorBoundary;
} 