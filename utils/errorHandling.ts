import { Contact } from '../types/contact';

export type ImportErrorType = 
  | 'VALIDATION_ERROR'
  | 'API_ERROR'
  | 'DATABASE_ERROR'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

export interface ImportError {
  type: ImportErrorType;
  message: string;
  details?: Record<string, any>;
  context?: Record<string, any>;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
}

export class ValidationError implements ImportError {
  type: ImportErrorType = 'VALIDATION_ERROR';
  message: string;
  details?: Record<string, any>;
  context?: Record<string, any>;
  timestamp: Date;
  userId?: string;
  sessionId?: string;

  constructor(message: string, details?: Record<string, any>, context?: Record<string, any>) {
    this.message = message;
    this.details = details;
    this.context = context;
    this.timestamp = new Date();
  }
}

export class ApiError implements ImportError {
  type: ImportErrorType = 'API_ERROR';
  message: string;
  details?: Record<string, any>;
  context?: Record<string, any>;
  timestamp: Date;
  userId?: string;
  sessionId?: string;

  constructor(message: string, details?: Record<string, any>, context?: Record<string, any>) {
    this.message = message;
    this.details = details;
    this.context = context;
    this.timestamp = new Date();
  }
}

export class DatabaseError implements ImportError {
  type: ImportErrorType = 'DATABASE_ERROR';
  message: string;
  details?: Record<string, any>;
  context?: Record<string, any>;
  timestamp: Date;
  userId?: string;
  sessionId?: string;

  constructor(message: string, details?: Record<string, any>, context?: Record<string, any>) {
    this.message = message;
    this.details = details;
    this.context = context;
    this.timestamp = new Date();
  }
}

export class NetworkError implements ImportError {
  type: ImportErrorType = 'NETWORK_ERROR';
  message: string;
  details?: Record<string, any>;
  context?: Record<string, any>;
  timestamp: Date;
  userId?: string;
  sessionId?: string;

  constructor(message: string, details?: Record<string, any>, context?: Record<string, any>) {
    this.message = message;
    this.details = details;
    this.context = context;
    this.timestamp = new Date();
  }
}

export class UnknownError implements ImportError {
  type: ImportErrorType = 'UNKNOWN_ERROR';
  message: string;
  details?: Record<string, any>;
  context?: Record<string, any>;
  timestamp: Date;
  userId?: string;
  sessionId?: string;

  constructor(message: string, details?: Record<string, any>, context?: Record<string, any>) {
    this.message = message;
    this.details = details;
    this.context = context;
    this.timestamp = new Date();
  }
}

export class ImportErrorLogger {
  private static instance: ImportErrorLogger;
  private errors: ImportError[] = [];

  private constructor() {}

  static getInstance(): ImportErrorLogger {
    if (!ImportErrorLogger.instance) {
      ImportErrorLogger.instance = new ImportErrorLogger();
    }
    return ImportErrorLogger.instance;
  }

  logError(error: Omit<ImportError, 'timestamp'>): ImportError {
    const fullError: ImportError = {
      ...error,
      timestamp: new Date()
    };
    
    this.errors.push(fullError);
    console.error('Contact Import Error:', {
      type: fullError.type,
      message: fullError.message,
      details: fullError.details,
      context: fullError.context
    });
    
    return fullError;
  }

  getErrors(): ImportError[] {
    return this.errors;
  }

  getErrorsByType(type: ImportErrorType): ImportError[] {
    return this.errors.filter(error => error.type === type);
  }

  clearErrors(): void {
    this.errors = [];
  }
}

export function createError(
  type: ImportErrorType,
  message: string,
  details?: any,
  context?: ImportError['context']
): ImportError {
  return ImportErrorLogger.getInstance().logError({
    type,
    message,
    details,
    context
  });
}

export function formatErrorForDisplay(error: ImportError): string {
  let formattedMessage = error.message;
  
  if (error.context) {
    if (error.context.fileFormat) {
      formattedMessage += `\nFile Format: ${error.context.fileFormat}`;
    }
    if (error.context.lineNumber) {
      formattedMessage += `\nLine Number: ${error.context.lineNumber}`;
    }
    if (error.context.batchIndex !== undefined) {
      formattedMessage += `\nBatch Index: ${error.context.batchIndex}`;
    }
  }
  
  return formattedMessage;
}

export function isRecoverableError(error: ImportError): boolean {
  const recoverableTypes = [
    'VALIDATION_ERROR',
    'DATABASE_ERROR',
    'NETWORK_ERROR'
  ];
  
  return recoverableTypes.includes(error.type);
}

export function getErrorResolutionSteps(error: ImportError): string[] {
  const steps: string[] = [];
  
  switch (error.type) {
    case 'VALIDATION_ERROR':
      steps.push('Review the validation error details');
      steps.push('Manually correct the data if possible');
      steps.push('Try importing again with corrected data');
      break;
      
    case 'DATABASE_ERROR':
      steps.push('Check database connection');
      steps.push('Verify database permissions');
      steps.push('Contact system administrator if issue persists');
      break;
      
    case 'NETWORK_ERROR':
      steps.push('Check network connection');
      steps.push('Try the operation again');
      steps.push('Contact support if the issue persists');
      break;
      
    default:
      steps.push('Try the operation again');
      steps.push('Contact support if the issue persists');
  }
  
  return steps;
} 