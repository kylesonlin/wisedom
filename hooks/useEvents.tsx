import { useState, useEffect, useCallback } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

interface Event {
  id: string;
  userId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  type: 'conference' | 'meeting' | 'networking' | 'other';
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  industry: string;
  metadata: {
    url?: string;
    attendees?: string[];
    notes?: string;
    reminders?: {
      time: string;
      type: 'email' | 'notification';
    }[];
  };
  createdAt: string;
  updatedAt: string;
}

interface UseEventsReturn {
  events: Event[];
  loading: boolean;
  error: string | null;
  totalEvents: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refreshEvents: () => Promise<void>;
  addEvent: (event: Omit<Event, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateEvent: (id: string, updates: Partial<Event>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
}

const CACHE_KEY = 'events_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const DEFAULT_PAGE_SIZE = 20;

export function useEvents(userId: string): UseEventsReturn {
  const supabase = useSupabaseClient();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalEvents, setTotalEvents] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadEvents = useCallback(async (pageNum: number = 1, shouldRefresh: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first if not refreshing
      if (!shouldRefresh) {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION) {
            setEvents(data.events);
            setTotalEvents(data.totalEvents);
            setHasMore(data.hasMore);
            setLoading(false);
            return;
          }
        }
      }

      // Get total count
      const { count, error: countError } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('userId', userId);

      if (countError) throw countError;
      setTotalEvents(count || 0);

      // Get paginated events
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .eq('userId', userId)
        .order('startDate', { ascending: true })
        .range((pageNum - 1) * pageSize, pageNum * pageSize - 1);

      if (eventsError) throw eventsError;

      const newEvents = eventsData || [];

      if (pageNum === 1) {
        setEvents(newEvents);
      } else {
        setEvents(prev => [...prev, ...newEvents]);
      }

      setHasMore(newEvents.length === pageSize);

      // Update cache
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        events: pageNum === 1 ? newEvents : [...events, ...newEvents],
        totalEvents: count || 0,
        hasMore: newEvents.length === pageSize,
        timestamp: Date.now(),
      }));

    } catch (err) {
      console.error('Error loading events:', err);
      setError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [userId, supabase, pageSize]);

  useEffect(() => {
    if (userId) {
      loadEvents(1, true);
    }
  }, [userId, loadEvents]);

  const loadMore = async () => {
    if (!hasMore || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    await loadEvents(nextPage);
  };

  const refreshEvents = async () => {
    setPage(1);
    await loadEvents(1, true);
  };

  const addEvent = async (event: Omit<Event, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .insert([{ ...event, userId }])
        .select()
        .single();

      if (error) throw error;

      setEvents(prev => [data, ...prev]);
      setTotalEvents(prev => prev + 1);

      // Update cache
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data: cacheData, timestamp } = JSON.parse(cached);
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          ...cacheData,
          events: [data, ...cacheData.events],
          totalEvents: cacheData.totalEvents + 1,
          timestamp,
        }));
      }
    } catch (err) {
      console.error('Error adding event:', err);
      setError(err instanceof Error ? err.message : 'Failed to add event');
    }
  };

  const updateEvent = async (id: string, updates: Partial<Event>) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', id)
        .eq('userId', userId)
        .select()
        .single();

      if (error) throw error;

      setEvents(prev =>
        prev.map(event => (event.id === id ? { ...event, ...data } : event))
      );

      // Update cache
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data: cacheData, timestamp } = JSON.parse(cached);
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          ...cacheData,
          events: cacheData.events.map((event: Event) =>
            event.id === id ? { ...event, ...data } : event
          ),
          timestamp,
        }));
      }
    } catch (err) {
      console.error('Error updating event:', err);
      setError(err instanceof Error ? err.message : 'Failed to update event');
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

      setEvents(prev => prev.filter(event => event.id !== id));
      setTotalEvents(prev => prev - 1);

      // Update cache
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data: cacheData, timestamp } = JSON.parse(cached);
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          ...cacheData,
          events: cacheData.events.filter((event: Event) => event.id !== id),
          totalEvents: cacheData.totalEvents - 1,
          timestamp,
        }));
      }
    } catch (err) {
      console.error('Error deleting event:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete event');
    }
  };

  return {
    events,
    loading,
    error,
    totalEvents,
    page,
    pageSize,
    hasMore,
    loadMore,
    refreshEvents,
    addEvent,
    updateEvent,
    deleteEvent,
  };
} 