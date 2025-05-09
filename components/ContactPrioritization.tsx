"use client";

import React, { useState, useEffect } from 'react';
import { getSupabaseClient } from '../utils/supabase';
import { Contact } from '../types/contact';
import { Interaction } from '../types/interaction';
import { PriorityScore, calculatePriorityScore, generateFollowUpSuggestions, PriorityFactors, DEFAULT_PRIORITY_FACTORS } from '../utils/contactPrioritization';
import { FollowUpSuggestion } from '../utils/aiAnalysis';
import { scheduleFollowUp, dismissSuggestion } from '../utils/followUpScheduling';

export default function ContactPrioritization() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [suggestions, setSuggestions] = useState<FollowUpSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('week');
  const [priorityFactors, setPriorityFactors] = useState<PriorityFactors>(DEFAULT_PRIORITY_FACTORS);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (contacts.length > 0 && interactions.length > 0) {
      // For each contact, generate suggestions
      const allSuggestions = contacts.flatMap(contact => {
        const contactInteractions = interactions.filter(i => i.contactId === contact.id);
        const score = calculatePriorityScore(contact, contactInteractions, priorityFactors);
        return generateFollowUpSuggestions(contact, contactInteractions, score);
      });
      setSuggestions(allSuggestions);
    }
  }, [contacts, interactions, priorityFactors]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const supabase = getSupabaseClient();

      // Load contacts
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select('*');

      if (contactsError) throw contactsError;

      // Load interactions
      const { data: interactionsData, error: interactionsError } = await supabase
        .from('interactions')
        .select('*')
        .order('timestamp', { ascending: false });

      if (interactionsError) throw interactionsError;

      setContacts(contactsData.map(contact => ({
        ...contact,
        createdAt: new Date(contact.createdAt),
        updatedAt: new Date(contact.updatedAt)
      })));

      setInteractions(interactionsData.map(interaction => ({
        ...interaction,
        timestamp: new Date(interaction.timestamp),
        createdAt: new Date(interaction.createdAt),
        updatedAt: new Date(interaction.updatedAt)
      })));
    } catch (err) {
      console.error('Failed to load data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleFollowUp = async (suggestion: FollowUpSuggestion) => {
    try {
      setError(null);
      await scheduleFollowUp(suggestion);
      setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
    } catch (err) {
      console.error('Failed to schedule follow-up:', err);
      setError(err instanceof Error ? err.message : 'Failed to schedule follow-up');
    }
  };

  const handleDismissSuggestion = async (suggestion: FollowUpSuggestion) => {
    try {
      setError(null);
      await dismissSuggestion(suggestion);
      setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
    } catch (err) {
      console.error('Failed to dismiss suggestion:', err);
      setError(err instanceof Error ? err.message : 'Failed to dismiss suggestion');
    }
  };

  const getFullName = (contact: Contact) => `${contact.firstName ?? ''} ${contact.lastName ?? ''}`.trim();

  if (loading) {
    return <div>Loading contacts and interactions...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Contact Prioritization</h2>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value as 'day' | 'week' | 'month')}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="day">Last 24 Hours</option>
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contacts.map(contact => {
          const score = calculatePriorityScore(contact, interactions, priorityFactors);
          return (
            <div
              key={contact.id}
              className="p-4 bg-white rounded-lg shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{getFullName(contact)}</h3>
                  {contact.company && (
                    <p className="text-sm text-gray-600">{contact.company}</p>
                  )}
                </div>
                <div className="text-sm font-medium">
                  Score: {score.toFixed(1)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {suggestions.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Follow-up Suggestions</h3>
          <div className="space-y-4">
            {suggestions.map(suggestion => (
              <div
                key={suggestion.id}
                className="p-4 bg-white rounded-lg shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{suggestion.contactName}</h4>
                    <p className="text-sm text-gray-600 mt-1">{suggestion.reason}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleScheduleFollowUp(suggestion)}
                      className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      Schedule
                    </button>
                    <button
                      onClick={() => handleDismissSuggestion(suggestion)}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 