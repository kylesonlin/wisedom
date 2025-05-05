import { Contact, Interaction } from '../types/contact';

export interface PriorityScore {
  overall: number;
  recency: number;
  engagement: number;
  importance: number;
  urgency: number;
}

export interface FollowUpSuggestion {
  contactId: string;
  type: 'email' | 'call' | 'meeting';
  priority: 'high' | 'medium' | 'low';
  reason: string;
  suggestedTime: Date;
  confidence: number;
}

// Calculate priority score based on various factors
export function calculatePriorityScore(
  contact: Contact,
  interactions: Interaction[],
  timeframe: 'day' | 'week' | 'month' = 'week'
): PriorityScore {
  const now = new Date();
  const timeframeMs = {
    day: 24 * 60 * 60 * 1000,
    week: 7 * 24 * 60 * 60 * 1000,
    month: 30 * 24 * 60 * 60 * 1000
  }[timeframe];

  // Filter interactions within timeframe
  const recentInteractions = interactions.filter(
    i => now.getTime() - new Date(i.timestamp).getTime() <= timeframeMs
  );

  // Calculate recency score (0-1)
  const recencyScore = recentInteractions.length > 0
    ? 1 - (now.getTime() - new Date(recentInteractions[0].timestamp).getTime()) / timeframeMs
    : 0;

  // Calculate engagement score (0-1)
  const engagementScore = Math.min(recentInteractions.length / 10, 1);

  // Calculate importance score (0-1)
  const importanceScore = calculateImportanceScore(contact, recentInteractions);

  // Calculate urgency score (0-1)
  const urgencyScore = calculateUrgencyScore(contact, recentInteractions);

  // Calculate overall score (weighted average)
  const overallScore = (
    recencyScore * 0.2 +
    engagementScore * 0.3 +
    importanceScore * 0.3 +
    urgencyScore * 0.2
  );

  return {
    overall: overallScore,
    recency: recencyScore,
    engagement: engagementScore,
    importance: importanceScore,
    urgency: urgencyScore
  };
}

// Calculate importance score based on contact data and interactions
function calculateImportanceScore(
  contact: Contact,
  interactions: Interaction[]
): number {
  let score = 0;

  // Company size and role importance
  if (contact.company) {
    score += 0.2;
    if (contact.title?.toLowerCase().includes('ceo') || 
        contact.title?.toLowerCase().includes('founder')) {
      score += 0.3;
    }
  }

  // Interaction sentiment
  const sentimentScore = interactions.reduce((sum, i) => sum + (i.sentiment || 0), 0) / 
    (interactions.length || 1);
  score += (sentimentScore + 1) / 2 * 0.3;

  // Topic importance
  const importantTopics = ['partnership', 'deal', 'investment', 'collaboration'];
  const topicScore = interactions.reduce((sum, i) => {
    const matchingTopics = (i.topics || []).filter(t => 
      importantTopics.some(it => t.toLowerCase().includes(it))
    ).length;
    return sum + matchingTopics;
  }, 0) / (interactions.length || 1);
  score += Math.min(topicScore, 0.2);

  return Math.min(score, 1);
}

// Calculate urgency score based on recent interactions and patterns
function calculateUrgencyScore(
  contact: Contact,
  interactions: Interaction[]
): number {
  if (interactions.length === 0) return 0;

  const now = new Date();
  const lastInteraction = new Date(interactions[0].timestamp);
  const daysSinceLastInteraction = (now.getTime() - lastInteraction.getTime()) / (24 * 60 * 60 * 1000);

  // Base urgency on time since last interaction
  let score = Math.max(0, 1 - daysSinceLastInteraction / 30);

  // Increase urgency if there are pending items
  const pendingItems = interactions.filter(i => 
    i.metadata?.pendingAction || 
    i.metadata?.followUpRequired
  ).length;
  score += Math.min(pendingItems * 0.2, 0.3);

  // Increase urgency based on interaction frequency pattern
  const interactionFrequency = calculateInteractionFrequency(interactions);
  if (interactionFrequency > 0 && daysSinceLastInteraction > interactionFrequency) {
    score += 0.2;
  }

  return Math.min(score, 1);
}

// Calculate average time between interactions
function calculateInteractionFrequency(interactions: Interaction[]): number {
  if (interactions.length < 2) return 0;

  const sortedInteractions = [...interactions].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  let totalDays = 0;
  for (let i = 0; i < sortedInteractions.length - 1; i++) {
    const current = new Date(sortedInteractions[i].timestamp);
    const next = new Date(sortedInteractions[i + 1].timestamp);
    totalDays += (current.getTime() - next.getTime()) / (24 * 60 * 60 * 1000);
  }

  return totalDays / (sortedInteractions.length - 1);
}

