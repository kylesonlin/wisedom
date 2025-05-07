'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Contact {
  id: string;
  name: string;
  company: string;
  title: string;
  lastInteraction: string;
  interactionCount: number;
  averageResponseTime: number;
  connectionStrength: number;
  metadata?: {
    lastInteractionType?: string;
    preferredContactMethod?: string;
    notes?: string;
  };
}

const strengthColors = {
  high: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-red-100 text-red-800',
};

const getStrengthLevel = (strength: number): 'high' | 'medium' | 'low' => {
  if (strength >= 7) return 'high';
  if (strength >= 4) return 'medium';
  return 'low';
};

export default function RelationshipStrength() {
  const supabase = useSupabaseClient();
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStrength, setSelectedStrength] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'strength' | 'lastInteraction' | 'interactionCount'>('strength');

  useEffect(() => {
    if (user) {
      loadContacts();
    }
  }, [user]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get contacts with their basic info
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select('*')
        .eq('userId', user?.id);

      if (contactsError) throw contactsError;

      // Get interaction data for each contact
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('activities')
        .select('*')
        .eq('userId', user?.id)
        .in('type', ['email', 'call', 'meeting', 'message']);

      if (activitiesError) throw activitiesError;

      // Process the data to calculate metrics
      const processedContacts = contactsData.map(contact => {
        const contactActivities = activitiesData.filter(
          activity => activity.metadata?.contactId === contact.id
        );

        const lastInteraction = contactActivities.length > 0
          ? new Date(Math.max(...contactActivities.map(a => new Date(a.createdAt).getTime())))
          : null;

        const responseTimes = contactActivities
          .filter(a => a.metadata?.responseTime)
          .map(a => a.metadata.responseTime);

        const averageResponseTime = responseTimes.length > 0
          ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
          : 0;

        // Calculate connection strength based on various factors
        const strength = calculateConnectionStrength(
          contactActivities.length,
          averageResponseTime,
          lastInteraction
        );

        return {
          ...contact,
          lastInteraction: lastInteraction?.toISOString() || '',
          interactionCount: contactActivities.length,
          averageResponseTime,
          connectionStrength: strength,
        };
      });

      setContacts(processedContacts);
    } catch (err) {
      console.error('Error loading contacts:', err);
      setError('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const calculateConnectionStrength = (
    interactionCount: number,
    averageResponseTime: number,
    lastInteraction: Date | null
  ): number => {
    let strength = 0;

    // Base score from interaction count
    strength += Math.min(interactionCount * 0.5, 5);

    // Response time factor (faster responses = higher score)
    if (averageResponseTime > 0) {
      strength += Math.max(0, 5 - (averageResponseTime / 24)); // Assuming response time is in hours
    }

    // Recency factor
    if (lastInteraction) {
      const daysSinceLastInteraction = (Date.now() - lastInteraction.getTime()) / (1000 * 60 * 60 * 24);
      strength += Math.max(0, 5 - (daysSinceLastInteraction / 30)); // Decay over 30 days
    }

    return Math.min(Math.max(Math.round(strength), 1), 10);
  };

  const filteredContacts = contacts
    .filter(contact => {
      const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.title?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStrength = !selectedStrength ||
        getStrengthLevel(contact.connectionStrength) === selectedStrength;

      return matchesSearch && matchesStrength;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'strength':
          return b.connectionStrength - a.connectionStrength;
        case 'lastInteraction':
          return new Date(b.lastInteraction).getTime() - new Date(a.lastInteraction).getTime();
        case 'interactionCount':
          return b.interactionCount - a.interactionCount;
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-4">
        <div className="text-red-500">{error}</div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Relationship Strength</h2>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedStrength(null)}
              className={!selectedStrength ? 'bg-gray-100' : ''}
            >
              All Strengths
            </Button>
            {Object.keys(strengthColors).map(strength => (
              <Button
                key={strength}
                variant="outline"
                size="sm"
                onClick={() => setSelectedStrength(strength)}
                className={selectedStrength === strength ? 'bg-gray-100' : ''}
              >
                {strength.charAt(0).toUpperCase() + strength.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onValueChange={(value: string) => setSearchQuery(value)}
            className="flex-1"
          />
          <select
            value={sortBy}
            onValueChange={(value: string) => setSortBy(value as typeof sortBy)}
            className="rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="strength">Sort by Strength</option>
            <option value="lastInteraction">Sort by Last Interaction</option>
            <option value="interactionCount">Sort by Interaction Count</option>
          </select>
        </div>

        <div className="space-y-4">
          {filteredContacts.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              No contacts found
            </div>
          ) : (
            filteredContacts.map(contact => (
              <div
                key={contact.id}
                className="border rounded-lg p-4 space-y-2 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${strengthColors[getStrengthLevel(contact.connectionStrength)]}`}>
                      Strength: {contact.connectionStrength}/10
                    </span>
                    <span className="text-sm text-gray-500">
                      {contact.interactionCount} interactions
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Last interaction: {new Date(contact.lastInteraction).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium">{contact.name}</h3>
                  <p className="text-sm text-gray-600">
                    {contact.title} at {contact.company}
                  </p>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>
                    Avg. response time: {Math.round(contact.averageResponseTime)} hours
                  </span>
                  {contact.metadata?.preferredContactMethod && (
                    <span>
                      Preferred: {contact.metadata.preferredContactMethod}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  );
} 