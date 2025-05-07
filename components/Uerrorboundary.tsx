import React from 'react';
import { Card } from '@/components/ui/Ucard';
import { Button } from '@/components/ui/Ubutton';

interface Props {
  children: React.ReactNode;
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
    // Log error to your error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="p-6 max-w-md mx-auto mt-8">
          <h2 className="text-xl font-semibold mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-4">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <div className="flex gap-4">
            <Button
              onClick={() => window.location.reload()}
              variant="default"
            >
              Refresh Page
            </Button>
            <Button
              onClick={() => this.setState({ hasError: false, error: null })}
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
} 