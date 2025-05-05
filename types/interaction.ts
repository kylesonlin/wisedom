export interface Interaction {
  id: string;
  type: 'email' | 'call' | 'meeting' | 'note';
  contactId: string;
  userId: string;
  timestamp: Date;
  summary: string;
  sentiment?: number;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed' | 'cancelled';
  followUpNeeded: boolean;
  followUpDate?: Date;
  notes?: string;
  attachments?: string[];
  tags?: string[];
} 