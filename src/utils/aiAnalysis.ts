interface Interaction {
  id: string;
  type: string;
  timestamp: string;
  content: string;
  topics?: string[];
  metadata?: {
    pendingAction?: boolean;
    followUpRequired?: boolean;
    scheduled?: boolean;
  };
}
