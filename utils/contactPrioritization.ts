import { Contact } from '../types/contact';
import { Interaction } from '../types/interaction';
import { FollowUpSuggestion } from './aiAnalysis';

export type PriorityScore = number;

export interface PriorityFactors {
  recencyWeight: number;
  engagementWeight: number;
  importanceWeight: number;
  urgencyWeight: number;
}

export const DEFAULT_PRIORITY_FACTORS: PriorityFactors = {
  recencyWeight: 0.3,
  engagementWeight: 0.3,
  importanceWeight: 0.2,
  urgencyWeight: 0.2
};

export type { FollowUpSuggestion };

const getFullName = (contact: Contact) => `${contact.firstName ?? ''} ${contact.lastName ?? ''}`.trim();

// Calculate priority score based on various factors
export function calculatePriorityScore(
  contact: Contact,
  interactions: Interaction[],
  factors: PriorityFactors = DEFAULT_PRIORITY_FACTORS
): PriorityScore {
  const now = new Date();
  const recentInteractions = interactions.filter(i => {
    const interactionDate = new Date(i.timestamp);
    return now.getTime() - interactionDate.getTime() <= 30 * 24 * 60 * 60 * 1000; // Last 30 days
  });

  // Calculate recency score (0-1)
  const recencyScore = recentInteractions.length > 0
    ? Math.min(1, recentInteractions.length / 10) // Cap at 10 interactions
    : 0;

  // Calculate engagement score (0-1)
  const engagementScore = recentInteractions.length > 0
    ? recentInteractions.reduce((sum, i) => sum + (i.sentiment || 0), 0) / recentInteractions.length
    : 0;

  // Get importance and urgency from contact
  const importanceScore = contact.importance || 0;
  const urgencyScore = contact.urgency || 0;

  // Calculate weighted score
  return (
    recencyScore * factors.recencyWeight +
    engagementScore * factors.engagementWeight +
    importanceScore * factors.importanceWeight +
    urgencyScore * factors.urgencyWeight
  );
}

// Generate follow-up suggestions based on priority scores and interaction history
export function generateFollowUpSuggestions(
  contact: Contact,
  interactions: Interaction[],
  priorityScore: PriorityScore
): FollowUpSuggestion[] {
  const suggestions: FollowUpSuggestion[] = [];
  const now = new Date();

  // Get recent interactions
  const recentInteractions = interactions
    .filter(i => {
      const interactionDate = new Date(i.timestamp);
      return now.getTime() - interactionDate.getTime() <= 30 * 24 * 60 * 60 * 1000; // Last 30 days
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (recentInteractions.length === 0) {
    // No recent interactions - suggest a check-in
    suggestions.push({
      id: `check-in-${contact.id}`,
      contactId: contact.id,
      contactName: getFullName(contact),
      type: 'email',
      priority: priorityScore > 0.7 ? 'high' : priorityScore > 0.4 ? 'medium' : 'low',
      reason: 'No recent interactions',
      suggestedAction: 'Schedule a check-in call',
      suggestedTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      confidence: 0.7
    });
  }

  return suggestions;
}