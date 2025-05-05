import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Contact, Interaction } from '../types/contact';
import { format, formatDistanceToNow } from 'date-fns';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

interface ContactHistoryProps {
  contactId: string;
}

export default function ContactHistory({ contactId }: ContactHistoryProps) {
  const [contact, setContact] = useState<Contact | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'all' | 'month' | 'week' | 'day'>('all');

  useEffect(() => {
    loadData();
  }, [contactId]);

  useEffect(() => {
    if (interactions.length > 0) {
      filterInteractions();
    }
  }, [selectedTimeframe]);

  async function loadData() {
    try {
      setLoading(true);

      // Load contact
      const { data: contactData, error: contactError } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', contactId)
        .single();

      if (contactError) throw contactError;
      setContact(contactData ? {
        ...contactData,
        createdAt: contactData.createdAt ? new Date(contactData.createdAt) : undefined,
        updatedAt: contactData.updatedAt ? new Date(contactData.updatedAt) : undefined,
        birthday: contactData.birthday ?? undefined,
        phone: contactData.phone ?? undefined,
        company: contactData.company ?? undefined,
        title: contactData.title ?? undefined,
        assignedTo: contactData.assignedTo ?? undefined,
        notes: contactData.notes ?? undefined,
        source: contactData.source ?? undefined,
        additionalFields: contactData.additionalFields ?? undefined,
      } : null);

      // Load interactions
      const { data: interactionsData, error: interactionsError } = await supabase
        .from('interactions')
        .select('*')
        .eq('contact_id', contactId)
        .order('timestamp', { ascending: false });

      if (interactionsError) throw interactionsError;
      setInteractions((interactionsData || []).map(i => ({
        ...i,
        timestamp: i.timestamp,
        created_at: i.created_at ? new Date(i.created_at) : undefined,
        updated_at: i.updated_at ? new Date(i.updated_at) : undefined,
        summary: i.summary ?? undefined,
        sentiment: i.sentiment ?? undefined,
        topics: i.topics ?? undefined,
        metadata: i.metadata ?? undefined,
      })));

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  function filterInteractions() {
    const now = new Date();
    const filteredInteractions = interactions.filter(interaction => {
      const interactionDate = new Date(interaction.timestamp);
      const timeDiff = now.getTime() - interactionDate.getTime();

      switch (selectedTimeframe) {
        case 'day':
          return timeDiff <= 24 * 60 * 60 * 1000;
        case 'week':
          return timeDiff <= 7 * 24 * 60 * 60 * 1000;
        case 'month':
          return timeDiff <= 30 * 24 * 60 * 60 * 1000;
        default:
          return true;
      }
    });

    setInteractions(filteredInteractions);
  }

  function getInteractionIcon(type: string) {
    switch (type) {
      case 'email':
        return '✉️';
      case 'call':
        return '📞';
      case 'meeting':
        return '🤝';
      case 'note':
        return '📝';
      default:
        return '📌';
    }
  }

  function getSentimentColor(sentiment: number | undefined) {
    if (sentiment === undefined) return 'text-gray-500';
    if (sentiment > 0.5) return 'text-green-500';
    if (sentiment < -0.5) return 'text-red-500';
    return 'text-yellow-500';
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Contact not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{contact.name}</h1>
        <p className="text-gray-600">{contact.company}</p>
      </div>

      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Timeframe
        </label>
        <select
          value={selectedTimeframe}
          onChange={(e) => setSelectedTimeframe(e.target.value as 'all' | 'month' | 'week' | 'day')}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value="all">All Time</option>
          <option value="month">Last Month</option>
          <option value="week">Last Week</option>
          <option value="day">Last 24 Hours</option>
        </select>
      </div>

      <div className="space-y-6">
        {interactions.map((interaction) => (
          <div
            key={interaction.id}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-start space-x-4">
              <div className="text-2xl">{getInteractionIcon(interaction.type)}</div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold capitalize">
                      {interaction.type}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(interaction.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                  
                  {interaction.sentiment !== undefined && (
                    <div className={`text-sm ${getSentimentColor(interaction.sentiment)}`}>
                      {interaction.sentiment > 0 ? 'Positive' : interaction.sentiment < 0 ? 'Negative' : 'Neutral'}
                    </div>
                  )}
                </div>

                {interaction.summary && (
                  <p className="mt-2 text-gray-700">{interaction.summary}</p>
                )}

                {interaction.topics && interaction.topics.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {interaction.topics.map((topic, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                )}

                {interaction.metadata && (
                  <div className="mt-2 text-sm text-gray-500">
                    {Object.entries(interaction.metadata).map(([key, value]) => (
                      <div key={key}>
                        <span className="font-medium">{key}:</span> {value}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {interactions.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No interactions found</p>
          </div>
        )}
      </div>
    </div>
  );
} 