"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Event } from '@/types/event';

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

export function useEvents(userId: string): UseEventsReturn {
  const supabase = useSupabaseClient();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const getCachedData = useCallback(() => {
    if (typeof window === 'undefined') return null;
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    
    return data;
  }, []);

  const setCachedData = useCallback((data: any) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now(),
    }));
  }, []);

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);

      // Check cache first
      const cached = getCachedData();
      if (cached) {
        setEvents(cached);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('userId', userId)
        .order('startDate', { ascending: true });

      if (error) throw error;

      setEvents(data);
      setCachedData(data);
    } catch (err) {
      console.error('Error loading events:', err);
      setError(err instanceof Error ? err : new Error('Failed to load events'));
    } finally {
      setLoading(false);
    }
  }, [userId, supabase, getCachedData, setCachedData]);

  useEffect(() => {
    if (userId) {
      loadEvents();
    }
  }, [userId, loadEvents]);

  const addEvent = async (event: Omit<Event, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .insert([{ ...event, userId }])
        .select()
        .single();

      if (error) throw error;

      setEvents(prev => [data, ...prev]);

      // Update cache
      setCachedData([data, ...events]);
    } catch (err) {
      console.error('Error adding event:', err);
      setError(err instanceof Error ? err : new Error('Failed to add event'));
    }
  };

  const updateEvent = async (id: string, event: Partial<Event>) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .update(event)
        .eq('id', id)
        .eq('userId', userId)
        .select()
        .single();

      if (error) throw error;

      setEvents(prev =>
        prev.map(e => (e.id === id ? { ...e, ...data } : e))
      );

      // Update cache
      setCachedData(
        events.map(e => (e.id === id ? { ...e, ...data } : e))
      );
    } catch (err) {
      console.error('Error updating event:', err);
      setError(err instanceof Error ? err : new Error('Failed to update event'));
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id)
        .eq('userId', userId);

      if (error) throw error;

      setEvents(prev => prev.filter(e => e.id !== id));

      // Update cache
      setCachedData(events.filter(e => e.id !== id));
    } catch (err) {
      console.error('Error deleting event:', err);
      setError(err instanceof Error ? err : new Error('Failed to delete event'));
    }
  };

  const searchEvents = async (query: string) => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('userId', userId)
        .ilike('title', `%${query}%`)
        .order('startDate', { ascending: true });

      if (error) throw error;

      setEvents(data);
      setCachedData(data);
    } catch (err) {
      console.error('Error searching events:', err);
      setError(err instanceof Error ? err : new Error('Failed to search events'));
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = async (filters: EventFilters) => {
    try {
      setLoading(true);

      let query = supabase
        .from('events')
        .select('*')
        .eq('userId', userId);

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
      setCachedData(data);
    } catch (err) {
      console.error('Error filtering events:', err);
      setError(err instanceof Error ? err : new Error('Failed to filter events'));
    } finally {
      setLoading(false);
    }
  };

  const refreshEvents = async () => {
    await loadEvents();
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