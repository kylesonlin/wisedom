"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Event } from '@/types/event';
import { getLocalStorage, setLocalStorage, removeLocalStorage } from '@/utils/storage';

const CACHE_KEY = 'events-cache';
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

interface EventFilters {
  startDate?: Date;
  endDate?: Date;
  type?: 'meeting' | 'call' | 'task' | 'reminder';
  status?: 'upcoming' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high';
  participants?: string[];
  location?: string;
  searchTerm?: string;
  sortBy?: 'date' | 'priority' | 'status';
  sortOrder?: 'asc' | 'desc';
}

interface UseEventsReturn {
  events: Event[];
  loading: boolean;
  error: Error | null;
  filterEvents: (filters: EventFilters) => Promise<void>;
  refreshEvents: () => Promise<void>;
  addEvent: (event: Omit<Event, 'id'>) => Promise<void>;
  updateEvent: (id: string, event: Partial<Event>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  searchEvents: (query: string) => Promise<void>;
}

export function useEvents() {
  const supabase = useSupabaseClient();
  const user = useUser();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) return;

    const loadEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check cache first
        const cached = getLocalStorage(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION) {
            setEvents(data);
            setLoading(false);
            return;
          }
          // Cache expired
          removeLocalStorage(CACHE_KEY);
        }

        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('userId', user.id)
          .order('startDate', { ascending: true });

        if (error) throw error;

        setEvents(data);

        // Cache the results
        setLocalStorage(CACHE_KEY, JSON.stringify({
          data: events,
          timestamp: Date.now()
        }));
      } catch (err) {
        console.error('Error loading events:', err);
        setError(err instanceof Error ? err : new Error('Failed to load events'));
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [user, supabase]);

  const addEvent = async (event: Omit<Event, 'id'>) => {
    if (!user) throw new Error('User not authenticated');
    try {
      const { data, error } = await supabase
        .from('events')
        .insert([{ ...event, userId: user.id }])
        .select()
        .single();

      if (error) throw error;

      setEvents(prev => [data, ...prev]);

      // Update cache
      setLocalStorage(CACHE_KEY, JSON.stringify({
        data: [data, ...events],
        timestamp: Date.now()
      }));
    } catch (err) {
      console.error('Error adding event:', err);
      setError(err instanceof Error ? err : new Error('Failed to add event'));
    }
  };

  const updateEvent = async (id: string, event: Partial<Event>) => {
    if (!user) throw new Error('User not authenticated');
    try {
      const { data, error } = await supabase
        .from('events')
        .update(event)
        .eq('id', id)
        .eq('userId', user.id)
        .select()
        .single();

      if (error) throw error;

      setEvents(prev =>
        prev.map(e => (e.id === id ? { ...e, ...data } : e))
      );

      // Update cache
      setLocalStorage(CACHE_KEY, JSON.stringify({
        data: events.map(e => (e.id === id ? { ...e, ...data } : e)),
        timestamp: Date.now()
      }));
    } catch (err) {
      console.error('Error updating event:', err);
      setError(err instanceof Error ? err : new Error('Failed to update event'));
    }
  };

  const deleteEvent = async (id: string) => {
    if (!user) throw new Error('User not authenticated');
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id)
        .eq('userId', user.id);

      if (error) throw error;

      setEvents(prev => prev.filter(e => e.id !== id));

      // Update cache
      setLocalStorage(CACHE_KEY, JSON.stringify({
        data: events.filter(e => e.id !== id),
        timestamp: Date.now()
      }));
    } catch (err) {
      console.error('Error deleting event:', err);
      setError(err instanceof Error ? err : new Error('Failed to delete event'));
    }
  };

  const searchEvents = async (query: string) => {
    if (!user) throw new Error('User not authenticated');
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('userId', user.id)
        .ilike('title', `%${query}%`)
        .order('startDate', { ascending: true });

      if (error) throw error;

      setEvents(data);

      // Cache the results
      setLocalStorage(CACHE_KEY, JSON.stringify({
        data: data,
        timestamp: Date.now()
      }));
    } catch (err) {
      console.error('Error searching events:', err);
      setError(err instanceof Error ? err : new Error('Failed to search events'));
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = async (filters: EventFilters) => {
    if (!user) throw new Error('User not authenticated');
    try {
      setLoading(true);

      let query = supabase
        .from('events')
        .select('*')
        .eq('userId', user.id);

      if (filters.startDate) {
        query = query.gte('startDate', filters.startDate.toISOString());
      }
      if (filters.endDate) {
        query = query.lte('endDate', filters.endDate.toISOString());
      }
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }
      if (filters.participants) {
        query = query.in('participants', filters.participants);
      }
      if (filters.location) {
        query = query.eq('location', filters.location);
      }
      if (filters.searchTerm) {
        query = query.ilike('title', `%${filters.searchTerm}%`);
      }
      if (filters.sortBy && filters.sortOrder) {
        query = query.order(filters.sortBy as string, { ascending: filters.sortOrder === 'asc' });
      }

      const { data, error } = await query.order('startDate', { ascending: true });

      if (error) throw error;

      setEvents(data);

      // Cache the results
      setLocalStorage(CACHE_KEY, JSON.stringify({
        data: data,
        timestamp: Date.now()
      }));
    } catch (err) {
      console.error('Error filtering events:', err);
      setError(err instanceof Error ? err : new Error('Failed to filter events'));
    } finally {
      setLoading(false);
    }
  };

  const refreshEvents = async () => {
    await searchEvents('');
  };

  return {
    events,
    loading,
    error,
    filterEvents,
    refreshEvents,
    addEvent,
    updateEvent,
    deleteEvent,
    searchEvents,
  };
} 