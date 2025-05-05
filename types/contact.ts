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