// Generate follow-up suggestions based on priority scores and interaction history
export function generateFollowUpSuggestions(
  contacts: Contact[],
  interactions: Interaction[],
  timeframe: 'day' | 'week' | 'month' = 'week'
): FollowUpSuggestion[] {
  const suggestions: FollowUpSuggestion[] = [];

  for (const contact of contacts) {
    if (!contact.id) continue; // Skip contacts without an ID
    
    const contactInteractions = interactions.filter(i => i.contact_id === contact.id);
    const priorityScore = calculatePriorityScore(contact, contactInteractions, timeframe);

    if (priorityScore.overall < 0.3) continue;

    // Determine follow-up type based on interaction history
    const lastInteraction = contactInteractions[0];
    const suggestedType = determineFollowUpType(lastInteraction, contactInteractions);

    // Calculate suggested time based on priority and interaction patterns
    const suggestedTime = calculateSuggestedTime(contactInteractions, priorityScore);

    // Generate reason for follow-up
    const reason = generateFollowUpReason(contact, lastInteraction, priorityScore);

    // Calculate confidence based on data quality and patterns
    const confidence = calculateConfidence(contactInteractions, priorityScore);

    suggestions.push({
      contactId: contact.id,
      type: suggestedType,
      priority: priorityScore.overall > 0.7 ? 'high' : priorityScore.overall > 0.4 ? 'medium' : 'low',
      reason,
      suggestedTime,
      confidence
    });
  }

  return suggestions.sort((a, b) => b.confidence - a.confidence);
}

// Determine the most appropriate follow-up type
function determineFollowUpType(
  lastInteraction: Interaction | undefined,
  allInteractions: Interaction[]
): 'email' | 'call' | 'meeting' {
  if (!lastInteraction) return 'email';

  // Count interaction types
  const typeCounts = allInteractions.reduce((counts, i) => {
    counts[i.type] = (counts[i.type] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);

  // If there's a clear preference in interaction type, use that
  const maxType = Object.entries(typeCounts).reduce((max, [type, count]) => 
    (count as number) > ((typeCounts[max] as number) || 0) ? type : max
  , 'email');

  // Consider the context of the last interaction
  if (lastInteraction.metadata?.suggestedNextAction) {
    return lastInteraction.metadata.suggestedNextAction;
  }

  return maxType as 'email' | 'call' | 'meeting';
}

// Calculate the suggested time for follow-up
function calculateSuggestedTime(
  interactions: Interaction[],
  priorityScore: PriorityScore
): Date {
  const now = new Date();
  
  // Base time on priority score
  let daysToAdd = 7 * (1 - priorityScore.overall);
  
  // Adjust based on interaction frequency
  const frequency = calculateInteractionFrequency(interactions);
  if (frequency > 0) {
    daysToAdd = Math.min(daysToAdd, frequency);
  }
  
  // Add some randomness to avoid all follow-ups being scheduled at the same time
  daysToAdd += (Math.random() - 0.5) * 2;
  
  const suggestedTime = new Date(now);
  suggestedTime.setDate(suggestedTime.getDate() + Math.max(1, Math.round(daysToAdd)));
  
  // Ensure the time is during business hours
  suggestedTime.setHours(9 + Math.floor(Math.random() * 8));
  suggestedTime.setMinutes(Math.floor(Math.random() * 60));
  
  return suggestedTime;
}

// Generate a human-readable reason for the follow-up
function generateFollowUpReason(
  contact: Contact,
  lastInteraction: Interaction | undefined,
  priorityScore: PriorityScore
): string {
  if (!lastInteraction) {
    return `Initial outreach to ${contact.name || 'contact'}`;
  }

  const daysAgo = Math.floor(
    (new Date().getTime() - new Date(lastInteraction.timestamp).getTime()) / (24 * 60 * 60 * 1000)
  );

  if (priorityScore.urgency > 0.7) {
    return `Urgent follow-up needed after ${daysAgo} days since last contact`;
  }

  if (lastInteraction.metadata?.pendingAction) {
    return `Follow-up regarding pending action: ${lastInteraction.metadata.pendingAction}`;
  }

  if (lastInteraction.topics?.length) {
    return `Continue discussion about ${lastInteraction.topics[0]}`;
  }

  return `Regular check-in after ${daysAgo} days`;
}

// Calculate confidence in the suggestion
function calculateConfidence(
  interactions: Interaction[],
  priorityScore: PriorityScore
): number {
  let confidence = 0.5;

  // More interactions = higher confidence
  confidence += Math.min(interactions.length / 10, 0.2);

  // Higher priority score = higher confidence
  confidence += priorityScore.overall * 0.2;

  // Consider data quality
  const hasQualityData = interactions.some(i => 
    i.summary && i.sentiment !== undefined && i.topics?.length
  );
  if (hasQualityData) confidence += 0.1;

  return Math.min(confidence, 1);
} 