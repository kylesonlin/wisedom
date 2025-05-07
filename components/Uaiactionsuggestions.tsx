'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '@/components/ui/Ucard';
import { Button } from '@/components/ui/Ubutton';
import { Input } from '@/components/ui/Uinput';

interface Suggestion {
  id: string;
  type: 'follow_up' | 'introduction' | 'check_in' | 'opportunity' | 'risk';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  contactId: string;
  contactName: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

const typeColors = {
  follow_up: 'bg-blue-100 text-blue-800',
  introduction: 'bg-green-100 text-green-800',
  check_in: 'bg-yellow-100 text-yellow-800',
  opportunity: 'bg-purple-100 text-purple-800',
  risk: 'bg-red-100 text-red-800',
};

const priorityColors = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-green-100 text-green-800',
};

export default function AIActionSuggestions() {
  const supabase = useSupabaseClient();
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadSuggestions();
    }
  }, [user]);

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('ai_suggestions')
        .select(`
          *,
          contacts:contactId (
            name
          )
        `)
        .eq('userId', user?.id)
        .eq('dismissed', false)
        .order('createdAt', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      const formattedSuggestions = data.map((suggestion: any) => ({
        ...suggestion,
        contactName: suggestion.contacts?.name || 'Unknown Contact',
      }));

      setSuggestions(formattedSuggestions);
    } catch (err) {
      console.error('Error loading suggestions:', err);
      setError('Failed to load suggestions');
    } finally {
      setLoading(false);
    }
  };

  const dismissSuggestion = async (suggestionId: string) => {
    try {
      const { error } = await supabase
        .from('ai_suggestions')
        .update({ dismissed: true })
        .eq('id', suggestionId);

      if (error) throw error;

      setSuggestions(suggestions.filter(s => s.id !== suggestionId));
    } catch (err) {
      console.error('Error dismissing suggestion:', err);
      setError('Failed to dismiss suggestion');
    }
  };

  const filteredSuggestions = suggestions.filter(suggestion => {
    const matchesSearch = suggestion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      suggestion.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      suggestion.contactName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = !selectedType || suggestion.type === selectedType;
    const matchesPriority = !selectedPriority || suggestion.priority === selectedPriority;

    return matchesSearch && matchesType && matchesPriority;
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
          <h2 className="text-lg font-semibold">AI Suggestions</h2>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedType(null)}
              className={!selectedType ? 'bg-gray-100' : ''}
            >
              All Types
            </Button>
            {Object.keys(typeColors).map(type => (
              <Button
                key={type}
                variant="outline"
                size="sm"
                onClick={() => setSelectedType(type)}
                className={selectedType === type ? 'bg-gray-100' : ''}
              >
                {type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Search suggestions..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <select
            value={selectedPriority || ''}
            onChange={(e) => setSelectedPriority(e.target.value || null)}
            className="rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="space-y-4">
          {filteredSuggestions.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              No suggestions found
            </div>
          ) : (
            filteredSuggestions.map(suggestion => (
              <div
                key={suggestion.id}
                className="border rounded-lg p-4 space-y-2 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[suggestion.type]}`}>
                      {suggestion.type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[suggestion.priority]}`}>
                      {suggestion.priority.charAt(0).toUpperCase() + suggestion.priority.slice(1)} Priority
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissSuggestion(suggestion.id)}
                  >
                    Dismiss
                  </Button>
                </div>
                <h3 className="font-medium">{suggestion.title}</h3>
                <p className="text-gray-600">{suggestion.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>For: {suggestion.contactName}</span>
                  <span>{new Date(suggestion.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  );
} 