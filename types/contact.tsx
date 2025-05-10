import { Interaction } from './interaction';

export interface ContactMetadata {
  lastInteraction?: Date;
  nextFollowUp?: Date;
  relationshipStrength?: number;
  tags?: string[];
  notes?: string;
  customFields?: Record<string, string | number | boolean | null>;
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

export interface ContactFilterOptions {
  status?: 'active' | 'inactive' | 'archived';
  category?: string[];
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  searchTerm?: string;
  sortBy?: 'name' | 'date' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface ContactSortOptions {
  field: keyof Contact;
  direction: 'asc' | 'desc';
  customComparator?: (a: Contact, b: Contact) => number;
}

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
  importance?: number;
  urgency?: number;
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

export interface ContactListOptions {
  filterOptions: ContactFilterOptions;
  sortOptions: ContactSortOptions;
  pagination?: {
    page: number;
    limit: number;
  };
}

export interface Activity {
  id: string;
  userId: string;
  contactId: string;
  type: 'email' | 'call' | 'meeting' | 'message' | 'action_item';
  title: string;
  description?: string;
  status: 'pending' | 'completed' | 'cancelled';
  priority?: 'high' | 'medium' | 'low';
  dueDate?: Date;
  completedAt?: Date;
  sentiment?: number;
  topics?: string[];
  summary?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface WidgetPreference {
  id: string;
  userId: string;
  widgetId: string;
  enabled: boolean;
  order: number;
  settings?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface SavedView {
  id: string;
  userId: string;
  name: string;
  type: 'contacts' | 'projects' | 'tasks';
  filterOptions: Record<string, any>;
  sortOptions: Record<string, any>;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type FilterOperator = 
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'endsWith'
  | 'greaterThan'
  | 'lessThan'
  | 'between'
  | 'in'
  | 'notIn'
  | 'isNull'
  | 'isNotNull'
  | 'regex'
  | 'custom';

export interface FilterCondition {
  field: keyof Contact;
  operator: FilterOperator;
  value: string | number | boolean | null;
  value2?: string | number | boolean | null;
  customFunction?: string;
  isRegex?: boolean;
  caseSensitive?: boolean;
  validationPattern?: string;
  validationMessage?: string;
}

export type FilterGroupOperation = {
  id: string;
  filters: FilterCondition[];
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