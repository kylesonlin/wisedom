import React from 'react';
import { Alert } from './Alert';
import { Button } from './Button';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Call onError callback if provided
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-4">
          <Alert variant="destructive">
            <h3 className="text-lg font-semibold">Something went wrong</h3>
            <p className="text-sm mt-2">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Try again
            </Button>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
} 