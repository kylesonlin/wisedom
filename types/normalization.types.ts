import { NormalizedContact } from './contact.types';

export interface NormalizationRule {
  field: keyof NormalizedContact;
  transform: (value: string) => string;
  validate: (value: string) => boolean;
  description: string;
}

export interface NormalizationStats {
  emailsNormalized: number;
  phonesNormalized: number;
  namesNormalized: number;
  totalProcessed: number;
  errors: NormalizationError[];
}

export interface NormalizationError {
  field: keyof NormalizedContact;
  value: string;
  error: string;
  timestamp: Date;
}

export interface NormalizationOptions {
  rules: NormalizationRule[];
  validateAfterNormalization?: boolean;
  onError?: (error: NormalizationError) => void;
}

export interface NormalizationResult {
  normalizedValue: string;
  confidence: number;
  originalValue: string;
  appliedRules: string[];
}

export type NormalizationField = 'email' | 'phone' | 'name';
export type NormalizationStatus = 'success' | 'error' | 'skipped'; 