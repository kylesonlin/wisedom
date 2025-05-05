import React, { useState, useEffect } from 'react';
import { getSupabaseClient } from '../utils/supabase';
import { Contact, Interaction } from '../types/contact';
import { format, formatDistanceToNow } from 'date-fns';

interface ContactHistoryProps {
  contactId: string;
}

export default function ContactHistory({ contactId }: ContactHistoryProps) {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInteractions();
  }, [contactId]);

  const loadInteractions = async () => {
    try {
      setLoading(true);
      setError(null);

      const supabase = getSupabaseClient();
      const { data, error: fetchError } = await supabase
        .from('interactions')
        .select('*')
        .eq('contact_id', contactId)
        .order('timestamp', { ascending: false });

      if (fetchError) throw fetchError;

      setInteractions(data.map(interaction => ({
        ...interaction,
        timestamp: new Date(interaction.timestamp),
        created_at: new Date(interaction.created_at),
        updated_at: new Date(interaction.updated_at)
      })));
    } catch (err) {
      console.error('Failed to load interactions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load interactions');
    } finally {
      setLoading(false);
    }
  };

  const addInteraction = async (type: string, summary: string) => {
    try {
      setError(null);

      const supabase = getSupabaseClient();
      const { data, error: insertError } = await supabase
        .from('interactions')
        .insert({
          contact_id: contactId,
          type,
          summary,
          timestamp: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setInteractions(prev => [{
        ...data,
        timestamp: new Date(data.timestamp),
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at)
      }, ...prev]);
    } catch (err) {
      console.error('Failed to add interaction:', err);
      setError(err instanceof Error ? err.message : 'Failed to add interaction');
    }
  };

  if (loading) {
    return <div>Loading interactions...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Interaction History</h2>
      
      {interactions.length === 0 ? (
        <p className="text-gray-500">No interactions recorded yet.</p>
      ) : (
        <div className="space-y-4">
          {interactions.map(interaction => (
            <div
              key={interaction.id}
              className="p-4 bg-white rounded-lg shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-medium capitalize">{interaction.type}</span>
                  <p className="text-gray-600 mt-1">{interaction.summary}</p>
                </div>
                <div className="text-sm text-gray-500">
                  {formatDistanceToNow(interaction.timestamp, { addSuffix: true })}
                </div>
              </div>
              {interaction.sentiment !== null && (
                <div className="mt-2">
                  <span className="text-sm text-gray-500">Sentiment: </span>
                  <span className={(interaction.sentiment ?? 0) > 0 ? 'text-green-500' : 'text-red-500'}>
                    {(interaction.sentiment ?? 0) > 0 ? 'Positive' : 'Negative'}
                  </span>
                </div>
              )}
              {interaction.topics && interaction.topics.length > 0 && (
                <div className="mt-2">
                  <span className="text-sm text-gray-500">Topics: </span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {interaction.topics.map(topic => (
                      <span
                        key={topic}
                        className="px-2 py-1 bg-gray-100 rounded-full text-sm"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 