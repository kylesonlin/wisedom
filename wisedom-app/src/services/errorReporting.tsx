interface ErrorInfo {
  message: string;
  stack?: string;
  context?: string;
  timestamp: string;
  type: string;
  additionalInfo: Record<string, unknown>;
}

interface ImportError extends Error {
  code?: string;
  details?: unknown;
  cause?: unknown;
}

function isImportError(error: unknown): error is ImportError {
  return error instanceof Error && "code" in error;
}

export enum ErrorType {
  NETWORK_ERROR = "NETWORK_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
  FILE_ERROR = "FILE_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

const errorSeverity: Record<ErrorType, number> = {
  [ErrorType.NETWORK_ERROR]: 2,
  [ErrorType.VALIDATION_ERROR]: 1,
  [ErrorType.AUTHENTICATION_ERROR]: 3,
  [ErrorType.FILE_ERROR]: 1,
  [ErrorType.UNKNOWN_ERROR]: 0,
};

export function reportError(error: unknown, context?: string): void {
  const errorInfo: ErrorInfo = {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    context,
    timestamp: new Date().toISOString(),
    type: error instanceof Error ? error.constructor.name : typeof error,
    additionalInfo: {},
  };

  // Add specific handling for ImportError
  if (isImportError(error)) {
    errorInfo.additionalInfo = {
      code: error.code,
      details: error.details,
      cause: error.cause,
    };
  }

  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.error("Error reported:", errorInfo);
  }

  // TODO: Implement actual error reporting service integration
  // This could be Sentry, LogRocket, or a custom solution
}
