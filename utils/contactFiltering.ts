import { Contact, Interaction } from '../types/contact';
import { PriorityScore } from './contactPrioritization';
import { InteractionAnalysis } from './aiAnalysis';

export interface FilterOptions {
  searchTerm?: string;
  timeframes?: ('day' | 'week' | 'month')[];
  priorityLevels?: ('high' | 'medium' | 'low')[];
  interactionTypes?: ('email' | 'call' | 'meeting' | 'note')[];
  sentimentRange?: { min: number; max: number };
  relationshipStrength?: {
    min: number;
    max: number;
  };
  hasPendingActions?: boolean;
  hasScheduledFollowUps?: boolean;
  company?: string;
  title?: string;
}

export interface SortOptions {
  field: 'priority' | 'lastInteraction' | 'name' | 'company' | 'relationshipStrength';
  direction: 'asc' | 'desc';
}

const getFullName = (contact: Contact) => `${contact.firstName ?? ''} ${contact.lastName ?? ''}`.trim();

export function filterContacts(
  contacts: Contact[],
  interactions: Interaction[],
  filterOptions: FilterOptions,
  priorityScores: Record<string, PriorityScore>,
  interactionAnalyses: Record<string, InteractionAnalysis>
): Contact[] {
  return contacts.filter(contact => {
    if (!contact.id) return false;

    // Search term filter
    if (filterOptions.searchTerm) {
      const searchTerm = filterOptions.searchTerm.toLowerCase();
      const matchesSearch =
        getFullName(contact).toLowerCase().includes(searchTerm) ||
        contact.company?.toLowerCase().includes(searchTerm) ||
        contact.email?.toLowerCase().includes(searchTerm) ||
        contact.title?.toLowerCase().includes(searchTerm);
      if (!matchesSearch) return false;
    }

    // Timeframe filter
    if (filterOptions.timeframes?.length) {
      const contactInteractions = interactions.filter(i => i.contact_id === contact.id);
      const hasInteractionInTimeframe = filterOptions.timeframes.some(timeframe => {
        const timeframeMs = {
          day: 24 * 60 * 60 * 1000,
          week: 7 * 24 * 60 * 60 * 1000,
          month: 30 * 24 * 60 * 60 * 1000
        }[timeframe];
        return contactInteractions.some(
          i => Date.now() - new Date(i.timestamp).getTime() <= timeframeMs
        );
      });
      if (!hasInteractionInTimeframe) return false;
    }

    // Priority level filter
    if (filterOptions.priorityLevels?.length) {
      const priorityScore = priorityScores[contact.id];
      if (!priorityScore) return false;
      const priority = priorityScore > 0.7 ? 'high' : priorityScore > 0.4 ? 'medium' : 'low';
      if (!filterOptions.priorityLevels.includes(priority)) return false;
    }

    // Interaction type filter
    if (filterOptions.interactionTypes?.length) {
      const contactInteractions = interactions.filter(i => i.contact_id === contact.id);
      const hasInteractionType = filterOptions.interactionTypes.some(type =>
        contactInteractions.some(i => i.type === type)
      );
      if (!hasInteractionType) return false;
    }

    // Sentiment range filter
    if (filterOptions.sentimentRange) {
      const contactInteractions = interactions.filter(i => i.contact_id === contact.id);
      const averageSentiment =
        contactInteractions.reduce((sum, i) => sum + (i.sentiment || 0), 0) /
        (contactInteractions.length || 1);
      if (
        averageSentiment < filterOptions.sentimentRange.min ||
        averageSentiment > filterOptions.sentimentRange.max
      ) {
        return false;
      }
    }

    // Relationship strength filter
    if (filterOptions.relationshipStrength && 'min' in filterOptions.relationshipStrength && 'max' in filterOptions.relationshipStrength) {
      const analysis = interactionAnalyses[contact.id];
      if (!analysis) return false;
      if (analysis && 'relationshipStrength' in analysis) {
        if ((analysis.relationshipStrength as number) < filterOptions.relationshipStrength.min ||
            (analysis.relationshipStrength as number) > filterOptions.relationshipStrength.max) {
          return false;
        }
      }
    }

    // Pending actions filter
    if (filterOptions.hasPendingActions) {
      const contactInteractions = interactions.filter(i => i.contact_id === contact.id);
      const hasPendingAction = contactInteractions.some(
        i => i.metadata?.pendingAction || i.metadata?.followUpRequired
      );
      if (!hasPendingAction) return false;
    }

    // Scheduled follow-ups filter
    if (filterOptions.hasScheduledFollowUps) {
      const contactInteractions = interactions.filter(i => i.contact_id === contact.id);
      const hasScheduledFollowUp = contactInteractions.some(
        i => i.metadata?.scheduled
      );
      if (!hasScheduledFollowUp) return false;
    }

    // Company filter
    if (filterOptions.company && contact.company !== filterOptions.company) {
      return false;
    }

    // Title filter
    if (filterOptions.title && contact.title !== filterOptions.title) {
      return false;
    }

    return true;
  });
}

