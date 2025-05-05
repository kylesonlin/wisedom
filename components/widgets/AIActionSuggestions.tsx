import React, { useState, useEffect } from 'react';
import { getSupabaseClient } from '../../utils/supabase';
import { Contact } from '../../types/contact';
import { Interaction } from '../../types/interaction';
import { FollowUpSuggestion } from '../../utils/aiAnalysis';

interface AIActionSuggestionsProps {
  userId: string;
}

export default function AIActionSuggestions({ userId }: AIActionSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<FollowUpSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSuggestions();
  }, [userId]);

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      setError(null);

      const supabase = getSupabaseClient();
      
      // Load contacts and interactions
      const { data: contacts, error: contactsError } = await supabase
        .from('contacts')
        .select('*');
      if (contactsError) throw contactsError;

      const { data: interactions, error: interactionsError } = await supabase
        .from('interactions')
        .select('*');
      if (interactionsError) throw interactionsError;

      // Generate AI suggestions based on contact and interaction data
      const suggestions: FollowUpSuggestion[] = [];
      
      // Example logic for generating suggestions
      // In a real implementation, this would use your AI analysis functions
      for (const contact of contacts || []) {
        const contactInteractions = interactions?.filter(i => i.contact_id === contact.id) || [];
        const lastInteraction = contactInteractions.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )[0];

        if (lastInteraction) {
          const daysSinceLastInteraction = Math.floor(
            (new Date().getTime() - new Date(lastInteraction.timestamp).getTime()) / (1000 * 60 * 60 * 24)
          );

          if (daysSinceLastInteraction > 30) {
            suggestions.push({
              contactId: contact.id,
              contactName: contact.name,
              type: 'follow-up',
              priority: 'high',
              reason: `No interaction in ${daysSinceLastInteraction} days`,
              suggestedAction: 'Schedule a catch-up call',
              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
            });
          }
        }
      }

      setSuggestions(suggestions);
    } catch (err) {
      console.error('Failed to load suggestions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load suggestions');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-gray-500">Loading suggestions...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">AI-Predicted Follow-Ups</h2>
      {suggestions.length === 0 ? (
        <div className="text-gray-500">No follow-ups needed at this time</div>
      ) : (
        <div className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{suggestion.contactName}</h3>
                  <p className="text-sm text-gray-600">{suggestion.reason}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Suggested: {suggestion.suggestedAction}
                  </p>
                </div>
                <div className="text-sm">
                  <span className={`px-2 py-1 rounded-full ${
                    suggestion.priority === 'high'
                      ? 'bg-red-100 text-red-800'
                      : suggestion.priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {suggestion.priority}
                  </span>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                Due: {suggestion.dueDate.toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 