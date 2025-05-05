import { ImportError, ImportErrorType } from '../utils/errorHandling';
import { Contact } from '../types/contact';

interface RecoveryStrategy {
  type: ImportErrorType;
  canRecover: (error: ImportError) => boolean;
  recover: (error: ImportError) => Promise<void>;
}

export class ErrorRecoveryService {
  private static instance: ErrorRecoveryService;
  private strategies: RecoveryStrategy[] = [];

  private constructor() {
    this.initializeStrategies();
  }

  static getInstance(): ErrorRecoveryService {
    if (!ErrorRecoveryService.instance) {
      ErrorRecoveryService.instance = new ErrorRecoveryService();
    }
    return ErrorRecoveryService.instance;
  }

  private initializeStrategies(): void {
    this.strategies = [
      {
        type: ImportErrorType.FILE_PARSE,
        canRecover: (error) => {
          const context = error.context;
          return context?.fileFormat !== undefined && 
                 context?.lineNumber !== undefined;
        },
        recover: async (error) => {
          // Implement file parsing recovery
          // This could involve:
          // 1. Attempting to parse the file with different settings
          // 2. Skipping problematic lines
          // 3. Using a different parser
          console.log('Recovering from file parse error:', error);
        }
      },
      {
        type: ImportErrorType.NORMALIZATION,
        canRecover: (error) => {
          const contact = error.context?.contact;
          return contact !== undefined;
        },
        recover: async (error) => {
          // Implement contact normalization recovery
          // This could involve:
          // 1. Using fallback normalization rules
          // 2. Manual review of problematic contacts
          // 3. Skipping problematic fields
          console.log('Recovering from normalization error:', error);
        }
      },
      {
        type: ImportErrorType.DUPLICATE_DETECTION,
        canRecover: (error) => {
          const batchIndex = error.context?.batchIndex;
          return batchIndex !== undefined;
        },
        recover: async (error) => {
          // Implement duplicate detection recovery
          // This could involve:
          // 1. Adjusting similarity thresholds
          // 2. Using alternative matching algorithms
          // 3. Manual review of potential duplicates
          console.log('Recovering from duplicate detection error:', error);
        }
      },
      {
        type: ImportErrorType.DATABASE,
        canRecover: (error) => {
          return error.details?.code === 'CONNECTION_ERROR';
        },
        recover: async (error) => {
          // Implement database error recovery
          // This could involve:
          // 1. Retrying the operation
          // 2. Using a fallback database
          // 3. Queueing the operation for later
          console.log('Recovering from database error:', error);
        }
      }
    ];
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

  getRecoveryStrategies(): RecoveryStrategy[] {
    return this.strategies;
  }

  addRecoveryStrategy(strategy: RecoveryStrategy): void {
    this.strategies.push(strategy);
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