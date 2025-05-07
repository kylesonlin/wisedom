"use client";

import React, { useState, useEffect } from 'react';
import { getSupabaseClient } from '../utils/supabase';
import { Contact } from '../types/contact';
import { Interaction } from '../types/interaction';
import { format, formatDistanceToNow } from 'date-fns';

interface ContactHistoryProps {
  contactId: string;
}

export default function ContactHistory({ contactId }: ContactHistoryProps) {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInteractions() {
      try {
        setLoading(true);
        setError(null);

        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from('interactions')
          .select('*')
          .eq('contactId', contactId)
          .order('timestamp', { ascending: false });

        if (error) throw error;

        setInteractions(
          (data || []).map(interaction => ({
            ...interaction,
            timestamp: new Date(interaction.timestamp)
          }))
        );
      } catch (err) {
        console.error('Error loading interactions:', err);
        setError(err instanceof Error ? err.message : 'Failed to load interactions');
      } finally {
        setLoading(false);
      }
    }

    loadInteractions();
  }, [contactId]);

  const getInteractionIcon = (type: Interaction['type']) => {
    switch (type) {
      case 'email':
        return '📧';
      case 'call':
        return '📞';
      case 'meeting':
        return '👥';
      case 'note':
        return '📝';
      default:
        return '❓';
    }
  };

  const getPriorityColor = (priority: Interaction['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 w-1/4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 w-3/4 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 rounded-lg bg-red-50">
        Error loading interaction history: {error}
      </div>
    );
  }

  if (interactions.length === 0) {
    return (
      <div className="text-center text-gray-500 p-4">
        No interaction history found for this contact.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {interactions.map((interaction) => (
        <div
          key={interaction.id}
          className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-2xl" role="img" aria-label={interaction.type}>
                {getInteractionIcon(interaction.type)}
              </span>
              <div>
                <h3 className="font-medium">{interaction.summary}</h3>
                <p className="text-sm text-gray-500">
                  {format(interaction.timestamp, 'PPp')} ({formatDistanceToNow(interaction.timestamp, { addSuffix: true })})
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-medium ${getPriorityColor(interaction.priority)}`}>
                {interaction.priority.charAt(0).toUpperCase() + interaction.priority.slice(1)} Priority
              </span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  interaction.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : interaction.status === 'cancelled'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {interaction.status.charAt(0).toUpperCase() + interaction.status.slice(1)}
              </span>
            </div>
          </div>
          {interaction.notes && (
            <p className="text-gray-600 text-sm mt-2">{interaction.notes}</p>
          )}
          {interaction.tags && interaction.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {interaction.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {interaction.followUpNeeded && (
            <div className="mt-2 flex items-center text-sm text-blue-600">
              <span role="img" aria-aria-aria-aria-label="calendar" className="mr-1">
                📅
              </span>
              Follow-up{' '}
              {interaction.followUpDate
                ? `scheduled for ${format(new Date(interaction.followUpDate), 'PP')}`
                : 'needed'}
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 