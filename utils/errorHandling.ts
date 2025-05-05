import { Contact } from '../types/contact';

export enum ImportErrorType {
  FILE_READ = 'FILE_READ',
  FILE_PARSE = 'FILE_PARSE',
  FILE_FORMAT = 'FILE_FORMAT',
  NORMALIZATION = 'NORMALIZATION',
  DUPLICATE_DETECTION = 'DUPLICATE_DETECTION',
  DATABASE = 'DATABASE',
  VALIDATION = 'VALIDATION',
  UNKNOWN = 'UNKNOWN'
}

export interface ImportError {
  type: ImportErrorType;
  message: string;
  details?: any;
  timestamp: Date;
  context?: {
    fileFormat?: string;
    lineNumber?: number;
    contact?: Partial<Contact>;
    batchIndex?: number;
  };
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
    ImportErrorType.FILE_PARSE,
    ImportErrorType.NORMALIZATION,
    ImportErrorType.DUPLICATE_DETECTION
  ];
  
  return recoverableTypes.includes(error.type);
}

export function getErrorResolutionSteps(error: ImportError): string[] {
  const steps: string[] = [];
  
  switch (error.type) {
    case ImportErrorType.FILE_READ:
      steps.push('Check if the file exists and is accessible');
      steps.push('Verify file permissions');
      steps.push('Try uploading the file again');
      break;
      
    case ImportErrorType.FILE_PARSE:
      steps.push('Verify the file format matches the selected format');
      steps.push('Check for any malformed data in the file');
      steps.push('Ensure all required fields are present');
      break;
      
    case ImportErrorType.NORMALIZATION:
      steps.push('Review the problematic contact data');
      steps.push('Manually correct the data if possible');
      steps.push('Try importing again with corrected data');
      break;
      
    case ImportErrorType.DATABASE:
      steps.push('Check database connection');
      steps.push('Verify database permissions');
      steps.push('Contact system administrator if issue persists');
      break;
      
    default:
      steps.push('Try the operation again');
      steps.push('Contact support if the issue persists');
  }
  
  return steps;
} 