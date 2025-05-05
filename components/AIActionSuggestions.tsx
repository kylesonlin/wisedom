import React from 'react';
import { Contact, Interaction } from '../types/contact';
import { PriorityScore } from '../utils/contactPrioritization';
import { InteractionAnalysis, FollowUpSuggestion } from '../utils/aiAnalysis';

interface AIActionSuggestionsProps {
  contact: Contact;
  interactions: Interaction[];
  priorityScore: PriorityScore;
  interactionAnalysis: InteractionAnalysis;
  followUpSuggestions: FollowUpSuggestion[];
}

interface ActionSuggestion {
  type: 'follow-up' | 'reminder' | 'priority' | 'relationship';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  suggestedDate?: Date;
  actionItems?: string[];
}

export default function AIActionSuggestions({
  contact,
  interactions,
  priorityScore,
  interactionAnalysis,
  followUpSuggestions
}: AIActionSuggestionsProps) {
  // Generate action suggestions based on analysis
  const generateActionSuggestions = (): ActionSuggestion[] => {
    const suggestions: ActionSuggestion[] = [];

    // Priority-based suggestions
    if (priorityScore > 0.8) {
      suggestions.push({
        type: 'priority',
        title: 'High Priority Contact',
        description: 'This contact requires immediate attention due to high priority score.',
        priority: 'high',
        actionItems: [
          'Schedule a follow-up meeting',
          'Review recent interactions',
          'Prepare key talking points'
        ]
      } as ActionSuggestion);
    }

    // Follow-up suggestions
    if (followUpSuggestions.length > 0) {
      const nextFollowUp = followUpSuggestions[0];
      suggestions.push({
        type: 'follow-up',
        title: 'Recommended Follow-up',
        description: `Based on interaction history, a follow-up is recommended ${nextFollowUp.reason}.`,
        priority: nextFollowUp.priority,
        suggestedDate: nextFollowUp.suggestedTime
      } as ActionSuggestion);
    }

    // Relationship building suggestions
    if (interactionAnalysis && 'relationshipStrength' in interactionAnalysis && (interactionAnalysis.relationshipStrength as number) < 0.5) {
      suggestions.push({
        type: 'relationship',
        title: 'Relationship Building Opportunity',
        description: 'Consider strengthening the relationship through more frequent interactions.',
        priority: 'medium',
        actionItems: [
          'Schedule regular check-ins',
          'Share relevant industry insights',
          'Connect on professional networks'
        ]
      } as ActionSuggestion);
    }

    // Sentiment-based suggestions
    if (interactionAnalysis.overallSentiment < 0.3) {
      suggestions.push({
        type: 'reminder',
        title: 'Address Negative Sentiment',
        description: 'Recent interactions show negative sentiment. Consider addressing concerns.',
        priority: 'high',
        actionItems: [
          'Review recent negative interactions',
          'Prepare response to address concerns',
          'Schedule a call to discuss issues'
        ]
      } as ActionSuggestion);
    }

    // Action item reminders
    const pendingActions = interactionAnalysis.actionItems.filter(item => !item.completed);
    if (pendingActions.length > 0) {
      suggestions.push({
        type: 'reminder',
        title: 'Pending Action Items',
        description: `There are ${pendingActions.length} pending action items that need attention.`,
        priority: 'high',
        actionItems: pendingActions.map(item => item.description)
      } as ActionSuggestion);
    }

    return suggestions;
  };

  const suggestions = generateActionSuggestions();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">AI Action Suggestions</h3>
      <div className="grid grid-cols-1 gap-4">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${
              suggestion.priority === 'high'
                ? 'border-red-200 bg-red-50'
                : suggestion.priority === 'medium'
                ? 'border-yellow-200 bg-yellow-50'
                : 'border-green-200 bg-green-50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium">{suggestion.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{suggestion.description}</p>
                {suggestion.suggestedDate && (
                  <p className="text-sm text-gray-500 mt-1">
                    Suggested date: {suggestion.suggestedDate.toLocaleDateString()}
                  </p>
                )}
              </div>
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  suggestion.priority === 'high'
                    ? 'bg-red-100 text-red-800'
                    : suggestion.priority === 'medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {suggestion.priority.charAt(0).toUpperCase() + suggestion.priority.slice(1)}
              </span>
            </div>
            {suggestion.actionItems && suggestion.actionItems.length > 0 && (
              <div className="mt-3">
                <h5 className="text-sm font-medium mb-2">Action Items:</h5>
                <ul className="list-disc list-inside space-y-1">
                  {suggestion.actionItems.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-sm text-gray-600">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 