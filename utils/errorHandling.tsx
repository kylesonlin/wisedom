import { Contact } from '../types/contact';

export type ImportErrorType = 'FILE_ERROR' | 'PARSE_ERROR' | 'VALIDATION_ERROR' | 'PROCESSING_ERROR' | 'SAVE_ERROR';

export interface ImportErrorContext {
  file: string;
  lineNumber: number;
  column?: number;
  code: string;
  sessionId: string;
  fileFormat: 'csv' | 'json' | 'xlsx' | 'vcf';
  userId: string;
  batchIndex: number;
  timestamp: Date;
  contactData?: Partial<Contact>;
  errorDetails?: {
    message: string;
    stack?: string;
    cause?: unknown;
  };
}

export class ImportError extends Error {
  type: ImportErrorType;
  context: ImportErrorContext;
  recoverable: boolean;
  timestamp: Date;

  constructor(
    type: ImportErrorType,
    message: string,
    context: ImportErrorContext,
    recoverable = false
  ) {
    super(message);
    this.type = type;
    this.context = context;
    this.recoverable = recoverable;
    this.timestamp = new Date();
    this.name = 'ImportError';
  }
}

export class ValidationError extends ImportError {
  constructor(message: string, context: ImportErrorContext) {
    super('VALIDATION_ERROR', message, context, true);
    this.name = 'ValidationError';
  }
}

export class ProcessingError extends ImportError {
  constructor(message: string, context: ImportErrorContext) {
    super('PROCESSING_ERROR', message, context, false);
    this.name = 'ProcessingError';
  }
}

export class SaveError extends ImportError {
  constructor(message: string, context: ImportErrorContext) {
    super('SAVE_ERROR', message, context, false);
    this.name = 'SaveError';
  }
}

export const isImportError = (error: unknown): error is ImportError => {
  return error instanceof ImportError;
};

export const isValidationError = (error: unknown): error is ValidationError => {
  return error instanceof ValidationError;
};

export const isProcessingError = (error: unknown): error is ProcessingError => {
  return error instanceof ProcessingError;
};

export const isSaveError = (error: unknown): error is SaveError => {
  return error instanceof SaveError;
};

export function createError(
  type: ImportErrorType,
  message: string,
  error?: Error,
  context?: Partial<ImportErrorContext>
): ImportError {
  const baseContext: ImportErrorContext = {
    file: context?.file || 'unknown',
    lineNumber: context?.lineNumber || 0,
    code: context?.code || 'UNKNOWN_ERROR',
    sessionId: context?.sessionId || 'unknown',
    fileFormat: context?.fileFormat || 'csv',
    userId: context?.userId || 'unknown',
    batchIndex: context?.batchIndex || 0,
    timestamp: new Date(),
    errorDetails: error ? {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    } : undefined
  };

  switch (type) {
    case 'VALIDATION_ERROR':
      return new ValidationError(message, baseContext);
    case 'PROCESSING_ERROR':
      return new ProcessingError(message, baseContext);
    case 'SAVE_ERROR':
      return new SaveError(message, baseContext);
    default:
      return new ImportError(type, message, baseContext);
  }
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
      
    case 'PROCESSING_ERROR':
      steps.push('Check database connection');
      steps.push('Verify database permissions');
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