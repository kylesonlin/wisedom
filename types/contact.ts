export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  title?: string;
  birthday?: string;
  relationshipStrength?: number;
  assignedTo?: string;
  tags?: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  source?: string;
  additionalFields?: Record<string, any>;
}

export interface Interaction {
  id: string;
  contact_id: string;
  type: 'email' | 'call' | 'meeting' | 'note';
  timestamp: string;
  summary?: string;
  sentiment?: number;
  topics?: string[];
  metadata?: {
    pendingAction?: string;
    followUpRequired?: boolean;
    suggestedNextAction?: 'email' | 'call' | 'meeting';
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

export type FilterGroupOperation = {
  id: string;
  filters: Array<{
    field: keyof Contact;
    operator: string;
    value: string;
    value2?: string;
    customFunction?: string;
    isRegex?: boolean;
    caseSensitive?: boolean;
    validationPattern?: string;
    validationMessage?: string;
  }>;
  combination: 'AND' | 'OR';
  parentGroupId?: string;
  level: number;
};

export type BatchOperation = {
  type: 'edit' | 'delete' | 'group';
  contacts: Contact[];
  timestamp: number;
  description: string;
  preview?: Contact[];
};

export type ImportOperation = {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  type: 'import' | 'merge' | 'deduplicate';
  metadata: {
    totalContacts: number;
    processedContacts: number;
    failedContacts: number;
    startTime: number;
    endTime?: number;
  };
}; 