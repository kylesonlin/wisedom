import { PostgrestError } from '@supabase/supabase-js';
import { DatabaseError } from '@/utils/errors';

// Common PostgreSQL error codes
const ERROR_CODES = {
  UNIQUE_VIOLATION: '23505',
  FOREIGN_KEY_VIOLATION: '23503',
  NOT_NULL_VIOLATION: '23502',
  CHECK_VIOLATION: '23514',
  INVALID_TEXT_REPRESENTATION: '22P02',
  INVALID_DATETIME_FORMAT: '22007',
  INVALID_NUMERIC_VALUE: '22P03',
  INVALID_JSON: '22P04',
  INVALID_UUID: '22P05',
} as const;

// Error messages for common database errors
const ERROR_MESSAGES = {
  [ERROR_CODES.UNIQUE_VIOLATION]: 'A record with this information already exists',
  [ERROR_CODES.FOREIGN_KEY_VIOLATION]: 'Referenced record does not exist',
  [ERROR_CODES.NOT_NULL_VIOLATION]: 'Required field is missing',
  [ERROR_CODES.CHECK_VIOLATION]: 'Invalid value provided',
  [ERROR_CODES.INVALID_TEXT_REPRESENTATION]: 'Invalid text format',
  [ERROR_CODES.INVALID_DATETIME_FORMAT]: 'Invalid date/time format',
  [ERROR_CODES.INVALID_NUMERIC_VALUE]: 'Invalid numeric value',
  [ERROR_CODES.INVALID_JSON]: 'Invalid JSON format',
  [ERROR_CODES.INVALID_UUID]: 'Invalid UUID format',
} as const;

/**
 * Handles database errors and converts them to application-specific errors
 */
export function handleDatabaseError(error: PostgrestError | Error): DatabaseError {
  // Handle PostgrestError
  if ('code' in error) {
    const pgError = error as PostgrestError;
    const errorCode = pgError.code;
    const errorMessage = ERROR_MESSAGES[errorCode as keyof typeof ERROR_MESSAGES] || pgError.message;

    // Add additional context based on error type
    let details: Record<string, unknown> = {};
    if (errorCode === ERROR_CODES.UNIQUE_VIOLATION) {
      details = { constraint: pgError.details };
    } else if (errorCode === ERROR_CODES.FOREIGN_KEY_VIOLATION) {
      details = { constraint: pgError.details };
    }

    return new DatabaseError(errorMessage, errorCode, details);
  }

  // Handle generic errors
  return new DatabaseError(error.message, 'UNKNOWN_ERROR');
}

/**
 * Validates database query results
 */
export function validateQueryResult<T>(result: { data: T | null; error: PostgrestError | null }): T {
  if (result.error) {
    throw handleDatabaseError(result.error);
  }
  if (!result.data) {
    throw new DatabaseError('No data found', 'NOT_FOUND');
  }
  return result.data;
}

/**
 * Validates database query results that may return null
 */
export function validateNullableQueryResult<T>(result: { data: T | null; error: PostgrestError | null }): T | null {
  if (result.error) {
    throw handleDatabaseError(result.error);
  }
  return result.data;
}

/**
 * Validates database query results that return an array
 */
export function validateArrayQueryResult<T>(result: { data: T[] | null; error: PostgrestError | null }): T[] {
  if (result.error) {
    throw handleDatabaseError(result.error);
  }
  if (!result.data) {
    return [];
  }
  return result.data;
}

/**
 * Handles database transaction errors
 */
export function handleTransactionError(error: unknown): never {
  if (error instanceof Error) {
    throw handleDatabaseError(error);
  }
  throw new DatabaseError('Unknown transaction error', 'UNKNOWN_ERROR');
}

/**
 * Validates database operation results
 */
export function validateOperationResult(result: { error: PostgrestError | null }): void {
  if (result.error) {
    throw handleDatabaseError(result.error);
  }
} 