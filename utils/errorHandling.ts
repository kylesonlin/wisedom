import { Contact } from '../types/contact';

export type ImportErrorType = 'FILE_ERROR' | 'PARSE_ERROR' | 'VALIDATION_ERROR' | 'PROCESSING_ERROR' | 'SAVE_ERROR';

export interface ImportErrorContext {
  file?: string;
  line?: number;
  column?: number;
  code?: string;
  sessionId?: string;
  fileFormat?: string;
  userId?: string;
  lineNumber?: number;
  batchIndex?: number;
}

export class ImportError extends Error {
  type: ImportErrorType;
  details: Record<string, any>;
  timestamp: Date;
  context?: ImportErrorContext;

  constructor(type: ImportErrorType, message: string, details?: Record<string, any>, context?: ImportErrorContext) {
    super(message);
    this.type = type;
    this.details = details || {};
    this.timestamp = new Date();
    this.context = context;
    this.name = 'ImportError';
  }
}

export class ValidationError extends ImportError {
  constructor(message: string, details?: Record<string, any>, context?: ImportErrorContext) {
    super('VALIDATION_ERROR', message, details, context);
    this.name = 'ValidationError';
  }
}

export class ProcessingError extends ImportError {
  constructor(message: string, details?: Record<string, any>, context?: ImportErrorContext) {
    super('PROCESSING_ERROR', message, details, context);
    this.name = 'ProcessingError';
  }
}

export class SaveError extends ImportError {
  constructor(message: string, details?: Record<string, any>, context?: ImportErrorContext) {
    super('SAVE_ERROR', message, details, context);
    this.name = 'SaveError';
  }
}

export function createError(type: ImportErrorType, message: string, error?: Error, context?: ImportErrorContext): ImportError {
  const details: Record<string, any> = {};
  if (error) {
    details.stack = error.stack;
    details.name = error.name;
    if (error instanceof ImportError) {
      Object.assign(details, error.details);
    }
  }
  return new ImportError(type, message, details, context);
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