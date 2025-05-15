import { Contact } from '../types/contact';

export interface ErrorContext {
  userId?: string;
  timestamp: Date;
  requestId?: string;
  componentName?: string;
  additionalInfo?: Record<string, unknown>;
  stackTrace?: string;
}

export interface BaseError extends Error {
  details?: {
    code: string;
    message: string;
    context?: ErrorContext;
  };
  type?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  recoverable?: boolean;
  timestamp: Date;
}

export interface ImportError extends BaseError {
  type: 'IMPORT_ERROR';
}

export interface ProcessingError extends BaseError {
  type: 'PROCESSING_ERROR';
}

export interface DatabaseError extends BaseError {
  type: 'DATABASE_ERROR';
}

export interface ValidationError extends BaseError {
  type: 'VALIDATION_ERROR';
}

export type ErrorType = 'IMPORT_ERROR' | 'PROCESSING_ERROR' | 'DATABASE_ERROR' | 'VALIDATION_ERROR';
export type RecoverableError = ImportError | ProcessingError | DatabaseError | ValidationError;

interface ErrorRecoveryStrategy {
  type: ErrorType;
  canRecover: (error: RecoverableError) => boolean;
  recover: (error: RecoverableError) => Promise<void>;
}

const errorRecoveryStrategies: ErrorRecoveryStrategy[] = [
  {
    type: 'IMPORT_ERROR',
    canRecover: (error) => {
      return error.details?.code === 'FILE_NOT_FOUND';
    },
    recover: async (error) => {
      // Implement import error recovery
      console.log('Recovering from import error:', error);
      // Add retry logic or alternative import method
    }
  },
  {
    type: 'PROCESSING_ERROR',
    canRecover: (error) => {
      return error.details?.code === 'CONNECTION_ERROR';
    },
    recover: async (error) => {
      // Implement processing error recovery
      console.log('Recovering from processing error:', error);
      // Add retry logic with exponential backoff
    }
  },
  {
    type: 'DATABASE_ERROR',
    canRecover: (error) => {
      return error.details?.code === 'DEADLOCK';
    },
    recover: async (error) => {
      // Implement database error recovery
      console.log('Recovering from database error:', error);
      // Add retry logic with transaction management
    }
  },
  {
    type: 'VALIDATION_ERROR',
    canRecover: (error) => {
      return error.details?.code === 'INVALID_FORMAT' && error.details?.context !== undefined;
    },
    recover: async (error) => {
      console.log('Recovering from validation error:', error);
      // Add data normalization or transformation logic
    }
  }
];

export async function handleError(error: Error, type: ErrorType): Promise<void> {
  const strategy = errorRecoveryStrategies.find(s => s.type === type);
  
  if (!strategy) {
    throw new Error(`No recovery strategy found for error type: ${type}`);
  }

  const recoverableError = error as RecoverableError;
  if (strategy.canRecover(recoverableError)) {
    await strategy.recover(recoverableError);
  } else {
    throw error;
  }
}

export class ErrorRecoveryService {
  private static instance: ErrorRecoveryService;
  private strategies: ErrorRecoveryStrategy[] = [];

  private constructor() {
    // Initialize with default strategies
    this.strategies = errorRecoveryStrategies;
  }

  public static getInstance(): ErrorRecoveryService {
    if (!ErrorRecoveryService.instance) {
      ErrorRecoveryService.instance = new ErrorRecoveryService();
    }
    return ErrorRecoveryService.instance;
  }

  getRecoveryStrategies(): ErrorRecoveryStrategy[] {
    return this.strategies;
  }

  addRecoveryStrategy(strategy: ErrorRecoveryStrategy): void {
    this.strategies.push(strategy);
  }

  async handleError(error: Error, type: ErrorType): Promise<void> {
    await handleError(error, type);
  }

  async attemptRecovery(error: ImportError): Promise<boolean> {
    const strategy = this.strategies.find(s => s.type === error.type);
    
    if (!strategy || !strategy.canRecover(error)) {
      return false;
    }

    try {
      await strategy.recover(error);
      return true;
    } catch (recoveryError) {
      console.error('Recovery attempt failed:', recoveryError);
      return false;
    }
  }

  async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 1000
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, i)));
        }
      }
    }
    
    throw lastError;
  }

  async fallbackOperation<T>(
    primaryOperation: () => Promise<T>,
    fallbackOperation: () => Promise<T>
  ): Promise<T> {
    try {
      return await primaryOperation();
    } catch (error) {
      console.warn('Primary operation failed, attempting fallback:', error);
      return await fallbackOperation();
    }
  }
} 