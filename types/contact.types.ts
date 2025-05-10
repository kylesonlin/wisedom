export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  role?: string;
  title?: string;
  status: 'active' | 'inactive' | 'archived';
  category?: string;
  createdAt: Date;
  updatedAt: Date;
  lastContactedAt?: Date;
  nextFollowUpDate?: Date;
  birthday?: Date;
  notes?: string;
  assignedTo?: string;
  additionalFields?: Record<string, string | number | boolean | null | {
    mergedAt: Date;
    strategy: 'prefer_new' | 'prefer_existing' | 'combine' | 'custom';
    customRules: {
      field: keyof Contact;
      strategy: 'prefer_new' | 'prefer_existing' | 'combine' | 'custom';
      customFunction?: string;
    }[];
    originalValues: Record<string, any>;
  }>;
  metadata?: ContactMetadata;
  settings?: ContactSettings;
  relationships?: {
    userId: string;
    type: 'primary' | 'secondary' | 'team';
    permissions: Array<'view' | 'edit' | 'delete'>;
  }[];
}

export interface ContactMetadata {
  lastSyncAt?: Date;
  syncSource?: string;
  tags?: string[];
  customFields?: Record<string, any>;
}

export interface ContactSettings {
  notifications?: {
    email?: boolean;
    push?: boolean;
    frequency?: 'daily' | 'weekly' | 'monthly';
  };
  privacy?: {
    isPublic?: boolean;
    sharedWith?: string[];
  };
  display?: {
    showAvatar?: boolean;
    showStats?: boolean;
    layout?: 'compact' | 'detailed';
  };
  preferences?: {
    contactMethod?: 'email' | 'phone' | 'any';
    timezone?: string;
    language?: string;
  };
}

export interface NormalizedContact extends Omit<Contact, 'email' | 'phone' | 'firstName' | 'lastName'> {
  email: string;
  normalizedEmail: string;
  phone?: string;
  normalizedPhone?: string;
  firstName?: string;
  lastName?: string;
  normalizedName?: string;
  source: string;
  confidence: number;
  normalizationTimestamp: Date;
  originalValues: {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
  };
}

export interface ContactImportResult {
  contacts: NormalizedContact[];
  totalProcessed: number;
  duplicatesFound: number;
  processingTime: number;
  normalizationStats: {
    emailsNormalized: number;
    phonesNormalized: number;
    namesNormalized: number;
  };
  batchStats: {
    totalBatches: number;
    averageBatchSize: number;
  };
}

export interface ContactImportOptions {
  batchSize: number;
  similarityThreshold: number;
  onProgress?: (progress: number) => void;
  onBatchProcessed?: (batch: NormalizedContact[]) => void;
  onNormalizationComplete?: (stats: ContactImportResult) => void;
  onError?: (error: Error) => void;
}

export type ContactStatus = 'active' | 'inactive' | 'archived';
export type ContactSource = 'manual' | 'import' | 'api' | 'test'; 