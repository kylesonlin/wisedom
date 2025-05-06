import { Interaction } from '../types/contact';
import { Contact } from '../types/contact';
import { ContactUpdate } from './contactMonitoring';

export interface ActionItem {
  id: string;
  type: 'birthday' | 'follow-up' | 'meeting' | 'email' | 'call';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: Date;
  contactId: string;
  contactName: string;
  status: 'pending' | 'completed';
  completed: boolean;
}

export interface TopicAnalysis {
  topics: string[];
  sentiment: number;
  keyPoints: string[];
  actionItems: string[];
}

export interface InteractionAnalysis {
  topics: TopicAnalysis[];
  overallSentiment: number;
  keyPhrases: string[];
  actionItems: ActionItem[];
}

// Canonical FollowUpSuggestion type for the entire app
export interface FollowUpSuggestion {
  id: string;
  contactId: string;
  contactName: string;
  type: 'email' | 'call' | 'meeting' | 'follow-up';
  priority: 'high' | 'medium' | 'low';
  reason: string;
  suggestedAction: string;
  suggestedTime: Date;
  confidence?: number;
  notes?: string;
}

export async function analyzeInteraction(interaction: Interaction): Promise<InteractionAnalysis> {
  // Mock implementation - replace with actual AI analysis
  return {
    topics: [
      {
        topics: ['Project Discussion'],
        sentiment: 0.8,
        keyPoints: [],
        actionItems: []
      }
    ],
    overallSentiment: 0.8,
    keyPhrases: ['project deadline', 'next steps', 'collaboration'],
    actionItems: [
      {
        id: '1',
        type: 'follow-up',
        title: 'Follow up on project deadline',
        description: 'Follow up on project deadline',
        priority: 'high',
        dueDate: new Date(),
        contactId: 'contact-1',
        contactName: 'Contact 1',
        status: 'pending',
        completed: false
      },
      {
        id: '2',
        type: 'meeting',
        title: 'Schedule next meeting',
        description: 'Schedule next meeting',
        priority: 'medium',
        dueDate: new Date(),
        contactId: 'contact-1',
        contactName: 'Contact 1',
        status: 'pending',
        completed: false
      }
    ]
  };
}

function extractKeyPhrases(text: string): string[] {
  // In a real implementation, you would use NLP to extract key phrases
  // For now, we'll use a simple mock implementation
  const phrases = text.split(/[.,!?]/).filter(phrase => phrase.length > 10);
  return phrases.slice(0, 3);
}

function extractActionItems(text: string): string[] {
  // In a real implementation, you would use NLP to extract action items
  // For now, we'll use a simple mock implementation
  const actionWords = ['need', 'should', 'must', 'will', 'going to'];
  const sentences = text.split(/[.,!?]/);
  return sentences
    .filter(sentence => actionWords.some(word => sentence?.toLowerCase().includes(word)))
    .slice(0, 3);
}

function calculateRelationshipStrength(interaction: Interaction): number {
  // In a real implementation, you would analyze the interaction history
  // For now, we'll use a simple mock implementation
  let strength = 0.5; // Base strength

  // Increase strength based on interaction type
  switch (interaction.type) {
    case 'meeting':
      strength += 0.2;
      break;
    case 'call':
      strength += 0.1;
      break;
  }

  // Increase strength based on sentiment
  if (interaction.sentiment) {
    strength += interaction.sentiment * 0.2;
  }

  // Increase strength if there are topics
  if (interaction.topics?.length) {
    strength += Math.min(interaction.topics.length * 0.1, 0.2);
  }

  return Math.min(Math.max(strength, 0), 1);
}

export async function analyzeInteractionHistory(interactions: Interaction[]): Promise<{
  relationshipTrend: number[];
  topicEvolution: Record<string, number[]>;
  sentimentTrend: number[];
}> {
  // Sort interactions by timestamp
  const sortedInteractions = [...interactions].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Calculate trends
  const relationshipTrend = sortedInteractions.map(i => 
    calculateRelationshipStrength(i)
  );

  const sentimentTrend = sortedInteractions.map(i => 
    i.sentiment || 0
  );

  // Track topic evolution
  const topicEvolution: Record<string, number[]> = {};
  const allTopics = new Set<string>();
  
  sortedInteractions.forEach(i => {
    (i.topics || []).forEach(topic => allTopics.add(topic));
  });

  allTopics.forEach(topic => {
    topicEvolution[topic] = sortedInteractions.map(i => 
      (i.topics || []).includes(topic) ? 1 : 0
    );
  });

  return {
    relationshipTrend,
    topicEvolution,
    sentimentTrend
  };
}

export function calculatePriorityScore(
  contact: Contact,
  interactions: Interaction[],
  updates: ContactUpdate[]
): number {
  let score = 0;

  // Recent interaction score
  const recentInteractions = interactions.filter(i => {
    const hoursSinceInteraction = Math.ceil(
      (Date.now() - new Date(i.timestamp).getTime()) / (1000 * 60 * 60)
    );
    return hoursSinceInteraction <= 24;
  });

  score += recentInteractions.length * 5;

  // High priority updates
  const highPriorityUpdates = updates.filter(u => u.priority === 'high');
  score += highPriorityUpdates.length * 15;

  // Medium priority updates
  const mediumPriorityUpdates = updates.filter(u => u.priority === 'medium');
  score += mediumPriorityUpdates.length * 10;

  // Sentiment analysis
  const sentimentScores = interactions.map(i => i.sentiment || 0);
  const averageSentiment = sentimentScores.length > 0
    ? sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length
    : 0;

  score += averageSentiment * 10;

  // Time decay factor
  const lastInteraction = interactions.length > 0
    ? new Date(Math.max(...interactions.map(i => new Date(i.timestamp).getTime())))
    : new Date(0);

  const daysSinceLastInteraction = Math.ceil(
    (Date.now() - lastInteraction.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceLastInteraction > 30) {
    score *= 0.8; // Reduce score for inactive contacts
  }

  // Normalize score to 0-100 range
  return Math.min(Math.max(score, 0), 100);
}

export function analyzeInteractionSentiment(interaction: Interaction): number {
  // This is a placeholder for actual sentiment analysis
  // In a real implementation, you would use an NLP service
  const sentimentKeywords = {
    positive: ['great', 'excellent', 'happy', 'pleased', 'thank', 'appreciate'],
    negative: ['disappointed', 'unhappy', 'frustrated', 'concerned', 'issue', 'problem']
  };

  const text = `${interaction.summary || ''}`.toLowerCase();
  
  let sentiment = 0;
  
  sentimentKeywords.positive.forEach(keyword => {
    if (text.includes(keyword)) sentiment += 1;
  });
  
  sentimentKeywords.negative.forEach(keyword => {
    if (text.includes(keyword)) sentiment -= 1;
  });

  // Normalize to -1 to 1 range
  return Math.min(Math.max(sentiment / 5, -1), 1);
}

export function generateFollowUpSuggestions(
  contact: Contact,
  interactions: Interaction[],
  priorityScore: number
): FollowUpSuggestion[] {
  // This is a placeholder for actual AI suggestions
  return [];
} 