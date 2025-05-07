"use client";

import React, { useState, useEffect } from 'react';
import { getSupabaseClient } from '../../utils/supabase';
import { Contact } from '../../types/contact';
import { Interaction } from '../../types/interaction';
import { InteractionAnalysis } from '../../utils/aiAnalysis';

interface RelationshipStrengthProps {
  userId: string;
}

interface RelationshipMetrics {
  contactId: string;
  contactName: string;
  strength: number;
  lastInteraction: Date;
  interactionCount: number;
  sentiment: number;
}

export default function RelationshipStrength({ userId }: RelationshipStrengthProps) {
  const [metrics, setMetrics] = useState<RelationshipMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMetrics();
  }, [userId]);

  const loadMetrics = async () => {
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

      // Calculate relationship metrics for each contact
      const relationshipMetrics: RelationshipMetrics[] = [];

      for (const contact of contacts || []) {
        const contactInteractions = interactions?.filter(i => i.contactId === contact.id) || [];
        const lastInteraction = contactInteractions.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )[0];

        if (lastInteraction) {
          // Calculate relationship strength based on interaction frequency and recency
          const daysSinceLastInteraction = Math.floor(
            (new Date().getTime() - new Date(lastInteraction.timestamp).getTime()) / (1000 * 60 * 60 * 24)
          );
          
          // Simple strength calculation (can be enhanced with more sophisticated metrics)
          const strength = Math.max(0, 1 - (daysSinceLastInteraction / 365));
          
          // Calculate average sentiment (placeholder for now)
          const sentiment = 0.7; // This would come from your AI analysis

          relationshipMetrics.push({
            contactId: contact.id,
            contactName: `${contact.firstName ?? ''} ${contact.lastName ?? ''}`.trim(),
            strength,
            lastInteraction: new Date(lastInteraction.timestamp),
            interactionCount: contactInteractions.length,
            sentiment
          });
        }
      }

      // Sort by relationship strength
      relationshipMetrics.sort((a, b) => b.strength - a.strength);
      setMetrics(relationshipMetrics);
    } catch (err) {
      console.error('Failed to load relationship metrics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load relationship metrics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-gray-500">Loading relationship metrics...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Relationship Strength Overview</h2>
      {metrics.length === 0 ? (
        <div className="text-gray-500">No relationship data available</div>
      ) : (
        <div className="space-y-3">
          {metrics.slice(0, 5).map(metric => (
            <div
              key={metric.contactId}
              className="bg-white rounded-lg shadow p-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{metric.contactName}</h3>
                  <p className="text-sm text-gray-600">
                    {metric.interactionCount} interactions
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Last interaction: {metric.lastInteraction.toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {Math.round(metric.strength * 100)}% Strength
                  </div>
                  <div className="mt-1">
                    <div className="w-24 h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-2 bg-blue-500 rounded-full"
                        style={{ width: `${metric.strength * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 