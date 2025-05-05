import { Interaction } from '../types/contact';
import { Contact } from '../types/contact';
import { ContactUpdate } from './contactMonitoring';

export interface ActionItem {
  description: string;
  completed: boolean;
}

export interface TopicAnalysis {
  topic: string;
  sentiment: number;
  frequency: number;
  importance: number;
}

export interface InteractionAnalysis {
  topics: TopicAnalysis[];
  overallSentiment: number;
  keyPhrases: string[];
  actionItems: ActionItem[];
  relationshipStrength: number;
}

// Canonical FollowUpSuggestion type for the entire app
export interface FollowUpSuggestion {
  contactId: string;
  type: 'email' | 'call' | 'meeting';
  priority: 'high' | 'medium' | 'low';
  reason: string;
  suggestedTime: Date;
  confidence: number;
  actionItems: string[];
}

export async function analyzeInteraction(interaction: Interaction): Promise<InteractionAnalysis> {
  // Mock implementation - replace with actual AI analysis
  return {
    topics: [
      {
        topic: 'Project Discussion',
        sentiment: 0.8,
        frequency: 1,
        importance: 0.9
      }
    ],
    overallSentiment: 0.8,
    keyPhrases: ['project deadline', 'next steps', 'collaboration'],
    actionItems: [
      {
        description: 'Follow up on project deadline',
        completed: false
      },
      {
        description: 'Schedule next meeting',
        completed: false
      }
    ],
    relationshipStrength: 0.7
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
    .filter(sentence => actionWords.some(word => sentence.toLowerCase().includes(word)))
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

  // Base score from relationship strength
  if (contact.relationshipStrength) {
    score += contact.relationshipStrength * 20;
  }

  // Recent interaction score
  const recentInteractions = interactions.filter(i => {
    const hoursSinceInteraction = Math.ceil(
      (Date.now() - i.timestamp.getTime()) / (1000 * 60 * 60)
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
    ? new Date(Math.max(...interactions.map(i => i.timestamp.getTime())))
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

  const text = `${interaction.summary} ${interaction.notes || ''}`.toLowerCase();
  
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
  interaction: Interaction
): string[] {
  const suggestions: string[] = [];

  // Add time-based suggestions
  const hoursSinceInteraction = Math.ceil(
    (Date.now() - interaction.timestamp.getTime()) / (1000 * 60 * 60)
  );

  if (hoursSinceInteraction > 24) {
    suggestions.push('Send a follow-up email to check in');
  }

  // Add sentiment-based suggestions
  const sentiment = analyzeInteractionSentiment(interaction);
  if (sentiment < 0) {
    suggestions.push('Schedule a call to address concerns');
  } else if (sentiment > 0) {
    suggestions.push('Send a thank you note');
  }

  // Add priority-based suggestions
  if (interaction.priority === 'high') {
    suggestions.push('Schedule an immediate follow-up meeting');
  }

  // Add relationship-based suggestions
  if (contact.relationshipStrength && contact.relationshipStrength < 0.5) {
    suggestions.push('Plan a relationship-building activity');
  }

  return suggestions;
} 