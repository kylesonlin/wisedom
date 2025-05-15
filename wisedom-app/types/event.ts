export interface Event {
  id: string;
  userId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  type: 'conference' | 'meeting' | 'networking' | 'other';
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  industry: string;
  metadata: {
    url?: string;
    attendees?: string[];
    notes?: string;
    reminders?: {
      time: string;
      type: 'email' | 'notification';
    }[];
  };
  createdAt: string;
  updatedAt: string;
} 