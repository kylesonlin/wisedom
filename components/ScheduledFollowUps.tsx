"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Contact } from '../types/contact';
import { FollowUpSuggestion } from '../utils/aiAnalysis';
import { getScheduledFollowUps, updateFollowUpStatus } from '../utils/followUpScheduling';
import DatePicker from './DatePicker';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

export default function ScheduledFollowUps() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [scheduledFollowUps, setScheduledFollowUps] = useState<Record<string, FollowUpSuggestion[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'day' | 'week' | 'month'>('week');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedFollowUp, setSelectedFollowUp] = useState<FollowUpSuggestion | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (contacts.length > 0) {
      loadScheduledFollowUps();
    }
  }, [contacts, selectedTimeframe]);

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

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadScheduledFollowUps() {
    try {
      const followUps: Record<string, FollowUpSuggestion[]> = {};

      for (const contact of contacts) {
        if (!contact.id) continue; // Skip contacts without an ID
        
        const contactFollowUps = await getScheduledFollowUps(contact.id);
        
        // Filter follow-ups based on selected timeframe
        const now = new Date();
        const timeframeMs = {
          day: 24 * 60 * 60 * 1000,
          week: 7 * 24 * 60 * 60 * 1000,
          month: 30 * 24 * 60 * 60 * 1000
        }[selectedTimeframe];

        const filteredFollowUps = contactFollowUps.filter(followUp => {
          const timeDiff = new Date(followUp.suggestedTime).getTime() - now.getTime();
          return timeDiff <= timeframeMs && timeDiff >= 0;
        });

        if (filteredFollowUps.length > 0) {
          followUps[contact.id] = filteredFollowUps;
        }
      }

      setScheduledFollowUps(followUps);

    } catch (error) {
      console.error('Error loading scheduled follow-ups:', error);
    }
  }

  async function handleStatusUpdate(
    contactId: string,
    followUp: FollowUpSuggestion,
    status: 'completed' | 'cancelled' | 'rescheduled',
    newTime?: Date
  ) {
    try {
      await updateFollowUpStatus(followUp.contactId, status, newTime);
      await loadScheduledFollowUps(); // Refresh the list
    } catch (error) {
      console.error('Error updating follow-up status:', error);
    }
  }

  function handleRescheduleClick(followUp: FollowUpSuggestion) {
    setSelectedFollowUp(followUp);
    setShowDatePicker(true);
  }

  function handleDateSelect(newDate: Date) {
    if (selectedFollowUp) {
      handleStatusUpdate(selectedFollowUp.contactId, selectedFollowUp, 'rescheduled', newDate);
    }
    setShowDatePicker(false);
    setSelectedFollowUp(null);
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
      <h1 className="text-3xl font-bold mb-8">Scheduled Follow-ups</h1>

      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Timeframe
        </label>
        <select
          value={selectedTimeframe}
          onChange={(e) => setSelectedTimeframe(e.target.value as 'day' | 'week' | 'month')}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value="day">Next 24 Hours</option>
          <option value="week">Next Week</option>
          <option value="month">Next Month</option>
        </select>
      </div>

      <div className="space-y-6">
        {Object.entries(scheduledFollowUps).map(([contactId, followUps]) => {
          const contact = contacts.find(c => c.id === contactId);
          if (!contact) return null;

          return (
            <div key={contactId} className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">{contact.firstName} {contact.lastName}</h3>
                <p className="text-gray-600">{contact.company}</p>
              </div>

              <div className="space-y-4">
                {followUps.map((followUp, index) => (
                  <div
                    key={index}
                    className="border-l-4 border-blue-500 pl-4 py-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{followUp.reason}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(followUp.suggestedTime).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          className="px-3 py-1 bg-green-100 text-green-800 rounded-md text-sm hover:bg-green-200"
                          onClick={() => handleStatusUpdate(contactId, followUp, 'completed')}
                        >
                          Complete
                        </button>
                        <button
                          className="px-3 py-1 bg-red-100 text-red-800 rounded-md text-sm hover:bg-red-200"
                          onClick={() => handleStatusUpdate(contactId, followUp, 'cancelled')}
                        >
                          Cancel
                        </button>
                        <button
                          className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md text-sm hover:bg-yellow-200"
                          onClick={() => handleRescheduleClick(followUp)}
                        >
                          Reschedule
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {showDatePicker && selectedFollowUp && (
        <DatePicker
          initialDate={new Date(selectedFollowUp.suggestedTime)}
          onSelect={handleDateSelect}
          onCancel={() => {
            setShowDatePicker(false);
            setSelectedFollowUp(null);
          }}
        />
      )}
    </div>
  );
} 