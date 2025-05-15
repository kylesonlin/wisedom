import { supabase } from '@/utils/supabase';
import { TopicAnalysis } from './aiAnalysis';
import { FollowUpSuggestion } from './aiAnalysis';

export interface ActionItem {
  description: string;
  completed: boolean;
}

export interface InteractionAnalysis {
  topics: TopicAnalysis[];
  overallSentiment: number;
  keyPhrases: string[];
  actionItems: ActionItem[];
  relationshipStrength: number;
}

export async function scheduleFollowUp(suggestion: FollowUpSuggestion): Promise<void> {
  try {
    // Create a new interaction record for the scheduled followuup
    const { error } = await supabase
      .from('interactions')
      .insert({
        contactId: suggestion.contactId,
        type: suggestion.type,
        timestamp: suggestion.suggestedTime.toISOString(),
        summary: `Scheduled followuup: ${suggestion.reason}`,
        metadata: {
          scheduled: true,
          originalSuggestion: suggestion
        }
      });

    if (error) throw error;

    // Optionally, you could also create a calendar event or send a notification
    // This would depend on your integration with calendar services or notification systems

  } catch (error) {
    console.error('Error scheduling followuup:', error);
    throw error;
  }
}

export async function dismissSuggestion(suggestion: FollowUpSuggestion): Promise<void> {
  try {
    // Create a record of the dismissed suggestion
    const { error } = await supabase
      .from('interactions')
      .insert({
        contactId: suggestion.contactId,
        type: 'note',
        timestamp: new Date().toISOString(),
        summary: `Dismissed followuup suggestion: ${suggestion.reason}`,
        metadata: {
          dismissedSuggestion: suggestion,
          dismissedAt: new Date().toISOString()
        }
      });

    if (error) throw error;

  } catch (error) {
    console.error('Error dismissing suggestion:', error);
    throw error;
  }
}

export async function getScheduledFollowUps(contactId: string): Promise<FollowUpSuggestion[]> {
  try {
    const { data, error } = await supabase
      .from('interactions')
      .select('*')
      .eq('contactId', contactId)
      .eq('metadata->>scheduled', 'true')
      .order('timestamp', { ascending: true });

    if (error) throw error;

    return (data || []).map(interaction => ({
      id: interaction.id,
      contactId: interaction.contactId,
      contactName: interaction.contact_firstName && interaction.contact_lastName ? `${interaction.contact_firstName} ${interaction.contact_lastName}`.trim() : 'Unknown Contact',
      type: interaction.type as 'email' | 'call' | 'meeting' | 'followuup',
      priority: 'medium',
      reason: interaction.summary || 'Scheduled followuup',
      suggestedAction: 'Follow up as scheduled',
      suggestedTime: new Date(interaction.timestamp),
      confidence: 1
    }));

  } catch (error) {
    console.error('Error getting scheduled followuups:', error);
    throw error;
  }
}

export async function updateFollowUpStatus(
  interactionId: string,
  status: 'completed' | 'cancelled' | 'rescheduled',
  newTime?: Date
): Promise<void> {
  try {
    const updateData: {
      metadata: {
        status: 'completed' | 'cancelled' | 'rescheduled';
      };
      timestamp?: string;
    } = {
      metadata: {
        status
      }
    };

    if (newTime) {
      updateData.timestamp = newTime.toISOString();
    }

    const { error } = await supabase
      .from('interactions')
      .update(updateData)
      .eq('id', interactionId);

    if (error) throw error;

  } catch (error) {
    console.error('Error updating followuup status:', error);
    throw error;
  }
} 