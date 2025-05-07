import { Interaction } from './interaction';

export interface Contact {
  id: string;
  userId: string;
  email: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  title?: string;
  avatar?: string;
  birthday?: Date;
  notes?: string;
  source?: string;
  importance?: number;
  urgency?: number;
  assignedTo?: string;
  relationshipStrength?: number;
  tags?: string[];
  additionalFields?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
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