export function sortContacts(
  contacts: Contact[],
  interactions: Interaction[],
  sortOptions: SortOptions,
  priorityScores: Record<string, PriorityScore>,
  interactionAnalyses: Record<string, InteractionAnalysis>
): Contact[] {
  return [...contacts].sort((a, b) => {
    if (!a.id || !b.id) return 0;

    let comparison = 0;

    switch (sortOptions.field) {
      case 'priority':
        const scoreA = priorityScores[a.id] || 0;
        const scoreB = priorityScores[b.id] || 0;
        comparison = scoreA - scoreB;
        break;

      case 'lastInteraction':
        const lastInteractionA = interactions
          .filter(i => i.contact_id === a.id)
          .sort((i1, i2) => new Date(i2.timestamp).getTime() - new Date(i1.timestamp).getTime())[0];
        const lastInteractionB = interactions
          .filter(i => i.contact_id === b.id)
          .sort((i1, i2) => new Date(i2.timestamp).getTime() - new Date(i1.timestamp).getTime())[0];
        const timeA = lastInteractionA ? new Date(lastInteractionA.timestamp).getTime() : 0;
        const timeB = lastInteractionB ? new Date(lastInteractionB.timestamp).getTime() : 0;
        comparison = timeA - timeB;
        break;

      case 'name':
        comparison = getFullName(a).localeCompare(getFullName(b));
        break;

      case 'company':
        comparison = (a.company || '').localeCompare(b.company || '');
        break;

      case 'relationshipStrength':
        const strengthA = interactionAnalyses[a.id] && (interactionAnalyses[a.id] as any).relationshipStrength !== undefined ? (interactionAnalyses[a.id] as any).relationshipStrength as number : 0;
        const strengthB = interactionAnalyses[b.id] && (interactionAnalyses[b.id] as any).relationshipStrength !== undefined ? (interactionAnalyses[b.id] as any).relationshipStrength as number : 0;
        comparison = strengthA - strengthB;
        break;
    }

    return sortOptions.direction === 'asc' ? comparison : -comparison;
  });
}

export function getFilterStats(
  contacts: Contact[],
  interactions: Interaction[],
  filterOptions: FilterOptions,
  priorityScores: Record<string, PriorityScore>,
  interactionAnalyses: Record<string, InteractionAnalysis>
): {
  totalContacts: number;
  filteredContacts: number;
  priorityDistribution: { high: number; medium: number; low: number };
  interactionTypeDistribution: Record<string, number>;
  averageSentiment: number;
  averageRelationshipStrength: number;
} {
  const filteredContacts = filterContacts(
    contacts,
    interactions,
    filterOptions,
    priorityScores,
    interactionAnalyses
  );

  const priorityDistribution = {
    high: 0,
    medium: 0,
    low: 0
  };

  const interactionTypeDistribution: Record<string, number> = {};

  let totalSentiment = 0;
  let totalRelationshipStrength = 0;
  let count = 0;

  filteredContacts.forEach(contact => {
    if (!contact.id) return;

    // Calculate priority distribution
    const priorityScore = priorityScores[contact.id];
    if (priorityScore) {
      const priority = priorityScore > 0.7 ? 'high' : priorityScore > 0.4 ? 'medium' : 'low';
      priorityDistribution[priority]++;
    }

    // Calculate interaction type distribution and average sentiment
    const contactInteractions = interactions.filter(i => i.contact_id === contact.id);
    contactInteractions.forEach(interaction => {
      interactionTypeDistribution[interaction.type] = (interactionTypeDistribution[interaction.type] || 0) + 1;
    });

    // Calculate average sentiment
    const averageSentiment = contactInteractions.reduce((sum, i) => sum + (i.sentiment || 0), 0) / (contactInteractions.length || 1);
    totalSentiment += averageSentiment;

    // Calculate average relationship strength
    const analysis = interactionAnalyses[contact.id];
    if (analysis && 'relationshipStrength' in analysis) {
      totalRelationshipStrength += (analysis.relationshipStrength as number);
      count++;
    }
  });

  return {
    totalContacts: contacts.length,
    filteredContacts: filteredContacts.length,
    priorityDistribution,
    interactionTypeDistribution,
    averageSentiment: totalSentiment / filteredContacts.length,
    averageRelationshipStrength: totalRelationshipStrength / count
  };
} 