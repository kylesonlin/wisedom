import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Contact, Interaction } from '../types/contact';
import { PriorityScore, calculatePriorityScore, generateFollowUpSuggestions } from '../utils/contactPrioritization';
import { FollowUpSuggestion } from '../utils/aiAnalysis';
import { scheduleFollowUp, dismissSuggestion } from '../utils/followUpScheduling';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

export default function ContactPrioritization() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [suggestions, setSuggestions] = useState<FollowUpSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('week');
  const [priorityFactors, setPriorityFactors] = useState({
    recency: 0.2,
    engagement: 0.3,
    importance: 0.3,
    urgency: 0.2
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (contacts.length > 0 && interactions.length > 0) {
      const newSuggestions = generateFollowUpSuggestions(contacts, interactions, timeframe);
      setSuggestions(newSuggestions);
    }
  }, [contacts, interactions, timeframe, priorityFactors]);

  async function loadData() {
    try {
      setLoading(true);

      // Load contacts
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select('*');

      if (contactsError) throw contactsError;
      setContacts(
        (contactsData || []).map(c => ({
          ...c,
          createdAt: c.createdAt ? new Date(c.createdAt) : undefined,
          updatedAt: c.updatedAt ? new Date(c.updatedAt) : undefined,
          birthday: c.birthday ?? undefined,
          phone: c.phone ?? undefined,
          company: c.company ?? undefined,
          title: c.title ?? undefined,
          assignedTo: c.assignedTo ?? undefined,
          notes: c.notes ?? undefined,
          source: c.source ?? undefined,
          additionalFields: c.additionalFields ?? undefined,
        }))
      );

      // Load interactions
      const { data: interactionsData, error: interactionsError } = await supabase
        .from('interactions')
        .select('*')
        .order('timestamp', { ascending: false });

      if (interactionsError) throw interactionsError;
      setInteractions(
        (interactionsData || []).map(i => ({
          ...i,
          timestamp: i.timestamp,
          created_at: i.created_at ? new Date(i.created_at) : undefined,
          updated_at: i.updated_at ? new Date(i.updated_at) : undefined,
          summary: i.summary ?? undefined,
          sentiment: i.sentiment ?? undefined,
          topics: i.topics ?? undefined,
          metadata: i.metadata ?? undefined,
        }))
      );

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleTimeframeChange(event: React.ChangeEvent<HTMLSelectElement>) {
    setTimeframe(event.target.value as 'day' | 'week' | 'month');
  }

  function handlePriorityFactorChange(factor: keyof typeof priorityFactors, value: string) {
    setPriorityFactors(prev => ({
      ...prev,
      [factor]: parseFloat(value)
    }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Contact Prioritization</h1>

      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Timeframe
        </label>
        <select
          value={timeframe}
          onChange={handleTimeframeChange}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value="day">Last 24 Hours</option>
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
        </select>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Priority Factors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(priorityFactors).map(([factor, value]) => (
            <div key={factor} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {factor.charAt(0).toUpperCase() + factor.slice(1)}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={value.toString()}
                onChange={(e) => handlePriorityFactorChange(factor as keyof typeof priorityFactors, e.target.value)}
                className="w-full"
              />
              <span className="text-sm text-gray-500">{Math.round(value * 100)}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {suggestions.map((suggestion) => {
          const contact = contacts.find(c => c.id === suggestion.contactId);
          if (!contact) return null;

          return (
            <div
              key={suggestion.contactId}
              className={`p-6 rounded-lg shadow-md ${
                suggestion.priority === 'high'
                  ? 'bg-red-50 border-red-200'
                  : suggestion.priority === 'medium'
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-green-50 border-green-200'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{contact.name}</h3>
                  <p className="text-gray-600">{contact.company}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    suggestion.priority === 'high'
                      ? 'bg-red-100 text-red-800'
                      : suggestion.priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {suggestion.priority} priority
                  </span>
                  <span className="text-sm text-gray-500">
                    {Math.round(suggestion.confidence * 100)}% confidence
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-gray-700">{suggestion.reason}</p>
                <div className="mt-2 flex items-center space-x-4">
                  <span className="text-sm text-gray-500">
                    Suggested: {suggestion.type}
                  </span>
                  <span className="text-sm text-gray-500">
                    Time: {new Date(suggestion.suggestedTime).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex space-x-2">
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  onClick={async () => {
                    try {
                      await scheduleFollowUp(suggestion);
                      // Refresh the suggestions list
                      const newSuggestions = generateFollowUpSuggestions(contacts, interactions, timeframe);
                      setSuggestions(newSuggestions);
                    } catch (error) {
                      console.error('Error scheduling follow-up:', error);
                      // You might want to show an error message to the user here
                    }
                  }}
                >
                  Schedule
                </button>
                <button
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  onClick={async () => {
                    try {
                      await dismissSuggestion(suggestion);
                      // Remove the dismissed suggestion from the list
                      setSuggestions(prev => prev.filter(s => s.contactId !== suggestion.contactId));
                    } catch (error) {
                      console.error('Error dismissing suggestion:', error);
                      // You might want to show an error message to the user here
                    }
                  }}
                >
                  Dismiss
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 