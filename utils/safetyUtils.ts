import { Contact } from '../types/contact';

// Safe function evaluation
export const safeEvaluateFunction = (fnString: string, ...args: any[]): any => {
  try {
    const fn = new Function(...args.map((_, i) => `arg${i}`), fnString);
    return fn(...args);
  } catch (error) {
    console.error('Error evaluating function:', error);
    return null;
  }
};

// Safe date parsing
export const safeParseDate = (date: string | Date | null): Date | null => {
  if (!date) return null;
  try {
    const parsed = new Date(date);
    return isNaN(parsed.getTime()) ? null : parsed;
  } catch {
    return null;
  }
};

// Environment variable validation
export const validateEnvVars = () => {
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];
  
  const missing = requiredVars.filter(varName => !process.env[varName]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

// Safe Supabase operation wrapper
export async function safeSupabaseOperation<T>(
  operation: () => Promise<{ data: T; error: any }>
): Promise<T> {
  try {
    const { data, error } = await operation();
    if (error) {
      console.error('Supabase operation failed:', error);
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error in safeSupabaseOperation:', error);
    throw error;
  }
}

// Batch processing with retry
export async function processBatchWithRetry<T, R>(
  items: T[],
  processFn: (batch: T[]) => Promise<R>,
  options: {
    batchSize?: number;
    maxRetries?: number;
    retryDelay?: number;
  } = {}
): Promise<R> {
  const {
    batchSize = 100,
    maxRetries = 3,
    retryDelay = 1000
  } = options;

  let lastError: Error | null = null;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      return await processFn(items);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      retryCount++;
      
      if (retryCount < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * retryCount));
      }
    }
  }

  throw lastError || new Error('Failed to process batch after retries');
}

// Resource cleanup
export const cleanupResources = (setters: {
  setContacts: (contacts: Contact[]) => void;
  setSimilarityGroups: (groups: Contact[][]) => void;
  setPreviewContacts: (contacts: Contact[]) => void;
  setOperationHistory: (history: any[]) => void;
  setHistoryIndex: (index: number) => void;
}) => {
  setters.setContacts([]);
  setters.setSimilarityGroups([]);
  setters.setPreviewContacts([]);
  setters.setOperationHistory([]);
  setters.setHistoryIndex(-1);
};

// Enhanced duplicate detection with null safety
export const isPotentialDuplicate = (contactA: Contact, contactB: Contact): boolean => {
  if (!contactA || !contactB) return false;
  
  const emailMatch = Boolean(contactA.email) && Boolean(contactB.email) && contactA.email === contactB.email;
  const phoneMatch = Boolean(contactA.phone) && Boolean(contactB.phone) && contactA.phone === contactB.phone;
  const getFullName = (contact: any) => `${contact.firstName ?? ''} ${contact.lastName ?? ''}`.trim();
  const nameMatch = Boolean(getFullName(contactA)) && Boolean(getFullName(contactB)) &&
    getFullName(contactA).trim().toLowerCase() === getFullName(contactB).trim().toLowerCase();
  
  return emailMatch || phoneMatch || (nameMatch && Boolean(contactA.email || contactA.phone) && Boolean(contactB.email || contactB.phone));
}; 