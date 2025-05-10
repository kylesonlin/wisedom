import { Contact } from '../types/contact';
import { NormalizedContact } from '../utils/contactNormalization';

// Safe function evaluation
export function safeEvaluateFunction<T>(fn: string, defaultValue: T): T {
  try {
    const result = new Function(`return ${fn}`)();
    return result;
  } catch (error) {
    console.error('Error evaluating function:', error);
    return defaultValue;
  }
}

// Safe date parsing
export function safeParseDate(dateStr: string, defaultValue: Date = new Date()): Date {
  try {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? defaultValue : date;
  } catch (error) {
    console.error('Error parsing date:', error);
    return defaultValue;
  }
}

// Environment variable validation
export function validateEnvVars(): void {
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}

// Safe Supabase operation
export async function safeSupabaseOperation<T>(
  operation: () => Promise<T>,
  errorMessage: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.error(errorMessage, error);
    throw error;
  }
}

// Batch processing with retry
export async function processBatchWithRetry<T extends NormalizedContact, R>(
  items: T[],
  processFn: (batch: T[]) => Promise<R>,
  options: {
    maxRetries?: number;
    batchSize?: number;
    retryDelay?: number;
  } = {}
): Promise<R> {
  const {
    maxRetries = 3,
    batchSize = 100,
    retryDelay = 1000
  } = options;

  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }

  let lastError: Error | null = null;
  for (let retry = 0; retry < maxRetries; retry++) {
    try {
      return await processFn(batches[0]);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (retry < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * (retry + 1)));
      }
    }
  }

  throw lastError || new Error('Failed to process batch after all retries');
}

// Resource cleanup
export function cleanupResources(
  setContacts: React.Dispatch<React.SetStateAction<NormalizedContact[]>>,
  setSimilarityGroups: React.Dispatch<React.SetStateAction<NormalizedContact[][]>>,
  setPreviewContacts: React.Dispatch<React.SetStateAction<NormalizedContact[]>>,
  setOperationHistory: React.Dispatch<React.SetStateAction<Array<{
    type: 'edit' | 'delete' | 'group';
    contacts: NormalizedContact[];
    timestamp: number;
    description: string;
    preview?: NormalizedContact[];
  }>>>,
  setHistoryIndex: React.Dispatch<React.SetStateAction<number>>
): void {
  setContacts([]);
  setSimilarityGroups([]);
  setPreviewContacts([]);
  setOperationHistory([]);
  setHistoryIndex(-1);
}

// Duplicate detection
export function isPotentialDuplicate(contact1: NormalizedContact, contact2: NormalizedContact): boolean {
  const emailMatch = contact1.email && contact2.email && contact1.email === contact2.email;
  const phoneMatch = contact1.phone && contact2.phone && contact1.phone === contact2.phone;
  const nameMatch = contact1.firstName === contact2.firstName && contact1.lastName === contact2.lastName;
  return emailMatch || phoneMatch || nameMatch;
} 