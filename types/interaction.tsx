export interface Interaction {
  id: string;
  type: 'email' | 'call' | 'meeting' | 'note';
  contactId: string;
  userId: string;
  timestamp: string;
  content: string;
  summary: string;
  sentiment?: number;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed' | 'cancelled';
  followUpNeeded: boolean;
  followUpDate?: string;
  notes?: string;
  attachments?: string[];
  tags?: string[];
  topics?: string[];
  metadata?: {
    pendingAction?: boolean;
    followUpRequired?: boolean;
    scheduled?: boolean;
  };
} 