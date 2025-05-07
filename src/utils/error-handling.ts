export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorDetails {
  message: string;
  code?: string;
  severity: ErrorSeverity;
  context?: Record<string, unknown>;
  timestamp: Date;
}

export class AppError extends Error {
  public readonly details: ErrorDetails;

  constructor(message: string, details: Omit<ErrorDetails, 'timestamp'>) {
    super(message);
    this.name = 'AppError';
    this.details = {
      ...details,
      timestamp: new Date(),
    };
  }
}

export function handleError(error: unknown): ErrorDetails {
  if (error instanceof AppError) {
    return error.details;
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      severity: 'medium',
      timestamp: new Date(),
    };
  }

  return {
    message: 'An unknown error occurred',
    severity: 'medium',
    timestamp: new Date(),
  };
}

export function isRecoverableError(error: unknown): boolean {
  if (error instanceof AppError) {
    return error.details.severity !== 'critical';
  }
  return true;
}

export function formatErrorForDisplay(error: unknown): string {
  if (error instanceof AppError) {
    return `${error.details.message} (${error.details.code || 'No code'})`;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
}

export function getErrorResolutionSteps(error: unknown): string[] {
  if (error instanceof AppError) {
    switch (error.details.severity) {
      case 'critical':
        return [
          'Please contact support immediately',
          'Save any unsaved work',
          'Try refreshing the page',
        ];
      case 'high':
        return [
          'Try refreshing the page',
          'Clear your browser cache',
          'Contact support if the issue persists',
        ];
      case 'medium':
        return [
          'Try the action again',
          'Check your input data',
          'Contact support if the issue persists',
        ];
      case 'low':
        return [
          'Try the action again',
          'Check your input data',
        ];
    }
  }
  return [
    'Try the action again',
    'Refresh the page if the issue persists',
    'Contact support if the problem continues',
  ];
} 